import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { talksSeedData } from '../lib/db/seed-data/talks';
import { eq } from 'drizzle-orm';

interface TalkToUpsert {
  slug: string;
  title: string;
  speakerName: string;
  tedUrl: string;
  description?: string | null;
  durationSeconds?: number | null;
  eventName?: string | null;
  year?: number | null;
  thumbnailUrl?: string | null;
  language?: string;
  youtubeVideoId?: string | null;
}

async function upsertTalks() {
  console.log('🎤 Starting talks upsert...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const talk of talksSeedData as TalkToUpsert[]) {
    try {
      // Check if talk already exists by slug
      const [existingTalk] = await db
        .select()
        .from(talks)
        .where(eq(talks.slug, talk.slug))
        .limit(1);

      if (existingTalk) {
        // Update existing talk with new metadata
        await db
          .update(talks)
          .set({
            title: talk.title,
            speakerName: talk.speakerName,
            tedUrl: talk.tedUrl,
            description: talk.description || null,
            durationSeconds: talk.durationSeconds || null,
            eventName: talk.eventName || null,
            year: talk.year || null,
            thumbnailUrl: talk.thumbnailUrl || null,
            language: talk.language || 'en',
            youtubeVideoId: talk.youtubeVideoId || null,
            updatedAt: new Date(),
          })
          .where(eq(talks.id, existingTalk.id));

        console.log(`  🔄 Updated: ${talk.speakerName} - ${talk.title}`);
        updated++;
      } else {
        // Create new talk
        await db.insert(talks).values({
          slug: talk.slug,
          title: talk.title,
          speakerName: talk.speakerName,
          tedUrl: talk.tedUrl,
          description: talk.description || null,
          durationSeconds: talk.durationSeconds || null,
          eventName: talk.eventName || null,
          year: talk.year || null,
          thumbnailUrl: talk.thumbnailUrl || null,
          language: talk.language || 'en',
          youtubeVideoId: talk.youtubeVideoId || null,
        });

        console.log(`  ✅ Created: ${talk.speakerName} - ${talk.title}`);
        created++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`  ❌ Error with ${talk.slug}: ${errorMsg}`);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total processed: ${talksSeedData.length}`);

  process.exit(0);
}

upsertTalks().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
