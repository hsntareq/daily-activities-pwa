'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '@/types';

interface CalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  tasks: Task[];
}

export function CalendarStrip({ selectedDate, onSelectDate, tasks }: CalendarStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate an array of dates around the selected date (-14 days to +28 days)
  const dates = React.useMemo(() => {
    const list: Date[] = [];
    const base = new Date();
    // Start 14 days before today
    for (let i = -14; i <= 28; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const formatDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateStr(new Date());

  // Scroll active date into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedDate]);

  const handlePrevDay = () => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() - 1);
    onSelectDate(formatDateStr(curr));
  };

  const handleNextDay = () => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + 1);
    onSelectDate(formatDateStr(curr));
  };

  const handleGoToday = () => {
    onSelectDate(todayStr);
  };

  // Format month and year of currently selected date
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const monthYearLabel = selectedDateObj.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md">
      {/* Top Header: Month Year + Quick Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            {monthYearLabel}
          </h2>
          {selectedDate === todayStr && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGoToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors active:scale-95"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors active:scale-95"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Calendar Strip */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((dateItem) => {
          const dateStr = formatDateStr(dateItem);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const dayName = dateItem.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateItem.getDate();

          // Count tasks for this day
          const dayTasks = tasks.filter((t) => t.date === dateStr && !t.isDeleted);
          const hasTasks = dayTasks.length > 0;
          const allCompleted = hasTasks && dayTasks.every((t) => t.status === 'completed');

          return (
            <button
              key={dateStr}
              data-active={isSelected}
              onClick={() => onSelectDate(dateStr)}
              className={`flex-shrink-0 flex flex-col items-center justify-between w-[58px] h-[76px] py-2 rounded-xl transition-all duration-200 border relative group ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-105'
                  : isToday
                  ? 'bg-slate-800/90 border-indigo-500/50 text-indigo-300 hover:bg-slate-800'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <span className={`text-[11px] font-medium uppercase tracking-wider ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {dayName}
              </span>

              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                {dayNum}
              </span>

              {/* Task Indicator Dot(s) */}
              <div className="flex items-center gap-0.5 h-1.5">
                {hasTasks ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? 'bg-white'
                        : allCompleted
                        ? 'bg-emerald-400'
                        : 'bg-indigo-400'
                    }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
