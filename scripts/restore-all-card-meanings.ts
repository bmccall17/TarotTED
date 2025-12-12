/**
 * Restore all card meanings from JSONL files
 * This restores the full meanings that were lost during db:seed
 */

import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CardMeaning {
  slug: string;
  symbolism?: string;
  adviceWhenDrawn?: string;
  journalingPrompts?: string[];
  astrologicalCorrespondence?: string;
  numerologicalSignificance?: string;
}

async function restoreCardMeanings(jsonlPath: string, suitName: string) {
  console.log(`\n📖 Restoring ${suitName} meanings from ${jsonlPath}...`);

  const fileContent = readFileSync(jsonlPath, 'utf-8');
  const lines = fileContent.trim().split('\n');

  let updated = 0;
  let skipped = 0;

  for (const line of lines) {
    try {
      const cardData: CardMeaning = JSON.parse(line);

      // Find the card by slug
      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.slug, cardData.slug))
        .limit(1);

      if (!card) {
        console.log(`  ⏭️  Skipped: ${cardData.slug} (not found)`);
        skipped++;
        continue;
      }

      // Update with full meanings
      await db
        .update(cards)
        .set({
          symbolism: cardData.symbolism || null,
          adviceWhenDrawn: cardData.adviceWhenDrawn || null,
          journalingPrompts: cardData.journalingPrompts ? JSON.stringify(cardData.journalingPrompts) : null,
          astrologicalCorrespondence: cardData.astrologicalCorrespondence || null,
          numerologicalSignificance: cardData.numerologicalSignificance || null,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, card.id));

      console.log(`  ✅ ${card.name}`);
      updated++;
    } catch (error) {
      console.error(`  ❌ Error parsing line:`, error);
    }
  }

  console.log(`✓ ${suitName}: ${updated} updated, ${skipped} skipped`);
  return { updated, skipped };
}

async function restoreAllMeanings() {
  console.log('🔮 Restoring all card meanings...\n');

  const results = {
    majorArcana: { updated: 0, skipped: 0 },
    cups: { updated: 0, skipped: 0 },
    pentacles: { updated: 0, skipped: 0 },
    swords: { updated: 0, skipped: 0 },
    wands: { updated: 0, skipped: 0 },
  };

  // Restore Major Arcana
  results.majorArcana = await restoreCardMeanings(
    join(__dirname, '../docs/archive/fullmeaning_MajorArcana.jsonl'),
    'Major Arcana'
  );

  // Restore Cups
  results.cups = await restoreCardMeanings(
    join(__dirname, '../docs/fullmeaning_Cups.jsonl'),
    'Cups'
  );

  // Restore Pentacles
  results.pentacles = await restoreCardMeanings(
    join(__dirname, '../docs/fullmeaning_Pentacles.jsonl'),
    'Pentacles'
  );

  // Restore Swords
  results.swords = await restoreCardMeanings(
    join(__dirname, '../docs/fullmeaning_Swords.jsonl'),
    'Swords'
  );

  // Restore Wands
  results.wands = await restoreCardMeanings(
    join(__dirname, '../docs/fullmeaning_Wands.jsonl'),
    'Wands'
  );

  const totalUpdated = Object.values(results).reduce((sum, r) => sum + r.updated, 0);
  const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);

  console.log('\n═══════════════════════════════════════');
  console.log('✨ Card meanings restoration complete!');
  console.log('═══════════════════════════════════════');
  console.log(`Total updated: ${totalUpdated}`);
  console.log(`Total skipped: ${totalSkipped}`);
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
}

restoreAllMeanings().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
