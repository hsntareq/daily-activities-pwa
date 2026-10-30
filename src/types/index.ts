export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export type RoutineType = 'medicine' | 'walking' | 'playtime' | 'work' | 'custom';

export interface ReminderSettings {
  enabled: boolean;
  time?: string; // HH:mm
  minutesBefore?: number;
  routineType?: RoutineType;
  promptText?: string;
  soundEnabled?: boolean;
}

export type RecurrenceFrequency = 
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'month_start' // 1st of month
  | 'month_mid'   // 15th of month
  | 'month_end'   // Last day of month
  | 'custom';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number; // every X days/weeks/months
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday...
  dayOfMonth?: number;
  endCondition?: 'never' | 'after_count' | 'until_date';
  untilDate?: string;
  count?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status: TaskStatus;
  priority: TaskPriority;
  emoji?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  reminder?: ReminderSettings;
  ownerId?: string;
  sharedWith?: Record<string, UserPermissionLevel>;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
  syncedWithCloud?: boolean;
  syncVersion?: number;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  emoji: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subCategories: SubCategory[];
  isCustom?: boolean;
  createdAt: number;
}

export type UserPermissionLevel = 'viewer' | 'editor' | 'admin';

export interface UserPermission {
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface SharedProfile {
  id: string;
  userId: string;
  displayName: string;
  tabTitle: string;
  avatarEmoji: string;
  colorTheme: string;
  permissions: UserPermission;
  isCurrentProfile?: boolean;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'task' | 'category' | 'sharedProfile';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: unknown;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  pendingChangesCount: number;
  firebaseConnected: boolean;
  syncError?: string | null;
}
