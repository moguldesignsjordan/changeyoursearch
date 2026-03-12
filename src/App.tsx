// App.tsx - Main application with Google login, Gemini AI, and Firestore
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LoginView } from './components/LoginView';
import { HallOfRecordsModal } from './components/HistorySidebar';
import { SettingsModal } from './components/SettingsModal';
import { MetaphysicalDisplay, MetaphysicalBadges } from './components/MetaphysicalDisplay';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle,
  signOut, 
  resendVerificationEmail,
  User 
} from './services/firebase';
import { 
  saveRecord, 
  getRecords, 
  saveSettings, 
  getSettings, 
  deleteRecord,
  subscribeToRecords,
  migrateFromLocalStorage,
  hasLocalStorageData
} from './services/firestore';
import { fetchMetaphysicalProperties } from './services/gemini';
import { 
  SearchEngine, 
  SearchRecord, 
  SearchHistoryItem, 
  UserSettings, 
  MetaphysicalData,
  SyncStatus 
} from './types';
import { ENGINE_URLS, DEFAULT_PHRASE } from './constants';

// ==================== LOGO COMPONENT ====================
const Logo = () => (
  <div className="absolute top-4 left-4 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-10">
    <img 
      src="/metalogo.png" 
      alt="Change Your Search" 
      className="w-full h-full object-contain drop-shadow-lg"
    />
  </div>
);

// ==================== CHANGE TEXT MODAL ====================
const ChangeTextModal = ({ currentText, onSave, onClose }: { currentText: string, onSave: (text: string) => void, onClose: () => void }) => {
  const [text, setText] = useState(currentText);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-stone-800 rounded-lg w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold">Change Context Phrase</h3>
        <input 
          type="text" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="w-full p-3 border rounded-md" 
          placeholder="e.g., metaphysical properties of"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-stone-200 hover:bg-stone-300 transition-colors">Cancel</button>
          <button onClick={() => { onSave(text); onClose(); }} className="px-4 py-2 rounded-md bg-stone-800 text-white hover:bg-stone-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT NOTES MODAL ====================
const EditNotesModal = ({ 
  record, 
  onSave, 
  onClose, 
  onContinueSearch,
  onDelete 
}: { 
  record: SearchRecord; 
  onSave: (id: string, notes: string) => void; 
  onClose: () => void; 
  onContinueSearch: () => void;
  onDelete: (id: string) => void;
}) => {
  const [notes, setNotes] = useState(record.notes);
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#643d2c] border-2 border-stone-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">{record.title}</h3>
            <p className="text-xs text-stone-400 mt-1">
              {record.engine} • {new Date(record.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300">&times;</button>
        </div>
        
        {record.metaphysicalData && (
          <MetaphysicalBadges data={record.metaphysicalData} />
        )}
        
        <textarea 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          className="w-full h-48 p-3 rounded-lg bg-black/20 border border-stone-500/30 text-sm text-white placeholder-stone-500 font-mono" 
          placeholder="Add your research notes here..."
        />
        
        <div className="flex gap-2">
          <button 
            onClick={onContinueSearch} 
            className="flex-1 p-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
          >
            Continue Search
          </button>
          <button 
            onClick={() => onSave(record.id, notes)} 
            className="flex-1 p-3 rounded-lg bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 transition-colors"
          >
            Save Notes
          </button>
        </div>
        
        <button
          onClick={() => { if (confirm('Delete this record?')) onDelete(record.id); }}
          className="w-full py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          Delete Record
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
const MainApp: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  // State
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    appendedPhrase: DEFAULT_PHRASE,
    isPrefix: true,
    engine: SearchEngine.GOOGLE,
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isSyncing: false });
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHallOpen, setIsHallOpen] = useState(false);
  const [isChangeTextOpen, setIsChangeTextOpen] = useState(false);
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SearchRecord | null>(null);

  // AI State
  const [metaphysicalLoading, setMetaphysicalLoading] = useState(false);
  const [metaphysicalData, setMetaphysicalData] = useState<MetaphysicalData | null>(null);
  const [metaphysicalError, setMetaphysicalError] = useState<string | undefined>();
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setSyncStatus({ isSyncing: true });

      try {
        // Check for localStorage migration
        if (hasLocalStorageData()) {
          const migrationResult = await migrateFromLocalStorage();
          if (migrationResult.success && migrationResult.migratedRecords > 0) {
            console.log(`Migrated ${migrationResult.migratedRecords} records to cloud`);
          }
        }

        // Load records
        const recordsResult = await getRecords();
        if (recordsResult.success && recordsResult.data) {
          setRecords(recordsResult.data);
        }

        // Load settings
        const settingsResult = await getSettings();
        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
        }

        setSyncStatus({ isSyncing: false, lastSyncedAt: Date.now() });
      } catch (error: any) {
        console.error('Error loading data:', error);
        setSyncStatus({ isSyncing: false, error: error.message });
      }

      setIsLoading(false);
    };

    loadData();
  }, [user.uid]);

  // Real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToRecords(
      (updatedRecords) => {
        setRecords(updatedRecords);
        setSyncStatus({ isSyncing: false, lastSyncedAt: Date.now() });
      },
      (error) => {
        setSyncStatus({ isSyncing: false, error: error.message });
      }
    );
    return () => unsubscribe();
  }, [user.uid]);

  // Save settings
  const handleSaveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    setSyncStatus({ isSyncing: true });
    const result = await saveSettings(newSettings);
    setSyncStatus(result.success 
      ? { isSyncing: false, lastSyncedAt: Date.now() }
      : { isSyncing: false, error: result.error }
    );
  };

  // Fetch metaphysical properties
  const fetchMetaphysical = useCallback(async (searchQuery: string) => {
    setMetaphysicalLoading(true);
    setMetaphysicalError(undefined);
    setMetaphysicalData(null);
    setLastSearchedQuery(searchQuery);

    const response = await fetchMetaphysicalProperties(searchQuery, settings.appendedPhrase);
    
    if (response.success && response.data) {
      const data: MetaphysicalData = {
        ...response.data,
        fetchedAt: Date.now(),
      };
      setMetaphysicalData(data);
    } else {
      setMetaphysicalError(response.error || 'Failed to fetch metaphysical properties');
    }

    setMetaphysicalLoading(false);
    return response;
  }, [settings.appendedPhrase]);

  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    // Check for existing record
    const existingRecord = records.find(
      r => r.title.toLowerCase() === trimmedQuery.toLowerCase() && r.engine === settings.engine
    );

    if (existingRecord) {
      setActiveRecord(existingRecord);
      setIsEditNotesOpen(true);
      setQuery('');
      return;
    }

    // Fetch metaphysical properties
    const aiResponse = await fetchMetaphysical(trimmedQuery);

    // Build augmented query
    const augmentedQuery = settings.isPrefix
      ? `${settings.appendedPhrase} ${trimmedQuery}`
      : `${trimmedQuery} ${settings.appendedPhrase}`;

    // Open external search
    window.open(ENGINE_URLS[settings.engine] + encodeURIComponent(augmentedQuery), '_blank');

    // Create search item
    const newSearchItem: SearchHistoryItem = {
      id: crypto.randomUUID(),
      query: trimmedQuery,
      augmentedQuery,
      timestamp: Date.now(),
      engine: settings.engine,
      metaphysicalData: aiResponse.success && aiResponse.data ? {
        ...aiResponse.data,
        fetchedAt: Date.now(),
      } : undefined,
    };

    // Create record
    const newRecord: SearchRecord = {
      id: crypto.randomUUID(),
      title: trimmedQuery,
      engine: settings.engine,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      notes: `# Research Notes: ${trimmedQuery}\n\n`,
      searches: [newSearchItem],
      metaphysicalData: aiResponse.success && aiResponse.data ? {
        ...aiResponse.data,
        fetchedAt: Date.now(),
      } : undefined,
    };

    // Save to Firestore
    setSyncStatus({ isSyncing: true });
    const saveResult = await saveRecord(newRecord);
    
    if (saveResult.success) {
      setRecords(prev => [newRecord, ...prev].sort((a, b) => b.updatedAt - a.updatedAt));
      setSyncStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } else {
      setSyncStatus({ isSyncing: false, error: saveResult.error });
    }

    setQuery('');
    setActiveRecord(newRecord);
    setIsEditNotesOpen(true);
  };

  // Save notes
  const handleSaveNotes = async (recordId: string, notes: string) => {
    const recordToUpdate = records.find(r => r.id === recordId);
    if (!recordToUpdate) return;

    const updatedRecord: SearchRecord = {
      ...recordToUpdate,
      notes,
      updatedAt: Date.now(),
    };

    setSyncStatus({ isSyncing: true });
    const result = await saveRecord(updatedRecord);

    if (result.success) {
      setRecords(prev => 
        prev.map(r => r.id === recordId ? updatedRecord : r)
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
      setSyncStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } else {
      setSyncStatus({ isSyncing: false, error: result.error });
    }

    setIsEditNotesOpen(false);
    setActiveRecord(null);
  };

  // Append metaphysical to notes
  const handleSaveMetaphysicalToNotes = (markdown: string) => {
    if (!activeRecord) return;
    const updatedNotes = activeRecord.notes + '\n\n' + markdown;
    handleSaveNotes(activeRecord.id, updatedNotes);
  };

  // Delete record
  const handleDeleteRecord = async (recordId: string) => {
    setSyncStatus({ isSyncing: true });
    const result = await deleteRecord(recordId);

    if (result.success) {
      setRecords(prev => prev.filter(r => r.id !== recordId));
      setSyncStatus({ isSyncing: false, lastSyncedAt: Date.now() });
    } else {
      setSyncStatus({ isSyncing: false, error: result.error });
    }

    setIsEditNotesOpen(false);
    setActiveRecord(null);
  };

  // Continue search
  const handleContinueSearch = (record: SearchRecord) => {
    if (!record.searches.length) return;
    const latestSearch = record.searches[0];
    window.open(ENGINE_URLS[latestSearch.engine] + encodeURIComponent(latestSearch.augmentedQuery), '_blank');
  };

  // Select record from hall
  const handleSelectRecord = (record: SearchRecord) => {
    setActiveRecord(record);
    setIsEditNotesOpen(true);
    setIsHallOpen(false);
    if (record.metaphysicalData) {
      setMetaphysicalData(record.metaphysicalData);
      setLastSearchedQuery(record.title);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center text-white/80">
          <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-bold tracking-wider">Loading your sacred records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Logo />
      
      {/* Sync indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {syncStatus.isSyncing ? (
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Syncing..." />
        ) : syncStatus.error ? (
          <div className="w-2 h-2 bg-red-400 rounded-full" title={syncStatus.error} />
        ) : (
          <div className="w-2 h-2 bg-green-400 rounded-full" title="Synced" />
        )}
      </div>

      <div className="w-full max-w-2xl mx-auto text-center pt-16 sm:pt-8">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase mb-2">
          Change Your Search
        </h1>
        <p className="text-stone-400 mb-8">Discover the metaphysical world</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a crystal, herb, symbol..."
              className="w-full p-4 pr-24 rounded-2xl bg-black/30 border-2 border-stone-500/30 text-white placeholder-stone-500 text-lg focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={metaphysicalLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {metaphysicalLoading ? '✨' : 'Search'}
            </button>
          </div>
        </form>

        {/* Context phrase info */}
        <p className="text-xs text-stone-500 mb-6">
          Using {settings.engine} • 
          <button 
            onClick={() => setIsChangeTextOpen(true)}
            className="text-orange-400 hover:text-orange-300 ml-1 underline"
          >
            {settings.isPrefix ? `"${settings.appendedPhrase} [query]"` : `"[query] ${settings.appendedPhrase}"`}
          </button>
        </p>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setIsHallOpen(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors flex items-center gap-2"
          >
            📜 Hall of Records
            {records.length > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 rounded-full text-xs">{records.length}</span>
            )}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Metaphysical Display */}
        {(metaphysicalLoading || metaphysicalData || metaphysicalError) && (
          <div className="mb-8 text-left">
            <MetaphysicalDisplay
              data={metaphysicalData}
              isLoading={metaphysicalLoading}
              error={metaphysicalError}
              query={lastSearchedQuery}
              onSaveToNotes={handleSaveMetaphysicalToNotes}
              onRetry={() => fetchMetaphysical(lastSearchedQuery)}
            />
          </div>
        )}

        {/* Recent Records */}
        {records.length > 0 && !metaphysicalData && (
          <div className="text-left">
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Recent Searches</h2>
            <div className="space-y-2">
              {records.slice(0, 4).map(record => (
                <button
                  key={record.id}
                  onClick={() => handleSelectRecord(record)}
                  className="w-full text-left p-4 bg-black/20 hover:bg-black/30 rounded-xl border border-stone-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{record.title}</span>
                    <span className="text-xs text-stone-500">{record.engine}</span>
                  </div>
                  <MetaphysicalBadges data={record.metaphysicalData} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {records.length === 0 && !metaphysicalLoading && !metaphysicalData && (
          <div className="py-12 text-center">
            <img 
              src="/metalogo.png" 
              alt="Change Your Search" 
              className="w-24 h-24 mx-auto mb-4 opacity-50"
            />
            <p className="text-stone-400">Begin your journey by searching for any crystal, herb, or symbol</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          updateSettings={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          user={user}
          onLogout={onLogout}
        />
      )}

      {isHallOpen && (
        <HallOfRecordsModal
          records={records}
          onSelect={handleSelectRecord}
          onClose={() => setIsHallOpen(false)}
        />
      )}

      {isChangeTextOpen && (
        <ChangeTextModal
          currentText={settings.appendedPhrase}
          onSave={(text) => handleSaveSettings({ ...settings, appendedPhrase: text })}
          onClose={() => setIsChangeTextOpen(false)}
        />
      )}

      {isEditNotesOpen && activeRecord && (
        <EditNotesModal
          record={activeRecord}
          onSave={handleSaveNotes}
          onContinueSearch={() => handleContinueSearch(activeRecord)}
          onClose={() => { setIsEditNotesOpen(false); setActiveRecord(null); }}
          onDelete={handleDeleteRecord}
        />
      )}
    </Layout>
  );
};

// ==================== APP ROOT ====================
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // For email/password users, require verification
      // For Google users, they're already verified
      if (firebaseUser) {
        const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
        if (isGoogleUser || firebaseUser.emailVerified) {
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
    } else if (data?.user && !data.user.emailVerified) {
      setEmailForVerification(email);
      setShowVerificationMessage(true);
      setAuthError('Please verify your email before logging in.');
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setAuthError(null);
    const { data, error } = await signUpWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
    } else if (data?.user) {
      setEmailForVerification(email);
      setShowVerificationMessage(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const { data, error } = await signInWithGoogle();
    if (error) {
      setAuthError(error.message);
    } else if (data?.user) {
      setUser(data.user);
    }
  };

  const handleResendVerification = async (email: string) => {
    const { error } = await resendVerificationEmail(email);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert(`Verification email sent to ${email}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
    setUser(null);
  };

  if (isLoadingAuth) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center text-white/80">
          <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-bold tracking-wider">Authenticating...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Logo />
        <LoginView
          onLogin={handleLogin}
          onRegister={handleRegister}
          onGoogleSignIn={handleGoogleSignIn}
          authError={authError}
          onClearError={() => setAuthError(null)}
          onResendVerification={handleResendVerification}
          showVerificationMessage={showVerificationMessage}
          emailForVerification={emailForVerification}
          onBackToLogin={() => {
            setShowVerificationMessage(false);
            setAuthError(null);
          }}
        />
      </Layout>
    );
  }

  return <MainApp user={user} onLogout={handleLogout} />;
};

export default App;
