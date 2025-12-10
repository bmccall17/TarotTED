import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { like } from 'drizzle-orm';

async function check() {
  const results = await db.select({
    name: cards.name,
    upright: cards.uprightMeaning,
    astrological: cards.astrologicalCorrespondence
  }).from(cards).where(like(cards.name, '%Wands%'));

  console.log(`Found ${results.length} Wands cards`);
  for (const card of results) {
    console.log(`\n${card.name}:`);
    console.log(`  Upright: ${card.upright ? card.upright.substring(0, 100) + '...' : 'NULL'}`);
    console.log(`  Astro: ${card.astrological || 'NULL'}`);
  }
  process.exit(0);
}

check();
