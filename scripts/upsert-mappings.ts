import { db } from '../lib/db';
import { cards, talks, cardTalkMappings } from '../lib/db/schema';
import { mappingsSeedData } from '../lib/db/seed-data/mappings';
import { eq, and } from 'drizzle-orm';

interface MappingToUpsert {
  cardSlug: string;
  talkSlug: string;
  isPrimary: boolean;
  strength: number;
  rationaleShort: string;
  rationaleLong: string | null;
}

async function upsertMappings() {
  console.log('🔗 Starting mappings upsert...\n');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const mapping of mappingsSeedData as MappingToUpsert[]) {
    try {
      // Find the card by slug
      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.slug, mapping.cardSlug))
        .limit(1);

      if (!card) {
        console.log(`  ⏭️  Card not found: ${mapping.cardSlug}`);
        skipped++;
        continue;
      }

      // Find the talk by slug
      const [talk] = await db
        .select()
        .from(talks)
        .where(eq(talks.slug, mapping.talkSlug))
        .limit(1);

      if (!talk) {
        console.log(`  ⏭️  Talk not found: ${mapping.talkSlug}`);
        skipped++;
        continue;
      }

      // Check if mapping already exists
      const [existingMapping] = await db
        .select()
        .from(cardTalkMappings)
        .where(
          and(
            eq(cardTalkMappings.cardId, card.id),
            eq(cardTalkMappings.talkId, talk.id)
          )
        )
        .limit(1);

      if (existingMapping) {
        // Update existing mapping
        await db
          .update(cardTalkMappings)
          .set({
            isPrimary: mapping.isPrimary,
            strength: mapping.strength,
            rationaleShort: mapping.rationaleShort,
            rationaleLong: mapping.rationaleLong,
            updatedAt: new Date(),
          })
          .where(eq(cardTalkMappings.id, existingMapping.id));

        console.log(`  🔄 Updated: ${card.name} → ${talk.title}`);
        updated++;
      } else {
        // Create new mapping
        await db.insert(cardTalkMappings).values({
          cardId: card.id,
          talkId: talk.id,
          isPrimary: mapping.isPrimary,
          strength: mapping.strength,
          rationaleShort: mapping.rationaleShort,
          rationaleLong: mapping.rationaleLong,
        });

        console.log(`  ✅ Created: ${card.name} → ${talk.title}`);
        created++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`  ❌ Error with ${mapping.cardSlug}: ${errorMsg}`);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total processed: ${mappingsSeedData.length}`);

  process.exit(0);
}

upsertMappings().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
