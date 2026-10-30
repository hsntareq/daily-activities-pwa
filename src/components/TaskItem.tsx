'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { Clock, Trash2, Check, Sparkles, Bell, Lock } from 'lucide-react';
import { Task, Category } from '@/types';
import { useSettings } from '@/context/SettingsContext';

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggleStatus: (task: Task) => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function TaskItem({
  task,
  category,
  onToggleStatus,
  onDelete,
  canEdit = true,
  canDelete = true,
}: TaskItemProps) {
  const { soundEnabled } = useSettings();
  const isCompleted = task.status === 'completed';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) {
      alert("🔒 View-Only: You don't have permission to edit or check tasks on this shared profile.");
      return;
    }
    if (!isCompleted) {
      // Fire confetti burst!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: [category?.color || '#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });

      // Optional playful audio chime via Web Audio API
      if (soundEnabled && typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        } catch {
          // ignore
        }
      }
    }
    onToggleStatus(task);
  };

  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'urgent':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'low':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const subCategoryObj = category?.subCategories?.find((s) => s.id === task.subCategoryId);

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 flex items-start justify-between gap-3 ${
        isCompleted
          ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 shadow-md hover:shadow-indigo-500/5'
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Animated Interactive Checkbox */}
        <button
          onClick={handleToggle}
          disabled={!canEdit}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-90 ${
            !canEdit
              ? 'border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed'
              : isCompleted
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
              : 'border-slate-700 hover:border-indigo-400 text-transparent hover:bg-indigo-500/10'
          }`}
          title={
            !canEdit
              ? 'Permission Denied: Read-only profile'
              : isCompleted
              ? 'Mark as incomplete'
              : 'Mark as completed'
          }
        >
          {!canEdit ? (
            <Lock className="w-3 h-3 text-slate-500" />
          ) : (
            <Check
              className={`w-3.5 h-3.5 stroke-[3] transition-transform ${
                isCompleted ? 'scale-100' : 'scale-50'
              }`}
            />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg leading-none" role="img" aria-label="emoji">
              {task.emoji || category?.emoji || '📋'}
            </span>

            <h3
              className={`text-sm font-semibold tracking-tight truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Category Tag */}
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border"
              style={{
                backgroundColor: category?.bgColor || 'rgba(99, 102, 241, 0.1)',
                borderColor: category?.borderColor || 'rgba(99, 102, 241, 0.3)',
                color: category?.color || '#818cf8',
              }}
            >
              {category?.name || 'General'}
            </span>

            {/* Sub-category Pill */}
            {subCategoryObj && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                <span>{subCategoryObj.emoji}</span>
                <span>{subCategoryObj.name}</span>
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Time & Metadata Pill bar */}
          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            {(task.startTime || task.endTime) && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded-md border border-slate-800/70">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>
                  {task.startTime || '00:00'}
                  {task.endTime ? ` - ${task.endTime}` : ''}
                </span>
              </span>
            )}

            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getPriorityStyle()}`}>
              {task.priority}
            </span>

            {task.reminder?.enabled && (
              <span className="inline-flex items-center gap-1 text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                <Bell className="w-3 h-3 text-purple-400" />
                <span>Reminder</span>
              </span>
            )}

            {task.isRecurring && (
              <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                🔄 Recurring
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Action (only if canDelete permission is granted) */}
      {canDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
