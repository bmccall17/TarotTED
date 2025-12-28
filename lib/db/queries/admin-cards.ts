import { db } from '@/lib/db';
import { cards, cardTalkMappings, talks } from '@/lib/db/schema';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';

export async function getAllCardsForAdmin(searchQuery?: string) {
  const query = db
    .select({
      id: cards.id,
      slug: cards.slug,
      name: cards.name,
      arcanaType: cards.arcanaType,
      suit: cards.suit,
      number: cards.number,
      imageUrl: cards.imageUrl,
      summary: cards.summary,
    })
    .from(cards);

  if (searchQuery) {
    query.where(
      or(
        ilike(cards.name, `%${searchQuery}%`),
        ilike(cards.slug, `%${searchQuery}%`)
      )
    );
  }

  const allCards = await query.orderBy(cards.sequenceIndex);

  // Get all mappings with talk info for these cards
  const cardIds = allCards.map(c => c.id);

  if (cardIds.length === 0) {
    return [];
  }

  const allMappings = await db
    .select({
      cardId: cardTalkMappings.cardId,
      isPrimary: cardTalkMappings.isPrimary,
      talkThumbnailUrl: talks.thumbnailUrl,
      talkTitle: talks.title,
      talkSlug: talks.slug,
      talkId: talks.id,
    })
    .from(cardTalkMappings)
    .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
    .where(sql`${cardTalkMappings.cardId} = ANY(${cardIds})`)
    .orderBy(desc(cardTalkMappings.isPrimary));

  // Group mappings by card
  const mappingsByCard = allMappings.reduce((acc, mapping) => {
    if (!acc[mapping.cardId]) {
      acc[mapping.cardId] = [];
    }
    acc[mapping.cardId].push(mapping);
    return acc;
  }, {} as Record<string, typeof allMappings>);

  // Attach mappings to cards
  return allCards.map(card => ({
    ...card,
    mappings: mappingsByCard[card.id] || [],
  }));
}

export async function getCardForAdmin(cardId: string) {
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  if (!card) return null;

  // Get all mappings for this card with talk details
  const mappings = await db
    .select({
      id: cardTalkMappings.id,
      talkId: cardTalkMappings.talkId,
      isPrimary: cardTalkMappings.isPrimary,
      strength: cardTalkMappings.strength,
      rationaleShort: cardTalkMappings.rationaleShort,
      rationaleLong: cardTalkMappings.rationaleLong,
      talkSlug: talks.slug,
      talkTitle: talks.title,
      talkSpeakerName: talks.speakerName,
      talkThumbnailUrl: talks.thumbnailUrl,
      talkYear: talks.year,
      talkIsDeleted: talks.isDeleted,
    })
    .from(cardTalkMappings)
    .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
    .where(eq(cardTalkMappings.cardId, cardId))
    .orderBy(desc(cardTalkMappings.isPrimary), desc(cardTalkMappings.strength));

  return {
    ...card,
    mappings,
  };
}

export async function updateCard(
  cardId: string,
  data: {
    name?: string;
    summary?: string;
    keywords?: string;
    uprightMeaning?: string | null;
    reversedMeaning?: string | null;
    symbolism?: string | null;
    adviceWhenDrawn?: string | null;
    journalingPrompts?: string | null;
    astrologicalCorrespondence?: string | null;
    numerologicalSignificance?: string | null;
  }
) {
  const [updated] = await db
    .update(cards)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cards.id, cardId))
    .returning();

  return updated;
}
