import { db } from '../index';
import { cards, cardTalkMappings, talks } from '../schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function getAllCards() {
  return db
    .select({
      id: cards.id,
      slug: cards.slug,
      name: cards.name,
      arcanaType: cards.arcanaType,
      suit: cards.suit,
      number: cards.number,
      sequenceIndex: cards.sequenceIndex,
      imageUrl: cards.imageUrl,
      keywords: cards.keywords,
      summary: cards.summary,
    })
    .from(cards)
    .orderBy(cards.sequenceIndex);
}

export async function getCardBySlug(slug: string) {
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.slug, slug))
    .limit(1);

  return card;
}

export async function getCardWithMappings(slug: string) {
  const card = await getCardBySlug(slug);
  if (!card) return null;

  const mappings = await db
    .select({
      talk: talks,
      mapping: cardTalkMappings,
    })
    .from(cardTalkMappings)
    .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
    .where(eq(cardTalkMappings.cardId, card.id))
    .orderBy(
      desc(cardTalkMappings.isPrimary),
      desc(cardTalkMappings.strength)
    );

  return {
    ...card,
    mappings,
  };
}

export async function getCardsByArcana(arcanaType: 'major' | 'minor') {
  return db
    .select()
    .from(cards)
    .where(eq(cards.arcanaType, arcanaType))
    .orderBy(cards.sequenceIndex);
}

export async function getCardsBySuit(suit: 'wands' | 'cups' | 'swords' | 'pentacles') {
  return db
    .select()
    .from(cards)
    .where(eq(cards.suit, suit))
    .orderBy(cards.number);
}
