'use client';

import React, { useEffect, useState } from 'react';
import { Check, Clock, X, BellRing, Sparkles } from 'lucide-react';
import { notificationManager, ActiveRoutinePrompt } from '@/lib/notifications/notificationManager';
import confetti from 'canvas-confetti';

interface RoutineNotificationPromptProps {
  onCompleteTask: (taskId: string) => Promise<void>;
}

export function RoutineNotificationPrompt({ onCompleteTask }: RoutineNotificationPromptProps) {
  const [prompt, setPrompt] = useState<ActiveRoutinePrompt | null>(null);

  useEffect(() => {
    const unsub = notificationManager.subscribe((active) => {
      setPrompt(active);
    });
    return () => unsub();
  }, []);

  if (!prompt) return null;

  const handleComplete = async () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.3 },
    });
    await onCompleteTask(prompt.task.id);
    notificationManager.dismissPrompt();
  };

  const handleSnooze = () => {
    notificationManager.snoozePrompt(10);
  };

  const handleDismiss = () => {
    notificationManager.dismissPrompt();
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/60 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl ring-4 ring-indigo-500/20 text-white">
        {/* Animated ambient top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-500 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl flex-shrink-0 animate-bounce">
              {prompt.emoji}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <BellRing className="w-3 h-3 text-indigo-400" />
                  <span>Scheduled Routine Alert</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {prompt.task.startTime || 'Now'}
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight truncate">
                {prompt.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2">
                {prompt.message}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Prompt Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={handleSnooze}
            className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Snooze 10m</span>
          </button>

          <button
            onClick={handleComplete}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Complete Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
