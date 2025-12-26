/**
 * Migrate all talk thumbnails to Supabase Storage
 *
 * This script handles:
 * 1. Local files in public/images/talks/ (reads and uploads)
 * 2. External URLs (downloads and uploads)
 * 3. Updates database with new Supabase URLs
 *
 * Run: npx dotenv -e .env.local -- tsx scripts/migrate-thumbnails-to-supabase.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq, isNotNull, and, sql } from 'drizzle-orm';
import { createServiceClient, getStorageBucket, getPublicStorageUrl } from '../lib/supabase/server';
import { isSupabaseStorageUrl, isLocalPath } from '../lib/supabase';

const LOCAL_IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'talks');

interface MigrationResult {
  id: string;
  title: string;
  status: 'success' | 'failed' | 'skipped';
  oldUrl: string | null;
  newUrl: string | null;
  error?: string;
}

/**
 * Get content type from file extension
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return types[ext] || 'image/jpeg';
}

/**
 * Upload a local file to Supabase Storage
 */
async function uploadLocalFile(
  talkId: string,
  localPath: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fullPath = path.join(process.cwd(), 'public', localPath);
    const buffer = await fs.readFile(fullPath);
    const contentType = getContentType(localPath);
    const ext = path.extname(localPath);
    const filename = `${talkId}${ext}`;

    const supabase = createServiceClient();
    const bucket = getStorageBucket();

    const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      url: getPublicStorageUrl(filename),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Download from external URL and upload to Supabase
 */
async function downloadAndUpload(
  talkId: string,
  imageUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    // Determine extension from content type
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const ext = extMap[contentType.split(';')[0]] || '.jpg';
    const filename = `${talkId}${ext}`;

    const supabase = createServiceClient();
    const bucket = getStorageBucket();

    const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
      contentType: contentType.split(';')[0],
      upsert: true,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      url: getPublicStorageUrl(filename),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Download/upload failed',
    };
  }
}

async function migrateThumbnails() {
  console.log('🚀 Starting thumbnail migration to Supabase Storage...\n');

  // Get all talks with thumbnails
  const allTalks = await db
    .select({
      id: talks.id,
      title: talks.title,
      thumbnailUrl: talks.thumbnailUrl,
    })
    .from(talks)
    .where(
      and(isNotNull(talks.thumbnailUrl), sql`${talks.thumbnailUrl} != ''`)
    );

  console.log(`Found ${allTalks.length} talks with thumbnails\n`);

  const results: MigrationResult[] = [];
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const talk of allTalks) {
    const thumbnailUrl = talk.thumbnailUrl;

    // Skip if already in Supabase
    if (isSupabaseStorageUrl(thumbnailUrl)) {
      console.log(`⏭️  Skipping (already in Supabase): ${talk.title}`);
      results.push({
        id: talk.id,
        title: talk.title,
        status: 'skipped',
        oldUrl: thumbnailUrl,
        newUrl: thumbnailUrl,
      });
      skipCount++;
      continue;
    }

    console.log(`📦 Processing: ${talk.title}`);
    console.log(`   Current URL: ${thumbnailUrl?.substring(0, 60)}...`);

    let result: { success: boolean; url?: string; error?: string };

    // Handle local paths
    if (isLocalPath(thumbnailUrl)) {
      console.log('   Type: Local file');
      result = await uploadLocalFile(talk.id, thumbnailUrl!);
    }
    // Handle external URLs
    else if (thumbnailUrl?.startsWith('http')) {
      console.log('   Type: External URL');
      result = await downloadAndUpload(talk.id, thumbnailUrl);
    }
    // Unknown format
    else {
      console.log(`   ⚠️  Unknown URL format: ${thumbnailUrl}`);
      results.push({
        id: talk.id,
        title: talk.title,
        status: 'failed',
        oldUrl: thumbnailUrl,
        newUrl: null,
        error: 'Unknown URL format',
      });
      failCount++;
      continue;
    }

    if (result.success && result.url) {
      // Update database
      await db
        .update(talks)
        .set({ thumbnailUrl: result.url })
        .where(eq(talks.id, talk.id));

      console.log(`   ✅ Migrated to: ${result.url.substring(0, 60)}...\n`);
      results.push({
        id: talk.id,
        title: talk.title,
        status: 'success',
        oldUrl: thumbnailUrl,
        newUrl: result.url,
      });
      successCount++;
    } else {
      console.log(`   ❌ Failed: ${result.error}\n`);
      results.push({
        id: talk.id,
        title: talk.title,
        status: 'failed',
        oldUrl: thumbnailUrl,
        newUrl: null,
        error: result.error,
      });
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Skipped (already done): ${skipCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📦 Bucket: talk-thumbnails`);

  if (failCount > 0) {
    console.log('\n❌ Failed migrations:');
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        console.log(`   - ${r.title}: ${r.error}`);
      });
  }

  console.log('\n' + '='.repeat(60));
}

// Run the migration
migrateThumbnails()
  .then(() => {
    console.log('\n✨ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
