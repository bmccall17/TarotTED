import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { themes, cardThemes, talkThemes, cards, talks } from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';

const getConnectionString = () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required');
  }
  return connectionString;
};

// ============================================================================
// THEME DEFINITIONS - Edit this section to add/update themes
// ============================================================================

interface ThemeDefinition {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  category: 'emotion' | 'life_phase' | 'role' | 'other';
  cardSlugs?: string[];  // Optional: cards to associate with this theme
  talkSlugs?: string[];  // Optional: talks to associate with this theme
}

const themeDefinitions: ThemeDefinition[] = [
  // EMOTIONS
  {
    slug: 'grief-and-gratitude',
    name: 'Grief & Gratitude',
    shortDescription: 'Navigating loss while finding meaning and appreciation.',
    longDescription: 'This theme explores the intertwined nature of grief and gratitude - how acknowledging our losses can deepen our appreciation for what remains and what was.',
    category: 'emotion',
    cardSlugs: ['death', 'five-of-cups', 'ten-of-swords'],
  },
  {
    slug: 'joy-and-celebration',
    name: 'Joy & Celebration',
    shortDescription: 'Embracing happiness, success, and moments of triumph.',
    longDescription: 'Cards and talks that celebrate life\'s victories, both big and small, and explore the science and practice of cultivating joy.',
    category: 'emotion',
    cardSlugs: ['the-sun', 'three-of-cups', 'four-of-wands', 'nine-of-pentacles'],
  },
  {
    slug: 'fear-and-courage',
    name: 'Fear & Courage',
    shortDescription: 'Facing our fears and finding the courage to move forward.',
    longDescription: 'Exploring anxiety, fear, and the inner strength needed to face challenges head-on.',
    category: 'emotion',
    cardSlugs: ['strength', 'seven-of-wands', 'nine-of-swords'],
  },

  // LIFE PHASES
  {
    slug: 'new-beginnings',
    name: 'New Beginnings',
    shortDescription: 'Starting fresh, taking leaps of faith, and embracing the unknown.',
    longDescription: 'Whether it\'s a new job, relationship, or life chapter, these cards and talks guide you through the excitement and uncertainty of starting something new.',
    category: 'life_phase',
    cardSlugs: ['the-fool', 'ace-of-wands', 'ace-of-cups', 'ace-of-swords', 'ace-of-pentacles'],
  },
  {
    slug: 'endings-and-transitions',
    name: 'Endings & Transitions',
    shortDescription: 'Letting go, saying goodbye, and moving through change.',
    longDescription: 'The wisdom of endings - how to gracefully close chapters, honor what was, and prepare for what comes next.',
    category: 'life_phase',
    cardSlugs: ['death', 'the-tower', 'ten-of-swords', 'six-of-swords'],
  },
  {
    slug: 'transformation',
    name: 'Transformation',
    shortDescription: 'Deep change, death and rebirth, becoming who you\'re meant to be.',
    longDescription: 'Profound transformation isn\'t easy, but it\'s essential. These cards and talks explore the process of radical change and personal evolution.',
    category: 'life_phase',
    cardSlugs: ['death', 'the-tower', 'judgement', 'the-hanged-man'],
  },

  // ROLES
  {
    slug: 'leadership',
    name: 'Leadership',
    shortDescription: 'Guiding others, making decisions, and wielding power wisely.',
    longDescription: 'What makes a good leader? These cards and talks explore authority, responsibility, and the art of inspiring others.',
    category: 'role',
    cardSlugs: ['the-emperor', 'king-of-wands', 'king-of-swords'],
  },
  {
    slug: 'creativity-and-calling',
    name: 'Creativity & Calling',
    shortDescription: 'Following your creative impulses and discovering your purpose.',
    longDescription: 'For artists, makers, and anyone seeking to live a creative life - guidance on overcoming blocks and trusting your genius.',
    category: 'role',
    cardSlugs: ['the-magician', 'the-empress', 'ace-of-wands', 'three-of-pentacles'],
  },
  {
    slug: 'relationships',
    name: 'Relationships',
    shortDescription: 'Love, partnership, community, and human connection.',
    longDescription: 'How we relate to others shapes our entire lives. These cards and talks explore romantic love, friendship, family, and community bonds.',
    category: 'role',
    cardSlugs: ['the-lovers', 'two-of-cups', 'three-of-cups', 'ten-of-pentacles'],
  },

  // OTHER
  {
    slug: 'resilience',
    name: 'Resilience',
    shortDescription: 'Bouncing back, persevering, and finding strength in adversity.',
    longDescription: 'When life knocks you down, these cards and talks offer wisdom on getting back up and growing stronger.',
    category: 'other',
    cardSlugs: ['strength', 'nine-of-wands', 'seven-of-wands'],
  },
  {
    slug: 'wisdom-and-introspection',
    name: 'Wisdom & Introspection',
    shortDescription: 'Going within, seeking truth, and cultivating self-knowledge.',
    longDescription: 'The examined life - cards and talks for those who seek deeper understanding through reflection and contemplation.',
    category: 'other',
    cardSlugs: ['the-hermit', 'the-high-priestess', 'four-of-swords'],
  },
];

// ============================================================================
// SCRIPT LOGIC - You shouldn't need to edit below this line
// ============================================================================

async function manageThemes() {
  const client = postgres(getConnectionString(), { prepare: false });
  const db = drizzle(client);

  console.log('Starting theme management...\n');

  try {
    let themesCreated = 0;
    let themesUpdated = 0;
    let cardRelationsCreated = 0;
    let talkRelationsCreated = 0;

    for (const themeDef of themeDefinitions) {
      console.log(`Processing theme: ${themeDef.name}...`);

      // Check if theme exists
      const existingTheme = await db
        .select()
        .from(themes)
        .where(eq(themes.slug, themeDef.slug))
        .limit(1);

      let themeId: string;

      if (existingTheme.length > 0) {
        // Update existing theme
        const updated = await db
          .update(themes)
          .set({
            name: themeDef.name,
            shortDescription: themeDef.shortDescription,
            longDescription: themeDef.longDescription || null,
            category: themeDef.category,
            updatedAt: new Date(),
          })
          .where(eq(themes.slug, themeDef.slug))
          .returning({ id: themes.id });

        themeId = updated[0].id;
        console.log(`  ✓ Updated theme: ${themeDef.name}`);
        themesUpdated++;
      } else {
        // Create new theme
        const created = await db
          .insert(themes)
          .values({
            slug: themeDef.slug,
            name: themeDef.name,
            shortDescription: themeDef.shortDescription,
            longDescription: themeDef.longDescription || null,
            category: themeDef.category,
          })
          .returning({ id: themes.id });

        themeId = created[0].id;
        console.log(`  ✓ Created theme: ${themeDef.name}`);
        themesCreated++;
      }

      // Handle card associations
      if (themeDef.cardSlugs && themeDef.cardSlugs.length > 0) {
        // First, remove all existing card associations for this theme
        await db.delete(cardThemes).where(eq(cardThemes.themeId, themeId));

        // Then add the new associations
        for (const cardSlug of themeDef.cardSlugs) {
          const card = await db
            .select()
            .from(cards)
            .where(eq(cards.slug, cardSlug))
            .limit(1);

          if (card.length > 0) {
            await db.insert(cardThemes).values({
              cardId: card[0].id,
              themeId: themeId,
            });
            cardRelationsCreated++;
          } else {
            console.log(`  ⚠️  Card not found: ${cardSlug}`);
          }
        }
        console.log(`  ✓ Added ${themeDef.cardSlugs.length} card associations`);
      }

      // Handle talk associations
      if (themeDef.talkSlugs && themeDef.talkSlugs.length > 0) {
        // First, remove all existing talk associations for this theme
        await db.delete(talkThemes).where(eq(talkThemes.themeId, themeId));

        // Then add the new associations
        for (const talkSlug of themeDef.talkSlugs) {
          const talk = await db
            .select()
            .from(talks)
            .where(eq(talks.slug, talkSlug))
            .limit(1);

          if (talk.length > 0) {
            await db.insert(talkThemes).values({
              talkId: talk[0].id,
              themeId: themeId,
            });
            talkRelationsCreated++;
          } else {
            console.log(`  ⚠️  Talk not found: ${talkSlug}`);
          }
        }
        console.log(`  ✓ Added ${themeDef.talkSlugs.length} talk associations`);
      }

      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('Theme management complete!');
    console.log('═══════════════════════════════════════');
    console.log(`Themes created: ${themesCreated}`);
    console.log(`Themes updated: ${themesUpdated}`);
    console.log(`Card associations: ${cardRelationsCreated}`);
    console.log(`Talk associations: ${talkRelationsCreated}`);
    console.log('═══════════════════════════════════════\n');

  } finally {
    await client.end();
  }
}

manageThemes();
