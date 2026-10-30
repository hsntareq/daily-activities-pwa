'use client';

import React, { useState } from 'react';
import { SettingsProvider } from '@/context/SettingsContext';
import { HomeScreen } from './HomeScreen';
import Step1ReviewPage from './Step1ReviewPage';

export default function AppClientWrapper() {
  const [showInspector, setShowInspector] = useState(false);

  return (
    <SettingsProvider>
      {showInspector ? (
        <div className="relative">
          <button
            onClick={() => setShowInspector(false)}
            className="fixed top-3 right-4 z-50 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl transition-all"
          >
            ← Return to Home Screen
          </button>
          <Step1ReviewPage />
        </div>
      ) : (
        <HomeScreen onOpenInspector={() => setShowInspector(true)} />
      )}
    </SettingsProvider>
  );
}
