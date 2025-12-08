import { db } from '../index';
import { themes, cardThemes, talkThemes, cards, talks } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function getAllThemes() {
  const allThemes = await db
    .select({
      id: themes.id,
      slug: themes.slug,
      name: themes.name,
      description: themes.shortDescription,
    })
    .from(themes)
    .orderBy(themes.name);

  // Get counts for each theme
  const themesWithCounts = await Promise.all(
    allThemes.map(async (theme) => {
      const [cardCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(cardThemes)
        .where(eq(cardThemes.themeId, theme.id));

      const [talkCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(talkThemes)
        .where(eq(talkThemes.themeId, theme.id));

      return {
        ...theme,
        cardsCount: Number(cardCount.count),
        talksCount: Number(talkCount.count),
      };
    })
  );

  return themesWithCounts;
}

export async function getThemeBySlug(slug: string) {
  const [theme] = await db
    .select()
    .from(themes)
    .where(eq(themes.slug, slug))
    .limit(1);

  return theme;
}

export async function getThemeWithCardsAndTalks(slug: string) {
  const [themeData] = await db
    .select({
      id: themes.id,
      slug: themes.slug,
      name: themes.name,
      description: themes.shortDescription,
    })
    .from(themes)
    .where(eq(themes.slug, slug))
    .limit(1);

  if (!themeData) return null;
  const theme = themeData;

  // Get cards for this theme
  const themeCards = await db
    .select({
      card: cards,
    })
    .from(cardThemes)
    .innerJoin(cards, eq(cardThemes.cardId, cards.id))
    .where(eq(cardThemes.themeId, theme.id))
    .orderBy(cards.sequenceIndex);

  // Get talks for this theme
  const themeTalks = await db
    .select({
      talk: talks,
    })
    .from(talkThemes)
    .innerJoin(talks, eq(talkThemes.talkId, talks.id))
    .where(eq(talkThemes.themeId, theme.id))
    .orderBy(talks.title);

  return {
    ...theme,
    cards: themeCards.map((tc) => tc.card),
    talks: themeTalks.map((tt) => tt.talk),
  };
}
