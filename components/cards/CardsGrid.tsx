'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Card {
  id: string;
  slug: string;
  name: string;
  arcanaType: string;
  suit: string | null;
  imageUrl: string;
  keywords: string;
  summary: string;
}

interface CardsGridProps {
  cards: Card[];
}

const suits = [
  { id: 'all', label: 'All Cards', color: 'bg-gray-100 text-gray-700' },
  { id: 'major', label: 'Major Arcana', color: 'bg-purple-100 text-purple-700' },
  { id: 'wands', label: 'Wands', color: 'bg-orange-100 text-orange-700' },
  { id: 'cups', label: 'Cups', color: 'bg-blue-100 text-blue-700' },
  { id: 'swords', label: 'Swords', color: 'bg-slate-100 text-slate-700' },
  { id: 'pentacles', label: 'Pentacles', color: 'bg-green-100 text-green-700' },
];

export function CardsGrid({ cards }: CardsGridProps) {
  const [selectedSuit, setSelectedSuit] = useState('all');

  const filteredCards = cards.filter((card) => {
    if (selectedSuit === 'all') return true;
    if (selectedSuit === 'major') return card.arcanaType === 'major';
    return card.suit === selectedSuit;
  });

  return (
    <>
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {suits.map((suit) => (
          <button
            key={suit.id}
            onClick={() => setSelectedSuit(suit.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
              selectedSuit === suit.id
                ? suit.color + ' shadow-sm'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {suit.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => {
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

      {/* Count */}
      <p className="text-center text-sm text-gray-500">
        Showing {filteredCards.length} of {cards.length} cards
      </p>
    </>
  );
}
