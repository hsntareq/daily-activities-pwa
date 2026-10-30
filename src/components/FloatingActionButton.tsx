'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        aria-label="Add New Activity"
        className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
      >
        {/* Pulsing ambient ring */}
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-40 blur-sm group-hover:opacity-75 transition duration-500 group-hover:duration-200 animate-pulse -z-10" />

        <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90" />
      </button>
    </div>
  );
}
