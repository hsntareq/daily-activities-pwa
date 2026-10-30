'use client';

import React, { useState } from 'react';
import { X, Users, Shield, Plus, Check, Trash2, KeyRound, Lock, Eye, Edit3 } from 'lucide-react';
import { SharedProfile, UserPermission } from '@/types';

interface ShareTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: SharedProfile[];
  currentProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: (profile: SharedProfile) => void;
  onDeleteProfile: (id: string) => void;
}

export function ShareTabModal({
  isOpen,
  onClose,
  profiles,
  currentProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
}: ShareTabModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tabTitle, setTabTitle] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('💼');
  const [canCreate, setCanCreate] = useState(true);
  const [canEdit, setCanEdit] = useState(true);
  const [canDelete, setCanDelete] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !tabTitle.trim()) return;

    const newProfile: SharedProfile = {
      id: `prof_${Date.now()}`,
      userId: `user_${Date.now()}`,
      displayName: displayName.trim(),
      tabTitle: tabTitle.trim(),
      avatarEmoji,
      colorTheme: 'indigo',
      permissions: {
        canRead: true,
        canCreate,
        canEdit,
        canDelete,
      },
    };

    onAddProfile(newProfile);
    setIsAdding(false);
    setDisplayName('');
    setTabTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Shared Profiles & Permissions</h2>
              <p className="text-xs text-slate-400">Collaborative tabs with granular role controls</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Quick Action */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Workspace Profile Tabs
            </h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Cancel' : 'Share New Profile View'}</span>
            </button>
          </div>

          {/* Add Profile Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 rounded-xl border border-indigo-500/40 bg-slate-950 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure Shared Tab & Permissions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Avatar Emoji</label>
                  <select
                    value={avatarEmoji}
                    onChange={(e) => setAvatarEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                  >
                    <option value="💼">💼 Work / Team</option>
                    <option value="🤝">🤝 Client View</option>
                    <option value="🏠">🏠 Family / Home</option>
                    <option value="🚀">🚀 Startup / Project</option>
                    <option value="🎨">🎨 Design Review</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Tab Title *</label>
                  <input
                    type="text"
                    value={tabTitle}
                    onChange={(e) => setTabTitle(e.target.value)}
                    placeholder="e.g. Client Alpha Workspace"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Collaborator Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex (Product Manager)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Granular Permission Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Granular Sharing Permissions
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreate}
                      onChange={(e) => setCanCreate(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Can Create</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canEdit}
                      onChange={(e) => setCanEdit(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Can Edit</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canDelete}
                      onChange={(e) => setCanDelete(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Can Delete</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Create Shared Tab
                </button>
              </div>
            </form>
          )}

          {/* List of Profiles */}
          <div className="space-y-2.5">
            {profiles.map((p) => {
              const isActive = p.id === currentProfileId;
              const isOwner = p.isCurrentProfile;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{p.avatarEmoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                          {p.tabTitle}
                        </h4>
                        {isOwner && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{p.displayName}</p>

                      {/* Granular permission badges */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5 text-emerald-400" /> Read
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            p.permissions.canCreate
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          <Plus className="w-2.5 h-2.5" /> Create
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            p.permissions.canEdit
                              ? 'bg-blue-500/15 text-blue-300'
                              : 'bg-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          <Edit3 className="w-2.5 h-2.5" /> Edit
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            p.permissions.canDelete
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Delete
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProfile(p.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        Switch
                      </button>
                    )}

                    {!isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProfile(p.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove tab"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
