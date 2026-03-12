// SettingsModal.tsx - Settings modal with user info and preferences
import React, { useState } from 'react';
import { UserSettings, SearchEngine } from '../types';
import { User } from '../services/firebase';

interface SettingsModalProps {
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => void;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  settings, 
  updateSettings, 
  onClose, 
  user, 
  onLogout 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#643d2c] border-2 border-stone-500/30 rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Settings</h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/10 text-stone-300 hover:text-white rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* User Info */}
          {user && (
            <div>
              <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
                ☁️ Cloud Sync Active
              </label>
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-[180px]">
                      {user.displayName || user.email}
                    </p>
                    {user.displayName && user.email && (
                      <p className="text-xs text-stone-400 truncate max-w-[180px]">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 text-xs font-bold bg-red-600/80 rounded-lg hover:bg-red-600 text-white transition-colors whitespace-nowrap"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Search Engine */}
          <div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
              Search Engine
            </label>
            <select
              value={localSettings.engine}
              onChange={(e) => setLocalSettings({ ...localSettings, engine: e.target.value as SearchEngine })}
              className="w-full p-4 bg-black/30 border border-stone-500/30 rounded-xl text-white focus:border-orange-500/50 outline-none"
            >
              {Object.values(SearchEngine).map(engine => (
                <option key={engine} value={engine} className="bg-stone-800">{engine}</option>
              ))}
            </select>
          </div>

          {/* Context Phrase */}
          <div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
              Context Phrase
            </label>
            <input
              type="text"
              value={localSettings.appendedPhrase}
              onChange={(e) => setLocalSettings({ ...localSettings, appendedPhrase: e.target.value })}
              className="w-full p-4 bg-black/30 border border-stone-500/30 rounded-xl text-white placeholder-stone-500 focus:border-orange-500/50 outline-none"
              placeholder="e.g., metaphysical properties of"
            />
          </div>

          {/* Prefix/Suffix Toggle */}
          <div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
              Phrase Position
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, isPrefix: true })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  localSettings.isPrefix 
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400' 
                    : 'border-stone-500/30 text-stone-400 hover:border-stone-400'
                }`}
              >
                <span className="font-bold">Prefix</span>
                <p className="text-xs mt-1 opacity-70">"phrase [query]"</p>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, isPrefix: false })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  !localSettings.isPrefix 
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400' 
                    : 'border-stone-500/30 text-stone-400 hover:border-stone-400'
                }`}
              >
                <span className="font-bold">Suffix</span>
                <p className="text-xs mt-1 opacity-70">"[query] phrase"</p>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-3 block">
              Preview
            </label>
            <div className="p-4 bg-black/30 rounded-xl border border-stone-500/30">
              <p className="text-white font-mono text-sm">
                {localSettings.isPrefix 
                  ? `"${localSettings.appendedPhrase} rose quartz"`
                  : `"rose quartz ${localSettings.appendedPhrase}"`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;