'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Plus, Calendar, Clock, Sparkles, Check, Trash2, Power } from 'lucide-react';
import {
  RecurringEventTemplate,
  getSavedRecurringTemplates,
  saveRecurringTemplates,
  materializeRecurringEventsForDate,
} from '@/lib/recurring/recurringService';
import { RecurrenceFrequency, Category, TaskPriority } from '@/types';

interface RecurringEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentDate: string;
  onEventsMaterialized: () => Promise<void>;
}

export function RecurringEventsModal({
  isOpen,
  onClose,
  categories,
  currentDate,
  onEventsMaterialized,
}: RecurringEventsModalProps) {
  const [templates, setTemplates] = useState<RecurringEventTemplate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFrequency, setNewFrequency] = useState<RecurrenceFrequency>('month_start');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || 'cat-web-dev');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      getSavedRecurringTemplates().then(setTemplates);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleActive = async (id: string) => {
    const updated = templates.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t));
    setTemplates(updated);
    await saveRecurringTemplates(updated);
  };

  const handleDeleteTemplate = async (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    await saveRecurringTemplates(updated);
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cat = categories.find((c) => c.id === newCategoryId) || categories[0];
    const newTpl: RecurringEventTemplate = {
      id: `rec_custom_${Date.now()}`,
      title: newTitle.trim(),
      categoryId: newCategoryId,
      emoji: cat?.emoji || '🔄',
      frequency: newFrequency,
      time: newTime,
      description: newDescription.trim() || `Recurring ${newFrequency} task`,
      priority: newPriority,
      isActive: true,
    };

    const updated = [newTpl, ...templates];
    setTemplates(updated);
    await saveRecurringTemplates(updated);
    setIsAdding(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleTriggerMaterialization = async () => {
    await materializeRecurringEventsForDate(currentDate);
    await onEventsMaterialized();
  };

  const getFrequencyLabel = (freq: RecurrenceFrequency) => {
    switch (freq) {
      case 'month_start':
        return '🏁 Beginning of Month (1st)';
      case 'month_mid':
        return '📊 Middle of Month (15th)';
      case 'month_end':
        return '🏠 End of Month (Rent / Dues)';
      case 'daily':
        return '☀️ Daily Routine';
      case 'weekly':
        return '📅 Weekly (Every Monday)';
      default:
        return freq;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Recurring Event Management</h2>
              <p className="text-xs text-slate-400">
                Beginning/middle/end of month tasks, rent collection, and scheduled routines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Quick Action Bar */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancel' : 'Add Recurring Rule'}</span>
            </button>

            <button
              onClick={handleTriggerMaterialization}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Materializes recurring tasks matching the currently selected calendar date"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync With Date ({currentDate})</span>
            </button>
          </div>

          {/* New Recurring Rule Form */}
          {isAdding && (
            <form onSubmit={handleAddTemplate} className="p-4 rounded-xl border border-indigo-500/40 bg-slate-950 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Create New Recurring Cadence
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Monthly Rent Collection or Server Invoices"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Recurrence Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="month_start">🏁 Beginning of Month (1st)</option>
                    <option value="month_mid">📊 Middle of Month (15th)</option>
                    <option value="month_end">🏠 End of Month (Rent / Wrap-up)</option>
                    <option value="daily">☀️ Daily Routine</option>
                    <option value="weekly">📅 Weekly (Every Monday)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Save Cadence
                </button>
              </div>
            </form>
          )}

          {/* List of Templates */}
          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const cat = categories.find((c) => c.id === tpl.categoryId);
              return (
                <div
                  key={tpl.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    tpl.isActive
                      ? 'bg-slate-950/70 border-slate-800'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl mt-0.5">{tpl.emoji}</span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                          {tpl.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                          {getFrequencyLabel(tpl.frequency)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{tpl.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {tpl.time}
                        </span>
                        <span>Category: {cat?.name || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(tpl.id)}
                      className={`p-2 rounded-lg border transition-colors ${
                        tpl.isActive
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                      title={tpl.isActive ? 'Active (Click to pause)' : 'Paused (Click to activate)'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
