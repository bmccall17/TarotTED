/**
 * Import all card meanings from JSONL files (the original source)
 * Handles malformed JSON and markdown code fences
 */

import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

interface RawCardData {
  Card?: string;
  slug?: string;
  uprightMeaning?: string;
  reversedMeaning?: string;
  symbolism?: string;
  adviceWhenDrawn?: string;
  journalingPrompts?: string[];
  astrologicalCorrespondence?: string;
  numerologicalSignificance?: string;
}

function cleanJsonLine(line: string): string | null {
  const trimmed = line.trim();

  // Skip empty lines, markdown fences, brackets
  if (!trimmed ||
      trimmed.startsWith('```') ||
      trimmed === '[' ||
      trimmed === ']' ||
      trimmed === '{' ||
      trimmed === '}') {
    return null;
  }

  // Remove trailing commas (common JSON error)
  let cleaned = trimmed.replace(/,\s*$/, '');

  return cleaned;
}

function cardNameToSlug(cardName: string): string {
  return cardName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function importFromJsonl(jsonlPath: string, suitName: string) {
  console.log(`\n📖 Importing ${suitName} from ${jsonlPath}...`);

  const fileContent = readFileSync(jsonlPath, 'utf-8');

  // Extract JSON objects using regex (handles embedded newlines)
  // Match from { to } accounting for nested structures and escaped quotes
  const jsonObjects: string[] = [];
  let currentObject = '';
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < fileContent.length; i++) {
    const char = fileContent[i];

    if (escapeNext) {
      currentObject += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      currentObject += char;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
    }

    if (!inString) {
      if (char === '{') {
        if (braceCount === 0) currentObject = '';
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          currentObject += char;
          jsonObjects.push(currentObject.trim());
          currentObject = '';
          continue;
        }
      }
    }

    if (braceCount > 0) {
      currentObject += char;
    }
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < jsonObjects.length; i++) {
    const jsonStr = jsonObjects[i];
    if (!jsonStr || jsonStr.length < 10) continue;

    try {
      // Replace curly quotes with straight quotes and remove special Unicode spaces
      const cleanedJson = jsonStr
        .replace(/"/g, '"')  // Left curly quote
        .replace(/"/g, '"')  // Right curly quote
        .replace(/'/g, "'")  // Left curly single quote
        .replace(/'/g, "'")  // Right curly single quote
        .replace(/\u202F/g, ' ')  // Narrow no-break space
        .replace(/\u00A0/g, ' ')  // Non-breaking space
        .replace(/\u2009/g, ' ')  // Thin space
        .replace(/\u200B/g, '');  // Zero-width space

      const rawData: RawCardData = JSON.parse(cleanedJson);

      // Get card name and convert to slug
      const cardName = rawData.Card || rawData.slug;
      if (!cardName) {
        console.log(`  ⏭️  Line ${i + 1}: No card name found`);
        skipped++;
        continue;
      }

      const slug = cardNameToSlug(cardName);

      // Find the card in database
      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.slug, slug))
        .limit(1);

      if (!card) {
        console.log(`  ⏭️  ${cardName} (${slug}) - not found in database`);
        skipped++;
        continue;
      }

      // Update with full meanings
      await db
        .update(cards)
        .set({
          symbolism: rawData.symbolism || null,
          adviceWhenDrawn: rawData.adviceWhenDrawn || null,
          journalingPrompts: rawData.journalingPrompts
            ? JSON.stringify(rawData.journalingPrompts)
            : null,
          astrologicalCorrespondence: rawData.astrologicalCorrespondence || null,
          numerologicalSignificance: rawData.numerologicalSignificance || null,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, card.id));

      console.log(`  ✅ ${card.name}`);
      updated++;

    } catch (error) {
      // Try to extract card name from the line for better error reporting
      let cardHint = '';
      try {
        const match = jsonStr.match(/"Card"\s*:\s*"([^"]+)"/);
        if (match) cardHint = ` (${match[1]})`;
      } catch {}

      console.log(`  ❌ Line ${i + 1}${cardHint}: Parse error - ${error.message}`);
      errors++;
    }
  }

  console.log(`✓ ${suitName}: ${updated} updated, ${skipped} skipped, ${errors} errors`);
  return { updated, skipped, errors };
}

async function importAllCardMeanings() {
  console.log('🔮 Importing all card meanings from JSONL files...\n');

  const results = {
    majorArcana: { updated: 0, skipped: 0, errors: 0 },
    cups: { updated: 0, skipped: 0, errors: 0 },
    pentacles: { updated: 0, skipped: 0, errors: 0 },
    swords: { updated: 0, skipped: 0, errors: 0 },
    wands: { updated: 0, skipped: 0, errors: 0 },
  };

  // Import Major Arcana
  results.majorArcana = await importFromJsonl(
    join(__dirname, '../docs/archive/fullmeaning_MajorArcana.jsonl'),
    'Major Arcana'
  );

  // Import Minor Arcana
  results.cups = await importFromJsonl(
    join(__dirname, '../docs/fullmeaning_Cups.jsonl'),
    'Cups'
  );

  results.pentacles = await importFromJsonl(
    join(__dirname, '../docs/fullmeaning_Pentacles.jsonl'),
    'Pentacles'
  );

  results.swords = await importFromJsonl(
    join(__dirname, '../docs/fullmeaning_Swords.jsonl'),
    'Swords'
  );

  results.wands = await importFromJsonl(
    join(__dirname, '../docs/fullmeaning_Wands.jsonl'),
    'Wands'
  );

  const totalUpdated = Object.values(results).reduce((sum, r) => sum + r.updated, 0);
  const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.skipped, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);

  console.log('\n═══════════════════════════════════════');
  console.log('✨ Import completed!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Updated: ${totalUpdated} cards`);
  console.log(`⏭️  Skipped: ${totalSkipped} entries`);
  console.log(`❌ Errors: ${totalErrors} lines`);
  console.log('═══════════════════════════════════════\n');

  if (totalUpdated === 78) {
    console.log('🎉 Perfect! All 78 cards have full meanings restored!\n');
  } else if (totalUpdated > 0) {
    console.log(`⚠️  Only ${totalUpdated}/78 cards updated. Some cards may be missing data.\n`);
  } else {
    console.log('❌ No cards were updated. Check the JSONL files and error messages above.\n');
  }

  console.log('🎯 Next step: Export to seed files');
  console.log('   npx dotenv-cli -e .env.local -- npx tsx scripts/export-cards-to-seed-files.ts\n');

  process.exit(0);
}

importAllCardMeanings().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
