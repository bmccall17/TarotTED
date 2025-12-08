'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowLeft, Play, Sparkles } from 'lucide-react';

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
    tedUrl: string;
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
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const totalResults = results
    ? results.cards.length + results.talks.length + results.themes.length
    : 0;

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

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 mt-3">Searching...</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && results && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="text-center">
            <p className="text-gray-400">
              {totalResults === 0 ? (
                <>No results found for &ldquo;{results.query}&rdquo;</>
              ) : (
                <>
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{results.query}&rdquo;
                </>
              )}
            </p>
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
                  const keywords = JSON.parse(card.keywords);
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
                          className="object-contain"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-100 mb-1">{card.name}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{card.summary}</p>
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
                        <h3 className="font-semibold text-gray-100 mb-1 line-clamp-2">{talk.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          {talk.speakerName}
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
                          <h3 className="text-lg font-semibold text-gray-100">{theme.name}</h3>
                        </div>
                        <p className="text-gray-400 text-sm">{theme.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
