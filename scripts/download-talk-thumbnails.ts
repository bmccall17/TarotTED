/**
 * Upload all talk thumbnails from external URLs to Supabase Storage
 * This updates the database to point to Supabase URLs instead of external URLs
 *
 * Run: npx dotenv -e .env.local -- tsx scripts/download-talk-thumbnails.ts
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq, isNotNull, and, sql } from 'drizzle-orm';
import { downloadTalkThumbnail } from '../lib/utils/download-image';
import { isSupabaseStorageUrl } from '../lib/supabase';

async function uploadAllThumbnails() {
  console.log('🖼️  Starting talk thumbnail upload to Supabase Storage...\n');

  // Get all talks that have external thumbnail URLs (excluding Supabase URLs)
  const talksWithThumbnails = await db
    .select({
      id: talks.id,
      title: talks.title,
      thumbnailUrl: talks.thumbnailUrl,
    })
    .from(talks)
    .where(
      and(
        isNotNull(talks.thumbnailUrl),
        sql`${talks.thumbnailUrl} != ''`,
        // Only process external URLs
        sql`(${talks.thumbnailUrl} LIKE 'http://%' OR ${talks.thumbnailUrl} LIKE 'https://%')`
      )
    );

  // Filter out already-migrated Supabase URLs
  const talksToMigrate = talksWithThumbnails.filter(
    (talk) => !isSupabaseStorageUrl(talk.thumbnailUrl)
  );

  console.log(`Found ${talksWithThumbnails.length} talks with external thumbnails`);
  console.log(`Skipping ${talksWithThumbnails.length - talksToMigrate.length} already in Supabase`);
  console.log(`Will migrate ${talksToMigrate.length} thumbnails\n`);

  if (talksToMigrate.length === 0) {
    console.log('✨ All thumbnails are already in Supabase Storage!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const talk of talksToMigrate) {
    console.log(`Processing: ${talk.title}`);
    console.log(`  External URL: ${talk.thumbnailUrl?.substring(0, 60)}...`);

    if (!talk.thumbnailUrl) continue;

    // Download from external URL and upload to Supabase
    const supabaseUrl = await downloadTalkThumbnail(talk.id, talk.thumbnailUrl);

    if (supabaseUrl) {
      // Update the database with the Supabase URL
      await db
        .update(talks)
        .set({ thumbnailUrl: supabaseUrl })
        .where(eq(talks.id, talk.id));

      console.log(`  ✅ Uploaded to: ${supabaseUrl.substring(0, 60)}...\n`);
      successCount++;
    } else {
      console.log(`  ❌ Failed to upload\n`);
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Successfully uploaded: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📦 Images stored in: Supabase Storage (talk-thumbnails bucket)`);
}

// Run the script
uploadAllThumbnails()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
