import { db } from '../index';
import { cardTalkMappings, cards, talks } from '../schema';
import { eq, desc, and, sql, count, isNull, or } from 'drizzle-orm';

// Type for creating/updating a mapping
export type InsertMapping = typeof cardTalkMappings.$inferInsert;

/**
 * Get all mappings for admin with card and talk details
 */
export async function getAllMappingsForAdmin() {
  return await db
    .select({
      id: cardTalkMappings.id,
      cardId: cardTalkMappings.cardId,
      talkId: cardTalkMappings.talkId,
      isPrimary: cardTalkMappings.isPrimary,
      strength: cardTalkMappings.strength,
      rationaleShort: cardTalkMappings.rationaleShort,
      rationaleLong: cardTalkMappings.rationaleLong,
      createdAt: cardTalkMappings.createdAt,
      updatedAt: cardTalkMappings.updatedAt,
      // Card details
      cardName: cards.name,
      cardSlug: cards.slug,
      cardImageUrl: cards.imageUrl,
      cardArcanaType: cards.arcanaType,
      cardSuit: cards.suit,
      // Talk details
      talkTitle: talks.title,
      talkSlug: talks.slug,
      talkSpeakerName: talks.speakerName,
      talkThumbnailUrl: talks.thumbnailUrl,
      talkIsDeleted: talks.isDeleted,
    })
    .from(cardTalkMappings)
    .innerJoin(cards, eq(cardTalkMappings.cardId, cards.id))
    .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
    .orderBy(cards.sequenceIndex, desc(cardTalkMappings.isPrimary), desc(cardTalkMappings.strength));
}

/**
 * Get all mappings for a specific card
 */
export async function getMappingsByCardId(cardId: string) {
  return await db
    .select({
      id: cardTalkMappings.id,
      cardId: cardTalkMappings.cardId,
      talkId: cardTalkMappings.talkId,
      isPrimary: cardTalkMappings.isPrimary,
      strength: cardTalkMappings.strength,
      rationaleShort: cardTalkMappings.rationaleShort,
      rationaleLong: cardTalkMappings.rationaleLong,
      createdAt: cardTalkMappings.createdAt,
      // Talk details
      talkTitle: talks.title,
      talkSlug: talks.slug,
      talkSpeakerName: talks.speakerName,
      talkThumbnailUrl: talks.thumbnailUrl,
      talkYear: talks.year,
      talkIsDeleted: talks.isDeleted,
    })
    .from(cardTalkMappings)
    .innerJoin(talks, eq(cardTalkMappings.talkId, talks.id))
    .where(eq(cardTalkMappings.cardId, cardId))
    .orderBy(desc(cardTalkMappings.isPrimary), desc(cardTalkMappings.strength));
}

/**
 * Get all cards with their mapping counts for the sidebar
 */
export async function getAllCardsWithMappingCounts() {
  return await db
    .select({
      id: cards.id,
      slug: cards.slug,
      name: cards.name,
      arcanaType: cards.arcanaType,
      suit: cards.suit,
      sequenceIndex: cards.sequenceIndex,
      imageUrl: cards.imageUrl,
      mappingsCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM card_talk_mappings
        WHERE card_talk_mappings.card_id = cards.id
      )`,
      hasPrimary: sql<boolean>`EXISTS (
        SELECT 1
        FROM card_talk_mappings
        WHERE card_talk_mappings.card_id = cards.id
        AND card_talk_mappings.is_primary = true
      )`,
    })
    .from(cards)
    .orderBy(cards.sequenceIndex);
}

/**
 * Get cards without a primary mapping
 */
export async function getCardsWithoutPrimaryMapping() {
  // Get all cards that either have no mappings or no primary mapping
  const result = await db
    .select({
      id: cards.id,
      slug: cards.slug,
      name: cards.name,
      arcanaType: cards.arcanaType,
      suit: cards.suit,
      sequenceIndex: cards.sequenceIndex,
      imageUrl: cards.imageUrl,
      mappingsCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM card_talk_mappings
        WHERE card_talk_mappings.card_id = cards.id
      )`,
    })
    .from(cards)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM card_talk_mappings
        WHERE card_talk_mappings.card_id = cards.id
        AND card_talk_mappings.is_primary = true
      )`
    )
    .orderBy(cards.sequenceIndex);

  return result;
}

/**
 * Get talks not mapped to any card
 */
export async function getUnmappedTalks() {
  return await db
    .select({
      id: talks.id,
      slug: talks.slug,
      title: talks.title,
      speakerName: talks.speakerName,
      thumbnailUrl: talks.thumbnailUrl,
      year: talks.year,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        sql`NOT EXISTS (
          SELECT 1 FROM card_talk_mappings
          WHERE card_talk_mappings.talk_id = talks.id
        )`
      )
    )
    .orderBy(desc(talks.createdAt));
}

/**
 * Create or update a mapping
 * Uses transaction to ensure atomicity when setting primary (YELLOW FLAG #3 FIX)
 */
export async function upsertMapping(data: {
  cardId: string;
  talkId: string;
  isPrimary: boolean;
  strength: number;
  rationaleShort: string;
  rationaleLong?: string | null;
}) {
  // Use transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // If setting as primary, demote existing primary first
    if (data.isPrimary) {
      await tx
        .update(cardTalkMappings)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(cardTalkMappings.cardId, data.cardId),
            eq(cardTalkMappings.isPrimary, true)
          )
        );
    }

    // Check if mapping already exists
    const existing = await tx
      .select({ id: cardTalkMappings.id })
      .from(cardTalkMappings)
      .where(
        and(
          eq(cardTalkMappings.cardId, data.cardId),
          eq(cardTalkMappings.talkId, data.talkId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing mapping
      const result = await tx
        .update(cardTalkMappings)
        .set({
          isPrimary: data.isPrimary,
          strength: data.strength,
          rationaleShort: data.rationaleShort,
          rationaleLong: data.rationaleLong,
          updatedAt: new Date(),
        })
        .where(eq(cardTalkMappings.id, existing[0].id))
        .returning();

      // Audit log
      console.log(
        `[AUDIT] ${new Date().toISOString()} | MAPPING_UPDATED | ${JSON.stringify({
          mappingId: existing[0].id,
          cardId: data.cardId,
          talkId: data.talkId,
          isPrimary: data.isPrimary,
        })}`
      );

      return result[0];
    } else {
      // Create new mapping
      const result = await tx
        .insert(cardTalkMappings)
        .values({
          cardId: data.cardId,
          talkId: data.talkId,
          isPrimary: data.isPrimary,
          strength: data.strength,
          rationaleShort: data.rationaleShort,
          rationaleLong: data.rationaleLong,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Audit log
      console.log(
        `[AUDIT] ${new Date().toISOString()} | MAPPING_CREATED | ${JSON.stringify({
          mappingId: result[0].id,
          cardId: data.cardId,
          talkId: data.talkId,
          isPrimary: data.isPrimary,
        })}`
      );

      return result[0];
    }
  });
}

/**
 * Delete a mapping
 */
export async function deleteMapping(id: string) {
  // Get mapping info for audit log
  const mapping = await db
    .select({
      cardId: cardTalkMappings.cardId,
      talkId: cardTalkMappings.talkId,
      isPrimary: cardTalkMappings.isPrimary,
    })
    .from(cardTalkMappings)
    .where(eq(cardTalkMappings.id, id))
    .limit(1);

  if (mapping.length === 0) {
    throw new Error('Mapping not found');
  }

  // Audit log
  console.log(
    `[AUDIT] ${new Date().toISOString()} | MAPPING_DELETED | ${JSON.stringify({
      mappingId: id,
      cardId: mapping[0].cardId,
      talkId: mapping[0].talkId,
      wasPrimary: mapping[0].isPrimary,
    })}`
  );

  await db.delete(cardTalkMappings).where(eq(cardTalkMappings.id, id));

  return { success: true };
}

/**
 * Set a mapping as primary (demotes others)
 */
export async function setMappingAsPrimary(mappingId: string) {
  // Get the mapping to find its cardId
  const mapping = await db
    .select({
      cardId: cardTalkMappings.cardId,
      talkId: cardTalkMappings.talkId,
    })
    .from(cardTalkMappings)
    .where(eq(cardTalkMappings.id, mappingId))
    .limit(1);

  if (mapping.length === 0) {
    throw new Error('Mapping not found');
  }

  return await db.transaction(async (tx) => {
    // Demote all other primaries for this card
    await tx
      .update(cardTalkMappings)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(
        and(
          eq(cardTalkMappings.cardId, mapping[0].cardId),
          eq(cardTalkMappings.isPrimary, true)
        )
      );

    // Set this one as primary
    const result = await tx
      .update(cardTalkMappings)
      .set({ isPrimary: true, updatedAt: new Date() })
      .where(eq(cardTalkMappings.id, mappingId))
      .returning();

    // Audit log
    console.log(
      `[AUDIT] ${new Date().toISOString()} | MAPPING_SET_PRIMARY | ${JSON.stringify({
        mappingId,
        cardId: mapping[0].cardId,
        talkId: mapping[0].talkId,
      })}`
    );

    return result[0];
  });
}

/**
 * Get mapping statistics for the dashboard
 */
export async function getMappingsStats() {
  const totalMappings = await db
    .select({ count: count() })
    .from(cardTalkMappings);

  const totalCards = await db
    .select({ count: count() })
    .from(cards);

  const cardsWithPrimary = await db
    .select({ count: sql<number>`COUNT(DISTINCT card_talk_mappings.card_id)::int` })
    .from(cardTalkMappings)
    .where(eq(cardTalkMappings.isPrimary, true));

  const unmappedTalks = await db
    .select({ count: count() })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        sql`NOT EXISTS (
          SELECT 1 FROM card_talk_mappings
          WHERE card_talk_mappings.talk_id = talks.id
        )`
      )
    );

  return {
    totalMappings: totalMappings[0]?.count || 0,
    totalCards: totalCards[0]?.count || 0,
    cardsWithPrimary: cardsWithPrimary[0]?.count || 0,
    cardsWithoutPrimary: (totalCards[0]?.count || 0) - (cardsWithPrimary[0]?.count || 0),
    unmappedTalks: unmappedTalks[0]?.count || 0,
  };
}
