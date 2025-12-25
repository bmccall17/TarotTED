/**
 * Download all talk thumbnails from external URLs and save them locally
 * This updates the database to point to local images instead of external URLs
 */

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq, isNotNull, or, and, sql } from 'drizzle-orm';
import { downloadTalkThumbnail } from '../lib/utils/download-image';

async function downloadAllThumbnails() {
  console.log('🖼️  Starting talk thumbnail download...\n');

  // Get all talks that have external thumbnail URLs
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
        // Only download external URLs (not already local)
        or(
          sql`${talks.thumbnailUrl} LIKE 'http%'`,
          sql`${talks.thumbnailUrl} LIKE 'https://%'`
        )
      )
    );

  console.log(`Found ${talksWithThumbnails.length} talks with external thumbnails\n`);

  let successCount = 0;
  let failCount = 0;

  for (const talk of talksWithThumbnails) {
    console.log(`Processing: ${talk.title}`);
    console.log(`  External URL: ${talk.thumbnailUrl}`);

    if (!talk.thumbnailUrl) continue;

    // Download the image
    const localPath = await downloadTalkThumbnail(talk.id, talk.thumbnailUrl);

    if (localPath) {
      // Update the database with the local path
      await db
        .update(talks)
        .set({ thumbnailUrl: localPath })
        .where(eq(talks.id, talk.id));

      console.log(`  ✅ Updated to: ${localPath}\n`);
      successCount++;
    } else {
      console.log(`  ❌ Failed to download\n`);
      failCount++;
    }

    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Successfully downloaded: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  📁 Images saved to: public/images/talks/`);
}

// Run the script
downloadAllThumbnails()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
