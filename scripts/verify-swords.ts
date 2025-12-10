import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { like } from 'drizzle-orm';

async function verify() {
  const results = await db.select().from(cards).where(like(cards.name, '%Swords%'));

  console.log(`Found ${results.length} Swords cards\n`);
  for (const card of results) {
    console.log(`${card.name}:`);
    console.log(`  Has uprightMeaning: ${!!card.uprightMeaning}`);
    console.log(`  Has astrologicalCorrespondence: ${!!card.astrologicalCorrespondence}`);
    if (card.astrologicalCorrespondence) {
      console.log(`  Astrological: ${card.astrologicalCorrespondence}`);
    }
  }
  process.exit(0);
}

verify();
