import { Task, RecurrenceFrequency, RecurrenceRule } from '@/types';
import { getAllTasks, saveTask, getDB } from '@/lib/db/indexedDB';

export interface RecurringEventTemplate {
  id: string;
  title: string;
  categoryId: string;
  subCategoryId?: string;
  emoji: string;
  frequency: RecurrenceFrequency;
  time: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
}

// Default recurring templates matching the blueprint (Beginning/Middle/End of month, Rent, Routines)
export const DEFAULT_RECURRING_TEMPLATES: RecurringEventTemplate[] = [
  {
    id: 'rec_month_start_goals',
    title: 'Monthly Organizational Goals & Billing Review',
    categoryId: 'cat-web-dev',
    subCategoryId: 'sub-deployment',
    emoji: '🎯',
    frequency: 'month_start',
    time: '09:00',
    description: 'Beginning-of-month client milestones, invoice dispatches, and infrastructure billing checks.',
    priority: 'high',
    isActive: true,
  },
  {
    id: 'rec_month_mid_review',
    title: 'Mid-Month Retainer & Sprint Review',
    categoryId: 'cat-client-comm',
    subCategoryId: 'sub-contracts-invoices',
    emoji: '📊',
    frequency: 'month_mid',
    time: '14:00',
    description: 'Mid-month deliverables review, client check-in calls, and sprint progress tracking.',
    priority: 'medium',
    isActive: true,
  },
  {
    id: 'rec_month_end_rent',
    title: 'Rent Collection & Monthly Financial Wrap-up',
    categoryId: 'cat-routines',
    subCategoryId: 'sub-rent',
    emoji: '🏠',
    frequency: 'month_end',
    time: '18:00',
    description: 'End-of-month rent collection, accounts reconciliation, and utility dues.',
    priority: 'urgent',
    isActive: true,
  },
  {
    id: 'rec_daily_medicine',
    title: 'Morning Medicine & Vitamins Routine',
    categoryId: 'cat-routines',
    subCategoryId: 'sub-medicine',
    emoji: '💊',
    frequency: 'daily',
    time: '08:00',
    description: 'Daily scheduled prescription and multivitamin routine.',
    priority: 'high',
    isActive: true,
  },
  {
    id: 'rec_daily_walk',
    title: 'Evening Outdoor Walking & Cardio',
    categoryId: 'cat-routines',
    subCategoryId: 'sub-walking',
    emoji: '🚶‍♂️',
    frequency: 'daily',
    time: '17:30',
    description: 'Daily fresh air walk to hit step goal.',
    priority: 'medium',
    isActive: true,
  },
  {
    id: 'rec_daily_playtime',
    title: 'Family & Pet Playtime / Mental Break',
    categoryId: 'cat-routines',
    subCategoryId: 'sub-playtime',
    emoji: '🎮',
    frequency: 'daily',
    time: '19:30',
    description: 'Scheduled playtime with family, games, or pets.',
    priority: 'low',
    isActive: true,
  },
];

/**
 * Checks if a given date matches a recurrence frequency
 */
export function isDateMatchingFrequency(dateStr: string, frequency: RecurrenceFrequency): boolean {
  if (frequency === 'none') return false;
  if (frequency === 'daily') return true;

  const date = new Date(dateStr + 'T00:00:00');
  const dayOfMonth = date.getDate();

  if (frequency === 'month_start') {
    return dayOfMonth === 1;
  }

  if (frequency === 'month_mid') {
    return dayOfMonth === 15;
  }

  if (frequency === 'month_end') {
    // Check if tomorrow is the 1st of the next month
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    return tomorrow.getDate() === 1;
  }

  if (frequency === 'weekly') {
    // Every Monday (day 1)
    return date.getDay() === 1;
  }

  return false;
}

/**
 * Materializes recurring tasks for the given date if they haven't been created yet
 */
export async function materializeRecurringEventsForDate(dateStr: string): Promise<Task[]> {
  const existingTasks = await getAllTasks();
  const templates = await getSavedRecurringTemplates();
  const createdTasks: Task[] = [];

  for (const tpl of templates) {
    if (!tpl.isActive) continue;

    if (isDateMatchingFrequency(dateStr, tpl.frequency)) {
      // Check if already materialized for this date
      const alreadyExists = existingTasks.some(
        (t) => t.date === dateStr && t.title === tpl.title && !t.isDeleted
      );

      if (!alreadyExists) {
        const newTask: Task = {
          id: `rec_${tpl.id}_${dateStr}`,
          title: tpl.title,
          description: tpl.description,
          categoryId: tpl.categoryId,
          subCategoryId: tpl.subCategoryId,
          date: dateStr,
          startTime: tpl.time,
          status: 'todo',
          priority: tpl.priority,
          emoji: tpl.emoji,
          isRecurring: true,
          recurrenceRule: {
            frequency: tpl.frequency,
          },
          reminder: {
            enabled: true,
            time: tpl.time,
            promptText: `Scheduled routine: ${tpl.title}`,
            soundEnabled: true,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncedWithCloud: false,
        };

        await saveTask(newTask);
        createdTasks.push(newTask);
      }
    }
  }

  return createdTasks;
}

export async function getSavedRecurringTemplates(): Promise<RecurringEventTemplate[]> {
  if (typeof window === 'undefined') return DEFAULT_RECURRING_TEMPLATES;
  try {
    const raw = localStorage.getItem('daily_recurring_templates');
    if (!raw) {
      localStorage.setItem('daily_recurring_templates', JSON.stringify(DEFAULT_RECURRING_TEMPLATES));
      return DEFAULT_RECURRING_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RECURRING_TEMPLATES;
  }
}

export async function saveRecurringTemplates(templates: RecurringEventTemplate[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('daily_recurring_templates', JSON.stringify(templates));
  }
}
