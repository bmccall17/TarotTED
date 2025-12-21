import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function completeMigration() {
  try {
    console.log('📦 Completing migration 0002...\n');

    // Step 1: Add youtube_url column
    console.log('1. Adding youtube_url column...');
    await db.execute(sql`ALTER TABLE "talks" ADD COLUMN IF NOT EXISTS "youtube_url" text`);
    console.log('✅ Done\n');

    // Step 2: Migrate YouTube URLs from ted_url to youtube_url
    console.log('2. Migrating YouTube URLs from ted_url to youtube_url...');
    const updateResult = await db.execute(sql`
      UPDATE "talks"
      SET "youtube_url" = "ted_url"
      WHERE "ted_url" LIKE 'https://www.youtube.com%' OR "ted_url" LIKE 'https://youtu.be%'
    `);
    console.log(`✅ Migrated YouTube URLs\n`);

    // Step 3: Make ted_url nullable (MUST do this before setting to NULL!)
    console.log('3. Making ted_url nullable...');
    await db.execute(sql`ALTER TABLE "talks" ALTER COLUMN "ted_url" DROP NOT NULL`);
    console.log('✅ Done\n');

    // Step 4: Clear YouTube URLs from ted_url (set to NULL where it was a YouTube URL)
    console.log('4. Clearing YouTube URLs from ted_url field...');
    await db.execute(sql`
      UPDATE "talks"
      SET "ted_url" = NULL
      WHERE "youtube_url" IS NOT NULL
    `);
    console.log('✅ Done\n');

    // Step 5: Add CHECK constraint to ensure at least one URL exists
    console.log('5. Adding CHECK constraint for at least one URL...');
    try {
      await db.execute(sql`
        ALTER TABLE "talks" ADD CONSTRAINT "chk_at_least_one_url"
        CHECK ("ted_url" IS NOT NULL OR "youtube_url" IS NOT NULL)
      `);
      console.log('✅ Done\n');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Constraint already exists, skipping\n');
      } else {
        throw error;
      }
    }

    // Step 6: Add unique partial index for primary mappings (only one primary per card)
    console.log('6. Adding unique partial index for primary mappings...');
    try {
      await db.execute(sql`
        CREATE UNIQUE INDEX "idx_one_primary_per_card"
        ON "card_talk_mappings" ("card_id")
        WHERE "is_primary" = true
      `);
      console.log('✅ Done\n');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('⚠️  Index already exists, skipping\n');
      } else {
        throw error;
      }
    }

    console.log('✅ Migration 0002 completed successfully!\n');

    // Verify the changes
    console.log('📊 Verifying migration...\n');

    const columnsResult = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'talks'
      AND column_name IN ('youtube_url', 'is_deleted', 'deleted_at', 'ted_url')
      ORDER BY column_name
    `) as any;

    const columns = Array.isArray(columnsResult) ? columnsResult : columnsResult?.rows || [];
    console.log('New/Modified columns:');
    columns.forEach((row: any) => {
      console.log(`  ✓ ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });

    const constraintsResult = await db.execute(sql`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'talks'::regclass
      AND conname = 'chk_at_least_one_url'
    `) as any;
    const constraints = Array.isArray(constraintsResult) ? constraintsResult : constraintsResult?.rows || [];
    if (constraints.length > 0) {
      console.log('\n  ✓ CHECK constraint: chk_at_least_one_url');
    }

    const indexesResult = await db.execute(sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'card_talk_mappings'
      AND indexname = 'idx_one_primary_per_card'
    `) as any;
    const indexes = Array.isArray(indexesResult) ? indexesResult : indexesResult?.rows || [];
    if (indexes.length > 0) {
      console.log('  ✓ Unique partial index: idx_one_primary_per_card');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

completeMigration();
