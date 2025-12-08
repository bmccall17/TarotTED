'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Play } from 'lucide-react';

interface Talk {
  id: string;
  slug: string;
  title: string;
  speakerName: string;
  tedUrl: string;
  durationSeconds: number | null;
  year: number | null;
}

interface TalksGridProps {
  talks: Talk[];
}

const durations = [
  { id: 'all', label: 'All Lengths' },
  { id: 'short', label: '< 10 min' },
  { id: 'medium', label: '10-20 min' },
  { id: 'long', label: '> 20 min' },
];

export function TalksGrid({ talks }: TalksGridProps) {
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTalks = talks.filter((talk) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        talk.title.toLowerCase().includes(query) ||
        talk.speakerName.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Duration filter
    if (selectedDuration !== 'all' && talk.durationSeconds) {
      const minutes = Math.floor(talk.durationSeconds / 60);
      if (selectedDuration === 'short' && minutes >= 10) return false;
      if (selectedDuration === 'medium' && (minutes < 10 || minutes > 20)) return false;
      if (selectedDuration === 'long' && minutes <= 20) return false;
    }

    return true;
  });

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search talks by title or speaker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-gray-100 placeholder-gray-500"
        />
      </div>

      {/* Duration Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {durations.map((duration) => (
          <button
            key={duration.id}
            onClick={() => setSelectedDuration(duration.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
              selectedDuration === duration.id
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {duration.label}
          </button>
        ))}
      </div>

      {/* Talks List */}
      <div className="space-y-3">
        {filteredTalks.map((talk) => (
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

      {/* Count */}
      <p className="text-center text-sm text-gray-500">
        Showing {filteredTalks.length} of {talks.length} talks
      </p>
    </>
  );
}
