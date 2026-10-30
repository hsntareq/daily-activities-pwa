import { ref, set, get, child, onValue, off, DatabaseReference } from 'firebase/database';
import { getRealtimeDatabase, isFirebaseConfigured } from './config';
import {
  getPendingSyncItems,
  removeSyncQueueItem,
  markTaskSynced,
  getTaskById,
  saveTask,
  getDB
} from '@/lib/db/indexedDB';
import { SyncState, Task, SyncQueueItem } from '@/types';

type SyncListener = (state: SyncState) => void;

class RealtimeSyncManager {
  private syncState: SyncState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: null,
    pendingChangesCount: 0,
    firebaseConnected: false,
    syncError: null,
  };

  private listeners: Set<SyncListener> = new Set();
  private remoteListenerRef: DatabaseReference | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SyncState {
    return { ...this.syncState };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  private handleNetworkChange(online: boolean) {
    this.syncState.isOnline = online;
    if (online) {
      this.syncState.syncError = null;
      this.syncPendingQueue();
    } else {
      this.syncState.firebaseConnected = false;
    }
    this.notify();
  }

  /**
   * Initializes synchronization listeners and tests connectivity
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Refresh pending count
    await this.refreshPendingCount();

    // Check if cloud sync is configured
    if (!isFirebaseConfigured()) {
      this.syncState.firebaseConnected = false;
      this.syncState.syncError = 'Firebase credentials not set. Running in local Offline-First mode.';
      this.notify();
      return;
    }

    try {
      const db = getRealtimeDatabase();
      const connectedRef = ref(db, '.info/connected');
      
      onValue(connectedRef, (snap) => {
        const isConnected = Boolean(snap.val());
        this.syncState.firebaseConnected = isConnected;
        if (isConnected) {
          this.syncPendingQueue();
          this.attachRemoteListener();
        }
        this.notify();
      });
    } catch (err: unknown) {
      const error = err as Error;
      this.syncState.firebaseConnected = false;
      this.syncState.syncError = error.message;
      this.notify();
    }
  }

  /**
   * Listens for remote task changes and merges them with IndexedDB using Last-Write-Wins (LWW)
   */
  private attachRemoteListener(): void {
    if (this.remoteListenerRef) return;
    try {
      const db = getRealtimeDatabase();
      this.remoteListenerRef = ref(db, 'tasks');

      onValue(this.remoteListenerRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const remoteTasks: Task[] = Object.values(data);
        for (const remoteTask of remoteTasks) {
          if (!remoteTask?.id) continue;

          const localTask = await getTaskById(remoteTask.id);
          // If remote is newer than local, update local IndexedDB without re-queueing to Firebase
          if (!localTask || (remoteTask.updatedAt > (localTask.updatedAt || 0))) {
            const dbInstance = await getDB();
            await dbInstance.put('tasks', {
              ...remoteTask,
              syncedWithCloud: true,
            });
          }
        }
      });
    } catch (err) {
      console.warn('Failed to attach remote listener:', err);
    }
  }

  public async refreshPendingCount(): Promise<number> {
    try {
      const pending = await getPendingSyncItems();
      this.syncState.pendingChangesCount = pending.length;
      this.notify();
      return pending.length;
    } catch {
      return 0;
    }
  }

  /**
   * Drain offline sync queue to Firebase Realtime Database
   */
  public async syncPendingQueue(): Promise<void> {
    if (!this.syncState.isOnline || this.syncState.isSyncing) return;

    this.syncState.isSyncing = true;
    this.notify();

    try {
      const pendingItems = await getPendingSyncItems();
      this.syncState.pendingChangesCount = pendingItems.length;

      if (pendingItems.length === 0) {
        this.syncState.isSyncing = false;
        this.syncState.lastSyncedAt = Date.now();
        this.notify();
        return;
      }

      if (!isFirebaseConfigured()) {
        // In local mock/offline mode, we simulate successful local queue resolution
        for (const item of pendingItems) {
          if (item.entityType === 'task') {
            await markTaskSynced(item.entityId);
          }
          await removeSyncQueueItem(item.id);
        }
        this.syncState.lastSyncedAt = Date.now();
        this.syncState.pendingChangesCount = 0;
        this.syncState.isSyncing = false;
        this.notify();
        return;
      }

      const db = getRealtimeDatabase();

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(db, item);
          await removeSyncQueueItem(item.id);
          if (item.entityType === 'task') {
            await markTaskSynced(item.entityId);
          }
        } catch (itemErr: unknown) {
          console.error(`Sync error on item ${item.id}:`, itemErr);
        }
      }

      this.syncState.lastSyncedAt = Date.now();
      await this.refreshPendingCount();
    } catch (err: unknown) {
      const error = err as Error;
      this.syncState.syncError = error.message;
    } finally {
      this.syncState.isSyncing = false;
      this.notify();
    }
  }

  private async processSyncItem(db: ReturnType<typeof getRealtimeDatabase>, item: SyncQueueItem): Promise<void> {
    const taskRef = ref(db, `tasks/${item.entityId}`);

    if (item.action === 'delete') {
      await set(taskRef, null);
    } else {
      await set(taskRef, item.payload);
    }
  }

  public cleanup(): void {
    if (this.remoteListenerRef) {
      off(this.remoteListenerRef);
      this.remoteListenerRef = null;
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
