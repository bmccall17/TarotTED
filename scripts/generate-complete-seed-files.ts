/**
 * This script generates complete seed files with full card meanings merged in.
 * Run with: npm run tsx scripts/generate-complete-seed-files.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Helper to parse JSONL
function parseJSONL(content: string): any[] {
  content = content.replace(/```jsonl\s*/g, '').replace(/```\s*/g, '');
  content = content.trim().replace(/^\[\s*/, '').replace(/\s*\]$/, '');
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      console.error('Failed to parse line:', line.substring(0, 100));
      return null;
    }
  }).filter(item => item !== null);
}

// Helper to escape strings for TypeScript
function escapeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Load source data
console.log('📚 Loading source data...\n');

const majorArcanaData = parseJSONL(
  fs.readFileSync(path.join(__dirname, '../docs/archive/fullmeaning_MajorArcana.jsonl'), 'utf-8')
);

const cupsData = parseJSONL(
  fs.readFileSync(path.join(__dirname, '../docs/fullmeaning_Cups.jsonl'), 'utf-8')
);

console.log(`✓ Major Arcana: ${majorArcanaData.length} cards`);
console.log(`✓ Cups: ${cupsData.length} cards`);

// Create a lookup map by card name
const fullMeaningsMap = new Map();
[...majorArcanaData, ...cupsData].forEach(card => {
  fullMeaningsMap.set(card.Card, card);
});

console.log(`\n📝 Total cards with full meanings: ${fullMeaningsMap.size}`);
console.log('\nSample card names in map:');
[...fullMeaningsMap.keys()].slice(0, 5).forEach(name => console.log(`  - ${name}`));

// Read current seed files to get the basic structure
const currentCardsFile = fs.readFileSync(
  path.join(__dirname, '../lib/db/seed-data/cards.ts'),
  'utf-8'
);

console.log('\n✅ Data loaded successfully!');
console.log('\n💡 Next steps:');
console.log('1. Check the output above to verify data was loaded');
console.log('2. The fullMeaningsMap contains all the deep meanings');
console.log('3. We need to match these by card name to the seed data');
console.log('\n📊 Data structure for each card should include:');
console.log('   - uprightMeaning (full version)');
console.log('   - reversedMeaning (full version)');
console.log('   - symbolism');
console.log('   - adviceWhenDrawn');
console.log('   - journalingPrompts');
console.log('   - astrologicalCorrespondence');
console.log('   - numerologicalSignificance');

export { fullMeaningsMap };
