import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards, talks, themes } from '@/lib/db/schema';
import { ilike, or, sql } from 'drizzle-orm';

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

    const searchTerm = `%${query.trim()}%`;

    // Search cards (name, keywords, summary)
    const cardResults = await db
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
      .where(
        or(
          ilike(cards.name, searchTerm),
          ilike(cards.keywords, searchTerm),
          ilike(cards.summary, searchTerm)
        )
      )
      .limit(20);

    // Search talks (title, speaker)
    const talkResults = await db
      .select({
        id: talks.id,
        slug: talks.slug,
        title: talks.title,
        speakerName: talks.speakerName,
        tedUrl: talks.tedUrl,
        durationSeconds: talks.durationSeconds,
        year: talks.year,
      })
      .from(talks)
      .where(
        or(
          ilike(talks.title, searchTerm),
          ilike(talks.speakerName, searchTerm)
        )
      )
      .limit(20);

    // Search themes (name, description)
    const themeResults = await db
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

    return NextResponse.json({
      cards: cardResults,
      talks: talkResults,
      themes: themeResults,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
