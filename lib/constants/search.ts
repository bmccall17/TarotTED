/**
 * Search-related constants
 * Centralized defaults for filter values and search configuration
 */

// Duration filter defaults (in seconds)
export const DURATION_MIN = 0;
export const DURATION_MAX = 3600; // 60 minutes

// Year filter defaults
export const YEAR_MIN = 2000;
export const YEAR_MAX = 2025;

// Result limits
export const SEARCH_LIMIT_CARDS = 20;
export const SEARCH_LIMIT_TALKS = 20;
export const SEARCH_LIMIT_THEMES = 10;

// Pagination
export const SEARCH_PAGE_SIZE = 20;

// Debounce delay (in milliseconds)
export const SEARCH_DEBOUNCE_MS = 300;

// Minimum query length for search
export const SEARCH_MIN_QUERY_LENGTH = 2;

// Default filter state
export const DEFAULT_FILTERS = {
  type: ['card', 'talk', 'theme'] as ('card' | 'talk' | 'theme')[],
  arcana: 'all' as const,
  suit: [] as ('wands' | 'cups' | 'swords' | 'pentacles')[],
  minDuration: DURATION_MIN,
  maxDuration: DURATION_MAX,
  minYear: YEAR_MIN,
  maxYear: YEAR_MAX,
};

// Entity types
export const ENTITY_TYPES = ['card', 'talk', 'theme'] as const;
export type EntityType = typeof ENTITY_TYPES[number];

// Arcana types
export const ARCANA_TYPES = ['all', 'major', 'minor'] as const;
export type ArcanaType = typeof ARCANA_TYPES[number];

// Suit types
export const SUIT_TYPES = ['wands', 'cups', 'swords', 'pentacles'] as const;
export type SuitType = typeof SUIT_TYPES[number];
