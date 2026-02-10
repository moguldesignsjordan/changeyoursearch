import React, { useState } from 'react';
import { SearchRecord } from '../types';

interface HallOfRecordsModalProps {
  records: SearchRecord[];
  onSelect: (record: SearchRecord) => void;
  onClose: () => void;
}

export const HallOfRecordsModal: React.FC<HallOfRecordsModalProps> = ({ records, onSelect, onClose }) => {
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  const handleDownload = (format: 'csv' | 'txt' | 'md', sortBy: 'date' | 'alpha') => {
    setIsDownloadMenuOpen(false);

    let sortedRecords = [...records];
    if (sortBy === 'date') {
      sortedRecords.sort((a, b) => b.updatedAt - a.updatedAt);
    } else {
      sortedRecords.sort((a, b) => 
        (a.searches[0]?.augmentedQuery || a.title).localeCompare(b.searches[0]?.augmentedQuery || b.title)
      );
    }

    let fileContent = '';
    const fileExtension = format;
    const fileName = `search_records_${sortBy}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    if (format === 'csv') {
      const header = '"Title","Search Term","Engine","Created Date","Last Updated","Notes"\n';
      const escapeCsvField = (field: string) => `"${field.replace(/"/g, '""')}"`;
      
      const rows = sortedRecords.map(r => {
        const title = escapeCsvField(r.searches[0]?.augmentedQuery || r.title);
        const searchTerm = escapeCsvField(r.title);
        const engine = escapeCsvField(r.engine);
        const created = escapeCsvField(new Date(r.createdAt).toLocaleString());
        const updated = escapeCsvField(new Date(r.updatedAt).toLocaleString());
        const notes = escapeCsvField(r.notes);
        return [title, searchTerm, engine, created, updated, notes].join(',');
      });
      
      fileContent = header + rows.join('\n');

    } else if (format === 'md') {
      fileContent = `# Search Records History\n\n*Generated on ${new Date().toLocaleString()}*\n\n---\n\n`;
      fileContent += sortedRecords.map(r => {
        return `## ${r.searches[0]?.augmentedQuery || r.title}\n` +
               `- **Base Term:** \`${r.title}\`\n` +
               `- **Engine:** ${r.engine}\n` +
               `- **Last Updated:** ${new Date(r.updatedAt).toLocaleDateString()}\n\n` +
               `### Research Notes\n\n${r.notes.replace(/#.*?\n\n/,'') || "_No notes recorded._"}\n\n` +
               `---`;
      }).join('\n\n');
    } else { // txt format
      fileContent = sortedRecords.map(r => {
        return `Title: ${r.searches[0]?.augmentedQuery || r.title}\n` +
               `Search Term: ${r.title}\n` +
               `Engine: ${r.engine}\n` +
               `Created: ${new Date(r.createdAt).toLocaleString()}\n` +
               `Last Updated: ${new Date(r.updatedAt).toLocaleString()}\n\n` +
               `Notes:\n${r.notes}\n` +
               `----------------------------------------`;
      }).join('\n\n');
    }

    const blob = new Blob([fileContent], { type: `text/${format};charset=utf-8;` });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
      <div className="bg-[#643d2c] border-2 border-stone-500/30 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Hall of Records</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)} className="p-2 px-3 flex items-center gap-2 text-xs font-bold bg-stone-700/50 rounded-md hover:bg-stone-700/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download
              </button>
              {isDownloadMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-stone-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-600/50">Export Format</div>
                    <button onClick={() => handleDownload('md', 'date')} className="text-left w-full block px-4 py-2 text-sm text-stone-200 hover:bg-stone-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        Markdown (.md)
                    </button>
                    <button onClick={() => handleDownload('csv', 'date')} className="text-left w-full block px-4 py-2 text-sm text-stone-200 hover:bg-stone-600">CSV Spreadsheet</button>
                    <button onClick={() => handleDownload('txt', 'date')} className="text-left w-full block px-4 py-2 text-sm text-stone-200 hover:bg-stone-600">Plain Text (.txt)</button>
                    <div className="px-4 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest border-t border-stone-600/50">Sort By</div>
                    <button onClick={() => handleDownload('md', 'alpha')} className="text-left w-full block px-4 py-2 text-sm text-stone-200 hover:bg-stone-600">Alphabetical (A-Z)</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {records.length > 0 ? records.map(record => (
            <div key={record.id} className="w-full text-left p-4 rounded-lg bg-stone-800/20 border border-stone-500/20 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <p className="font-bold text-blue-300 break-words">{record.searches[0]?.augmentedQuery || record.title}</p>
                <span className="text-xs font-bold bg-stone-600/50 px-2 py-1 rounded-md whitespace-nowrap">{record.engine}</span>
              </div>
              <div className="p-3 bg-black/20 rounded-md">
                <p className="text-xs text-stone-300 line-clamp-3 whitespace-pre-wrap">{record.notes.replace(/#.*?\n\n/,'') || "No notes yet."}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => onSelect(record)} className="px-3 py-1 text-xs font-bold bg-blue-500/80 rounded-md hover:bg-blue-500">View/Edit Notes</button>
                </div>
                <div className="text-right">
                    <p className="text-xs text-white/50">Created: {new Date(record.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-white/50">Appended: {new Date(record.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50">No records found. Start a new search to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};