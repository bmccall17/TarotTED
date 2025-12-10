import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function verify() {
  const result = await db.select().from(cards).where(eq(cards.name, 'Ace of Cups'));
  console.log('Ace of Cups:');
  console.log('  Has uprightMeaning:', !!result[0]?.uprightMeaning);
  console.log('  Has astrologicalCorrespondence:', !!result[0]?.astrologicalCorrespondence);
  if (result[0]?.astrologicalCorrespondence) {
    console.log('  Astrological value:', result[0].astrologicalCorrespondence);
  }
  process.exit(0);
}

verify();
