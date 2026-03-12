import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { HallOfRecordsModal } from './components/HistorySidebar';
import { SettingsModal } from './components/SettingsModal';
import { SearchRecord, SearchHistoryItem, UserSettings, SearchEngine } from '../types';
import { ENGINE_URLS, DEFAULT_PHRASE } from '../constants';
import { LoginView } from './components/LoginView';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut, 
  resendVerificationEmail,
  User 
} from './firebase';


const Logo = () => (
  <div className="absolute top-4 left-4 w-24 h-24 pointer-events-none">
    <img 
      src="/metalogo.png" 
      alt="Change Your Search Logo" 
      className="w-full h-full" 
    />
  </div>
);

const ChangeTextModal = ({ currentText, onSave, onClose }: { currentText: string, onSave: (text: string) => void, onClose: () => void }) => {
  const [text, setText] = useState(currentText);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white text-stone-800 rounded-lg w-full max-w-sm p-6 space-y-4">
        <h3 className="font-bold">Change Append Text</h3>
        <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full p-2 border rounded-md" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-stone-200">Cancel</button>
          <button onClick={() => { onSave(text); onClose(); }} className="px-4 py-2 rounded-md bg-stone-800 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

const EditNotesModal = ({ record, onSave, onClose, onContinueSearch }: { record: SearchRecord; onSave: (id: string, notes: string) => void; onClose: () => void; onContinueSearch: () => void; }) => {
    const [notes, setNotes] = useState(record.notes);
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#643d2c] border-2 border-stone-500/30 rounded-lg w-full max-w-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{record.searches[0]?.augmentedQuery || record.title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">&times;</button>
                </div>
                <p className="text-xs text-stone-300">Search Engine: {record.searches[0]?.engine}</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full h-64 p-3 rounded-md bg-black/20 border border-stone-500/30 text-sm" placeholder="Add your notes here..."></textarea>
                <div className="flex gap-2">
                    <button onClick={onContinueSearch} className="w-full p-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors">Continue to Search</button>
                    <button onClick={() => onSave(record.id, notes)} className="w-full p-2 rounded-md bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 transition-colors">Save Notes</button>
                </div>
            </div>
        </div>
    );
};

const MainApp: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [query, setQuery] = useState('');
  
  const [records, setRecords] = useState<SearchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cys_records');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse records from localStorage", error);
      return [];
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('cys_settings');
      return saved ? JSON.parse(saved) : { appendedPhrase: DEFAULT_PHRASE, isPrefix: true, engine: SearchEngine.GOOGLE };
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      return { appendedPhrase: DEFAULT_PHRASE, isPrefix: true, engine: SearchEngine.GOOGLE };
    }
  });

  useEffect(() => {
    localStorage.setItem('cys_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('cys_settings', JSON.stringify(settings));
  }, [settings]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHallOpen, setIsHallOpen] = useState(false);
  const [isChangeTextOpen, setIsChangeTextOpen] = useState(false);
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<SearchRecord | null>(null);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const existingRecord = records.find(
      r => r.title.toLowerCase() === trimmedQuery.toLowerCase() && r.engine === settings.engine
    );

    if (existingRecord) {
      setActiveRecord(existingRecord);
      setIsEditNotesOpen(true);
      setQuery('');
    } else {
      const augmentedQuery = settings.isPrefix
        ? `${settings.appendedPhrase} ${trimmedQuery}`
        : `${trimmedQuery} ${settings.appendedPhrase}`;
      
      window.open(ENGINE_URLS[settings.engine] + encodeURIComponent(augmentedQuery), '_blank');

      const newSearchItem: SearchHistoryItem = {
        id: crypto.randomUUID(),
        query: trimmedQuery,
        augmentedQuery,
        timestamp: Date.now(),
        engine: settings.engine,
      };
      
      const newRecord: SearchRecord = {
        id: crypto.randomUUID(),
        title: trimmedQuery,
        engine: settings.engine,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        notes: `# Notes for "${trimmedQuery}" on ${settings.engine}\n\n`,
        searches: [newSearchItem],
      };
      
      const newRecords = [newRecord, ...records];
      const sortedRecords = newRecords.sort((a,b) => b.updatedAt - a.updatedAt);
      setRecords(sortedRecords);
      setQuery('');
      setActiveRecord(newRecord);
      setIsEditNotesOpen(true);
    }
  };

  const handleContinueSearch = (record: SearchRecord) => {
    if (!record || !record.searches.length) return;
    const latestSearch = record.searches[0];
    const searchUrl = ENGINE_URLS[latestSearch.engine] + encodeURIComponent(latestSearch.augmentedQuery);
    window.open(searchUrl, '_blank');
  };

  const handleSelectRecord = (record: SearchRecord) => {
    setActiveRecord(record);
    setIsEditNotesOpen(true);
    setIsHallOpen(false);
  };
  
  const handleSaveNotes = (recordId: string, notes: string) => {
    const recordToUpdate = records.find(r => r.id === recordId);
    if (!recordToUpdate) return;
    
    const latestSearch = recordToUpdate.searches[0];
    const currentAugmentedQuery = settings.isPrefix
      ? `${settings.appendedPhrase} ${recordToUpdate.title}`
      : `${recordToUpdate.title} ${settings.appendedPhrase}`;
    
    let updatedSearches = recordToUpdate.searches;
    if (latestSearch.augmentedQuery !== currentAugmentedQuery) {
        const newSearchItem: SearchHistoryItem = {
            id: crypto.randomUUID(),
            query: recordToUpdate.title,
            augmentedQuery: currentAugmentedQuery,
            timestamp: Date.now(),
            engine: settings.engine,
        };
        updatedSearches = [newSearchItem, ...recordToUpdate.searches];
    }

    const updatedRecord = { ...recordToUpdate, notes, searches: updatedSearches, updatedAt: Date.now() };
    const newRecords = records.map(r => r.id === recordId ? updatedRecord : r).sort((a,b) => b.updatedAt - a.updatedAt);
    setRecords(newRecords);
    setIsEditNotesOpen(false);
    setActiveRecord(null);
  };

  return (
    <Layout>
      <div className="w-full max-w-3xl flex flex-col items-center justify-center p-4">
        <Logo />
        <div className="absolute top-6 right-6 flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 bg-stone-800/20 rounded-full hover:bg-orange-500/20 hover:text-orange-400 transition-all border border-transparent hover:border-orange-500/30" aria-label="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
        </div>
        
        <div className="w-full max-w-2xl flex flex-col items-center justify-center">
          <h1 className="text-4xl font-black mb-8 text-white tracking-tighter drop-shadow-sm">Change Your Search</h1>
          <form onSubmit={handleSearch} className="w-full relative mb-4">
              <input value={query} onChange={e => setQuery(e.target.value)} type="text" placeholder="Enter search term..." className="w-full p-5 pl-7 pr-14 rounded-full bg-black/30 border-2 border-stone-500/20 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-lg shadow-2xl" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all active:scale-90">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
          </form>
          <div className="w-full flex justify-center items-center gap-3 mb-8">
              <button onClick={() => handleSearch()} className="px-6 py-2.5 text-sm font-black bg-stone-700/40 rounded-full hover:bg-stone-700/80 transition-all">Search on {settings.engine}</button>
              <button onClick={() => setIsChangeTextOpen(true)} className="px-4 py-2.5 text-xs font-bold bg-stone-600/30 rounded-full hover:bg-stone-600/60 transition-all border border-white/5">Change Phrase</button>
              <button onClick={() => updateSettings({ appendedPhrase: DEFAULT_PHRASE })} className="px-4 py-2.5 text-xs font-bold bg-stone-600/30 rounded-full hover:bg-stone-600/60 transition-all border border-white/5">Reset</button>
          </div>
          
          <button onClick={() => setIsHallOpen(true)} className="w-full max-w-sm py-4 rounded-full bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all mb-8 flex items-center justify-center gap-3 shadow-sm">
              <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.994 7.994 0 002 12a8 8 0 008 8 8 8 0 008-8 7.994 7.994 0 00-7-7.196V3a1 1 0 10-2 0v1.804z"></path></svg>
              Hall of Records
          </button>
          
          <div className="p-3 px-6 bg-black/40 rounded-2xl text-center text-sm border border-white/5 shadow-inner">
              <span className="font-bold text-stone-400">Appending: </span>
              <span className="text-orange-300 font-medium">"{settings.appendedPhrase}"</span>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          updateSettings={updateSettings} 
          onClose={() => setIsSettingsOpen(false)} 
          user={user}
          onLogout={onLogout}
        />
      )}
      {isHallOpen && <HallOfRecordsModal records={records} onClose={() => setIsHallOpen(false)} onSelect={handleSelectRecord} />}
      {isChangeTextOpen && <ChangeTextModal currentText={settings.appendedPhrase} onClose={() => setIsChangeTextOpen(false)} onSave={(text) => updateSettings({ appendedPhrase: text })}/>}
      {isEditNotesOpen && activeRecord && <EditNotesModal record={activeRecord} onSave={handleSaveNotes} onClose={() => { setIsEditNotesOpen(false); setActiveRecord(null); }} onContinueSearch={() => handleContinueSearch(activeRecord)} />}
    </Layout>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoadingAuth(false);
      if (firebaseUser) {
        setShowVerificationMessage(false);
        setAuthError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
      console.error("Login error:", error.message);
    }
  };
  
  const handleRegister = async (email: string, password: string) => {
    setAuthError(null);
    const { data, error } = await signUpWithEmail(email, password);
    if (error) {
      setAuthError(error.message);
      console.error("Registration error:", error.message);
    } else if (data.user && !data.user.emailVerified) {
      setEmailForVerification(email);
      setShowVerificationMessage(true);
    }
  };

  const handleResendVerification = async (email: string) => {
    const { error } = await resendVerificationEmail(email);
    if (error) {
        alert(`Error resending verification: ${error.message}`);
    } else {
        alert(`A new verification email has been sent to ${email}. Please check your inbox and spam folder.`);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
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
        <LoginView
          onLogin={handleLogin}
          onRegister={handleRegister}
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