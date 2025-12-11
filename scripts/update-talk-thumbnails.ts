import * as fs from 'fs';
import * as path from 'path';
import { talksSeedData } from '../lib/db/seed-data/talks';

/**
 * Extract YouTube video ID from various YouTube URL formats
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
 * Get YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Extract TED talk ID from TED.com URL
 */
function getTedTalkId(url: string): string | null {
  const match = url.match(/ted\.com\/talks\/([^?#]+)/);
  return match ? match[1] : null;
}

/**
 * Get TED thumbnail URL from talk ID
 */
function getTedThumbnail(talkId: string): string {
  return `https://embed-ssl.ted.com/talks/${talkId}.jpg`;
}

/**
 * Get thumbnail URL for a talk
 */
function getThumbnailUrl(tedUrl: string): string | null {
  // Check if it's a YouTube URL
  const youtubeId = getYouTubeVideoId(tedUrl);
  if (youtubeId) {
    return getYouTubeThumbnail(youtubeId);
  }

  // Check if it's a TED URL
  if (tedUrl.includes('ted.com/talks/')) {
    const tedId = getTedTalkId(tedUrl);
    if (tedId) {
      return getTedThumbnail(tedId);
    }
  }

  return null;
}

/**
 * Generate the TypeScript code for talks seed data
 */
function generateTalksCode(): string {
  const imports = `import { generateSlug } from './helpers';

// Unique TED talks extracted from CSV files
// Note: Some talks appear multiple times across different cards
export const talksSeedData = [`;

  const talksCode = talksSeedData.map((talk) => {
    const thumbnailUrl = getThumbnailUrl(talk.tedUrl);

    return `  {
    slug: generateSlug('${talk.speakerName.replace(/'/g, "\\'")} ${talk.title.replace(/'/g, "\\'")}'),
    title: '${talk.title.replace(/'/g, "\\'")}',
    speakerName: '${talk.speakerName.replace(/'/g, "\\'")}',
    tedUrl: '${talk.tedUrl}',
    description: ${talk.description ? `'${talk.description.replace(/'/g, "\\'")}'` : 'null'},
    durationSeconds: ${talk.durationSeconds || 'null'},
    eventName: ${talk.eventName ? `'${talk.eventName}'` : 'null'},
    year: ${talk.year || 'null'},
    thumbnailUrl: ${thumbnailUrl ? `'${thumbnailUrl}'` : 'null'},
    language: '${talk.language}',
  }`;
  }).join(',\n');

  return `${imports}\n${talksCode}\n];\n`;
}

// Main execution
console.log('🖼️  Updating talks.ts with thumbnail URLs...\n');

const outputPath = path.join(__dirname, '../lib/db/seed-data/talks.ts');
const code = generateTalksCode();

fs.writeFileSync(outputPath, code, 'utf-8');

console.log('✅ Successfully updated talks.ts with thumbnails!');
console.log(`📝 File: ${outputPath}`);
console.log('\n💡 Next step: Run npm run db:seed to update the database\n');
