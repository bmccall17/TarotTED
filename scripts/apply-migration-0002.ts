import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  try {
    console.log('📦 Applying migration 0002...');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/0002_unknown_scarlet_witch.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(statements[i].substring(0, 100) + '...');

      try {
        await db.execute(sql.raw(statements[i]));
        console.log('✅ Success');
      } catch (error: any) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }

    console.log('\n✅ Migration 0002 applied successfully!');

    // Verify the changes
    console.log('\n📊 Verifying migration...');
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'talks'
      AND column_name IN ('youtube_url', 'is_deleted', 'deleted_at', 'ted_url')
      ORDER BY column_name
    `);

    console.log('Columns in talks table:');
    console.table(result.rows);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
