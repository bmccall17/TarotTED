import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Fetch TED.com thumbnail from oEmbed API
 */
async function getTedThumbnail(tedUrl: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.ted.com/services/v1/oembed.json?url=${encodeURIComponent(tedUrl)}`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error(`  Error fetching thumbnail:`, error);
    return null;
  }
}

async function restoreTedThumbnails() {
  console.log('🖼️  Restoring TED.com thumbnails...\n');

  // Get all talks
  const allTalks = await db.select().from(talks);
  console.log(`Found ${allTalks.length} total talks\n`);

  let restored = 0;
  let skipped = 0;
  let errors = 0;

  for (const talk of allTalks) {
    // Only process TED.com URLs
    if (!talk.tedUrl.includes('ted.com/talks/')) {
      console.log(`⏭️  Skipped: ${talk.title} (not a TED.com URL)`);
      skipped++;
      continue;
    }

    // Skip if already has a TED.com thumbnail
    if (talk.thumbnailUrl && (talk.thumbnailUrl.includes('tedcdn.com') || talk.thumbnailUrl.includes('pe.tedcdn.com'))) {
      console.log(`✓ Already has TED thumbnail: ${talk.title}`);
      skipped++;
      continue;
    }

    console.log(`📸 Fetching: ${talk.title}`);

    const thumbnail = await getTedThumbnail(talk.tedUrl);

    if (thumbnail) {
      try {
        await db
          .update(talks)
          .set({
            thumbnailUrl: thumbnail,
            updatedAt: new Date(),
          })
          .where(eq(talks.id, talk.id));

        console.log(`   ✅ Restored: ${thumbnail.substring(0, 70)}...`);
        restored++;
      } catch (error) {
        console.error(`   ❌ Database error:`, error);
        errors++;
      }
    } else {
      console.log(`   ⚠️  Failed to fetch thumbnail`);
      errors++;
    }

    // Rate limiting: wait 150ms between requests
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✨ TED.com thumbnail restoration completed!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Restored: ${restored} thumbnails`);
  console.log(`⏭️  Skipped: ${skipped} talks`);
  console.log(`❌ Errors: ${errors} talks`);
  console.log('═══════════════════════════════════════\n');

  if (restored > 0) {
    console.log('💡 Next step: Export to seed files:');
    console.log('   npx dotenv-cli -e .env.local -- npx tsx scripts/export-db-to-seed-files.ts\n');
  }

  process.exit(0);
}

restoreTedThumbnails().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
