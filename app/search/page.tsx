'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft, Play, Sparkles } from 'lucide-react';
import SearchFilters, { type FilterState } from '@/components/search/SearchFilters';
import {
  DURATION_MIN,
  DURATION_MAX,
  YEAR_MIN,
  YEAR_MAX,
  DEFAULT_FILTERS,
} from '@/lib/constants/search';

const themeColors: Record<string, string> = {
  'new-beginnings': 'bg-green-500',
  'grief-and-gratitude': 'bg-indigo-500',
  'transformation': 'bg-purple-500',
  'endings-and-transitions': 'bg-gray-500',
  'leadership': 'bg-rose-500',
  'creativity-and-calling': 'bg-orange-500',
  'relationships': 'bg-pink-500',
  'resilience': 'bg-blue-500',
  'joy-and-celebration': 'bg-yellow-500',
  'fear-and-courage': 'bg-red-500',
  'wisdom-and-introspection': 'bg-teal-500',
};

/**
 * Highlight matching text in search results
 * Returns JSX with highlighted spans for matching portions
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.trim().length);
  const after = text.slice(index + query.trim().length);

  return (
    <>
      {before}
      <mark className="bg-indigo-500/30 text-inherit rounded px-0.5">{match}</mark>
      {after}
    </>
  );
}

interface SearchResults {
  cards: Array<{
    id: string;
    slug: string;
    name: string;
    summary: string;
    keywords: string;
    imageUrl: string;
    arcanaType: string;
    suit: string | null;
  }>;
  talks: Array<{
    id: string;
    slug: string;
    title: string;
    speakerName: string;
    tedUrl: string | null;
    youtubeUrl: string | null;
    durationSeconds: number | null;
    year: number | null;
  }>;
  themes: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
  }>;
  query: string;
  suggestions?: string[];
  hasMoreCards?: boolean;
  hasMoreTalks?: boolean;
  hasMoreThemes?: boolean;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMoreCards, setLoadingMoreCards] = useState(false);
  const [loadingMoreTalks, setLoadingMoreTalks] = useState(false);
  const [loadingMoreThemes, setLoadingMoreThemes] = useState(false);

  // Parse filters from URL
  const parseFiltersFromURL = (): FilterState => {
    const typeParam = searchParams.get('type');
    const types = typeParam
      ? typeParam.split(',').filter(t => ['card', 'talk', 'theme'].includes(t)) as ('card' | 'talk' | 'theme')[]
      : DEFAULT_FILTERS.type;

    const arcanaParam = searchParams.get('arcana');
    const arcana = arcanaParam === 'major' || arcanaParam === 'minor' ? arcanaParam : DEFAULT_FILTERS.arcana;

    const suitParam = searchParams.get('suit');
    const suits = suitParam
      ? suitParam.split(',').filter(s => ['wands', 'cups', 'swords', 'pentacles'].includes(s)) as ('wands' | 'cups' | 'swords' | 'pentacles')[]
      : DEFAULT_FILTERS.suit;

    const minDuration = parseInt(searchParams.get('minDuration') || String(DURATION_MIN), 10);
    const maxDuration = parseInt(searchParams.get('maxDuration') || String(DURATION_MAX), 10);
    const minYear = parseInt(searchParams.get('minYear') || String(YEAR_MIN), 10);
    const maxYear = parseInt(searchParams.get('maxYear') || String(YEAR_MAX), 10);

    return {
      type: types,
      arcana,
      suit: suits,
      minDuration: isNaN(minDuration) ? DURATION_MIN : minDuration,
      maxDuration: isNaN(maxDuration) ? DURATION_MAX : maxDuration,
      minYear: isNaN(minYear) ? YEAR_MIN : minYear,
      maxYear: isNaN(maxYear) ? YEAR_MAX : maxYear,
    };
  };

  const [filters, setFilters] = useState<FilterState>(parseFiltersFromURL());

  // Update filters when URL changes
  useEffect(() => {
    setFilters(parseFiltersFromURL());
  }, [searchParams]);

  // Perform search when query or filters change
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, filters);
    }
  }, [initialQuery, searchParams]);

  const buildSearchURL = (query: string, filterState: FilterState): string => {
    const params = new URLSearchParams();
    params.set('q', query);

    // Only add filter params if they differ from defaults
    if (filterState.type.length > 0 && filterState.type.length < 3) {
      params.set('type', filterState.type.join(','));
    }

    if (filterState.arcana !== 'all') {
      params.set('arcana', filterState.arcana);
    }

    if (filterState.suit.length > 0) {
      params.set('suit', filterState.suit.join(','));
    }

    if (filterState.minDuration > DURATION_MIN) {
      params.set('minDuration', filterState.minDuration.toString());
    }

    if (filterState.maxDuration < DURATION_MAX) {
      params.set('maxDuration', filterState.maxDuration.toString());
    }

    if (filterState.minYear > YEAR_MIN) {
      params.set('minYear', filterState.minYear.toString());
    }

    if (filterState.maxYear < YEAR_MAX) {
      params.set('maxYear', filterState.maxYear.toString());
    }

    return `/api/search?${params.toString()}`;
  };

  const performSearch = async (query: string, filterState: FilterState) => {
    if (!query.trim()) {
      setResults(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = buildSearchURL(query, filterState);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Unable to complete search. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, filters);
  };

  const loadMoreCards = async () => {
    if (!results || !results.hasMoreCards || loadingMoreCards) return;
    setLoadingMoreCards(true);
    try {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      params.set('cardsOffset', String(results.cards.length));
      // Include current filter params
      if (filters.arcana !== 'all') params.set('arcana', filters.arcana);
      if (filters.suit.length > 0) params.set('suit', filters.suit.join(','));
      params.set('type', 'card'); // Only load cards

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Load more failed');
      const data = await response.json();

      setResults(prev => prev ? {
        ...prev,
        cards: [...prev.cards, ...data.cards],
        hasMoreCards: data.hasMoreCards,
      } : null);
    } catch (err) {
      console.error('Error loading more cards:', err);
    } finally {
      setLoadingMoreCards(false);
    }
  };

  const loadMoreTalks = async () => {
    if (!results || !results.hasMoreTalks || loadingMoreTalks) return;
    setLoadingMoreTalks(true);
    try {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      params.set('talksOffset', String(results.talks.length));
      // Include current filter params
      if (filters.minDuration > DURATION_MIN) params.set('minDuration', String(filters.minDuration));
      if (filters.maxDuration < DURATION_MAX) params.set('maxDuration', String(filters.maxDuration));
      if (filters.minYear > YEAR_MIN) params.set('minYear', String(filters.minYear));
      if (filters.maxYear < YEAR_MAX) params.set('maxYear', String(filters.maxYear));
      params.set('type', 'talk'); // Only load talks

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Load more failed');
      const data = await response.json();

      setResults(prev => prev ? {
        ...prev,
        talks: [...prev.talks, ...data.talks],
        hasMoreTalks: data.hasMoreTalks,
      } : null);
    } catch (err) {
      console.error('Error loading more talks:', err);
    } finally {
      setLoadingMoreTalks(false);
    }
  };

  const loadMoreThemes = async () => {
    if (!results || !results.hasMoreThemes || loadingMoreThemes) return;
    setLoadingMoreThemes(true);
    try {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      params.set('themesOffset', String(results.themes.length));
      params.set('type', 'theme'); // Only load themes

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Load more failed');
      const data = await response.json();

      setResults(prev => prev ? {
        ...prev,
        themes: [...prev.themes, ...data.themes],
        hasMoreThemes: data.hasMoreThemes,
      } : null);
    } catch (err) {
      console.error('Error loading more themes:', err);
    } finally {
      setLoadingMoreThemes(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);

    if (newFilters.type.length > 0 && newFilters.type.length < 3) {
      params.set('type', newFilters.type.join(','));
    }

    if (newFilters.arcana !== 'all') {
      params.set('arcana', newFilters.arcana);
    }

    if (newFilters.suit.length > 0) {
      params.set('suit', newFilters.suit.join(','));
    }

    if (newFilters.minDuration > DURATION_MIN) {
      params.set('minDuration', newFilters.minDuration.toString());
    }

    if (newFilters.maxDuration < DURATION_MAX) {
      params.set('maxDuration', newFilters.maxDuration.toString());
    }

    if (newFilters.minYear > YEAR_MIN) {
      params.set('minYear', newFilters.minYear.toString());
    }

    if (newFilters.maxYear < YEAR_MAX) {
      params.set('maxYear', newFilters.maxYear.toString());
    }

    router.push(`/search?${params.toString()}`, { scroll: false });

    // Auto-trigger search with new filters if there's a query
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilters);
    }
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterState = { ...DEFAULT_FILTERS };
    setFilters(defaultFilters);

    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    router.push(`/search?${params.toString()}`, { scroll: false });

    // Auto-trigger search with default filters if there's a query
    if (searchQuery.trim()) {
      performSearch(searchQuery, defaultFilters);
    }
  };

  const totalResults = results
    ? results.cards.length + results.talks.length + results.themes.length
    : 0;

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    const params = new URLSearchParams();
    params.set('q', suggestion);
    router.push(`/search?${params.toString()}`, { scroll: false });
    performSearch(suggestion, filters);
  };

  return (
    <div className="px-4 py-6 pb-24 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-100">Search</h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search cards, talks, or themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-gray-100 placeholder-gray-500"
          autoFocus
        />
      </form>

      {/* Search Filters */}
      <SearchFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 mt-3">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => performSearch(searchQuery, filters)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {!isLoading && results && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="text-center">
            <p className="text-gray-400">
              {totalResults === 0 ? (
                <>
                  No results found for &ldquo;{results.query}&rdquo;
                  {(filters.type.length < 3 || filters.arcana !== 'all' || filters.suit.length > 0 || filters.minDuration > DURATION_MIN || filters.maxDuration < DURATION_MAX || filters.minYear > YEAR_MIN || filters.maxYear < YEAR_MAX) && (
                    <span className="block mt-1 text-sm">Try adjusting your filters</span>
                  )}
                </>
              ) : (
                <>
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{results.query}&rdquo;
                </>
              )}
            </p>

            {/* Search Suggestions */}
            {totalResults === 0 && results.suggestions && results.suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Did you mean:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {results.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 rounded-lg text-sm border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cards Section */}
          {results.cards.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                Cards
                <span className="text-sm text-gray-500 font-normal">({results.cards.length})</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.cards.map((card) => {
                  const keywords = card.keywords ? JSON.parse(card.keywords) : [];
                  return (
                    <Link
                      key={card.id}
                      href={`/cards/${card.slug}`}
                      className="bg-gray-800/50 rounded-xl p-4 shadow-sm border border-gray-700 hover:shadow-md hover:border-gray-600 transition-all text-left group"
                    >
                      <div className="aspect-[5/7] rounded-lg mb-3 overflow-hidden relative group-hover:scale-105 transition-transform bg-gray-900">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          loading="lazy"
                          className="object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-100 mb-1">{highlightMatch(card.name, results.query)}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{highlightMatch(card.summary, results.query)}</p>
                      <div className="flex flex-wrap gap-1">
                        {keywords.slice(0, 2).map((keyword: string) => (
                          <span
                            key={keyword}
                            className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Load More Cards Button */}
              {results.hasMoreCards && (
                <button
                  onClick={loadMoreCards}
                  disabled={loadingMoreCards}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingMoreCards ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more cards'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Talks Section */}
          {results.talks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                Talks
                <span className="text-sm text-gray-500 font-normal">({results.talks.length})</span>
              </h2>
              <div className="space-y-3">
                {results.talks.map((talk) => (
                  <Link
                    key={talk.id}
                    href={`/talks/${talk.slug}`}
                    className="block bg-gray-800/50 rounded-xl p-4 shadow-sm border border-gray-700 hover:shadow-md hover:border-gray-600 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                        <Play className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-100 mb-1 line-clamp-2">{highlightMatch(talk.title, results.query)}</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {highlightMatch(talk.speakerName, results.query)}
                          {talk.durationSeconds && (
                            <> • {Math.floor(talk.durationSeconds / 60)} min</>
                          )}
                          {talk.year && <> • {talk.year}</>}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Load More Talks Button */}
              {results.hasMoreTalks && (
                <button
                  onClick={loadMoreTalks}
                  disabled={loadingMoreTalks}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingMoreTalks ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more talks'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Themes Section */}
          {results.themes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                Themes
                <span className="text-sm text-gray-500 font-normal">({results.themes.length})</span>
              </h2>
              <div className="space-y-3">
                {results.themes.map((theme) => (
                  <Link
                    key={theme.id}
                    href={`/themes/${theme.slug}`}
                    className="block bg-gray-800/50 rounded-xl p-5 shadow-sm border border-gray-700 hover:shadow-md hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-1 h-16 rounded-full flex-shrink-0 ${themeColors[theme.slug] || 'bg-indigo-500'}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-lg font-semibold text-gray-100">{highlightMatch(theme.name, results.query)}</h3>
                        </div>
                        <p className="text-gray-400 text-sm">{highlightMatch(theme.description || '', results.query)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Load More Themes Button */}
              {results.hasMoreThemes && (
                <button
                  onClick={loadMoreThemes}
                  disabled={loadingMoreThemes}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingMoreThemes ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more themes'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !results && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">Enter a search term to find cards, talks, and themes</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-6 pb-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mt-12"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
