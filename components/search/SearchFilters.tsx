'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterState {
  type: ('card' | 'talk' | 'theme')[];
  arcana: 'all' | 'major' | 'minor';
  suit: ('wands' | 'cups' | 'swords' | 'pentacles')[];
  minDuration: number;
  maxDuration: number;
  minYear: number;
  maxYear: number;
}

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const DURATION_MARKS = [
  { value: 0, label: '0m' },
  { value: 300, label: '5m' },
  { value: 600, label: '10m' },
  { value: 900, label: '15m' },
  { value: 1200, label: '20m' },
  { value: 1800, label: '30m' },
  { value: 2400, label: '40m' },
  { value: 3000, label: '50m' },
  { value: 3600, label: '60m+' },
];

const YEAR_MARKS = [
  { value: 2000, label: '2000' },
  { value: 2010, label: '2010' },
  { value: 2020, label: '2020' },
  { value: 2025, label: '2025' },
];

export default function SearchFilters({ filters, onChange, onClear }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filters.type.length > 0 && filters.type.length < 3) ||
      filters.arcana !== 'all' ||
      filters.suit.length > 0 ||
      filters.minDuration > 0 ||
      filters.maxDuration < 3600 ||
      filters.minYear > 2000 ||
      filters.maxYear < 2025
    );
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.type.length > 0 && filters.type.length < 3) count++;
    if (filters.arcana !== 'all') count++;
    if (filters.suit.length > 0) count++;
    if (filters.minDuration > 0 || filters.maxDuration < 3600) count++;
    if (filters.minYear > 2000 || filters.maxYear < 2025) count++;
    return count;
  };

  // Determine which filters should be disabled
  const isCardsOnly = filters.type.length === 1 && filters.type.includes('card');
  const isTalksOnly = filters.type.length === 1 && filters.type.includes('talk');
  const isThemesOnly = filters.type.length === 1 && filters.type.includes('theme');
  const noCardsSelected = !filters.type.includes('card');
  const noTalksSelected = !filters.type.includes('talk');

  const handleTypeToggle = (type: 'card' | 'talk' | 'theme') => {
    const newTypes = filters.type.includes(type)
      ? filters.type.filter(t => t !== type)
      : [...filters.type, type];
    onChange({ ...filters, type: newTypes });
  };

  const handleArcanaChange = (arcana: 'all' | 'major' | 'minor') => {
    onChange({ ...filters, arcana });
  };

  const handleSuitToggle = (suit: 'wands' | 'cups' | 'swords' | 'pentacles') => {
    const newSuits = filters.suit.includes(suit)
      ? filters.suit.filter(s => s !== suit)
      : [...filters.suit, suit];
    onChange({ ...filters, suit: newSuits });
  };

  const handleDurationChange = (min: number, max: number) => {
    onChange({ ...filters, minDuration: min, maxDuration: max });
  };

  const handleYearChange = (min: number, max: number) => {
    onChange({ ...filters, minYear: min, maxYear: max });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Filter Header (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-400" />
          <span className="font-medium text-gray-100">Filters</span>
          {activeFilterCount() > 0 && (
            <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-semibold rounded-full">
              {activeFilterCount()}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Filter Content (Expandable) */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-gray-700">
          {/* Entity Type Checkboxes */}
          <div className="pt-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Show Results For
            </label>
            <div className="space-y-2">
              {[
                { value: 'card' as const, label: 'Cards' },
                { value: 'talk' as const, label: 'Talks' },
                { value: 'theme' as const, label: 'Themes' },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.type.includes(value)}
                    onChange={() => handleTypeToggle(value)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Arcana Filter (Cards Only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Arcana
              {noCardsSelected && (
                <span className="ml-2 text-xs text-gray-500 font-normal">(Cards only)</span>
              )}
            </label>
            <div className="space-y-2">
              {[
                { value: 'all' as const, label: 'All' },
                { value: 'major' as const, label: 'Major Arcana' },
                { value: 'minor' as const, label: 'Minor Arcana' },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 cursor-pointer group ${
                    noCardsSelected ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="arcana"
                    checked={filters.arcana === value}
                    onChange={() => handleArcanaChange(value)}
                    disabled={noCardsSelected}
                    className="w-4 h-4 border-gray-600 bg-gray-700 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Suit Filter (Cards Only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Suit
              {noCardsSelected && (
                <span className="ml-2 text-xs text-gray-500 font-normal">(Cards only)</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'wands' as const, label: 'Wands', emoji: '🔥' },
                { value: 'cups' as const, label: 'Cups', emoji: '💧' },
                { value: 'swords' as const, label: 'Swords', emoji: '⚔️' },
                { value: 'pentacles' as const, label: 'Pentacles', emoji: '🪙' },
              ].map(({ value, label, emoji }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 cursor-pointer group ${
                    noCardsSelected ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.suit.includes(value)}
                    onChange={() => handleSuitToggle(value)}
                    disabled={noCardsSelected}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-gray-300 group-hover:text-gray-100 transition-colors">
                    {emoji} {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Range (Talks Only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Duration
              {noTalksSelected && (
                <span className="ml-2 text-xs text-gray-500 font-normal">(Talks only)</span>
              )}
            </label>
            <div className={noTalksSelected ? 'opacity-50' : ''}>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{Math.floor(filters.minDuration / 60)} min</span>
                <span>{filters.maxDuration >= 3600 ? '60+ min' : `${Math.floor(filters.maxDuration / 60)} min`}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="3600"
                  step="60"
                  value={filters.minDuration}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value), filters.maxDuration)}
                  disabled={noTalksSelected}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-indigo-500"
                />
                <input
                  type="range"
                  min="0"
                  max="3600"
                  step="60"
                  value={filters.maxDuration}
                  onChange={(e) => handleDurationChange(filters.minDuration, parseInt(e.target.value))}
                  disabled={noTalksSelected}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Year Range (Talks Only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Year
              {noTalksSelected && (
                <span className="ml-2 text-xs text-gray-500 font-normal">(Talks only)</span>
              )}
            </label>
            <div className={noTalksSelected ? 'opacity-50' : ''}>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{filters.minYear}</span>
                <span>{filters.maxYear}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="2000"
                  max="2025"
                  step="1"
                  value={filters.minYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value), filters.maxYear)}
                  disabled={noTalksSelected}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-indigo-500"
                />
                <input
                  type="range"
                  min="2000"
                  max="2025"
                  step="1"
                  value={filters.maxYear}
                  onChange={(e) => handleYearChange(filters.minYear, parseInt(e.target.value))}
                  disabled={noTalksSelected}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters() && (
            <button
              onClick={onClear}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
