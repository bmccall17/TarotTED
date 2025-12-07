import { db } from './index';
import { cards, talks, cardTalkMappings, themes, cardThemes, talkThemes } from './schema';
import { cardsSeedData } from './seed-data/cards';
import { talksSeedData } from './seed-data/talks';
import { mappingsSeedData } from './seed-data/mappings';
import { themesSeedData, cardThemeAssignments, talkThemeAssignments } from './seed-data/themes';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await db.delete(cardTalkMappings);
    await db.delete(cardThemes);
    await db.delete(talkThemes);
    await db.delete(themes);
    await db.delete(talks);
    await db.delete(cards);
    console.log('✓ Existing data cleared\n');

    // 2. Insert cards
    console.log('🃏 Inserting cards...');
    const insertedCards = await db.insert(cards).values(cardsSeedData).returning();
    console.log(`✓ Inserted ${insertedCards.length} cards\n`);

    // 3. Insert talks
    console.log('🎤 Inserting talks...');
    const insertedTalks = await db.insert(talks).values(talksSeedData).returning();
    console.log(`✓ Inserted ${insertedTalks.length} talks\n`);

    // 4. Insert themes
    console.log('🎨 Inserting themes...');
    const insertedThemes = await db.insert(themes).values(themesSeedData).returning();
    console.log(`✓ Inserted ${insertedThemes.length} themes\n`);

    // 5. Create card-talk mappings
    console.log('🔗 Creating card-talk mappings...');
    let mappingsCreated = 0;

    for (const mapping of mappingsSeedData) {
      // Find the card by slug
      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.slug, mapping.cardSlug))
        .limit(1);

      // Find the talk by slug
      const [talk] = await db
        .select()
        .from(talks)
        .where(eq(talks.slug, mapping.talkSlug))
        .limit(1);

      if (card && talk) {
        await db.insert(cardTalkMappings).values({
          cardId: card.id,
          talkId: talk.id,
          isPrimary: mapping.isPrimary,
          strength: mapping.strength,
          rationaleShort: mapping.rationaleShort,
          rationaleLong: mapping.rationaleLong,
        });
        mappingsCreated++;
      } else {
        console.log(`  ⚠️  Skipping mapping: ${mapping.cardSlug} -> ${mapping.talkSlug} (not found)`);
      }
    }
    console.log(`✓ Created ${mappingsCreated} card-talk mappings\n`);

    // 6. Create card-theme assignments
    console.log('🏷️  Assigning cards to themes...');
    let cardThemesCreated = 0;

    for (const assignment of cardThemeAssignments) {
      const [card] = await db
        .select()
        .from(cards)
        .where(eq(cards.slug, assignment.cardSlug))
        .limit(1);

      const [theme] = await db
        .select()
        .from(themes)
        .where(eq(themes.slug, assignment.themeSlug))
        .limit(1);

      if (card && theme) {
        await db.insert(cardThemes).values({
          cardId: card.id,
          themeId: theme.id,
        });
        cardThemesCreated++;
      }
    }
    console.log(`✓ Created ${cardThemesCreated} card-theme assignments\n`);

    // 7. Create talk-theme assignments
    console.log('🏷️  Assigning talks to themes...');
    let talkThemesCreated = 0;

    for (const assignment of talkThemeAssignments) {
      const [talk] = await db
        .select()
        .from(talks)
        .where(eq(talks.slug, assignment.talkSlug))
        .limit(1);

      const [theme] = await db
        .select()
        .from(themes)
        .where(eq(themes.slug, assignment.themeSlug))
        .limit(1);

      if (talk && theme) {
        await db.insert(talkThemes).values({
          talkId: talk.id,
          themeId: theme.id,
        });
        talkThemesCreated++;
      }
    }
    console.log(`✓ Created ${talkThemesCreated} talk-theme assignments\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✨ Seed completed successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`Cards:          ${insertedCards.length}`);
    console.log(`Talks:          ${insertedTalks.length}`);
    console.log(`Mappings:       ${mappingsCreated}`);
    console.log(`Themes:         ${insertedThemes.length}`);
    console.log(`Card-Themes:    ${cardThemesCreated}`);
    console.log(`Talk-Themes:    ${talkThemesCreated}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('👋 Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
