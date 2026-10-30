import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, Category, SyncQueueItem, SharedProfile } from '@/types';
import { INITIAL_CATEGORIES } from '@/data/initialCategories';

const DB_NAME = 'daily_activities_db';
const DB_VERSION = 1;

export interface DailyActivitiesDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-date': string;
      'by-category': string;
      'by-status': string;
      'by-synced': number;
      'by-updated': number;
    };
  };
  categories: {
    key: string;
    value: Category;
    indexes: {
      'by-slug': string;
    };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-status': string;
      'by-timestamp': number;
    };
  };
  shared_profiles: {
    key: string;
    value: SharedProfile;
    indexes: {
      'by-user-id': string;
    };
  };
  settings: {
    key: string;
    value: { key: string; value: unknown; updatedAt: number };
  };
}

let dbPromise: Promise<IDBPDatabase<DailyActivitiesDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<DailyActivitiesDB>> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB cannot be accessed during SSR.');
  }

  if (!dbPromise) {
    dbPromise = openDB<DailyActivitiesDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-date', 'date');
          taskStore.createIndex('by-category', 'categoryId');
          taskStore.createIndex('by-status', 'status');
          taskStore.createIndex('by-synced', 'syncedWithCloud');
          taskStore.createIndex('by-updated', 'updatedAt');
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('by-slug', 'slug', { unique: true });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('by-status', 'status');
          syncStore.createIndex('by-timestamp', 'timestamp');
        }

        // Shared profiles store
        if (!db.objectStoreNames.contains('shared_profiles')) {
          const profileStore = db.createObjectStore('shared_profiles', { keyPath: 'id' });
          profileStore.createIndex('by-user-id', 'userId');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Initialize DB and seed initial categories if not already seeded
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDB();
  const count = await db.count('categories');
  if (count === 0) {
    const tx = db.transaction('categories', 'readwrite');
    for (const cat of INITIAL_CATEGORIES) {
      await tx.store.put(cat);
    }
    await tx.done;
  }
}

// ==================== TASK OPERATIONS ====================

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  const tasks = await db.getAll('tasks');
  // Return non-deleted tasks sorted by time
  return tasks
    .filter(t => !t.isDeleted)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
}

export async function getTasksByDate(dateStr: string): Promise<Task[]> {
  const db = await getDB();
  const index = db.transaction('tasks').store.index('by-date');
  const tasks = await index.getAll(dateStr);
  return tasks
    .filter(t => !t.isDeleted)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function saveTask(task: Task, enqueueSync = true): Promise<Task> {
  const db = await getDB();
  const now = Date.now();
  const updatedTask: Task = {
    ...task,
    updatedAt: now,
    syncedWithCloud: false,
    syncVersion: (task.syncVersion || 0) + 1,
  };

  await db.put('tasks', updatedTask);

  if (enqueueSync) {
    await queueSyncItem({
      id: `sync_${task.id}_${now}`,
      entityType: 'task',
      entityId: task.id,
      action: task.isDeleted ? 'delete' : 'update',
      payload: updatedTask,
      timestamp: now,
      retryCount: 0,
      status: 'pending',
    });
  }

  return updatedTask;
}

export async function deleteTask(id: string, enqueueSync = true): Promise<void> {
  const db = await getDB();
  const existing = await db.get('tasks', id);
  if (!existing) return;

  const now = Date.now();
  // Soft delete for sync reconciliation
  const tombstone: Task = {
    ...existing,
    isDeleted: true,
    updatedAt: now,
    syncedWithCloud: false,
  };

  await db.put('tasks', tombstone);

  if (enqueueSync) {
    await queueSyncItem({
      id: `sync_del_${id}_${now}`,
      entityType: 'task',
      entityId: id,
      action: 'delete',
      payload: { id, isDeleted: true, updatedAt: now },
      timestamp: now,
      retryCount: 0,
      status: 'pending',
    });
  }
}

// ==================== CATEGORY OPERATIONS ====================

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  const categories = await db.getAll('categories');
  if (categories.length === 0) {
    await initializeDatabase();
    return db.getAll('categories');
  }
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCategory(category: Category): Promise<Category> {
  const db = await getDB();
  await db.put('categories', category);
  return category;
}

// ==================== SYNC QUEUE OPERATIONS ====================

export async function queueSyncItem(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('sync_queue', item);
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  const index = db.transaction('sync_queue').store.index('by-status');
  return index.getAll('pending');
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

export async function markTaskSynced(taskId: string): Promise<void> {
  const db = await getDB();
  const task = await db.get('tasks', taskId);
  if (task) {
    task.syncedWithCloud = true;
    await db.put('tasks', task);
  }
}

// ==================== SETTINGS & PROFILES ====================

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDB();
  const record = await db.get('settings', key);
  if (!record) return defaultValue;
  return record.value as T;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('settings', {
    key,
    value,
    updatedAt: Date.now(),
  });
}
