import React from 'react';
import { UserSettings, SearchEngine } from '../types';
import type { User } from '@supabase/supabase-js';

interface SettingsModalProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, updateSettings, onClose, user, onLogout }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#643d2c] border-2 border-stone-500/30 rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Settings</h2>
          <button onClick={onClose} className="p-2 bg-white/10 text-stone-300 hover:text-white rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-8">
          {user && (
            <div>
              <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
                Cloud Sync Active
              </label>
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/10">
                <p className="text-sm font-bold text-white truncate" title={user.email || 'Signed in user'}>
                  {user.user_metadata?.full_name || user.email}
                </p>
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 text-xs font-bold bg-red-600/80 rounded-lg hover:bg-red-600 text-white transition-colors whitespace-nowrap"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
              Contextual Phrase
            </label>
            <input
              type="text"
              value={settings.appendedPhrase}
              onChange={(e) => updateSettings({ appendedPhrase: e.target.value })}
              placeholder="e.g., peer reviews for"
              className="w-full px-5 py-4 rounded-2xl border-2 border-white/10 focus:border-orange-500/50 outline-none transition-all font-bold text-white bg-black/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3">
                Placement
              </label>
              <div className="flex p-1 bg-black/30 rounded-xl border border-white/5">
                <button
                  onClick={() => updateSettings({ isPrefix: true })}
                  className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${settings.isPrefix ? 'bg-orange-500 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                >
                  PREFIX
                </button>
                <button
                  onClick={() => updateSettings({ isPrefix: false })}
                  className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${!settings.isPrefix ? 'bg-orange-500 text-white shadow-lg' : 'text-stone-400 hover:text-white'}`}
                >
                  SUFFIX
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3">
                Search Engine
              </label>
              <div className="relative">
                <select
                  value={settings.engine}
                  onChange={(e) => updateSettings({ engine: e.target.value as SearchEngine })}
                  className="w-full px-5 py-3.5 rounded-xl border-2 border-white/10 focus:border-orange-500/50 outline-none transition-all appearance-none bg-black/30 font-bold text-white pr-10"
                >
                  {Object.values(SearchEngine).map((engine) => (
                    <option key={engine} value={engine} className="bg-[#643d2c]">{engine}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};