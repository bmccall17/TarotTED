/**
 * Script to download high-resolution Rider-Waite-Smith tarot card images
 * from dungeon.church and update the database
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

interface CardImageMapping {
  cardSlug: string;
  imageUrl: string;
  filename: string;
}

// All 78 card image URLs
const allCardImages: CardImageMapping[] = [
  // Major Arcana (22 cards)
  { cardSlug: 'the-fool', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-0-42043244c79fc1b1.jpg', filename: 'the-fool.jpg' },
  { cardSlug: 'the-magician', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-1-6476367511504b5f.jpg', filename: 'the-magician.jpg' },
  { cardSlug: 'the-high-priestess', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-2-a6def1e2445cdf9f.jpg', filename: 'the-high-priestess.jpg' },
  { cardSlug: 'the-empress', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-3-85cd590a7e0e6ec7.jpg', filename: 'the-empress.jpg' },
  { cardSlug: 'the-emperor', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-4-7380b1904f48ffd0.jpg', filename: 'the-emperor.jpg' },
  { cardSlug: 'the-hierophant', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-5-98e0942b64b895b5.jpg', filename: 'the-hierophant.jpg' },
  { cardSlug: 'the-lovers', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-6-3baa3420cca38224.jpg', filename: 'the-lovers.jpg' },
  { cardSlug: 'the-chariot', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-7-6731bdd32ad34906.jpg', filename: 'the-chariot.jpg' },
  { cardSlug: 'strength', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-8-7cf26f5fbe905cd4.jpg', filename: 'strength.jpg' },
  { cardSlug: 'the-hermit', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-9-6f1f533055ff354a.jpg', filename: 'the-hermit.jpg' },
  { cardSlug: 'wheel-of-fortune', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-10-6600306b7ecf8a76.jpg', filename: 'wheel-of-fortune.jpg' },
  { cardSlug: 'justice', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-11-4fc0a82e38a5972a.jpg', filename: 'justice.jpg' },
  { cardSlug: 'the-hanged-man', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-12-3a8ccf98db7d04a8.jpg', filename: 'the-hanged-man.jpg' },
  { cardSlug: 'death', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-13-23b8be15633f8945.jpg', filename: 'death.jpg' },
  { cardSlug: 'temperance', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-14-0aed89c9e8b7108d.jpg', filename: 'temperance.jpg' },
  { cardSlug: 'the-devil', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-15-b311203f411df750.jpg', filename: 'the-devil.jpg' },
  { cardSlug: 'the-tower', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-16-826d59a7b1468820.jpg', filename: 'the-tower.jpg' },
  { cardSlug: 'the-star', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-17-5fb78a5f37a972db.jpg', filename: 'the-star.jpg' },
  { cardSlug: 'the-moon', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-18-2364d8ac56751bf1.jpg', filename: 'the-moon.jpg' },
  { cardSlug: 'the-sun', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-19-d40d8ea7f0c0c263.jpg', filename: 'the-sun.jpg' },
  { cardSlug: 'judgement', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-20-db753a49ab7633ea.jpg', filename: 'judgement.jpg' },
  { cardSlug: 'the-world', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-major-21-734e52338d055159.jpg', filename: 'the-world.jpg' },

  // Wands (14 cards)
  { cardSlug: 'ace-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-1-e65bc5ba30713d17.jpg', filename: 'ace-of-wands.jpg' },
  { cardSlug: 'two-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-2-c53d8db32b75d99f.jpg', filename: 'two-of-wands.jpg' },
  { cardSlug: 'three-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-3-263680b54479fb61.jpg', filename: 'three-of-wands.jpg' },
  { cardSlug: 'four-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-4-7b6f3c47d0bd91a4.jpg', filename: 'four-of-wands.jpg' },
  { cardSlug: 'five-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-5-be3e44530c03e68e.jpg', filename: 'five-of-wands.jpg' },
  { cardSlug: 'six-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-6-6f0f6951c033eadd.jpg', filename: 'six-of-wands.jpg' },
  { cardSlug: 'seven-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-7-e6e2507530b17dd9.jpg', filename: 'seven-of-wands.jpg' },
  { cardSlug: 'eight-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-8-2705aa8da47e46bc.jpg', filename: 'eight-of-wands.jpg' },
  { cardSlug: 'nine-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-9-e6658378c0b1a109.jpg', filename: 'nine-of-wands.jpg' },
  { cardSlug: 'ten-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-10-c8127457564eb842.jpg', filename: 'ten-of-wands.jpg' },
  { cardSlug: 'page-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-page-f46491339b2fd87f.jpg', filename: 'page-of-wands.jpg' },
  { cardSlug: 'knight-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-knight-90a605be684f6379.jpg', filename: 'knight-of-wands.jpg' },
  { cardSlug: 'queen-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-queen-08b3b5bd681695d5.jpg', filename: 'queen-of-wands.jpg' },
  { cardSlug: 'king-of-wands', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-wands-king-177d091d45642b29.jpg', filename: 'king-of-wands.jpg' },

  // Cups (14 cards)
  { cardSlug: 'ace-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-1-d8e46960f2d01cef.jpg', filename: 'ace-of-cups.jpg' },
  { cardSlug: 'two-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-2-5c16b1eee7be3a85.jpg', filename: 'two-of-cups.jpg' },
  { cardSlug: 'three-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-3-b45bfaf88420f08d.jpg', filename: 'three-of-cups.jpg' },
  { cardSlug: 'four-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-4-0b3423ddf359d29a.jpg', filename: 'four-of-cups.jpg' },
  { cardSlug: 'five-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-5-d63660523a5bcc14.jpg', filename: 'five-of-cups.jpg' },
  { cardSlug: 'six-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-6-35074e29b815389e.jpg', filename: 'six-of-cups.jpg' },
  { cardSlug: 'seven-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-7-cd1a33ccd50675a0.jpg', filename: 'seven-of-cups.jpg' },
  { cardSlug: 'eight-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-8-7ffb70edf13aea94.jpg', filename: 'eight-of-cups.jpg' },
  { cardSlug: 'nine-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-9-13550c8d73cf9316.jpg', filename: 'nine-of-cups.jpg' },
  { cardSlug: 'ten-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-10-916a3c6dc2dc65a5.jpg', filename: 'ten-of-cups.jpg' },
  { cardSlug: 'page-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-page-4bb3c5ed72a7237b.jpg', filename: 'page-of-cups.jpg' },
  { cardSlug: 'knight-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-knight-d07f26d2681a7e25.jpg', filename: 'knight-of-cups.jpg' },
  { cardSlug: 'queen-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-queen-5ae87d65330a6302.jpg', filename: 'queen-of-cups.jpg' },
  { cardSlug: 'king-of-cups', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-cups-king-360de400f73f60c9.jpg', filename: 'king-of-cups.jpg' },

  // Swords (14 cards)
  { cardSlug: 'ace-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-1-3bebb8eeba6e380e.jpg', filename: 'ace-of-swords.jpg' },
  { cardSlug: 'two-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-2-baada4175898facc.jpg', filename: 'two-of-swords.jpg' },
  { cardSlug: 'three-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-3-7769531aa9f1c61e.jpg', filename: 'three-of-swords.jpg' },
  { cardSlug: 'four-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-4-25d9de390a29de87.jpg', filename: 'four-of-swords.jpg' },
  { cardSlug: 'five-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-5-cd19407493650ef3.jpg', filename: 'five-of-swords.jpg' },
  { cardSlug: 'six-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-6-9b49b2d0df8fd94c.jpg', filename: 'six-of-swords.jpg' },
  { cardSlug: 'seven-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-7-0012ca665760cc00.jpg', filename: 'seven-of-swords.jpg' },
  { cardSlug: 'eight-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-8-66463d63544d0b04.jpg', filename: 'eight-of-swords.jpg' },
  { cardSlug: 'nine-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-9-b4641fcbe203aaac.jpg', filename: 'nine-of-swords.jpg' },
  { cardSlug: 'ten-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-10-e3e1dcc9a0cd3831.jpg', filename: 'ten-of-swords.jpg' },
  { cardSlug: 'page-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-page-3969579bdf9f3487.jpg', filename: 'page-of-swords.jpg' },
  { cardSlug: 'knight-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-knight-1834928f1e0a2c37.jpg', filename: 'knight-of-swords.jpg' },
  { cardSlug: 'queen-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-queen-094d119544105d0e.jpg', filename: 'queen-of-swords.jpg' },
  { cardSlug: 'king-of-swords', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-swords-king-4730912676aa261e.jpg', filename: 'king-of-swords.jpg' },

  // Pentacles (14 cards)
  { cardSlug: 'ace-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-1-c9717ee444f022c8.jpg', filename: 'ace-of-pentacles.jpg' },
  { cardSlug: 'two-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-2-fecc845d1b47cae3.jpg', filename: 'two-of-pentacles.jpg' },
  { cardSlug: 'three-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-3-564b52d68b30af6f.jpg', filename: 'three-of-pentacles.jpg' },
  { cardSlug: 'four-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-4-4539fa68ac06a0ee.jpg', filename: 'four-of-pentacles.jpg' },
  { cardSlug: 'five-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-5-d71b72fea7ad7ef1.jpg', filename: 'five-of-pentacles.jpg' },
  { cardSlug: 'six-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-6-c9deebe03464bc89.jpg', filename: 'six-of-pentacles.jpg' },
  { cardSlug: 'seven-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-7-7d6a771308e7653c.jpg', filename: 'seven-of-pentacles.jpg' },
  { cardSlug: 'eight-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-8-b9042623182f11ee.jpg', filename: 'eight-of-pentacles.jpg' },
  { cardSlug: 'nine-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-9-9f7887ee1d7a3d5a.jpg', filename: 'nine-of-pentacles.jpg' },
  { cardSlug: 'ten-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-10-3edd405c64ee5ac6.jpg', filename: 'ten-of-pentacles.jpg' },
  { cardSlug: 'page-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-page-2bc9a735017ce3a1.jpg', filename: 'page-of-pentacles.jpg' },
  { cardSlug: 'knight-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-knight-c4402bd564aa8470.jpg', filename: 'knight-of-pentacles.jpg' },
  { cardSlug: 'queen-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-queen-1efbbba3b2e5785a.jpg', filename: 'queen-of-pentacles.jpg' },
  { cardSlug: 'king-of-pentacles', imageUrl: 'https://www.dungeon.church/content/images/2025/03/tarot-pentacles-king-6ca7fff779642736.jpg', filename: 'king-of-pentacles.jpg' },
];

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  ✗ Failed to download: ${response.status}`);
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.log(`  ✗ Error: ${error}`);
    return false;
  }
}

async function updateCardImages() {
  console.log('🖼️  Downloading high-resolution card images...\n');
  console.log(`Total cards to process: ${allCardImages.length}\n`);

  const imageDir = path.join(process.cwd(), 'public', 'images', 'cards');

  // Ensure directory exists
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  let downloaded = 0;
  let updated = 0;
  let skipped = 0;

  for (const mapping of allCardImages) {
    console.log(`📥 ${mapping.cardSlug}`);

    const filepath = path.join(imageDir, mapping.filename);

    // Download image
    const success = await downloadImage(mapping.imageUrl, filepath);

    if (success) {
      downloaded++;

      // Update database
      const newImageUrl = `/images/cards/${mapping.filename}`;
      await db
        .update(cards)
        .set({ imageUrl: newImageUrl })
        .where(eq(cards.slug, mapping.cardSlug));

      updated++;
      console.log(`  ✅ Downloaded and updated database`);
    } else {
      skipped++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Complete!`);
  console.log(`   Downloaded: ${downloaded} images`);
  console.log(`   Updated DB: ${updated} cards`);
  console.log(`   Skipped: ${skipped}`);
  console.log('='.repeat(50));

  process.exit(0);
}

updateCardImages().catch(console.error);
