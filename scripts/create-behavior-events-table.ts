import 'dotenv/config';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function createBehaviorEventsTable() {
  console.log('Creating behavior_events table...');

  try {
    // Create the table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "behavior_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "session_id" varchar(12) NOT NULL,
        "event_name" varchar(50) NOT NULL,
        "timestamp" bigint NOT NULL,
        "properties" text DEFAULT '{}',
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('Table created (or already exists).');

    // Create indexes (IF NOT EXISTS for safety)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_events_session" ON "behavior_events" USING btree ("session_id");`);
    console.log('Index idx_events_session created.');

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_events_name_time" ON "behavior_events" USING btree ("event_name","timestamp");`);
    console.log('Index idx_events_name_time created.');

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_events_created" ON "behavior_events" USING btree ("created_at");`);
    console.log('Index idx_events_created created.');

    console.log('Done! behavior_events table and indexes are ready.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

createBehaviorEventsTable();
