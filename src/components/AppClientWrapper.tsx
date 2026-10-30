'use client';

import React, { useState } from 'react';
import { SettingsProvider } from '@/context/SettingsContext';
import { HomeScreen } from './HomeScreen';
import Step1ReviewPage from './Step1ReviewPage';
import { Layers, Home } from 'lucide-react';

export default function AppClientWrapper() {
  const [currentView, setCurrentView] = useState<'home' | 'step1_inspector'>('home');

  return (
    <SettingsProvider>
      {/* Top Banner Navigation Pill to toggle between Home Screen & Architecture Inspector */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center p-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            currentView === 'home'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Step 2: Home Screen UI</span>
        </button>

        <button
          onClick={() => setCurrentView('step1_inspector')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            currentView === 'step1_inspector'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Step 1: DB & Model Inspector</span>
        </button>
      </div>

      {currentView === 'home' ? <HomeScreen /> : <Step1ReviewPage />}
    </SettingsProvider>
  );
}
