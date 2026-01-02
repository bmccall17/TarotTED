'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Link as LinkIcon, Search } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface AddMappingModalProps {
  talk: {
    id: string;
    title: string;
    speakerName: string;
    slug: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface Card {
  id: string;
  slug: string;
  name: string;
  summary: string;
  keywords: string;
  imageUrl: string;
  arcanaType: string;
  suit: string | null;
}

export default function AddMappingModal({
  talk,
  onClose,
  onSuccess
}: AddMappingModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=card`);
      const data = await response.json();
      setSearchResults(data.cards || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-card-item]');
      const item = items[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          setSelectedCard(searchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSearchQuery('');
        setSearchResults([]);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleCreateMapping = async () => {
    if (!selectedCard) {
      setError('Please select a card');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create mapping via the mappings API
      const response = await fetch('/api/admin/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard.id,
          talkId: talk.id,
          rationaleShort: `Mapping created from validation dashboard for ${talk.title}`,
          rationaleLong: null,
          strength: 3,
          isPrimary: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create mapping');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-100">Add Mapping</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Talk Info */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <h3 className="font-medium text-gray-100 mb-1">{talk.title}</h3>
            <p className="text-sm text-gray-400">{talk.speakerName}</p>
          </div>

          {/* Card Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search for a Card
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by card name or keywords..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 placeholder-gray-500"
                disabled={isSubmitting}
                autoFocus
                role="combobox"
                aria-expanded={searchResults.length > 0}
                aria-haspopup="listbox"
                aria-autocomplete="list"
              />
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-4">
              <div className="inline-block w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Searching...</p>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select a Card ({searchResults.length} results) - Use arrow keys to navigate
              </label>
              <div ref={resultsRef} role="listbox" className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((card, index) => {
                  const keywords = card.keywords ? JSON.parse(card.keywords) : [];
                  const isHighlighted = highlightedIndex === index;
                  const isSelected = selectedCard?.id === card.id;
                  return (
                    <div
                      key={card.id}
                      data-card-item
                      role="option"
                      aria-selected={isSelected}
                      className={`bg-gray-900/50 rounded-lg p-3 border ${
                        isSelected
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : isHighlighted
                          ? 'border-indigo-400/50 bg-indigo-600/10'
                          : 'border-gray-700'
                      } transition-colors cursor-pointer hover:border-gray-600`}
                      onClick={() => setSelectedCard(card)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-12 h-16 object-contain rounded bg-gray-900"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-100 mb-1">{card.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {card.summary}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {keywords.slice(0, 3).map((keyword: string) => (
                              <span
                                key={keyword}
                                className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              No cards found for &quot;{searchQuery}&quot;
            </div>
          )}

          {searchQuery.trim().length < 2 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              Enter at least 2 characters to search
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateMapping}
            disabled={isSubmitting || !selectedCard}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                Create Mapping
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
