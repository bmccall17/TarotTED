/**
 * Add youtubeVideoId field and populate it from existing YouTube URLs
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

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

async function addYoutubeVideoIdField() {
  console.log('🔧 Adding youtubeVideoId column to talks table...\n');

  try {
    // Add the column
    await db.execute(sql`
      ALTER TABLE talks
      ADD COLUMN IF NOT EXISTS youtube_video_id VARCHAR(20)
    `);
    console.log('✅ Column added successfully\n');

    // Get all talks
    const allTalks = await db.select().from(talks);
    console.log(`Found ${allTalks.length} talks\n`);

    let updated = 0;
    let skipped = 0;

    for (const talk of allTalks) {
      const videoId = extractVideoId(talk.tedUrl);

      if (videoId) {
        await db
          .update(talks)
          .set({ youtubeVideoId: videoId, updatedAt: new Date() })
          .where(sql`id = ${talk.id}`);

        console.log(`✅ ${talk.title}`);
        console.log(`   Video ID: ${videoId}\n`);
        updated++;
      } else {
        console.log(`⏭️  ${talk.title} (no YouTube URL)`);
        skipped++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✨ Migration completed!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Updated: ${updated} talks with YouTube video IDs`);
    console.log(`⏭️  Skipped: ${skipped} talks (TED.com URLs)`);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addYoutubeVideoIdField();
