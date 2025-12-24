import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cards } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get a random card from the database
    const [randomCard] = await db
      .select()
      .from(cards)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (!randomCard) {
      return NextResponse.json(
        { error: 'No cards found' },
        { status: 404 }
      );
    }

    // No caching for random results
    return NextResponse.json({ slug: randomCard.slug }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching random card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random card' },
      { status: 500 }
    );
  }
}
