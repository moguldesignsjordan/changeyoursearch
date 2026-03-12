// HistorySidebar.tsx - Hall of Records modal with export functionality
import React, { useState, useMemo } from 'react';
import { SearchRecord } from '../types';
import { MetaphysicalBadges } from './MetaphysicalDisplay';

interface HallOfRecordsModalProps {
  records: SearchRecord[];
  onSelect: (record: SearchRecord) => void;
  onClose: () => void;
}

export const HallOfRecordsModal: React.FC<HallOfRecordsModalProps> = ({ records, onSelect, onClose }) => {
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date');

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let filtered = records.filter(record => 
      record.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchFilter.toLowerCase())
    );

    if (sortBy === 'date') {
      filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    } else {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [records, searchFilter, sortBy]);

  const handleDownload = (format: 'csv' | 'txt' | 'md') => {
    setIsDownloadMenuOpen(false);

    let sortedRecords = [...records];
    if (sortBy === 'date') {
      sortedRecords.sort((a, b) => b.updatedAt - a.updatedAt);
    } else {
      sortedRecords.sort((a, b) => a.title.localeCompare(b.title));
    }

    let fileContent = '';
    const fileName = `search_records_${sortBy}_${new Date().toISOString().split('T')[0]}.${format}`;

    if (format === 'csv') {
      const header = '"Title","Search Term","Engine","Created Date","Last Updated","Chakras","Elements","Notes"\n';
      const escapeCsvField = (field: string) => `"${String(field).replace(/"/g, '""')}"`;
      
      const rows = sortedRecords.map(r => {
        const title = escapeCsvField(r.searches[0]?.augmentedQuery || r.title);
        const searchTerm = escapeCsvField(r.title);
        const engine = escapeCsvField(r.engine);
        const created = escapeCsvField(new Date(r.createdAt).toLocaleString());
        const updated = escapeCsvField(new Date(r.updatedAt).toLocaleString());
        const chakras = escapeCsvField(r.metaphysicalData?.chakras?.join(', ') || '');
        const elements = escapeCsvField(r.metaphysicalData?.elements?.join(', ') || '');
        const notes = escapeCsvField(r.notes);
        return [title, searchTerm, engine, created, updated, chakras, elements, notes].join(',');
      });
      
      fileContent = header + rows.join('\n');

    } else if (format === 'md') {
      fileContent = `# Search Records History\n\n*Generated on ${new Date().toLocaleString()}*\n\n---\n\n`;
      fileContent += sortedRecords.map(r => {
        let entry = `## ${r.searches[0]?.augmentedQuery || r.title}\n` +
               `- **Base Term:** \`${r.title}\`\n` +
               `- **Engine:** ${r.engine}\n` +
               `- **Last Updated:** ${new Date(r.updatedAt).toLocaleDateString()}\n`;
        
        if (r.metaphysicalData) {
          if (r.metaphysicalData.chakras?.length) {
            entry += `- **Chakras:** ${r.metaphysicalData.chakras.join(', ')}\n`;
          }
          if (r.metaphysicalData.elements?.length) {
            entry += `- **Elements:** ${r.metaphysicalData.elements.join(', ')}\n`;
          }
          if (r.metaphysicalData.zodiacSigns?.length) {
            entry += `- **Zodiac:** ${r.metaphysicalData.zodiacSigns.join(', ')}\n`;
          }
        }
        
        entry += `\n### Research Notes\n\n${r.notes.replace(/^#/gm, '###')}\n\n---\n\n`;
        return entry;
      }).join('');

    } else {
      // TXT format
      fileContent = `Search Records History\nGenerated: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
      fileContent += sortedRecords.map(r => {
        let entry = `${r.searches[0]?.augmentedQuery || r.title}\n` +
               `Base Term: ${r.title}\n` +
               `Engine: ${r.engine}\n` +
               `Updated: ${new Date(r.updatedAt).toLocaleDateString()}\n`;
        
        if (r.metaphysicalData?.chakras?.length) {
          entry += `Chakras: ${r.metaphysicalData.chakras.join(', ')}\n`;
        }
        
        entry += `\nNotes:\n${r.notes}\n\n${'-'.repeat(50)}\n\n`;
        return entry;
      }).join('');
    }

    // Download the file
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-stone-700/50">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-700/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📜</span>
            <h2 className="text-xl font-bold text-stone-100">Hall of Records</h2>
            <span className="px-2 py-0.5 bg-stone-700 rounded-full text-xs text-stone-400">
              {records.length}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-stone-400 text-xl">&times;</button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-stone-700/30 flex items-center gap-3 shrink-0">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search records..."
              className="w-full px-4 py-2 bg-stone-900/50 border border-stone-600/50 rounded-lg text-sm text-stone-100 placeholder-stone-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'alpha')}
            className="px-3 py-2 bg-stone-900/50 border border-stone-600/50 rounded-lg text-sm text-stone-300"
          >
            <option value="date">Recent First</option>
            <option value="alpha">A-Z</option>
          </select>

          {/* Download */}
          <div className="relative">
            <button
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className="px-3 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm text-stone-300 flex items-center gap-2"
            >
              ⬇️ Export
            </button>
            {isDownloadMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-stone-700 rounded-lg shadow-xl border border-stone-600 overflow-hidden z-10">
                <button
                  onClick={() => handleDownload('md')}
                  className="w-full px-4 py-2 text-left text-sm text-stone-200 hover:bg-stone-600"
                >
                  Markdown (.md)
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-stone-200 hover:bg-stone-600"
                >
                  CSV (.csv)
                </button>
                <button
                  onClick={() => handleDownload('txt')}
                  className="w-full px-4 py-2 text-left text-sm text-stone-200 hover:bg-stone-600"
                >
                  Plain Text (.txt)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              {searchFilter ? 'No records match your search' : 'No records yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map(record => (
                <button
                  key={record.id}
                  onClick={() => onSelect(record)}
                  className="w-full text-left p-4 bg-stone-900/30 hover:bg-stone-900/50 rounded-xl border border-stone-700/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-stone-200 truncate group-hover:text-orange-300 transition-colors">
                        {record.title}
                      </h3>
                      <MetaphysicalBadges data={record.metaphysicalData} />
                      <p className="text-xs text-stone-500 mt-2">
                        {record.engine} • {new Date(record.updatedAt).toLocaleDateString()} • {record.searches.length} search{record.searches.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <div className="text-stone-600 group-hover:text-stone-400 transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-700/30 shrink-0">
          <p className="text-xs text-stone-500 text-center">
            ☁️ All records synced to cloud
          </p>
        </div>
      </div>
    </div>
  );
};

export default HallOfRecordsModal;