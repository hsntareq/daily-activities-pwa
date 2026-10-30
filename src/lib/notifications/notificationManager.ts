'use client';

import { Task } from '@/types';

export interface ActiveRoutinePrompt {
  id: string;
  task: Task;
  title: string;
  message: string;
  routineType: string;
  emoji: string;
  timestamp: number;
}

type PromptListener = (prompt: ActiveRoutinePrompt | null) => void;

class NotificationManager {
  private activePrompt: ActiveRoutinePrompt | null = null;
  private listeners: Set<PromptListener> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private notifiedTaskIds: Set<string> = new Set();

  public subscribe(listener: PromptListener): () => void {
    this.listeners.add(listener);
    listener(this.activePrompt);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.activePrompt));
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.requestPermission();
    }
    return 'denied';
  }

  public playChime() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        // Pleasant two-tone chime
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch {
        // ignore
      }
    }
  }

  public triggerRoutinePrompt(task: Task) {
    this.playChime();

    // Trigger browser system notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`${task.emoji || '⏰'} ${task.title}`, {
          body: task.reminder?.promptText || `Time for routine: ${task.title}`,
          icon: '/icons/icon-192.svg',
          badge: '/icons/icon-192.svg',
          tag: task.id,
        });
      } catch (e) {
        console.warn('System notification failed, falling back to in-app prompt:', e);
      }
    }

    this.activePrompt = {
      id: `prompt_${task.id}_${Date.now()}`,
      task,
      title: task.title,
      message: task.reminder?.promptText || task.description || 'Scheduled routine is ready for action.',
      routineType: task.reminder?.routineType || 'custom',
      emoji: task.emoji || '⏰',
      timestamp: Date.now(),
    };

    this.notify();
  }

  public dismissPrompt() {
    this.activePrompt = null;
    this.notify();
  }

  public snoozePrompt(minutes: number = 10) {
    if (!this.activePrompt) return;
    const task = this.activePrompt.task;
    this.dismissPrompt();

    // Re-trigger after snooze duration
    setTimeout(() => {
      this.triggerRoutinePrompt(task);
    }, minutes * 60 * 1000);
  }

  public startScheduleMonitor(getTasks: () => Promise<Task[]>) {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        const tasks = await getTasks();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        for (const task of tasks) {
          if (
            task.date === todayStr &&
            task.status === 'todo' &&
            task.reminder?.enabled &&
            task.startTime === currentTimeStr &&
            !this.notifiedTaskIds.has(`${task.id}_${currentTimeStr}`)
          ) {
            this.notifiedTaskIds.add(`${task.id}_${currentTimeStr}`);
            this.triggerRoutinePrompt(task);
            break;
          }
        }
      } catch (err) {
        console.warn('Routine monitor error:', err);
      }
    }, 15000); // Check every 15 seconds
  }

  public stopScheduleMonitor() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const notificationManager = new NotificationManager();
