import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { cardsSeedData } from '../lib/db/seed-data/cards';

async function seedCardsOnly() {
  console.log('🗑️  Deleting existing cards...');
  await db.delete(cards);

  console.log('🌱 Seeding cards...');
  await db.insert(cards).values(cardsSeedData);

  console.log('✅ Successfully seeded cards table!');
  console.log(`   Total cards: ${cardsSeedData.length}`);

  process.exit(0);
}

seedCardsOnly().catch((error) => {
  console.error('❌ Error seeding cards:', error);
  process.exit(1);
});
