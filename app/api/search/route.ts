import { NextRequest, NextResponse } from 'next/server';
import { searchWithFilters, getSearchSuggestions, type SearchFilters } from '@/lib/db/queries/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        cards: [],
        talks: [],
        themes: [],
      });
    }

    // Parse filter parameters
    const filters: SearchFilters = {};

    // Entity type filter (comma-separated: card,talk,theme)
    const typeParam = searchParams.get('type');
    if (typeParam) {
      const types = typeParam.split(',').map(t => t.trim());
      const validTypes = types.filter(t => ['card', 'talk', 'theme'].includes(t));
      if (validTypes.length > 0) {
        filters.type = validTypes as ('card' | 'talk' | 'theme')[];
      }
    }

    // Arcana filter (major or minor)
    const arcanaParam = searchParams.get('arcana');
    if (arcanaParam === 'major' || arcanaParam === 'minor') {
      filters.arcana = arcanaParam;
    }

    // Suit filter (comma-separated: wands,cups,swords,pentacles)
    const suitParam = searchParams.get('suit');
    if (suitParam) {
      const suits = suitParam.split(',').map(s => s.trim());
      const validSuits = suits.filter(s =>
        ['wands', 'cups', 'swords', 'pentacles'].includes(s)
      );
      if (validSuits.length > 0) {
        filters.suit = validSuits as ('wands' | 'cups' | 'swords' | 'pentacles')[];
      }
    }

    // Duration filters (in seconds)
    const minDurationParam = searchParams.get('minDuration');
    if (minDurationParam) {
      const minDuration = parseInt(minDurationParam, 10);
      if (!isNaN(minDuration) && minDuration >= 0) {
        filters.minDuration = minDuration;
      }
    }

    const maxDurationParam = searchParams.get('maxDuration');
    if (maxDurationParam) {
      const maxDuration = parseInt(maxDurationParam, 10);
      if (!isNaN(maxDuration) && maxDuration >= 0) {
        filters.maxDuration = maxDuration;
      }
    }

    // Year filters
    const minYearParam = searchParams.get('minYear');
    if (minYearParam) {
      const minYear = parseInt(minYearParam, 10);
      if (!isNaN(minYear)) {
        filters.minYear = minYear;
      }
    }

    const maxYearParam = searchParams.get('maxYear');
    if (maxYearParam) {
      const maxYear = parseInt(maxYearParam, 10);
      if (!isNaN(maxYear)) {
        filters.maxYear = maxYear;
      }
    }

    // Execute search with filters
    const results = await searchWithFilters(query, filters);

    // Get suggestions if no results found
    const totalResults = results.cards.length + results.talks.length + results.themes.length;
    let suggestions: string[] = [];
    if (totalResults === 0) {
      suggestions = await getSearchSuggestions(query);
    }

    // No caching to immediately reflect admin changes
    return NextResponse.json({ ...results, suggestions }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
