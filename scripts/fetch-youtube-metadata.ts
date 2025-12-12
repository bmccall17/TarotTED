/**
 * Fetch metadata from YouTube API for all talks with YouTube URLs
 * Updates: duration, year, thumbnailUrl
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq, isNotNull, sql } from 'drizzle-orm';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY not found');
  console.error('Please add YOUTUBE_API_KEY to your .env.local file');
  console.error('See docs/YOUTUBE-API-SETUP.md for instructions');
  process.exit(1);
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Parse ISO 8601 duration (PT1H23M45S) to seconds
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

// Fetch metadata from YouTube API
async function fetchYouTubeMetadata(videoId: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = data.items[0];
    const publishedDate = new Date(video.snippet.publishedAt);

    return {
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      durationSeconds: parseDuration(video.contentDetails.duration),
      year: publishedDate.getFullYear(),
      thumbnailUrl: video.snippet.thumbnails.maxresdefault?.url ||
                     video.snippet.thumbnails.high?.url ||
                     `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error(`  Error fetching video ${videoId}:`, error);
    return null;
  }
}

async function updateAllTalksMetadata() {
  console.log('🎬 Fetching YouTube metadata for all talks...\n');

  // Get all talks
  const allTalks = await db.select().from(talks);
  console.log(`Found ${allTalks.length} total talks\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const talk of allTalks) {
    // Use youtubeVideoId if available, otherwise try to extract from tedUrl
    let videoId = talk.youtubeVideoId;
    if (!videoId) {
      videoId = extractVideoId(talk.tedUrl);
    }

    if (!videoId) {
      console.log(`⏭️  Skipped: ${talk.title} (no YouTube video ID)`);
      skipped++;
      continue;
    }

    console.log(`📹 Processing: ${talk.title}`);
    console.log(`   Video ID: ${videoId}`);

    const metadata = await fetchYouTubeMetadata(videoId);

    if (!metadata) {
      console.log(`   ❌ Failed to fetch metadata\n`);
      errors++;
      continue;
    }

    // Update the talk
    try {
      // Only update thumbnail if it's missing or it's already a YouTube thumbnail
      // Preserve TED.com thumbnails (pi.tedcdn.com, pe.tedcdn.com)
      const shouldUpdateThumbnail = !talk.thumbnailUrl ||
        talk.thumbnailUrl.includes('youtube.com') ||
        talk.thumbnailUrl.includes('ytimg.com');

      const updateData: any = {
        durationSeconds: metadata.durationSeconds,
        year: metadata.year,
        updatedAt: new Date(),
      };

      // Only include thumbnail if we should update it
      if (shouldUpdateThumbnail) {
        updateData.thumbnailUrl = metadata.thumbnailUrl;
      }

      await db
        .update(talks)
        .set(updateData)
        .where(eq(talks.id, talk.id));

      console.log(`   ✅ Updated:`);
      console.log(`      Duration: ${Math.floor(metadata.durationSeconds / 60)} min ${metadata.durationSeconds % 60} sec`);
      console.log(`      Year: ${metadata.year}`);
      if (shouldUpdateThumbnail) {
        console.log(`      Thumbnail: ${metadata.thumbnailUrl.substring(0, 60)}... (YouTube)`);
      } else {
        console.log(`      Thumbnail: Preserved TED.com thumbnail`);
      }
      console.log('');

      updated++;
    } catch (error) {
      console.error(`   ❌ Database error:`, error);
      errors++;
    }

    // Rate limiting: wait 100ms between requests to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✨ Metadata fetch completed!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Updated: ${updated} talks`);
  console.log(`⏭️  Skipped: ${skipped} talks (non-YouTube URLs)`);
  console.log(`❌ Errors: ${errors} talks`);
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
}

updateAllTalksMetadata().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
