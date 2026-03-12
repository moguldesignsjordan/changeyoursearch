// MetaphysicalDisplay.tsx - Component to display AI-fetched metaphysical properties
import React from 'react';
import { MetaphysicalData } from '../types';

interface MetaphysicalDisplayProps {
  data: MetaphysicalData | null;
  isLoading: boolean;
  error?: string;
  query: string;
  onSaveToNotes: (markdown: string) => void;
  onRetry: () => void;
}

export const MetaphysicalDisplay: React.FC<MetaphysicalDisplayProps> = ({
  data,
  isLoading,
  error,
  query,
  onSaveToNotes,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full" />
          <span className="text-purple-200">Channeling metaphysical wisdom for "{query}"...</span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-purple-500/20 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-purple-500/20 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-purple-500/20 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-3 text-red-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <button 
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-red-200 text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatAsMarkdown = (): string => {
    let md = `# Metaphysical Properties of ${query}\n\n`;
    md += `## Summary\n${data.summary}\n\n`;
    
    if (data.properties.length > 0) {
      md += `## Key Properties\n`;
      data.properties.forEach(prop => { md += `- ${prop}\n`; });
      md += "\n";
    }
    
    if (data.chakras && data.chakras.length > 0) {
      md += `## Associated Chakras\n${data.chakras.join(", ")}\n\n`;
    }
    
    if (data.elements && data.elements.length > 0) {
      md += `## Elements\n${data.elements.join(", ")}\n\n`;
    }
    
    if (data.zodiacSigns && data.zodiacSigns.length > 0) {
      md += `## Zodiac Signs\n${data.zodiacSigns.join(", ")}\n\n`;
    }
    
    if (data.healingAspects && data.healingAspects.length > 0) {
      md += `## Healing Aspects\n`;
      data.healingAspects.forEach(aspect => { md += `- ${aspect}\n`; });
      md += "\n";
    }
    
    if (data.sources.length > 0) {
      md += `## Sources\n`;
      data.sources.forEach(source => { md += `- [${source.title}](${source.uri})\n`; });
    }
    
    md += `\n---\n*Generated on ${new Date(data.fetchedAt).toLocaleString()}*\n`;
    return md;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-purple-900/30 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-semibold text-purple-100">Metaphysical Properties</h3>
        </div>
        <button
          onClick={() => onSaveToNotes(formatAsMarkdown())}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg text-purple-200 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save to Notes
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div>
          <p className="text-stone-200 leading-relaxed">{data.summary}</p>
        </div>

        {/* Properties Grid */}
        {data.properties.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-3">Key Properties</h4>
            <div className="flex flex-wrap gap-2">
              {data.properties.slice(0, 6).map((prop, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-200 border border-purple-500/30"
                >
                  {prop.length > 50 ? prop.slice(0, 50) + '...' : prop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attributes Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Chakras */}
          {data.chakras && data.chakras.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Chakras</h4>
              <div className="flex flex-wrap gap-1">
                {data.chakras.map((chakra, idx) => (
                  <span key={idx} className="text-sm text-stone-300">{chakra}{idx < data.chakras!.length - 1 ? ',' : ''}</span>
                ))}
              </div>
            </div>
          )}

          {/* Elements */}
          {data.elements && data.elements.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Elements</h4>
              <div className="flex flex-wrap gap-1">
                {data.elements.map((element, idx) => (
                  <span key={idx} className="text-sm text-stone-300">{element}{idx < data.elements!.length - 1 ? ',' : ''}</span>
                ))}
              </div>
            </div>
          )}

          {/* Zodiac */}
          {data.zodiacSigns && data.zodiacSigns.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Zodiac</h4>
              <div className="flex flex-wrap gap-1">
                {data.zodiacSigns.map((sign, idx) => (
                  <span key={idx} className="text-sm text-stone-300">{sign}{idx < data.zodiacSigns!.length - 1 ? ',' : ''}</span>
                ))}
              </div>
            </div>
          )}

          {/* Healing */}
          {data.healingAspects && data.healingAspects.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Healing</h4>
              <div className="flex flex-wrap gap-1">
                {data.healingAspects.slice(0, 4).map((aspect, idx) => (
                  <span key={idx} className="text-sm text-stone-300">{aspect}{idx < Math.min(data.healingAspects!.length, 4) - 1 ? ',' : ''}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sources */}
        {data.sources.length > 0 && (
          <div className="pt-4 border-t border-purple-500/20">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {data.sources.slice(0, 4).map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  {source.title.length > 30 ? source.title.slice(0, 30) + '...' : source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for the Hall of Records list
export const MetaphysicalBadges: React.FC<{ data?: MetaphysicalData }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {data.chakras && data.chakras.length > 0 && (
        <span className="px-2 py-0.5 bg-purple-500/20 rounded text-xs text-purple-300">
          🔮 {data.chakras[0]}
        </span>
      )}
      {data.elements && data.elements.length > 0 && (
        <span className="px-2 py-0.5 bg-blue-500/20 rounded text-xs text-blue-300">
          🌊 {data.elements[0]}
        </span>
      )}
      {data.zodiacSigns && data.zodiacSigns.length > 0 && (
        <span className="px-2 py-0.5 bg-amber-500/20 rounded text-xs text-amber-300">
          ⭐ {data.zodiacSigns[0]}
        </span>
      )}
    </div>
  );
};

export default MetaphysicalDisplay;