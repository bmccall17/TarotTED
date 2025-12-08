'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Shuffle, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="px-4 py-6 pb-24 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-100">Tarot of TED</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Where ancient wisdom meets modern insight. Find talks that speak to your journey.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search cards, talks, or themes..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-gray-100 placeholder-gray-500"
        />
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <Link
          href="/cards"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Shuffle className="w-5 h-5" />
          <span className="font-medium">Draw a Card & Talk</span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/cards"
            className="bg-gray-800 border-2 border-indigo-500/30 text-indigo-300 py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors text-center font-medium"
          >
            Browse Cards
          </Link>
          <Link
            href="/talks"
            className="bg-gray-800 border-2 border-purple-500/30 text-purple-300 py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors text-center font-medium"
          >
            Browse Talks
          </Link>
        </div>
      </div>

      {/* Featured Theme */}
      <div className="bg-gray-800/50 rounded-xl p-5 shadow-sm border border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-1 h-16 rounded-full bg-green-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-400 uppercase tracking-wide">Featured Theme</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-1">New Beginnings</h3>
            <p className="text-gray-400 text-sm">Talks and cards for stepping into the unknown and starting fresh.</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs text-gray-500">
            <span>8 cards</span>
            <span>6 talks</span>
          </div>
          <Link
            href="/themes/new-beginnings"
            className="text-indigo-400 text-sm hover:text-indigo-300 font-medium"
          >
            Explore →
          </Link>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-800/50 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-700/50 transition-colors"
        >
          <span className="text-gray-300 font-medium">How this works</span>
          <span className="text-gray-500 text-xl">{showAbout ? '−' : '+'}</span>
        </button>
        {showAbout && (
          <div className="px-5 pb-5 space-y-3 text-sm text-gray-400 border-t border-gray-700 pt-4">
            <p>
              Each tarot card is paired with TED talks that echo its wisdom. Whether you&apos;re drawing cards for guidance or exploring themes, you&apos;ll find talks that deepen your understanding.
            </p>
            <p>
              Start by drawing a random card, browse by theme, or search for something specific. Each connection is thoughtfully curated to bridge timeless archetypes with contemporary insight.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
