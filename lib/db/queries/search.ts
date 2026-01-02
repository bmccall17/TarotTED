import { db } from '../index';
import { cards, talks, themes } from '../schema';
import { ilike, or, and, eq, gte, lte, inArray, isNull } from 'drizzle-orm';

export interface SearchFilters {
  type?: ('card' | 'talk' | 'theme')[];
  arcana?: 'major' | 'minor';
  suit?: ('wands' | 'cups' | 'swords' | 'pentacles')[];
  minDuration?: number; // in seconds
  maxDuration?: number; // in seconds
  minYear?: number;
  maxYear?: number;
}

export interface PaginationOptions {
  cardsOffset?: number;
  cardsLimit?: number;
  talksOffset?: number;
  talksLimit?: number;
  themesOffset?: number;
  themesLimit?: number;
}

// Extended card result with relevance score
interface CardResultWithScore {
  id: string;
  slug: string;
  name: string;
  summary: string;
  keywords: string;
  imageUrl: string;
  arcanaType: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  _score?: number;
}

// Extended talk result with relevance score
interface TalkResultWithScore {
  id: string;
  slug: string;
  title: string;
  speakerName: string;
  tedUrl: string | null;
  youtubeUrl: string | null;
  durationSeconds: number | null;
  year: number | null;
  description: string | null;
  _score?: number;
}

// Extended theme result with relevance score
interface ThemeResultWithScore {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  _score?: number;
}

export interface SearchResults {
  cards: Array<{
    id: string;
    slug: string;
    name: string;
    summary: string;
    keywords: string;
    imageUrl: string;
    arcanaType: 'major' | 'minor';
    suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
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
    description: string | null;
  }>;
  themes: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
  }>;
  query: string;
  hasMoreCards?: boolean;
  hasMoreTalks?: boolean;
  hasMoreThemes?: boolean;
}

/**
 * Calculate relevance score for a text match
 * Higher scores = better matches
 */
function calculateRelevanceScore(text: string | null, query: string, weight: number = 1): number {
  if (!text) return 0;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match (case-insensitive)
  if (lowerText === lowerQuery) return 100 * weight;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 75 * weight;

  // Word starts with query (e.g., "The Tower" matches "tower")
  const words = lowerText.split(/\s+/);
  if (words.some(word => word.startsWith(lowerQuery))) return 50 * weight;

  // Contains query
  if (lowerText.includes(lowerQuery)) return 25 * weight;

  return 0;
}

/**
 * Score a card result based on query matches
 */
function scoreCard(card: CardResultWithScore, query: string): number {
  let score = 0;

  // Primary fields (high weight)
  score += calculateRelevanceScore(card.name, query, 2);

  // Secondary fields (medium weight)
  score += calculateRelevanceScore(card.keywords, query, 1.5);

  // Tertiary fields (lower weight)
  score += calculateRelevanceScore(card.summary, query, 1);

  return score;
}

/**
 * Score a talk result based on query matches
 */
function scoreTalk(talk: TalkResultWithScore, query: string): number {
  let score = 0;

  // Primary fields (high weight)
  score += calculateRelevanceScore(talk.title, query, 2);
  score += calculateRelevanceScore(talk.speakerName, query, 1.5);

  // Secondary fields (lower weight)
  score += calculateRelevanceScore(talk.description, query, 1);

  return score;
}

/**
 * Score a theme result based on query matches
 */
function scoreTheme(theme: ThemeResultWithScore, query: string): number {
  let score = 0;

  // Primary field (high weight)
  score += calculateRelevanceScore(theme.name, query, 2);

  // Secondary field (lower weight)
  score += calculateRelevanceScore(theme.description, query, 1);

  return score;
}

/**
 * Get search suggestions based on partial query matches
 * Used for "Did you mean?" functionality when few/no results found
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery.length < 2) return [];

  const suggestions: string[] = [];

  // Get card names that partially match
  const cardSuggestions = await db
    .select({ name: cards.name })
    .from(cards)
    .limit(20);

  // Find cards with names that contain the query or start with similar letters
  for (const card of cardSuggestions) {
    const lowerName = card.name.toLowerCase();

    // Check for partial match or similar starting characters
    if (lowerName.includes(trimmedQuery) ||
        trimmedQuery.includes(lowerName.split(' ')[0]) ||
        levenshteinDistance(trimmedQuery, lowerName.split(' ')[0]) <= 2) {
      if (!suggestions.includes(card.name)) {
        suggestions.push(card.name);
      }
    }
  }

  // Get talk titles that might be relevant
  const talkSuggestions = await db
    .select({ title: talks.title })
    .from(talks)
    .where(or(eq(talks.isDeleted, false), isNull(talks.isDeleted)))
    .limit(50);

  // Find talks with titles containing similar words
  for (const talk of talkSuggestions) {
    const words = talk.title.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 &&
          (word.startsWith(trimmedQuery) ||
           trimmedQuery.startsWith(word.slice(0, 3)) ||
           levenshteinDistance(trimmedQuery, word) <= 2)) {
        // Add the relevant word, not the whole title
        if (!suggestions.some(s => s.toLowerCase() === word)) {
          suggestions.push(word.charAt(0).toUpperCase() + word.slice(1));
        }
        break;
      }
    }
  }

  // Get theme names
  const themeSuggestions = await db
    .select({ name: themes.name })
    .from(themes);

  for (const theme of themeSuggestions) {
    const lowerName = theme.name.toLowerCase();
    if (lowerName.includes(trimmedQuery) ||
        levenshteinDistance(trimmedQuery, lowerName.split(' ')[0]) <= 2) {
      if (!suggestions.includes(theme.name)) {
        suggestions.push(theme.name);
      }
    }
  }

  return suggestions.slice(0, limit);
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching in suggestions
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Default limits for pagination
const DEFAULT_CARDS_LIMIT = 20;
const DEFAULT_TALKS_LIMIT = 20;
const DEFAULT_THEMES_LIMIT = 10;

export async function searchWithFilters(
  query: string,
  filters: SearchFilters = {},
  pagination: PaginationOptions = {}
): Promise<SearchResults> {
  const searchTerm = `%${query.trim()}%`;
  const trimmedQuery = query.trim();
  const shouldSearchCards = !filters.type || filters.type.includes('card');
  const shouldSearchTalks = !filters.type || filters.type.includes('talk');
  const shouldSearchThemes = !filters.type || filters.type.includes('theme');

  // Extract pagination options with defaults
  const cardsOffset = pagination.cardsOffset ?? 0;
  const cardsLimit = pagination.cardsLimit ?? DEFAULT_CARDS_LIMIT;
  const talksOffset = pagination.talksOffset ?? 0;
  const talksLimit = pagination.talksLimit ?? DEFAULT_TALKS_LIMIT;
  const themesOffset = pagination.themesOffset ?? 0;
  const themesLimit = pagination.themesLimit ?? DEFAULT_THEMES_LIMIT;

  // Search cards - expanded to include uprightMeaning and reversedMeaning
  let cardResults: CardResultWithScore[] = [];
  if (shouldSearchCards) {
    const cardConditions = [
      or(
        ilike(cards.name, searchTerm),
        ilike(cards.keywords, searchTerm),
        ilike(cards.summary, searchTerm),
        ilike(cards.uprightMeaning, searchTerm),
        ilike(cards.reversedMeaning, searchTerm)
      ),
    ];

    // Add arcana filter
    if (filters.arcana) {
      cardConditions.push(eq(cards.arcanaType, filters.arcana));
    }

    // Add suit filter
    if (filters.suit && filters.suit.length > 0) {
      cardConditions.push(inArray(cards.suit, filters.suit));
    }

    // Fetch extra records for scoring, then paginate after sorting
    const fetchLimit = cardsOffset + cardsLimit + 10; // Extra buffer for scoring
    const rawCards = await db
      .select({
        id: cards.id,
        slug: cards.slug,
        name: cards.name,
        summary: cards.summary,
        keywords: cards.keywords,
        imageUrl: cards.imageUrl,
        arcanaType: cards.arcanaType,
        suit: cards.suit,
      })
      .from(cards)
      .where(and(...cardConditions))
      .limit(fetchLimit);

    // Score and sort cards by relevance, then apply pagination
    const scoredCards = rawCards
      .map(card => ({
        ...card,
        _score: scoreCard(card, trimmedQuery),
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));

    cardResults = scoredCards.slice(cardsOffset, cardsOffset + cardsLimit + 1);
  }
  const hasMoreCards = cardResults.length > cardsLimit;
  if (hasMoreCards) {
    cardResults = cardResults.slice(0, cardsLimit);
  }

  // Search talks - expanded to include description
  let talkResults: TalkResultWithScore[] = [];
  if (shouldSearchTalks) {
    const talkConditions = [
      or(
        ilike(talks.title, searchTerm),
        ilike(talks.speakerName, searchTerm),
        ilike(talks.description, searchTerm)
      ),
      // Exclude soft-deleted talks
      or(eq(talks.isDeleted, false), isNull(talks.isDeleted)),
    ];

    // Add duration filter
    if (filters.minDuration !== undefined) {
      talkConditions.push(gte(talks.durationSeconds, filters.minDuration));
    }
    if (filters.maxDuration !== undefined) {
      talkConditions.push(lte(talks.durationSeconds, filters.maxDuration));
    }

    // Add year filter
    if (filters.minYear !== undefined) {
      talkConditions.push(gte(talks.year, filters.minYear));
    }
    if (filters.maxYear !== undefined) {
      talkConditions.push(lte(talks.year, filters.maxYear));
    }

    // Fetch extra records for scoring, then paginate after sorting
    const fetchLimit = talksOffset + talksLimit + 10;
    const rawTalks = await db
      .select({
        id: talks.id,
        slug: talks.slug,
        title: talks.title,
        speakerName: talks.speakerName,
        tedUrl: talks.tedUrl,
        youtubeUrl: talks.youtubeUrl,
        durationSeconds: talks.durationSeconds,
        year: talks.year,
        description: talks.description,
      })
      .from(talks)
      .where(and(...talkConditions))
      .limit(fetchLimit);

    // Score and sort talks by relevance, then apply pagination
    const scoredTalks = rawTalks
      .map(talk => ({
        ...talk,
        _score: scoreTalk(talk, trimmedQuery),
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));

    talkResults = scoredTalks.slice(talksOffset, talksOffset + talksLimit + 1);
  }
  const hasMoreTalks = talkResults.length > talksLimit;
  if (hasMoreTalks) {
    talkResults = talkResults.slice(0, talksLimit);
  }

  // Search themes - expanded to include longDescription
  let themeResults: ThemeResultWithScore[] = [];
  if (shouldSearchThemes) {
    // Fetch extra records for scoring, then paginate after sorting
    const fetchLimit = themesOffset + themesLimit + 5;
    const rawThemes = await db
      .select({
        id: themes.id,
        slug: themes.slug,
        name: themes.name,
        description: themes.shortDescription,
        longDescription: themes.longDescription,
      })
      .from(themes)
      .where(
        or(
          ilike(themes.name, searchTerm),
          ilike(themes.shortDescription, searchTerm),
          ilike(themes.longDescription, searchTerm)
        )
      )
      .limit(fetchLimit);

    // Score and sort themes by relevance, then apply pagination
    const scoredThemes = rawThemes
      .map(theme => ({
        id: theme.id,
        slug: theme.slug,
        name: theme.name,
        description: theme.description,
        _score: scoreTheme({ ...theme, description: theme.description }, trimmedQuery),
      }))
      .sort((a, b) => (b._score || 0) - (a._score || 0));

    themeResults = scoredThemes.slice(themesOffset, themesOffset + themesLimit + 1);
  }
  const hasMoreThemes = themeResults.length > themesLimit;
  if (hasMoreThemes) {
    themeResults = themeResults.slice(0, themesLimit);
  }

  // Remove internal _score from results before returning
  return {
    cards: cardResults.map(({ _score, ...card }) => card),
    talks: talkResults.map(({ _score, ...talk }) => talk),
    themes: themeResults.map(({ _score, ...theme }) => theme),
    query: trimmedQuery,
    hasMoreCards,
    hasMoreTalks,
    hasMoreThemes,
  };
}
