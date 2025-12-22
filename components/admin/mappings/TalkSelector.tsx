'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

type Talk = {
  id: string;
  slug: string;
  title: string;
  speakerName: string;
  thumbnailUrl: string | null;
  year: number | null;
};

type Props = {
  selectedTalkId: string | null;
  excludeTalkIds: string[];
  onSelectTalk: (talk: Talk) => void;
  onClear: () => void;
};

export function TalkSelector({ selectedTalkId, excludeTalkIds, onSelectTalk, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Search for talks
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/mappings?searchTalks=${encodeURIComponent(debouncedQuery)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        // Filter out already-mapped talks
        const filtered = data.talks.filter((t: Talk) => !excludeTalkIds.includes(t.id));
        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, excludeTalkIds]);

  const handleSelect = (talk: Talk) => {
    setSelectedTalk(talk);
    onSelectTalk(talk);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedTalk(null);
    onClear();
    setQuery('');
  };

  // If a talk is already selected, show it
  if (selectedTalk || selectedTalkId) {
    const displayTalk = selectedTalk;
    if (!displayTalk) return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-600 rounded-lg">
        {displayTalk.thumbnailUrl && (
          <img
            src={displayTalk.thumbnailUrl}
            alt=""
            className="w-16 h-9 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate">
            {displayTalk.title}
          </p>
          <p className="text-xs text-gray-400">
            {displayTalk.speakerName}
            {displayTalk.year && ` (${displayTalk.year})`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-gray-400 hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a talk to add..."
          className="w-full pl-9 pr-10 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {results.length === 0 && !loading && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-gray-400">
              No talks found matching "{query}"
            </div>
          )}
          {results.map((talk) => (
            <button
              key={talk.id}
              type="button"
              onClick={() => handleSelect(talk)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
            >
              {talk.thumbnailUrl ? (
                <img
                  src={talk.thumbnailUrl}
                  alt=""
                  className="w-16 h-9 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-9 bg-gray-700 rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {talk.title}
                </p>
                <p className="text-xs text-gray-400">
                  {talk.speakerName}
                  {talk.year && ` (${talk.year})`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
