import { db } from '../lib/db';
import { cards } from '../lib/db/schema';

async function listCardSlugs() {
  const allCards = await db
    .select({ slug: cards.slug })
    .from(cards)
    .orderBy(cards.sequenceIndex);

  console.log(allCards.map(c => c.slug).join(', '));
  process.exit(0);
}

listCardSlugs();
