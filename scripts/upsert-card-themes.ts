import { db } from '../lib/db';
import { cards, themes, cardThemes } from '../lib/db/schema';
import { cardThemeAssignments } from '../lib/db/seed-data/themes';
import { eq, and } from 'drizzle-orm';

interface CardThemeToUpsert {
  cardSlug: string;
  themeSlug: string;
}

async function upsertCardThemes() {
  console.log('🔗 Starting card-theme mappings upsert...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const assignment of cardThemeAssignments as CardThemeToUpsert[]) {
    try {
      // Find the card by slug
      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.slug, assignment.cardSlug))
        .limit(1);

      if (!card) {
        console.log(`  ⏭️  Card not found: ${assignment.cardSlug}`);
        skipped++;
        continue;
      }

      // Find the theme by slug
      const [theme] = await db
        .select()
        .from(themes)
        .where(eq(themes.slug, assignment.themeSlug))
        .limit(1);

      if (!theme) {
        console.log(`  ⏭️  Theme not found: ${assignment.themeSlug}`);
        skipped++;
        continue;
      }

      // Check if mapping already exists
      const [existingMapping] = await db
        .select()
        .from(cardThemes)
        .where(
          and(
            eq(cardThemes.cardId, card.id),
            eq(cardThemes.themeId, theme.id)
          )
        )
        .limit(1);

      if (existingMapping) {
        // Mapping already exists, skip
        skipped++;
      } else {
        // Create new mapping
        await db.insert(cardThemes).values({
          cardId: card.id,
          themeId: theme.id,
        });

        console.log(`  ✅ Created: ${card.name} → ${theme.name}`);
        created++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`  ❌ Error with ${assignment.cardSlug}: ${errorMsg}`);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped} (already exist)`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total processed: ${cardThemeAssignments.length}`);

  process.exit(0);
}

upsertCardThemes().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
