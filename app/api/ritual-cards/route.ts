import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards, cardTalkMappings, talks } from '@/lib/db/schema';
import { sql, eq, and, or, isNull, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get 3 random cards from the database
    const randomCards = await db
      .select({
        id: cards.id,
        slug: cards.slug,
        name: cards.name,
        arcanaType: cards.arcanaType,
        suit: cards.suit,
        imageUrl: cards.imageUrl,
        keywords: cards.keywords,
        journalingPrompts: cards.journalingPrompts,
      })
      .from(cards)
      .orderBy(sql`RANDOM()`)
      .limit(3);

    if (randomCards.length === 0) {
      return NextResponse.json(
        { error: 'No cards found' },
        { status: 404 }
      );
    }

    // Get primary talk for each card
    const cardsWithTalks = await Promise.all(
      randomCards.map(async (card) => {
        const [primaryMapping] = await db
          .select({
            talk: {
              id: talks.id,
              slug: talks.slug,
              title: talks.title,
              speakerName: talks.speakerName,
              thumbnailUrl: talks.thumbnailUrl,
              durationSeconds: talks.durationSeconds,
            },
          })
          .from(cardTalkMappings)
          .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
          .where(
            and(
              eq(cardTalkMappings.cardId, card.id),
              eq(cardTalkMappings.isPrimary, true),
              or(eq(talks.isDeleted, false), isNull(talks.isDeleted))
            )
          )
          .limit(1);

        // If no primary, get any mapping
        if (!primaryMapping) {
          const [anyMapping] = await db
            .select({
              talk: {
                id: talks.id,
                slug: talks.slug,
                title: talks.title,
                speakerName: talks.speakerName,
                thumbnailUrl: talks.thumbnailUrl,
                durationSeconds: talks.durationSeconds,
              },
            })
            .from(cardTalkMappings)
            .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
            .where(
              and(
                eq(cardTalkMappings.cardId, card.id),
                or(eq(talks.isDeleted, false), isNull(talks.isDeleted))
              )
            )
            .orderBy(desc(cardTalkMappings.strength))
            .limit(1);

          return {
            ...card,
            primaryTalk: anyMapping?.talk || null,
          };
        }

        return {
          ...card,
          primaryTalk: primaryMapping.talk,
        };
      })
    );

    return NextResponse.json({ cards: cardsWithTalks }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching ritual cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ritual cards' },
      { status: 500 }
    );
  }
}
