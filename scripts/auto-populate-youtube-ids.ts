/**
 * Automatically find and populate YouTube video IDs for talks with TED.com URLs
 * Uses YouTube Search API to find matching videos
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { isNull, eq } from 'drizzle-orm';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY not found');
  process.exit(1);
}

// Search YouTube for a talk
async function searchYouTube(speakerName: string, title: string): Promise<string | null> {
  // Clean up the search query
  const query = `${speakerName} ${title}`;
  const encodedQuery = encodeURIComponent(query);

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Filter for TED/TEDx channels and find best match
    for (const item of data.items) {
      const channelTitle = item.snippet.channelTitle.toLowerCase();
      const videoTitle = item.snippet.title.toLowerCase();
      const searchTitle = title.toLowerCase();

      // Check if it's from an official TED channel
      const isTEDChannel =
        channelTitle.includes('ted') ||
        channelTitle.includes('tedx');

      // Check if titles match reasonably well
      const titleWords = searchTitle.split(' ').filter(w => w.length > 3);
      const matchCount = titleWords.filter(word => videoTitle.includes(word)).length;
      const matchRatio = matchCount / titleWords.length;

      if (isTEDChannel && matchRatio > 0.5) {
        return item.id.videoId;
      }
    }

    // If no perfect match, return first result from TED channel
    for (const item of data.items) {
      const channelTitle = item.snippet.channelTitle.toLowerCase();
      if (channelTitle.includes('ted')) {
        console.log(`   ⚠️  Using best guess (${item.snippet.channelTitle}): ${item.snippet.title}`);
        return item.id.videoId;
      }
    }

    return null;
  } catch (error) {
    console.error(`  Error searching for video:`, error);
    return null;
  }
}

async function autoPopulateYouTubeIds() {
  console.log('🔍 Finding YouTube video IDs for TED.com talks...\n');

  // Get all talks without YouTube video IDs
  const talksWithoutIds = await db
    .select()
    .from(talks)
    .where(isNull(talks.youtubeVideoId));

  console.log(`Found ${talksWithoutIds.length} talks without YouTube video IDs\n`);

  let found = 0;
  let notFound = 0;
  let errors = 0;

  for (const talk of talksWithoutIds) {
    console.log(`\n📹 Searching: ${talk.title}`);
    console.log(`   Speaker: ${talk.speakerName}`);

    try {
      const videoId = await searchYouTube(talk.speakerName, talk.title);

      if (videoId) {
        // Update the talk with the video ID
        await db
          .update(talks)
          .set({
            youtubeVideoId: videoId,
            updatedAt: new Date(),
          })
          .where(eq(talks.id, talk.id));

        console.log(`   ✅ Found: ${videoId}`);
        console.log(`   URL: https://www.youtube.com/watch?v=${videoId}`);
        found++;
      } else {
        console.log(`   ❌ Not found`);
        notFound++;
      }

      // Rate limiting: wait 200ms between searches to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`   ❌ Error:`, error);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✨ YouTube ID search completed!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Found: ${found} video IDs`);
  console.log(`❌ Not found: ${notFound} videos`);
  console.log(`⚠️  Errors: ${errors} videos`);
  console.log('═══════════════════════════════════════\n');

  if (found > 0) {
    console.log('💡 Next step: Run the metadata fetch script to populate duration/year/thumbnail:');
    console.log('   npx dotenv-cli -e .env.local -- npx tsx scripts/fetch-youtube-metadata.ts\n');
  }

  process.exit(0);
}

autoPopulateYouTubeIds().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
