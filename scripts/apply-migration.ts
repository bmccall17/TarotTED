import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function applyMigration() {
  console.log('Applying migration: Adding new card meaning fields...');

  try {
    // Run each ALTER TABLE statement
    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "symbolism" text`);
    console.log('✓ Added symbolism column');

    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "advice_when_drawn" text`);
    console.log('✓ Added advice_when_drawn column');

    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "journaling_prompts" text`);
    console.log('✓ Added journaling_prompts column');

    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "astrological_correspondence" text`);
    console.log('✓ Added astrological_correspondence column');

    await db.execute(sql`ALTER TABLE "cards" ADD COLUMN IF NOT EXISTS "numerological_significance" text`);
    console.log('✓ Added numerological_significance column');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
