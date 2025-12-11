import * as fs from 'fs';
import * as path from 'path';
import { talksSeedData } from '../lib/db/seed-data/talks';

/**
 * Get YouTube video ID
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
    /youtube\.com\/embed\/([^&\?\/]+)/,
    /youtube\.com\/v\/([^&\?\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Get TED oEmbed data (includes thumbnail)
 */
async function getTedOEmbedData(tedUrl: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.ted.com/services/v1/oembed.json?url=${encodeURIComponent(tedUrl)}`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate updated talks code
 */
async function updateTalksWithThumbnails() {
  console.log('🖼️  Fetching proper thumbnails from TED...\n');

  const updatedTalks = [];
  let successCount = 0;
  let failCount = 0;

  for (const talk of talksSeedData) {
    let thumbnailUrl = talk.thumbnailUrl;

    // If it's YouTube, keep the existing URL (those work)
    const youtubeId = getYouTubeVideoId(talk.tedUrl);
    if (youtubeId) {
      thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      console.log(`✓ YouTube: ${talk.speakerName} - ${talk.title}`);
      successCount++;
    }
    // If it's TED, fetch from oEmbed API
    else if (talk.tedUrl.includes('ted.com/talks/')) {
      console.log(`⏳ Fetching: ${talk.speakerName} - ${talk.title}`);
      const oembedThumb = await getTedOEmbedData(talk.tedUrl);

      if (oembedThumb) {
        thumbnailUrl = oembedThumb;
        console.log(`  ✓ Found: ${oembedThumb.substring(0, 60)}...`);
        successCount++;
      } else {
        console.log(`  ⚠ Failed to fetch thumbnail`);
        failCount++;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    updatedTalks.push({
      ...talk,
      thumbnailUrl,
    });
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Success: ${successCount}/${talksSeedData.length}`);
  console.log(`⚠️  Failed: ${failCount}/${talksSeedData.length}`);
  console.log('═══════════════════════════════════════\n');

  return updatedTalks;
}

/**
 * Write updated talks to file
 */
async function writeTalksFile(talks: any[]) {
  const imports = `import { generateSlug } from './helpers';

// Unique TED talks extracted from CSV files
// Note: Some talks appear multiple times across different cards
export const talksSeedData = [`;

  const talksCode = talks.map((talk) => {
    return `  {
    slug: generateSlug('${talk.speakerName.replace(/'/g, "\\'")} ${talk.title.replace(/'/g, "\\'")}'),
    title: '${talk.title.replace(/'/g, "\\'")}',
    speakerName: '${talk.speakerName.replace(/'/g, "\\'")}',
    tedUrl: '${talk.tedUrl}',
    description: ${talk.description ? `'${talk.description.replace(/'/g, "\\'")}'` : 'null'},
    durationSeconds: ${talk.durationSeconds || 'null'},
    eventName: ${talk.eventName ? `'${talk.eventName}'` : 'null'},
    year: ${talk.year || 'null'},
    thumbnailUrl: ${talk.thumbnailUrl ? `'${talk.thumbnailUrl}'` : 'null'},
    language: '${talk.language}',
  }`;
  }).join(',\n');

  const code = `${imports}\n${talksCode}\n];\n`;
  const outputPath = path.join(__dirname, '../lib/db/seed-data/talks.ts');

  fs.writeFileSync(outputPath, code, 'utf-8');
  console.log('✅ Updated talks.ts');
}

// Main execution
async function main() {
  const talks = await updateTalksWithThumbnails();
  await writeTalksFile(talks);
  console.log('\n💡 Next step: Run npm run db:seed to update the database\n');
}

if (require.main === module) {
  main().catch(console.error);
}
