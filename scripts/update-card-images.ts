import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCardImageUrl } from '../lib/db/seed-data/helpers';

// All 78 cards with their naming info for image URL generation
const allCards = [
  // Major Arcana (22)
  { slug: 'the-fool', name: 'The Fool', suit: null, number: 0 },
  { slug: 'the-magician', name: 'The Magician', suit: null, number: 1 },
  { slug: 'the-high-priestess', name: 'The High Priestess', suit: null, number: 2 },
  { slug: 'the-empress', name: 'The Empress', suit: null, number: 3 },
  { slug: 'the-emperor', name: 'The Emperor', suit: null, number: 4 },
  { slug: 'the-hierophant', name: 'The Hierophant', suit: null, number: 5 },
  { slug: 'the-lovers', name: 'The Lovers', suit: null, number: 6 },
  { slug: 'the-chariot', name: 'The Chariot', suit: null, number: 7 },
  { slug: 'strength', name: 'Strength', suit: null, number: 8 },
  { slug: 'the-hermit', name: 'The Hermit', suit: null, number: 9 },
  { slug: 'wheel-of-fortune', name: 'Wheel of Fortune', suit: null, number: 10 },
  { slug: 'justice', name: 'Justice', suit: null, number: 11 },
  { slug: 'the-hanged-man', name: 'The Hanged Man', suit: null, number: 12 },
  { slug: 'death', name: 'Death', suit: null, number: 13 },
  { slug: 'temperance', name: 'Temperance', suit: null, number: 14 },
  { slug: 'the-devil', name: 'The Devil', suit: null, number: 15 },
  { slug: 'the-tower', name: 'The Tower', suit: null, number: 16 },
  { slug: 'the-star', name: 'The Star', suit: null, number: 17 },
  { slug: 'the-moon', name: 'The Moon', suit: null, number: 18 },
  { slug: 'the-sun', name: 'The Sun', suit: null, number: 19 },
  { slug: 'judgement', name: 'Judgement', suit: null, number: 20 },
  { slug: 'the-world', name: 'The World', suit: null, number: 21 },

  // Wands (14)
  ...Array.from({ length: 14 }, (_, i) => ({
    slug: '', // will be generated
    name: 'Wands',
    suit: 'wands' as const,
    number: i + 1
  })),

  // Cups (14)
  ...Array.from({ length: 14 }, (_, i) => ({
    slug: '',
    name: 'Cups',
    suit: 'cups' as const,
    number: i + 1
  })),

  // Swords (14)
  ...Array.from({ length: 14 }, (_, i) => ({
    slug: '',
    name: 'Swords',
    suit: 'swords' as const,
    number: i + 1
  })),

  // Pentacles (14)
  ...Array.from({ length: 14 }, (_, i) => ({
    slug: '',
    name: 'Pentacles',
    suit: 'pentacles' as const,
    number: i + 1
  })),
];

async function updateCardImages() {
  console.log('🖼️  Updating card images to high-res versions...\n');

  let updated = 0;
  let notFound = 0;

  for (const card of allCards) {
    const imageUrl = getCardImageUrl(card.name, card.suit, card.number);

    // Generate slug for minor arcana if needed
    const numberNames: Record<number, string> = {
      1: 'ace', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
      6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
      11: 'page', 12: 'knight', 13: 'queen', 14: 'king',
    };

    const slug = card.slug || (card.suit
      ? `${numberNames[card.number]}-of-${card.suit}`
      : card.slug);

    try {
      const result = await db
        .update(cards)
        .set({
          imageUrl: imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(cards.slug, slug))
        .returning({ id: cards.id, name: cards.name });

      if (result.length > 0) {
        console.log(`✓ ${result[0].name}: ${imageUrl}`);
        updated++;
      } else {
        console.log(`✗ Not found: ${slug}`);
        notFound++;
      }
    } catch (error) {
      console.error(`Error updating ${slug}:`, error);
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✨ Image update completed!');
  console.log('═══════════════════════════════════════');
  console.log(`Updated: ${updated} cards`);
  console.log(`Not found: ${notFound} cards`);
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
}

updateCardImages().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
