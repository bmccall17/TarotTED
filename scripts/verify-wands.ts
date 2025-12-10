import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function verify() {
  const result = await db.select().from(cards).where(eq(cards.name, 'Six of Wands'));
  console.log('Six of Wands verification:');
  console.log('\nUpright meaning (first 150 chars):', result[0].uprightMeaning?.substring(0, 150) + '...');
  console.log('\nAstrological correspondence:', result[0].astrologicalCorrespondence);
  console.log('\nJournaling prompts:', result[0].journalingPrompts);
  process.exit(0);
}

verify();
