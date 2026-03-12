export enum SearchEngine {
  GOOGLE = 'Google',
  BING = 'Bing',
  DUCKDUCKGO = 'DuckDuckGo',
  ECOSIA = 'Ecosia'
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  answer: string;
  sources: SearchSource[];
}

// A record is a collection of searches and notes about a single topic on a specific engine.
export interface SearchRecord {
  id: string;
  title: string; // The original query that started this record.
  engine: SearchEngine;
  createdAt: number;
  updatedAt: number;
  notes: string;
  searches: SearchHistoryItem[];
}

// A single search instance within a record.
export interface SearchHistoryItem {
  id: string;
  query: string; // The specific search term used for this instance (without appended phrase)
  augmentedQuery: string;
  timestamp: number;
  engine: SearchEngine;
  result?: SearchResult;
}

export interface UserSettings {
  appendedPhrase: string;
  isPrefix: boolean;
  engine: SearchEngine;
}