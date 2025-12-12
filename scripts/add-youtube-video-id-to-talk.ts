/**
 * Add YouTube video ID to a specific talk
 * Usage: npx tsx scripts/add-youtube-video-id-to-talk.ts <talk-slug> <youtube-video-id>
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const [talkSlug, videoId] = process.argv.slice(2);

if (!talkSlug || !videoId) {
  console.error('❌ Usage: npx tsx scripts/add-youtube-video-id-to-talk.ts <talk-slug> <youtube-video-id>');
  console.error('');
  console.error('Example:');
  console.error('  npx tsx scripts/add-youtube-video-id-to-talk.ts brene-brown-the-power-of-vulnerability iCvmsMzlF7o');
  process.exit(1);
}

async function addVideoId() {
  try {
    // Find the talk
    const [talk] = await db
      .select()
      .from(talks)
      .where(eq(talks.slug, talkSlug))
      .limit(1);

    if (!talk) {
      console.error(`❌ Talk not found: ${talkSlug}`);
      process.exit(1);
    }

    console.log(`\n📝 Updating talk: ${talk.title}`);
    console.log(`   Current ted_url: ${talk.tedUrl}`);
    console.log(`   Adding youtube_video_id: ${videoId}\n`);

    // Update the talk
    await db
      .update(talks)
      .set({
        youtubeVideoId: videoId,
        updatedAt: new Date(),
      })
      .where(eq(talks.id, talk.id));

    console.log('✅ YouTube video ID added successfully!');
    console.log('\nYou can now run the metadata fetch script to populate duration/year/thumbnail:');
    console.log('  npx dotenv-cli -e .env.local -- npx tsx scripts/fetch-youtube-metadata.ts\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addVideoId();
