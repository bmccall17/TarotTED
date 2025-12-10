import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function verify() {
  const result = await db.select().from(cards).where(eq(cards.name, 'Ace of Cups'));
  console.log('Ace of Cups:');
  console.log('  Has upright_meaning:', !!result[0]?.upright_meaning);
  console.log('  Has astrological:', !!result[0]?.astrological_correspondence);
  if (result[0]?.astrological_correspondence) {
    console.log('  Astrological value:', result[0].astrological_correspondence);
  }
  process.exit(0);
}

verify();
