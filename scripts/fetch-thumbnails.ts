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
  // Use maxresdefault for highest quality, fallback to hqdefault if needed
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
  // TED uses a consistent pattern for thumbnails
  // Format: https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/[guid]/[talk-id]_[timestamp].jpg
  // However, this requires the specific GUID which we don't have
  // Instead, we'll use TED's embed thumbnail which is more predictable
  return `https://embed-ssl.ted.com/talks/${talkId}.jpg`;
}

/**
 * Process all talks and add thumbnail URLs
 */
export async function fetchThumbnails() {
  console.log('🖼️  Fetching thumbnails for talks...\n');

  const updatedTalks = talksSeedData.map((talk) => {
    let thumbnailUrl: string | null = null;

    // Check if it's a YouTube URL
    const youtubeId = getYouTubeVideoId(talk.tedUrl);
    if (youtubeId) {
      thumbnailUrl = getYouTubeThumbnail(youtubeId);
      console.log(`✓ YouTube: ${talk.speakerName} - ${talk.title}`);
      console.log(`  Video ID: ${youtubeId}`);
      console.log(`  Thumbnail: ${thumbnailUrl}\n`);
    }
    // Check if it's a TED URL
    else if (talk.tedUrl.includes('ted.com/talks/')) {
      const tedId = getTedTalkId(talk.tedUrl);
      if (tedId) {
        thumbnailUrl = getTedThumbnail(tedId);
        console.log(`✓ TED: ${talk.speakerName} - ${talk.title}`);
        console.log(`  Talk ID: ${tedId}`);
        console.log(`  Thumbnail: ${thumbnailUrl}\n`);
      }
    }

    if (!thumbnailUrl) {
      console.log(`⚠ Could not extract thumbnail for: ${talk.speakerName} - ${talk.title}`);
      console.log(`  URL: ${talk.tedUrl}\n`);
    }

    return {
      ...talk,
      thumbnailUrl,
    };
  });

  console.log('\n═══════════════════════════════════════');
  console.log('📊 Summary:');
  const withThumbnails = updatedTalks.filter((t) => t.thumbnailUrl).length;
  const total = updatedTalks.length;
  console.log(`Talks with thumbnails: ${withThumbnails}/${total}`);
  console.log('═══════════════════════════════════════\n');

  return updatedTalks;
}

// Run if called directly
if (require.main === module) {
  fetchThumbnails().then((talks) => {
    console.log('\n💡 Next steps:');
    console.log('1. Review the thumbnail URLs above');
    console.log('2. Update lib/db/seed-data/talks.ts with the thumbnailUrl field');
    console.log('3. Run npm run db:seed to update the database\n');
  });
}
