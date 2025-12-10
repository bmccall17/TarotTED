import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { generateSlug } from '../lib/db/seed-data/helpers';

interface CardMeaningCSV {
  Card: string;
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism: string;
  adviceWhenDrawn: string;
  journalingPrompts: string; // JSON array string
  astrologicalCorrespondence: string;
  numerologicalSignificance: string;
}

// Remove citations in brackets like [1, 2, 3] or [6]
function removeCitations(text: string): string {
  return text.replace(/\s*\[[\d,\s]+\]/g, '').trim();
}

function parseCSV(filePath: string): CardMeaningCSV[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    escape: '"',
    quote: '"',
  });

  return records.map((record: any) => ({
    Card: record.Card,
    uprightMeaning: removeCitations(record.uprightMeaning || ''),
    reversedMeaning: removeCitations(record.reversedMeaning || ''),
    symbolism: removeCitations(record.symbolism || ''),
    adviceWhenDrawn: removeCitations(record.adviceWhenDrawn || ''),
    journalingPrompts: record.journalingPrompts || '[]',
    astrologicalCorrespondence: removeCitations(record.astrologicalCorrespondence || ''),
    numerologicalSignificance: removeCitations(record.numerologicalSignificance || ''),
  }));
}

async function updateCardMeanings() {
  const csvPath = path.join(__dirname, '../docs/newFullCardMeaning_MajorArcana.csv');

  console.log('Parsing CSV file...');
  const cardMeanings = parseCSV(csvPath);
  console.log(`Found ${cardMeanings.length} cards in CSV`);

  let updated = 0;
  let notFound = 0;

  for (const meaning of cardMeanings) {
    const cardSlug = generateSlug(meaning.Card);

    try {
      const result = await db
        .update(cards)
        .set({
          uprightMeaning: meaning.uprightMeaning,
          reversedMeaning: meaning.reversedMeaning,
          symbolism: meaning.symbolism,
          adviceWhenDrawn: meaning.adviceWhenDrawn,
          journalingPrompts: meaning.journalingPrompts,
          astrologicalCorrespondence: meaning.astrologicalCorrespondence,
          numerologicalSignificance: meaning.numerologicalSignificance,
          updatedAt: new Date(),
        })
        .where(eq(cards.slug, cardSlug))
        .returning({ id: cards.id });

      if (result.length > 0) {
        console.log(`✓ Updated: ${meaning.Card}`);
        updated++;
      } else {
        console.log(`✗ Not found: ${meaning.Card} (slug: ${cardSlug})`);
        notFound++;
      }
    } catch (error) {
      console.error(`Error updating ${meaning.Card}:`, error);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updated} cards`);
  console.log(`Not found: ${notFound} cards`);

  process.exit(0);
}

updateCardMeanings().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
