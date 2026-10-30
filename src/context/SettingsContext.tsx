'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSetting, setSetting } from '@/lib/db/indexedDB';

export type AppTheme = 
  | 'dark-slate'
  | 'dark-purple'
  | 'dark-black'
  | 'light-default'
  | 'light-mint'
  | 'light-warm';

export type FontSize = 'sm' | 'base' | 'lg';

interface SettingsContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('dark-slate');
  const [fontSize, setFontSizeState] = useState<FontSize>('base');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    async function load() {
      try {
        const savedTheme = await getSetting<AppTheme>('app_theme', 'dark-slate');
        const savedFontSize = await getSetting<FontSize>('app_font_size', 'base');
        const savedSound = await getSetting<boolean>('app_sound_enabled', true);
        setThemeState(savedTheme);
        setFontSizeState(savedFontSize);
        setSoundEnabledState(savedSound);
      } catch (err) {
        console.warn('Failed to load settings:', err);
      }
    }
    load();
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    setSetting('app_theme', newTheme);
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    setSetting('app_font_size', newSize);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    setSetting('app_sound_enabled', enabled);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      <div className={`theme-${theme} font-size-${fontSize} min-h-screen transition-colors duration-300`}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
