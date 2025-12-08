/**
 * Script to fetch metadata (duration, year, event) for TED talks
 * Run with: npx tsx scripts/fetch-talk-metadata.ts
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

import { db } from '../lib/db';
import { talks } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

interface TalkMetadata {
  duration?: number;
  year?: number;
  eventName?: string;
}

async function fetchTalkMetadata(url: string): Promise<TalkMetadata> {
  try {
    console.log(`Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.log(`  ⚠️  Failed to fetch: ${response.status}`);
      return {};
    }

    const html = await response.text();

    // Extract duration from meta tags or script data
    let duration: number | undefined;
    const durationMatch = html.match(/"duration":(\d+)/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
    }

    // Extract year from filmed date or published date
    let year: number | undefined;
    const yearMatch = html.match(/"filmed_at":"(\d{4})-\d{2}-\d{2}/) ||
                      html.match(/filmed (?:in )?(\d{4})/i) ||
                      html.match(/"published_at":"(\d{4})-\d{2}-\d{2}/);
    if (yearMatch) {
      year = parseInt(yearMatch[1]);
    }

    // Extract event name
    let eventName: string | undefined;
    const eventMatch = html.match(/"event":"([^"]+)"/) ||
                       html.match(/<span class="[^"]*talk-hero__event[^"]*">([^<]+)</);
    if (eventMatch) {
      eventName = eventMatch[1].trim();
    }

    console.log(`  ✓ Duration: ${duration}s, Year: ${year}, Event: ${eventName || 'N/A'}`);

    return { duration, year, eventName };
  } catch (error) {
    console.log(`  ✗ Error: ${error}`);
    return {};
  }
}

async function updateTalkMetadata() {
  console.log('🔍 Fetching metadata for talks...\n');

  // Get all talks from database
  const allTalks = await db.select().from(talks);

  let updated = 0;
  let skipped = 0;

  for (const talk of allTalks) {
    // Skip if already has metadata
    if (talk.durationSeconds && talk.year) {
      console.log(`⏭️  Skipping "${talk.title}" (already has metadata)`);
      skipped++;
      continue;
    }

    console.log(`\n📹 "${talk.title}" by ${talk.speakerName}`);

    // Only fetch from ted.com URLs (not YouTube)
    if (!talk.tedUrl.includes('ted.com')) {
      console.log(`  ⏭️  Skipping (YouTube URL)`);
      skipped++;
      continue;
    }

    const metadata = await fetchTalkMetadata(talk.tedUrl);

    if (metadata.duration || metadata.year || metadata.eventName) {
      await db
        .update(talks)
        .set({
          durationSeconds: metadata.duration || talk.durationSeconds,
          year: metadata.year || talk.year,
          eventName: metadata.eventName || talk.eventName,
        })
        .where(eq(talks.id, talk.id));

      updated++;
      console.log(`  ✅ Updated!`);
    } else {
      console.log(`  ⚠️  No metadata found`);
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Complete! Updated: ${updated}, Skipped: ${skipped}`);
  console.log('='.repeat(50));

  process.exit(0);
}

// Run the update
updateTalkMetadata().catch(console.error);
