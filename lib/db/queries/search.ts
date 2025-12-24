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
  }>;
  themes: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
  }>;
  query: string;
}

export async function searchWithFilters(
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResults> {
  const searchTerm = `%${query.trim()}%`;
  const shouldSearchCards = !filters.type || filters.type.includes('card');
  const shouldSearchTalks = !filters.type || filters.type.includes('talk');
  const shouldSearchThemes = !filters.type || filters.type.includes('theme');

  // Search cards
  let cardResults: SearchResults['cards'] = [];
  if (shouldSearchCards) {
    const cardConditions = [
      or(
        ilike(cards.name, searchTerm),
        ilike(cards.keywords, searchTerm),
        ilike(cards.summary, searchTerm)
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

    cardResults = await db
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
      .limit(20);
  }

  // Search talks
  let talkResults: SearchResults['talks'] = [];
  if (shouldSearchTalks) {
    const talkConditions = [
      or(
        ilike(talks.title, searchTerm),
        ilike(talks.speakerName, searchTerm)
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

    talkResults = await db
      .select({
        id: talks.id,
        slug: talks.slug,
        title: talks.title,
        speakerName: talks.speakerName,
        tedUrl: talks.tedUrl,
        youtubeUrl: talks.youtubeUrl,
        durationSeconds: talks.durationSeconds,
        year: talks.year,
      })
      .from(talks)
      .where(and(...talkConditions))
      .limit(20);
  }

  // Search themes
  let themeResults: SearchResults['themes'] = [];
  if (shouldSearchThemes) {
    themeResults = await db
      .select({
        id: themes.id,
        slug: themes.slug,
        name: themes.name,
        description: themes.shortDescription,
      })
      .from(themes)
      .where(
        or(
          ilike(themes.name, searchTerm),
          ilike(themes.shortDescription, searchTerm)
        )
      )
      .limit(10);
  }

  return {
    cards: cardResults,
    talks: talkResults,
    themes: themeResults,
    query: query.trim(),
  };
}
