// constants.ts - Application constants

import { SearchEngine } from './types';

// Default context phrase for searches
export const DEFAULT_PHRASE = "metaphysical properties of";

// Search engine URL mappings
export const ENGINE_URLS: Record<SearchEngine, string> = {
  [SearchEngine.GOOGLE]: 'https://www.google.com/search?q=',
  [SearchEngine.BING]: 'https://www.bing.com/search?q=',
  [SearchEngine.DUCKDUCKGO]: 'https://duckduckgo.com/?q=',
  [SearchEngine.ECOSIA]: 'https://www.ecosia.org/search?q=',
};

// Default user settings
export const DEFAULT_SETTINGS = {
  appendedPhrase: DEFAULT_PHRASE,
  isPrefix: true,
  engine: SearchEngine.GOOGLE,
};

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  SEARCH_RECORDS: 'searchRecords',
  USER_SETTINGS: 'userSettings',
};

// LocalStorage keys (for migration purposes)
export const STORAGE_KEYS = {
  RECORDS: 'cys_records',
  SETTINGS: 'cys_settings',
};

// Chakra names for extraction
export const CHAKRA_KEYWORDS = [
  'root',
  'sacral', 
  'solar plexus',
  'heart',
  'throat',
  'third eye',
  'crown',
];

// Element names for extraction
export const ELEMENT_KEYWORDS = [
  'fire',
  'water', 
  'earth',
  'air',
  'ether',
  'spirit',
];

// Zodiac signs for extraction
export const ZODIAC_KEYWORDS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];