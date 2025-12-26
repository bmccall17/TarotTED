/**
 * Migrate all card images to Supabase Storage
 *
 * This script:
 * 1. Reads all 78 card images from public/images/cards/
 * 2. Uploads them to the card-images bucket in Supabase Storage
 * 3. Updates the database cards.image_url with new Supabase URLs
 *
 * Run: npx dotenv -e .env.local -- tsx scripts/migrate-cards-to-supabase.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { db } from '../lib/db';
import { cards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  createServiceClient,
  getCardImagesBucket,
  getPublicStorageUrl,
  isSupabaseStorageUrl,
} from '../lib/supabase/server';

const LOCAL_CARDS_DIR = path.join(process.cwd(), 'public', 'images', 'cards');
const CARD_IMAGES_BUCKET = 'card-images';

interface MigrationResult {
  slug: string;
  name: string;
  status: 'success' | 'failed' | 'skipped';
  oldUrl: string;
  newUrl: string | null;
  error?: string;
}

async function migrateCardImages() {
  console.log('🃏 Starting card images migration to Supabase Storage...\n');

  // Get all cards from database
  const allCards = await db
    .select({
      id: cards.id,
      name: cards.name,
      slug: cards.slug,
      imageUrl: cards.imageUrl,
    })
    .from(cards);

  console.log(`Found ${allCards.length} cards in database\n`);

  const results: MigrationResult[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  const supabase = createServiceClient();

  for (const card of allCards) {
    // Skip if already in Supabase
    if (isSupabaseStorageUrl(card.imageUrl)) {
      console.log(`⏭️  Skipping (already in Supabase): ${card.name}`);
      results.push({
        slug: card.slug,
        name: card.name,
        status: 'skipped',
        oldUrl: card.imageUrl,
        newUrl: card.imageUrl,
      });
      skipCount++;
      continue;
    }

    console.log(`📦 Processing: ${card.name}`);

    // Determine local file path
    // Current format: /images/cards/the-fool.jpg
    const filename = `${card.slug}.jpg`;
    const localPath = path.join(LOCAL_CARDS_DIR, filename);

    try {
      // Check if local file exists
      await fs.access(localPath);

      // Read the file
      const buffer = await fs.readFile(localPath);
      console.log(`   Reading: ${localPath} (${Math.round(buffer.length / 1024)}KB)`);

      // Upload to Supabase
      const { error } = await supabase.storage
        .from(CARD_IMAGES_BUCKET)
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const newUrl = getPublicStorageUrl(filename, CARD_IMAGES_BUCKET);

      // Update database
      await db
        .update(cards)
        .set({ imageUrl: newUrl })
        .where(eq(cards.id, card.id));

      console.log(`   ✅ Uploaded: ${newUrl.substring(0, 60)}...\n`);
      results.push({
        slug: card.slug,
        name: card.name,
        status: 'success',
        oldUrl: card.imageUrl,
        newUrl,
      });
      successCount++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log(`   ❌ Failed: ${errorMessage}\n`);
      results.push({
        slug: card.slug,
        name: card.name,
        status: 'failed',
        oldUrl: card.imageUrl,
        newUrl: null,
        error: errorMessage,
      });
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CARD IMAGES MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Skipped (already done): ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📦 Bucket: ${CARD_IMAGES_BUCKET}`);

  if (failCount > 0) {
    console.log('\n❌ Failed migrations:');
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        console.log(`   - ${r.name} (${r.slug}): ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(60));

  // Reminder about seed data
  if (successCount > 0) {
    console.log('\n⚠️  IMPORTANT: After migration, update lib/db/seed-data/cards.ts');
    console.log('   with the new Supabase URLs for fresh deployments.');
    console.log('\n   You can generate the new URLs with:');
    console.log('   const url = `${SUPABASE_URL}/storage/v1/object/public/card-images/${slug}.jpg`');
  }
}

// Run the migration
migrateCardImages()
  .then(() => {
    console.log('\n✨ Card images migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
