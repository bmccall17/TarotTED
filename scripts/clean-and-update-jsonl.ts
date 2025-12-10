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

function cleanAndParseJSON(filePath: string): CardMeaningJSON[] {
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // Remove markdown code fences
  fileContent = fileContent.replace(/```jsonl\s*/g, '').replace(/```\s*/g, '');

  // Remove array brackets
  fileContent = fileContent.trim();
  fileContent = fileContent.replace(/^\[\s*/, '').replace(/\s*\]$/, '');

  // Use JSON5 or manual extraction approach
  // Since the objects are comma-separated, we'll parse each one individually
  // looking for the pattern: },{

  // First, let's try to wrap it as a valid JSON array
  const wrappedContent = '[' + fileContent + ']';

  try {
    // Try standard JSON.parse first
    const parsed = JSON.parse(wrappedContent);
    return parsed.map((item: any) => ({
      Card: item.Card,
      uprightMeaning: item.uprightMeaning,
      reversedMeaning: item.reversedMeaning,
      symbolism: item.symbolism,
      adviceWhenDrawn: item.adviceWhenDrawn,
      journalingPrompts: item.journalingPrompts,
      astrologicalCorrespondence: item.astrologicalCorrespondence,
      numerologicalSignificance: item.numerologicalSignificance,
    }));
  } catch (error) {
    console.error('Standard JSON parsing failed, trying alternative approach...');

    // Alternative: split by pattern and manually parse
    const cardObjects: CardMeaningJSON[] = [];
    const cardMatches = wrappedContent.matchAll(/"Card":"([^"]+)"/g);

    for (const match of cardMatches) {
      const cardName = match[1];
      const startIdx = match.index!;

      // Find the end of this card's object by finding the next "Card": or end of array
      let endIdx = wrappedContent.indexOf('{"Card":', startIdx + 1);
      if (endIdx === -1) {
        endIdx = wrappedContent.lastIndexOf('}') + 1;
      }

      const objectStr = wrappedContent.substring(startIdx - 1, endIdx).replace(/},\s*$/, '}');

      try {
        const parsed = JSON.parse(objectStr);
        cardObjects.push({
          Card: parsed.Card,
          uprightMeaning: parsed.uprightMeaning || '',
          reversedMeaning: parsed.reversedMeaning || '',
          symbolism: parsed.symbolism || '',
          adviceWhenDrawn: parsed.adviceWhenDrawn || '',
          journalingPrompts: parsed.journalingPrompts || [],
          astrologicalCorrespondence: parsed.astrologicalCorrespondence || '',
          numerologicalSignificance: parsed.numerologicalSignificance || '',
        });
      } catch (e) {
        console.error(`Failed to parse card: ${cardName}`, e);
      }
    }

    return cardObjects;
  }
}

async function updateCardMeanings() {
  const jsonlPath = path.join(__dirname, '../docs/fullmeaning_MajorArcana.jsonl');

  console.log('Parsing and cleaning JSON file...');
  const cardMeanings = cleanAndParseJSON(jsonlPath);
  console.log(`Found ${cardMeanings.length} cards in file`);

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
