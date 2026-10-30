'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Volume2,
  Check,
} from 'lucide-react';
import { useSpeechToText } from '@/lib/speech/useSpeechToText';
import { Category, Task, TaskPriority, RoutineType, RecurrenceFrequency } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => Promise<void>;
  categories: Category[];
  initialDate?: string;
}

export function TaskModal({
  isOpen,
  onClose,
  onSaveTask,
  categories,
  initialDate,
}: TaskModalProps) {
  const {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-web-dev');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [routineType, setRoutineType] = useState<RoutineType>('work');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync category's first subcategory whenever category changes
  useEffect(() => {
    const currentCat = categories.find((c) => c.id === categoryId);
    if (currentCat && currentCat.subCategories.length > 0) {
      setSubCategoryId(currentCat.subCategories[0].id);
    } else {
      setSubCategoryId('');
    }
  }, [categoryId, categories]);

  // AUTO-ACTIVATE Web Speech API upon opening as required by blueprint
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      resetTranscript();
      if (initialDate) setDate(initialDate);

      // Automatically activate Web Speech API
      if (isSpeechSupported) {
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isOpen, initialDate, isSpeechSupported, startListening, stopListening, resetTranscript]);

  // When speech transcript updates, stream it into the title input!
  useEffect(() => {
    if (transcript) {
      setTitle(transcript);
    }
  }, [transcript]);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === categoryId) || categories[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    stopListening();

    try {
      await onSaveTask({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        subCategoryId: subCategoryId || undefined,
        date,
        startTime,
        endTime,
        status: 'todo',
        priority,
        emoji: currentCategory?.emoji || '📋',
        isRecurring: frequency !== 'none',
        recurrenceRule: frequency !== 'none' ? { frequency } : undefined,
        reminder: isReminderEnabled
          ? {
              enabled: true,
              time: startTime,
              routineType,
              promptText: `Scheduled ${routineType}: ${title}`,
              soundEnabled: true,
            }
          : undefined,
      });

      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create New Activity</h2>
              <p className="text-xs text-slate-400">Speak or type your task details</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice-to-Text Listening Banner */}
        <div className="my-4 p-3.5 rounded-xl border bg-slate-950/70 border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-voice-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {isListening ? '🎙️ Listening via Web Speech...' : 'Microphone Paused'}
                </span>
                {isListening && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isListening
                  ? 'Speak clearly — your speech is automatically transcribed below'
                  : isSpeechSupported
                  ? 'Tap mic icon to resume voice recording'
                  : 'Web Speech API not supported on this browser (fallback to typing)'}
              </p>
            </div>
          </div>

          {isListening && (
            <button
              type="button"
              onClick={resetTranscript}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {speechError && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Title input with live voice feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
              <span>Activity / Task Title *</span>
              {interimTranscript && (
                <span className="text-[11px] text-indigo-400 italic">
                  Hearing: &ldquo;{interimTranscript}&rdquo;
                </span>
              )}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Client discovery call for Mobile App redesign"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, agenda, or deliverable links..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Subcategory Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Sub-category
              </label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {currentCategory?.subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.emoji} {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Priority & Recurrence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all border ${
                        isSel
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p === 'urgent' ? '⚡' : p[0].toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Recurring Cadence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="none">One-off Activity</option>
                <option value="month_start">🏁 Beginning of Month (1st)</option>
                <option value="month_mid">📊 Middle of Month (15th)</option>
                <option value="month_end">🏠 End of Month (Rent / Dues)</option>
                <option value="daily">☀️ Daily Routine</option>
                <option value="weekly">📅 Weekly (Every Monday)</option>
              </select>
            </div>
          </div>

          {/* Routine Reminder Notification Options */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>🔔 Routine Reminder & Interactive Alert</span>
              </label>
              <button
                type="button"
                onClick={() => setIsReminderEnabled(!isReminderEnabled)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                  isReminderEnabled
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isReminderEnabled ? 'Active' : 'Disabled'}
              </button>
            </div>

            {isReminderEnabled && (
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Routine Category</span>
                  <select
                    value={routineType}
                    onChange={(e) => setRoutineType(e.target.value as RoutineType)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="medicine">💊 Medicine & Prescriptions</option>
                    <option value="walking">🚶‍♂️ Walking & Cardio</option>
                    <option value="playtime">🎮 Playtime / Mental Break</option>
                    <option value="work">💼 Work Focus / Standup</option>
                    <option value="custom">⏰ Custom Routine</option>
                  </select>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Alert Time</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                stopListening();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : 'Save Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
