import React from 'react';
import { SearchHistoryItem } from '../../types';

interface SearchResultDisplayProps {
  searchItem: SearchHistoryItem | null;
  isSearching: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-stone-300 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-stone-200 rounded"></div>
      <div className="h-3 bg-stone-200 rounded"></div>
      <div className="h-3 bg-stone-200 rounded w-5/6"></div>
    </div>
    <div className="h-4 bg-stone-300 rounded w-1/2"></div>
     <div className="space-y-2">
      <div className="h-3 bg-stone-200 rounded w-1/4"></div>
      <div className="h-3 bg-stone-200 rounded w-1/3"></div>
    </div>
  </div>
);

export const SearchResultDisplay: React.FC<SearchResultDisplayProps> = ({ searchItem, isSearching }) => {
  const renderContent = () => {
    if (isSearching) {
      return <LoadingSkeleton />;
    }

    if (!searchItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-stone-500">
           <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <p className="font-bold">No search selected</p>
          <p className="text-sm">Select a search from the history or perform a new one.</p>
        </div>
      );
    }

    if (!searchItem.result) {
      return (
         <div className="flex flex-col items-center justify-center h-full text-center text-stone-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
           <p className="font-bold">No AI Insight Available</p>
           <p className="text-sm">The AI-powered summary could not be generated for this search.</p>
         </div>
       );
    }

    return (
      <>
        <h3 className="text-lg font-bold text-blue-700 mb-3 break-words">{searchItem.augmentedQuery}</h3>
        <div className="prose prose-sm max-w-none text-stone-800 whitespace-pre-wrap leading-relaxed">
          {searchItem.result.answer}
        </div>
        {searchItem.result.sources && searchItem.result.sources.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-stone-600 text-xs uppercase tracking-wider">Sources</h4>
            <ul className="mt-2 space-y-2 text-sm">
              {searchItem.result.sources.map((source, index) => (
                <li key={index} className="truncate">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
      {renderContent()}
    </div>
  );
};