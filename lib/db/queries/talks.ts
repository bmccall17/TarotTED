import { db } from '../index';
import { talks, cardTalkMappings, cards } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getAllTalks() {
  const allTalks = await db
    .select()
    .from(talks)
    .orderBy(desc(talks.year), talks.title);

  // For each talk, get its primary mapped card
  const talksWithCards = await Promise.all(
    allTalks.map(async (talk) => {
      const [primaryCard] = await db
        .select({
          card: cards,
        })
        .from(cardTalkMappings)
        .innerJoin(cards, eq(cardTalkMappings.cardId, cards.id))
        .where(eq(cardTalkMappings.talkId, talk.id))
        .orderBy(desc(cardTalkMappings.strength))
        .limit(1);

      return {
        ...talk,
        primaryCard: primaryCard?.card || null,
      };
    })
  );

  return talksWithCards;
}

export async function getTalkBySlug(slug: string) {
  const [talk] = await db
    .select()
    .from(talks)
    .where(eq(talks.slug, slug))
    .limit(1);

  return talk;
}

export async function getTalkWithMappedCards(slug: string) {
  const talk = await getTalkBySlug(slug);
  if (!talk) return null;

  const mappedCards = await db
    .select({
      card: cards,
      mapping: cardTalkMappings,
    })
    .from(cardTalkMappings)
    .innerJoin(cards, eq(cardTalkMappings.cardId, cards.id))
    .where(eq(cardTalkMappings.talkId, talk.id))
    .orderBy(desc(cardTalkMappings.strength));

  return {
    ...talk,
    mappedCards,
  };
}
