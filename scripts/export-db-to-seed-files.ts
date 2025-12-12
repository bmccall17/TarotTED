/**
 * Export current database to seed files
 * This preserves all existing data (card meanings, YouTube metadata, etc.)
 * Run this BEFORE running db:seed to avoid data loss
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function exportTalksToSeedFile() {
  console.log('📤 Exporting talks from database to seed file...\n');

  // Get all talks from database
  const allTalks = await db.select().from(talks);
  console.log(`Found ${allTalks.length} talks in database\n`);

  // Generate the TypeScript file content
  let fileContent = `import { generateSlug } from './helpers';\n\n`;
  fileContent += `// Unique TED talks extracted from CSV files\n`;
  fileContent += `// Note: Some talks appear multiple times across different cards\n`;
  fileContent += `export const talksSeedData = [\n`;

  allTalks.forEach((talk, index) => {
    fileContent += `  {\n`;
    fileContent += `    slug: generateSlug('${talk.speakerName} ${talk.title}'),\n`;
    fileContent += `    title: '${talk.title.replace(/'/g, "\\'")}',\n`;
    fileContent += `    speakerName: '${talk.speakerName.replace(/'/g, "\\'")}',\n`;
    fileContent += `    tedUrl: '${talk.tedUrl}',\n`;

    if (talk.description) {
      fileContent += `    description: '${talk.description.replace(/'/g, "\\'")}',\n`;
    } else {
      fileContent += `    description: null,\n`;
    }

    fileContent += `    durationSeconds: ${talk.durationSeconds || 'null'},\n`;
    fileContent += `    eventName: ${talk.eventName ? `'${talk.eventName}'` : 'null'},\n`;
    fileContent += `    year: ${talk.year || 'null'},\n`;
    fileContent += `    thumbnailUrl: ${talk.thumbnailUrl ? `'${talk.thumbnailUrl}'` : 'null'},\n`;
    fileContent += `    language: '${talk.language || 'en'}',\n`;
    fileContent += `    youtubeVideoId: ${talk.youtubeVideoId ? `'${talk.youtubeVideoId}'` : 'null'},\n`;

    fileContent += `  }${index < allTalks.length - 1 ? ',' : ''}\n`;
  });

  fileContent += `];\n`;

  // Write to file
  const seedFilePath = join(__dirname, '../lib/db/seed-data/talks.ts');
  writeFileSync(seedFilePath, fileContent, 'utf-8');

  console.log('✅ Successfully exported talks to lib/db/seed-data/talks.ts');
  console.log(`   Total talks: ${allTalks.length}`);
  console.log(`   With YouTube video ID: ${allTalks.filter(t => t.youtubeVideoId).length}`);
  console.log(`   With duration: ${allTalks.filter(t => t.durationSeconds).length}`);
  console.log(`   With year: ${allTalks.filter(t => t.year).length}`);
  console.log(`   With thumbnails: ${allTalks.filter(t => t.thumbnailUrl).length}\n`);

  process.exit(0);
}

exportTalksToSeedFile().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
