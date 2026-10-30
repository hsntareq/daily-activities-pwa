'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Code2,
  Check,
} from 'lucide-react';
import {
  initializeDatabase,
  getAllCategories,
  getAllTasks,
  saveTask,
  deleteTask,
} from '@/lib/db/indexedDB';
import { realtimeSync } from '@/lib/firebase/realtimeSync';
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker';
import { Category, Task, SyncState, TaskPriority } from '@/types';

export default function Step1ReviewPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-web-dev');
  const [syncState, setSyncState] = useState<SyncState>(realtimeSync.getState());
  const [isDbReady, setIsDbReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'tasks' | 'datamodels' | 'sync'>('categories');
  
  // Test task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('09:30');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [, startTransition] = useTransition();

  // Load data on mount
  useEffect(() => {
    registerServiceWorker();

    const unsubscribe = realtimeSync.subscribe((state) => {
      setSyncState(state);
    });

    const init = async () => {
      try {
        await initializeDatabase();
        await realtimeSync.initialize();
        const loadedCats = await getAllCategories();
        const loadedTasks = await getAllTasks();
        startTransition(() => {
          setCategories(loadedCats);
          setTasks(loadedTasks);
          setIsDbReady(true);
        });
      } catch (err) {
        console.error('Failed to initialize database:', err);
      }
    };

    init();

    return () => {
      unsubscribe();
      realtimeSync.cleanup();
    };
  }, []);

  const refreshTasks = async () => {
    const list = await getAllTasks();
    setTasks(list);
    await realtimeSync.refreshPendingCount();
  };

  const handleCreateTestTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const currentCat = categories.find((c) => c.id === selectedCategory);
    const subCatId = currentCat?.subCategories[0]?.id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: taskTitle.trim(),
      description: `Step 1 test task for ${currentCat?.name || 'General'}`,
      categoryId: selectedCategory,
      subCategoryId: subCatId,
      date: todayStr,
      startTime: taskTime,
      endTime: '10:30',
      status: 'todo',
      priority: taskPriority,
      emoji: currentCat?.emoji || '📋',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncedWithCloud: false,
    };

    await saveTask(newTask);
    setTaskTitle('');
    await refreshTasks();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    await refreshTasks();
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await saveTask({
      ...task,
      status: newStatus,
    });
    await refreshTasks();
  };

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top ambient glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DailyActivities PWA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Step 1 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Core Architecture, Data Model & Offline-First IndexedDB
              </p>
            </div>
          </div>

          {/* Sync & Connectivity Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                syncState.isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              {syncState.isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{syncState.isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>IndexedDB:</span>
              <span className="text-emerald-400 font-semibold">{isDbReady ? 'Connected' : 'Connecting...'}</span>
            </div>

            <button
              onClick={() => realtimeSync.syncPendingQueue()}
              disabled={syncState.isSyncing}
              className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 transition-all active:scale-95 disabled:opacity-50"
              title="Trigger Sync to Cloud"
            >
              <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Step 1 Completion Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                  Gated Milestone
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-xs text-slate-400 font-medium">Ready for Review</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Step 1: Core Architecture, Data Model & Offline Setup
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Base PWA scaffolding with Next.js App Router, typed IndexedDB schema, Firebase Realtime Database connector, and preset categories with emojis and subcategories.
              </p>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>IndexedDB Storage</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Cloud Sync Queue</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>9 Core Categories</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Architecture Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Categories Configured</span>
              <span className="text-indigo-400 text-base">🏷️</span>
            </div>
            <div className="text-2xl font-bold text-white">{categories.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Pre-seeded with sub-categories</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Sub-categories</span>
              <span className="text-purple-400 text-base">📂</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {categories.reduce((acc, c) => acc + c.subCategories.length, 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Granular tagging ready</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Tasks in IndexedDB</span>
              <span className="text-emerald-400 text-base">💾</span>
            </div>
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Stored locally on client</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Sync Queue</span>
              <span className="text-amber-400 text-base">🔄</span>
            </div>
            <div className="text-2xl font-bold text-white">{syncState.pendingChangesCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Pending remote mutations</div>
          </div>
        </div>

        {/* Navigation Tabs for Step 1 Inspection */}
        <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏷️ Categories & Sub-categories</span>
            <span className="px-1.5 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ IndexedDB Live Tester</span>
            <span className="px-1.5 py-0.5 rounded text-xs bg-slate-800 text-slate-300">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('datamodels')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'datamodels'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>Data Model Schemas</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Firebase & Sync Engine</span>
          </button>
        </div>

        {/* Tab 1: Categories & Sub-categories Explorer */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Pre-Configured Core Categories</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Includes all requested categories: Web Dev, Social Media, Video, Digital Marketing, Mobile App, E-commerce, Client Communication, Delivery, and Care Routines.
                </p>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border text-left relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-500 bg-slate-900/90 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                          style={{ backgroundColor: cat.bgColor, border: `1px solid ${cat.borderColor}` }}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {cat.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">
                            {cat.subCategories.length} sub-categories
                          </span>
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                        title={`Color: ${cat.color}`}
                      />
                    </div>

                    {/* Subcategory Pills */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {cat.subCategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          <span>{sub.emoji}</span>
                          <span>{sub.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Category Deep Dive */}
            {activeCategoryObj && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeCategoryObj.emoji}</span>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {activeCategoryObj.name} Sub-category Details
                      </h3>
                      <p className="text-xs text-slate-400">
                        Configured for tagging, filtering, and scheduled routines
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeCategoryObj.subCategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                    >
                      <span className="text-2xl">{sub.emoji}</span>
                      <div>
                        <div className="font-medium text-sm text-slate-200">{sub.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{sub.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">ID: {sub.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: IndexedDB Live Tester */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Creator Form */}
            <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Insert Test Task</span>
                </h3>
                <span className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  IndexedDB Write
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Creates an offline record in IndexedDB and registers it in the sync queue.
              </p>

              <form onSubmit={handleCreateTestTask} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Implement PWA push notifications"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={taskTime}
                      onChange={(e) => setTaskTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="low">Low 🟢</option>
                      <option value="medium">Medium 🟡</option>
                      <option value="high">High 🔴</option>
                      <option value="urgent">Urgent ⚡</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save to IndexedDB</span>
                </button>
              </form>
            </div>

            {/* Right: Live Stored Records in IndexedDB */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Live IndexedDB Records (`daily_activities_db`)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time local query results. Persists across offline sessions and page reloads.
                  </p>
                </div>
                <button
                  onClick={refreshTasks}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2 bg-slate-900/20">
                  <span className="text-3xl">📝</span>
                  <div className="text-sm font-medium text-slate-300">
                    No tasks stored yet in IndexedDB
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Use the form on the left to insert a test task, or await Step 2 for the full interactive schedule and voice-to-text creation modal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((task) => {
                    const cat = categories.find((c) => c.id === task.categoryId);
                    const isDone = task.status === 'completed';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                : 'border-slate-700 hover:border-indigo-400 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base">{task.emoji || cat?.emoji || '📋'}</span>
                              <span
                                className={`text-sm font-semibold ${
                                  isDone ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {task.title}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                                style={{
                                  backgroundColor: cat?.bgColor || 'rgba(99, 102, 241, 0.15)',
                                  color: cat?.color || '#818cf8',
                                }}
                              >
                                {cat?.name || 'General'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {task.startTime || 'All Day'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {task.date}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">
                                Priority: {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              task.syncedWithCloud
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {task.syncedWithCloud ? 'Cloud Synced' : 'Local Only'}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Data Model Schemas */}
        {activeTab === 'datamodels' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-white text-base">Core TypeScript Interfaces</h3>
              <p className="text-xs text-slate-400">
                These schemas support the full lifecycle for Steps 1, 2, and 3: time-wise tasks, subcategories, recurrence, voice prompts, and shared profile permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs overflow-x-auto text-slate-300">
                <div className="text-indigo-400 font-bold mb-2">// Task Interface</div>
                <pre>{`export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
}`}</pre>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs overflow-x-auto text-slate-300">
                <div className="text-purple-400 font-bold mb-2">// Category & SubCategory</div>
                <pre>{`export interface Category {
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

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  emoji: string;
  description?: string;
}`}</pre>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs overflow-x-auto text-slate-300">
                <div className="text-emerald-400 font-bold mb-2">// Recurrence & Reminders (Step 3 ready)</div>
                <pre>{`export type RecurrenceFrequency = 
  | 'none' | 'daily' | 'weekly' | 'monthly' 
  | 'month_start' | 'month_mid' | 'month_end' | 'custom';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface ReminderSettings {
  enabled: boolean;
  time?: string;
  routineType?: 'medicine' | 'walking' | 'playtime' | 'work' | 'custom';
  promptText?: string;
}`}</pre>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs overflow-x-auto text-slate-300">
                <div className="text-amber-400 font-bold mb-2">// Shared Profiles & Permissions (Step 3 ready)</div>
                <pre>{`export interface UserPermission {
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
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Firebase & Sync Engine */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-indigo-400" />
                    <span>Firebase Realtime Database Offline-First Engine</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Operates with an optimistic local-first architecture. Any change writes to IndexedDB first and queues an entry for Firebase synchronization.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      syncState.firebaseConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        syncState.firebaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    {syncState.firebaseConnected ? 'Connected to Firebase' : 'Offline-First Fallback'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-xs text-slate-400">Queue Items Pending</div>
                  <div className="text-xl font-bold text-white mt-1">
                    {syncState.pendingChangesCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Stored in IndexedDB `sync_queue`</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-xs text-slate-400">Last Synced Time</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {syncState.lastSyncedAt
                      ? new Date(syncState.lastSyncedAt).toLocaleTimeString()
                      : 'Never'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {syncState.lastSyncedAt ? 'Synced with cloud' : 'Awaiting sync trigger'}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-xs text-slate-400">Sync Engine Status</div>
                  <div className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                    {syncState.isSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span className="text-indigo-400">Syncing in progress</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Idle / Ready</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Background task listener</div>
                </div>
              </div>

              {syncState.syncError && (
                <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/50 text-xs text-amber-300">
                  <span className="font-semibold">Notice:</span> {syncState.syncError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verification Checklist */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Step 1 Verification Checklist
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Next.js App Router & Tailwind CSS base structure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Offline-First IndexedDB (`idb`) + Firebase RTDB</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>All 8 Core Categories + Subcategories defined</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
