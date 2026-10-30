'use client';

import React from 'react';
import { X, Moon, Sun, Type, Volume2, VolumeX, Palette, Cloud, Database, Check } from 'lucide-react';
import { useSettings, AppTheme, FontSize } from '@/context/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: {
    isOnline: boolean;
    isSyncing: boolean;
    pendingChangesCount: number;
    firebaseConnected: boolean;
  };
  onOpenInspector?: () => void;
}

export function SettingsModal({ isOpen, onClose, syncState, onOpenInspector }: SettingsModalProps) {
  const { theme, setTheme, fontSize, setFontSize, soundEnabled, setSoundEnabled } = useSettings();

  if (!isOpen) return null;

  const themes: { id: AppTheme; name: string; type: 'dark' | 'light'; bgPreview: string; accentPreview: string }[] = [
    { id: 'dark-slate', name: 'Midnight Slate', type: 'dark', bgPreview: '#020617', accentPreview: '#6366f1' },
    { id: 'dark-purple', name: 'Cyber Purple', type: 'dark', bgPreview: '#090514', accentPreview: '#a855f7' },
    { id: 'dark-black', name: 'OLED Pure Black', type: 'dark', bgPreview: '#000000', accentPreview: '#10b981' },
    { id: 'light-default', name: 'Clean Daylight', type: 'light', bgPreview: '#ffffff', accentPreview: '#4f46e5' },
    { id: 'light-mint', name: 'Nordic Mint', type: 'light', bgPreview: '#f0fdf4', accentPreview: '#059669' },
    { id: 'light-warm', name: 'Warm Amber', type: 'light', bgPreview: '#faf5ee', accentPreview: '#d97706' },
  ];

  const fontSizes: { id: FontSize; label: string; desc: string }[] = [
    { id: 'sm', label: 'Compact', desc: '14px base font' },
    { id: 'base', label: 'Standard', desc: '16px base font' },
    { id: 'lg', label: 'Spacious', desc: '18px base font' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">App Settings & Appearance</h2>
              <p className="text-xs text-slate-400">Themes, typography, and offline sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-4 space-y-6 overflow-y-auto flex-1">
          {/* Theme Palette Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Color Themes</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: t.bgPreview }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: t.accentPreview }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{t.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{t.type}</div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Font Size Control */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>Typography & Font Size</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {fontSizes.map((f) => {
                const isSelected = fontSize === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className="text-[10px] text-slate-500">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Chime Feedback */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Micro-Interactions</span>
            </label>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800/60 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">Task Completion Chime</div>
                  <div className="text-[10px] text-slate-400">Play pleasant sound and confetti burst</div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  soundEnabled
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {soundEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>

          {/* Sync & Storage status */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>IndexedDB Storage</span>
              </span>
              <span className="text-emerald-400 text-[11px]">Healthy & Active</span>
            </div>
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Synchronization</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {syncState.firebaseConnected ? 'Connected' : 'Offline-First Ready'}
              </span>
            </div>
          </div>
          {/* Developer / Architecture Inspector */}
          {onOpenInspector && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInspector();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🔍 Open DB & Data Model Inspector</span>
              </button>
            </div>
          )}
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
