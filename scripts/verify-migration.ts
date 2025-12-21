import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function verifyMigration() {
  try {
    console.log('📊 Verifying current schema...\n');

    // Check columns in talks table
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'talks'
      ORDER BY ordinal_position
    `) as any;

    console.log('Columns in talks table:');
    const rows = Array.isArray(result) ? result : result?.rows || [];
    rows.forEach((row: any) => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Check constraints
    console.log('\n📋 Checking constraints...');
    const constraints = await db.execute(sql`
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'talks'::regclass
    `) as any;

    console.log('Constraints on talks table:');
    const constraintRows = Array.isArray(constraints) ? constraints : constraints?.rows || [];
    constraintRows.forEach((row: any) => {
      console.log(`  - ${row.conname} (${row.contype}): ${row.definition}`);
    });

    // Check indexes
    console.log('\n📑 Checking indexes...');
    const indexes = await db.execute(sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'card_talk_mappings'
    `) as any;

    console.log('Indexes on card_talk_mappings table:');
    const indexRows = Array.isArray(indexes) ? indexes : indexes?.rows || [];
    indexRows.forEach((row: any) => {
      console.log(`  - ${row.indexname}`);
      console.log(`    ${row.indexdef}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyMigration();
