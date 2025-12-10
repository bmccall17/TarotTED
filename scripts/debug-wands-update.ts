import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const getConnectionString = () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
  }
  return connectionString;
};

async function debugUpdate() {
  const client = postgres(getConnectionString(), { prepare: false });
  const db = drizzle(client);

  try {
    // First, find the card
    const found = await db.select().from(cards).where(eq(cards.name, 'Ace of Wands'));
    console.log('Found card:', found.length > 0);
    if (found.length > 0) {
      console.log('Card ID:', found[0].id);
      console.log('Card name:', found[0].name);
      console.log('Current uprightMeaning:', found[0].uprightMeaning?.substring(0, 50) || 'NULL');
    }

    // Try to update
    console.log('\nAttempting update...');
    const result = await db
      .update(cards)
      .set({
        uprightMeaning: 'TEST UPRIGHT MEANING',
        astrologicalCorrespondence: 'TEST ASTRO'
      })
      .where(eq(cards.name, 'Ace of Wands'))
      .returning();

    console.log('Update returned:', result.length, 'rows');
    if (result.length > 0) {
      console.log('Updated uprightMeaning:', result[0].uprightMeaning);
      console.log('Updated astrological:', result[0].astrologicalCorrespondence);
    }

    // Verify the update
    console.log('\nVerifying update...');
    const verified = await db.select().from(cards).where(eq(cards.name, 'Ace of Wands'));
    if (verified.length > 0) {
      console.log('Verified uprightMeaning:', verified[0].uprightMeaning?.substring(0, 50) || 'NULL');
      console.log('Verified astrological:', verified[0].astrologicalCorrespondence || 'NULL');
    }
  } finally {
    await client.end();
  }
}

debugUpdate();
