'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Star, AlertCircle } from 'lucide-react';

type Card = {
  id: string;
  slug: string;
  name: string;
  arcanaType: 'major' | 'minor';
  suit: string | null;
  sequenceIndex: number;
  imageUrl: string;
  mappingsCount: number;
  hasPrimary: boolean;
};

type Props = {
  cards: Card[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
};

export function CardSelector({ cards, selectedCardId, onSelectCard }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    major: true,
    wands: true,
    cups: true,
    swords: true,
    pentacles: true,
  });
  const [filterMode, setFilterMode] = useState<'all' | 'missing-primary' | 'no-mappings'>('all');

  // Group cards by arcana/suit
  const groupedCards = useMemo(() => {
    const filtered = cards.filter((card) => {
      // Search filter
      if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Status filter
      if (filterMode === 'missing-primary' && card.hasPrimary) {
        return false;
      }
      if (filterMode === 'no-mappings' && card.mappingsCount > 0) {
        return false;
      }
      return true;
    });

    return {
      major: filtered.filter((c) => c.arcanaType === 'major'),
      wands: filtered.filter((c) => c.suit === 'wands'),
      cups: filtered.filter((c) => c.suit === 'cups'),
      swords: filtered.filter((c) => c.suit === 'swords'),
      pentacles: filtered.filter((c) => c.suit === 'pentacles'),
    };
  }, [cards, searchQuery, filterMode]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sectionLabels: Record<string, string> = {
    major: 'Major Arcana',
    wands: 'Wands',
    cups: 'Cups',
    swords: 'Swords',
    pentacles: 'Pentacles',
  };

  const renderCardItem = (card: Card) => {
    const isSelected = card.id === selectedCardId;
    const needsPrimary = card.mappingsCount > 0 && !card.hasPrimary;
    const hasNoMappings = card.mappingsCount === 0;

    return (
      <button
        key={card.id}
        onClick={() => onSelectCard(card.id)}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
          ${isSelected
            ? 'bg-indigo-600/30 border border-indigo-500'
            : 'hover:bg-gray-700/50 border border-transparent'
          }
        `}
      >
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-8 h-12 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${isSelected ? 'text-gray-100' : 'text-gray-300'}`}>
              {card.name}
            </span>
            {card.hasPrimary && (
              <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-500">
            {card.mappingsCount} mapping{card.mappingsCount !== 1 ? 's' : ''}
          </span>
        </div>
        {needsPrimary && (
          <span title="No primary mapping">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          </span>
        )}
        {hasNoMappings && (
          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" title="No mappings" />
        )}
      </button>
    );
  };

  const renderSection = (key: string, sectionCards: Card[]) => {
    if (sectionCards.length === 0 && searchQuery) return null;

    const isExpanded = expandedSections[key];
    const Icon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div key={key} className="mb-2">
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Icon className="w-4 h-4" />
          <span>{sectionLabels[key]}</span>
          <span className="text-xs text-gray-500">({sectionCards.length})</span>
        </button>
        {isExpanded && (
          <div className="ml-2 space-y-1">
            {sectionCards.map(renderCardItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Cards (78)</h3>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as 'all' | 'missing-primary' | 'no-mappings')}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Cards</option>
          <option value="missing-primary">Missing Primary</option>
          <option value="no-mappings">No Mappings</option>
        </select>
      </div>

      {/* Card List */}
      <div className="max-h-[600px] overflow-y-auto p-2">
        {renderSection('major', groupedCards.major)}
        {renderSection('wands', groupedCards.wands)}
        {renderSection('cups', groupedCards.cups)}
        {renderSection('swords', groupedCards.swords)}
        {renderSection('pentacles', groupedCards.pentacles)}
      </div>
    </div>
  );
}
