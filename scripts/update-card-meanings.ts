import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { generateSlug } from '../lib/db/seed-data/helpers';

interface CardMeaningJSON {
  Card: string;
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism: string;
  adviceWhenDrawn: string;
  journalingPrompts: string[];
  astrologicalCorrespondence: string;
  numerologicalSignificance: string;
}

function parseJSONL(filePath: string): CardMeaningJSON[] {
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // Remove markdown code fences
  fileContent = fileContent.replace(/```jsonl\s*/g, '').replace(/```\s*/g, '');

  // Remove array brackets if wrapped
  fileContent = fileContent.trim().replace(/^\[\s*/, '').replace(/\s*\]$/, '');

  // Parse each line
  const lines = fileContent.split('\n').filter(line => line.trim());
  return lines.map(line => {
    try {
      // Remove trailing comma if present
      const cleanLine = line.trim().replace(/,\s*$/, '');
      const parsed = JSON.parse(cleanLine);
      return {
        Card: parsed.Card,
        uprightMeaning: parsed.uprightMeaning || '',
        reversedMeaning: parsed.reversedMeaning || '',
        symbolism: parsed.symbolism || '',
        adviceWhenDrawn: parsed.adviceWhenDrawn || '',
        journalingPrompts: parsed.journalingPrompts || [],
        astrologicalCorrespondence: parsed.astrologicalCorrespondence || '',
        numerologicalSignificance: parsed.numerologicalSignificance || '',
      };
    } catch (e) {
      console.error(`Failed to parse: ${line.substring(0, 50)}...`);
      return null;
    }
  }).filter(item => item !== null) as CardMeaningJSON[];
}

async function updateCardMeanings() {
  const jsonlPath = path.join(__dirname, '../docs/archive/fullmeaning_MajorArcana.jsonl');

  console.log('Parsing Major Arcana JSONL file...');
  const cardMeanings = parseJSONL(jsonlPath);
  console.log(`Found ${cardMeanings.length} cards in JSONL`);

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
          journalingPrompts: JSON.stringify(meaning.journalingPrompts),
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
