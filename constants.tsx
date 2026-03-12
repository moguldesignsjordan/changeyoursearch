import { SearchEngine } from './types';

export const ENGINE_URLS: Record<SearchEngine, string> = {
  [SearchEngine.GOOGLE]: 'https://www.google.com/search?q=',
  [SearchEngine.BING]: 'https://www.bing.com/search?q=',
  [SearchEngine.DUCKDUCKGO]: 'https://duckduckgo.com/?q=',
  [SearchEngine.ECOSIA]: 'https://www.ecosia.org/search?q=',
};

export const DEFAULT_PHRASE = 'peer reviewed';