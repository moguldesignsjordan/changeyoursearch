// types.ts - Type definitions for Change Your Search

export enum SearchEngine {
  GOOGLE = 'Google',
  BING = 'Bing',
  DUCKDUCKGO = 'DuckDuckGo',
  ECOSIA = 'Ecosia'
}

// Source reference from search grounding
export interface SearchSource {
  title: string;
  uri: string;
}

// Structured metaphysical properties from AI
export interface MetaphysicalData {
  summary: string;
  properties: string[];
  chakras?: string[];
  elements?: string[];
  zodiacSigns?: string[];
  healingAspects?: string[];
  sources: SearchSource[];
  rawResponse?: string;
  fetchedAt: number;
}

// Legacy search result type (kept for compatibility)
export interface SearchResult {
  answer: string;
  sources: SearchSource[];
}

// A single search instance within a record
export interface SearchHistoryItem {
  id: string;
  query: string; // The specific search term used for this instance (without appended phrase)
  augmentedQuery: string;
  timestamp: number;
  engine: SearchEngine;
  // AI-generated metaphysical data
  metaphysicalData?: MetaphysicalData;
  // Legacy result field for compatibility
  result?: SearchResult;
}

// A record is a collection of searches and notes about a single topic on a specific engine
export interface SearchRecord {
  id: string;
  title: string; // The original query that started this record
  engine: SearchEngine;
  createdAt: number;
  updatedAt: number;
  notes: string;
  searches: SearchHistoryItem[];
  // Aggregated metaphysical data (latest fetch)
  metaphysicalData?: MetaphysicalData;
}

// User preferences
export interface UserSettings {
  appendedPhrase: string;
  isPrefix: boolean;
  engine: SearchEngine;
}

// Sync status for cloud operations
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt?: number;
  error?: string;
}

// App state for managing the application
export interface AppState {
  records: SearchRecord[];
  settings: UserSettings;
  syncStatus: SyncStatus;
  isLoading: boolean;
}