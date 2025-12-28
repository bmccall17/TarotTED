'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CardRow } from './CardRow';

type Mapping = {
  cardId: string;
  isPrimary: boolean;
  talkThumbnailUrl: string | null;
  talkTitle: string;
  talkSlug: string;
  talkId: string;
};

type Card = {
  id: string;
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  number: number | null;
  imageUrl: string;
  summary: string;
  mappings: Mapping[];
};

export function CardsList() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/cards?${params}`);
      if (!response.ok) throw new Error('Failed to fetch cards');

      const data = await response.json();
      setCards(data.cards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchCards, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const majorArcana = cards.filter(c => c.arcanaType === 'major');
  const minorArcana = cards.filter(c => c.arcanaType === 'minor');

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search cards by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="text-gray-400">
          <span className="font-medium text-gray-300">{cards.length}</span> total cards
        </div>
        <div className="text-gray-400">
          <span className="font-medium text-yellow-400">{majorArcana.length}</span> major arcana
        </div>
        <div className="text-gray-400">
          <span className="font-medium text-indigo-400">{minorArcana.length}</span> minor arcana
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading cards...</div>
        ) : cards.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {searchQuery ? 'No cards found matching your search.' : 'No cards found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mappings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cards.map((card) => (
                  <CardRow key={card.id} card={card} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
