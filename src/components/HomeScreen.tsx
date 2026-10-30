'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Users,
  Repeat,
  Lock,
  Eye,
  Edit3,
  Bell,
  Trash2,
} from 'lucide-react';
import { CalendarStrip } from './CalendarStrip';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import { FloatingActionButton } from './FloatingActionButton';
import { SettingsModal } from './SettingsModal';
import { RecurringEventsModal } from './RecurringEventsModal';
import { ShareTabModal } from './ShareTabModal';
import { RoutineNotificationPrompt } from './RoutineNotificationPrompt';
import {
  getAllCategories,
  getAllTasks,
  saveTask,
  deleteTask,
  initializeDatabase,
} from '@/lib/db/indexedDB';
import { realtimeSync } from '@/lib/firebase/realtimeSync';
import { materializeRecurringEventsForDate } from '@/lib/recurring/recurringService';
import { notificationManager } from '@/lib/notifications/notificationManager';
import { Category, Task, SyncState, SharedProfile } from '@/types';
import { useSettings } from '@/context/SettingsContext';

const DEFAULT_PROFILES: SharedProfile[] = [
  {
    id: 'prof-owner',
    userId: 'user-primary',
    displayName: 'Primary Account (Hasan)',
    tabTitle: 'My Schedule',
    avatarEmoji: '👤',
    colorTheme: 'indigo',
    isCurrentProfile: true,
    permissions: {
      canRead: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  },
  {
    id: 'prof-team',
    userId: 'user-team',
    displayName: 'Web Dev & Digital Team',
    tabTitle: 'Team Workspace',
    avatarEmoji: '💼',
    colorTheme: 'purple',
    permissions: {
      canRead: true,
      canCreate: true,
      canEdit: true,
      canDelete: false, // Collaborative, cannot delete
    },
  },
  {
    id: 'prof-client',
    userId: 'user-client',
    displayName: 'Client Alpha (Read-Only Review)',
    tabTitle: 'Client Shared Tab',
    avatarEmoji: '🤝',
    colorTheme: 'cyan',
    permissions: {
      canRead: true,
      canCreate: false, // Read only
      canEdit: false,
      canDelete: false,
    },
  },
];

export function HomeScreen() {
  const { theme } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Multi-user profiles state
  const [profiles, setProfiles] = useState<SharedProfile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daily_shared_profiles');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_PROFILES;
  });
  const [currentProfileId, setCurrentProfileId] = useState<string>('prof-owner');

  const [syncState, setSyncState] = useState<SyncState>(realtimeSync.getState());
  const [, startTransition] = useTransition();

  // Active profile permissions
  const currentProfile = useMemo(() => {
    return profiles.find((p) => p.id === currentProfileId) || profiles[0];
  }, [profiles, currentProfileId]);

  // Load initial data and subscribe to sync changes
  useEffect(() => {
    const unsub = realtimeSync.subscribe((state) => {
      setSyncState(state);
    });

    async function loadData() {
      try {
        await initializeDatabase();
        await realtimeSync.initialize();
        const loadedCats = await getAllCategories();
        
        // Auto-materialize recurring events for today
        await materializeRecurringEventsForDate(selectedDate);
        
        const loadedTasks = await getAllTasks();
        startTransition(() => {
          setCategories(loadedCats);
          setTasks(loadedTasks);
        });

        // Start routine schedule notification monitor
        notificationManager.startScheduleMonitor(() => getAllTasks());
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }

    loadData();

    return () => {
      unsub();
      notificationManager.stopScheduleMonitor();
    };
  }, [selectedDate]);

  const refreshTasks = async () => {
    const list = await getAllTasks();
    setTasks(list);
    await realtimeSync.refreshPendingCount();
  };

  const handleToggleTaskStatus = async (task: Task) => {
    if (!currentProfile.permissions.canEdit) {
      alert("🔒 Permission Denied: You have read-only access on this shared profile tab.");
      return;
    }

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await saveTask({
      ...task,
      status: newStatus,
    });
    await refreshTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (!currentProfile.permissions.canDelete) {
      alert("🔒 Permission Denied: You do not have permission to delete tasks on this shared profile tab.");
      return;
    }
    await deleteTask(id);
    await refreshTasks();
  };

  const handleSaveNewTask = async (taskData: Partial<Task>) => {
    if (!currentProfile.permissions.canCreate) {
      alert("🔒 Permission Denied: You cannot create tasks on this shared profile tab.");
      return;
    }

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: taskData.title || 'Untitled Activity',
      description: taskData.description,
      categoryId: taskData.categoryId || categories[0]?.id || 'cat-web-dev',
      subCategoryId: taskData.subCategoryId,
      date: taskData.date || selectedDate,
      startTime: taskData.startTime,
      endTime: taskData.endTime,
      status: 'todo',
      priority: taskData.priority || 'medium',
      emoji: taskData.emoji || '📋',
      isRecurring: taskData.isRecurring,
      recurrenceRule: taskData.recurrenceRule,
      reminder: taskData.reminder,
      ownerId: currentProfile.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncedWithCloud: false,
    };

    await saveTask(newTask);
    await refreshTasks();
  };

  const handleCompleteRoutinePrompt = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await saveTask({
        ...task,
        status: 'completed',
      });
      await refreshTasks();
    }
  };

  // Shared profiles management
  const handleAddProfile = (newProfile: SharedProfile) => {
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setCurrentProfileId(newProfile.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_shared_profiles', JSON.stringify(updated));
    }
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    if (currentProfileId === id) {
      setCurrentProfileId(updated[0]?.id || 'prof-owner');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_shared_profiles', JSON.stringify(updated));
    }
  };

  // Filter tasks for the selected date & profile
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.isDeleted) return false;
      // Match selected date
      if (task.date !== selectedDate) return false;
      // Match category
      if (selectedCategoryFilter !== 'all' && task.categoryId !== selectedCategoryFilter) {
        return false;
      }
      // Match status
      if (statusFilter === 'todo' && task.status === 'completed') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;
      // Match search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, selectedDate, selectedCategoryFilter, statusFilter, searchQuery]);

  // Group tasks into Time Blocks
  const groupedTasks = useMemo(() => {
    const morning: Task[] = [];
    const afternoon: Task[] = [];
    const evening: Task[] = [];
    const unscheduled: Task[] = [];

    filteredTasks.forEach((t) => {
      if (!t.startTime) {
        unscheduled.push(t);
        return;
      }
      const hour = parseInt(t.startTime.split(':')[0], 10);
      if (hour < 12) {
        morning.push(t);
      } else if (hour < 18) {
        afternoon.push(t);
      } else {
        evening.push(t);
      }
    });

    return { morning, afternoon, evening, unscheduled };
  }, [filteredTasks]);

  // Overall stats for the selected date
  const totalDateTasks = tasks.filter((t) => t.date === selectedDate && !t.isDeleted).length;
  const completedDateTasks = tasks.filter(
    (t) => t.date === selectedDate && !t.isDeleted && t.status === 'completed'
  ).length;
  const completionPercentage = totalDateTasks > 0 ? Math.round((completedDateTasks / totalDateTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] antialiased transition-colors duration-300 pb-24">
      {/* Interactive Routine Notification Popup */}
      <RoutineNotificationPrompt onCompleteTask={handleCompleteRoutinePrompt} />

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 text-xl font-black">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Daily Activities
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Offline-First Smart Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Recurring Events Cadence Manager */}
            <button
              onClick={() => setIsRecurringModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95"
              title="Recurring Events & Monthly Cadences"
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Recurring Cadence</span>
            </button>

            {/* Shared Profile Tabs Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold flex items-center gap-1.5 active:scale-95"
              title="Manage Shared Profile Views & Permissions"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Share Views</span>
            </button>

            {/* Sync Status Badge */}
            <button
              onClick={() => realtimeSync.syncPendingQueue()}
              disabled={syncState.isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                syncState.isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
              title="Click to synchronize offline changes"
            >
              {syncState.isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {syncState.isSyncing ? 'Syncing...' : syncState.isOnline ? 'Online' : 'Offline'}
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
              title="Settings & Appearance"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-User Profile Shared Tabs Strip */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-2.5 flex items-center justify-between gap-2 overflow-x-auto border-t border-slate-800/40">
          <div className="flex items-center gap-2 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
              <span>View:</span>
            </span>

            {profiles.map((p) => {
              const isSelected = p.id === currentProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentProfileId(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex-shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{p.avatarEmoji}</span>
                  <span>{p.tabTitle}</span>
                  {p.isCurrentProfile ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      Owner
                    </span>
                  ) : !p.permissions.canCreate ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 flex items-center gap-0.5">
                      <Eye className="w-2.5 h-2.5" /> Read-Only
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-0.5">
                      <Edit3 className="w-2.5 h-2.5" /> Editor
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-dashed border-indigo-500/40 flex-shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share View</span>
            </button>
          </div>

          {/* Granular Permission Status Banner */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Permissions:</span>
            </span>
            <span className={currentProfile.permissions.canCreate ? 'text-emerald-400 font-medium' : 'text-slate-500 line-through'}>
              Create
            </span>
            <span>•</span>
            <span className={currentProfile.permissions.canEdit ? 'text-blue-400 font-medium' : 'text-slate-500 line-through'}>
              Edit
            </span>
            <span>•</span>
            <span className={currentProfile.permissions.canDelete ? 'text-rose-400 font-medium' : 'text-slate-500 line-through'}>
              Delete
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Permission Read-Only Notice (if applicable) */}
        {!currentProfile.permissions.canCreate && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/20 text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Shared View ({currentProfile.displayName}):</strong> You are currently viewing this schedule with read-only permissions. Creating, modifying, or deleting tasks is restricted.
              </span>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold whitespace-nowrap"
            >
              View Permissions
            </button>
          </div>
        )}

        {/* Scrollable Calendar Strip */}
        <CalendarStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={tasks}
        />

        {/* Daily Summary Progress Banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Daily Overview</span>
                <span className="text-xs text-slate-400 font-normal">({selectedDate})</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {totalDateTasks === 0
                ? 'No activities scheduled for this date. Tap the + button to speak or type a task!'
                : `${completedDateTasks} of ${totalDateTasks} activities completed (${completionPercentage}%)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-40 sm:w-48 bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-indigo-300">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Filter Bar: Category chips, Search & Status */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities or keywords..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Status Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({filteredTasks.length})
              </button>
              <button
                onClick={() => setStatusFilter('todo')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'todo'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'completed'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Done
              </button>
            </div>
          </div>

          {/* Category Quick Filter Horizontal Bar */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              All Categories
            </button>

            {categories.map((c) => {
              const isSelected = selectedCategoryFilter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryFilter(c.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-indigo-400 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  style={{
                    backgroundColor: isSelected ? c.color : undefined,
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time-Wise Task List Breakdown */}
        <div className="space-y-6">
          {filteredTasks.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-3 bg-slate-900/20">
              <span className="text-4xl animate-bounce inline-block">✨</span>
              <h3 className="text-sm font-semibold text-slate-300">
                No activities found for this selection
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {currentProfile.permissions.canCreate
                  ? 'Tap the Floating Action Button in the bottom-right corner to speak or type a new task!'
                  : 'No activities currently assigned in this shared read-only view.'}
              </p>
              {currentProfile.permissions.canCreate && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Task</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Morning Block */}
              {groupedTasks.morning.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400/90 px-1">
                    <span>🌅 Morning</span>
                    <span className="text-slate-500 font-mono text-[11px] font-normal">
                      (06:00 - 12:00) • {groupedTasks.morning.length} tasks
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {groupedTasks.morning.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleStatus={handleToggleTaskStatus}
                        onDelete={handleDeleteTask}
                        canEdit={currentProfile.permissions.canEdit}
                        canDelete={currentProfile.permissions.canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon Block */}
              {groupedTasks.afternoon.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400/90 px-1">
                    <span>☀️ Afternoon</span>
                    <span className="text-slate-500 font-mono text-[11px] font-normal">
                      (12:00 - 18:00) • {groupedTasks.afternoon.length} tasks
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {groupedTasks.afternoon.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleStatus={handleToggleTaskStatus}
                        onDelete={handleDeleteTask}
                        canEdit={currentProfile.permissions.canEdit}
                        canDelete={currentProfile.permissions.canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Evening Block */}
              {groupedTasks.evening.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400/90 px-1">
                    <span>🌙 Evening</span>
                    <span className="text-slate-500 font-mono text-[11px] font-normal">
                      (18:00 - 24:00) • {groupedTasks.evening.length} tasks
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {groupedTasks.evening.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleStatus={handleToggleTaskStatus}
                        onDelete={handleDeleteTask}
                        canEdit={currentProfile.permissions.canEdit}
                        canDelete={currentProfile.permissions.canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unscheduled / All Day Block */}
              {groupedTasks.unscheduled.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    <span>📋 All Day / Flexible</span>
                    <span className="text-slate-500 font-mono text-[11px] font-normal">
                      • {groupedTasks.unscheduled.length} tasks
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {groupedTasks.unscheduled.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        category={categories.find((c) => c.id === task.categoryId)}
                        onToggleStatus={handleToggleTaskStatus}
                        onDelete={handleDeleteTask}
                        canEdit={currentProfile.permissions.canEdit}
                        canDelete={currentProfile.permissions.canDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button (respects canCreate permission) */}
      <FloatingActionButton
        onClick={() => {
          if (!currentProfile.permissions.canCreate) {
            alert("🔒 Permission Denied: You do not have permission to create tasks on this shared profile tab.");
            return;
          }
          setIsTaskModalOpen(true);
        }}
      />

      {/* Voice-to-Text Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveNewTask}
        categories={categories}
        initialDate={selectedDate}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        syncState={syncState}
      />

      {/* Recurring Events Cadence Modal */}
      <RecurringEventsModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        categories={categories}
        currentDate={selectedDate}
        onEventsMaterialized={refreshTasks}
      />

      {/* Multi-User Shared Tab & Permissions Modal */}
      <ShareTabModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profiles={profiles}
        currentProfileId={currentProfileId}
        onSelectProfile={setCurrentProfileId}
        onAddProfile={handleAddProfile}
        onDeleteProfile={handleDeleteProfile}
      />
    </div>
  );
}
