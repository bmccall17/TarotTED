import { db } from '../index';
import { talks, cards, cardTalkMappings } from '../schema';
import { eq, and, sql, isNull, or, lt, count } from 'drizzle-orm';

/**
 * Validation Issues Interface
 */
export interface ValidationIssues {
  // Critical
  duplicateYoutubeIds: Array<{
    youtubeVideoId: string;
    talks: Array<{ id: string; title: string; speakerName: string }>;
  }>;

  // Important
  talksWithOnlyYoutubeUrl: Array<{
    id: string;
    title: string;
    speakerName: string;
    youtubeUrl: string | null;
  }>;
  missingBothUrls: Array<{
    id: string;
    title: string;
    speakerName: string;
  }>;
  missingThumbnails: Array<{
    id: string;
    title: string;
    speakerName: string;
  }>;
  shortDescriptions: Array<{
    id: string;
    title: string;
    speakerName: string;
    description: string | null;
  }>;

  // Mapping Issues
  cardsWithoutPrimaryMapping: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    mappingsCount: number;
  }>;
  talksNotMappedToAnyCard: Array<{
    id: string;
    title: string;
    speakerName: string;
    thumbnailUrl: string | null;
  }>;

  // Info
  softDeletedTalks: Array<{
    id: string;
    title: string;
    speakerName: string;
    deletedAt: Date | null;
  }>;
}

/**
 * Get all validation issues
 */
export async function getValidationIssues(): Promise<ValidationIssues> {
  const [
    duplicateYoutubeIds,
    talksWithOnlyYoutubeUrl,
    missingBothUrls,
    missingThumbnails,
    shortDescriptions,
    cardsWithoutPrimaryMapping,
    talksNotMappedToAnyCard,
    softDeletedTalks,
  ] = await Promise.all([
    getDuplicateYoutubeIds(),
    getTalksWithOnlyYoutubeUrl(),
    getMissingBothUrls(),
    getMissingThumbnails(),
    getShortDescriptions(),
    getCardsWithoutPrimaryMapping(),
    getTalksNotMappedToAnyCard(),
    getSoftDeletedTalks(),
  ]);

  return {
    duplicateYoutubeIds,
    talksWithOnlyYoutubeUrl,
    missingBothUrls,
    missingThumbnails,
    shortDescriptions,
    cardsWithoutPrimaryMapping,
    talksNotMappedToAnyCard,
    softDeletedTalks,
  };
}

/**
 * Get duplicate YouTube video IDs
 */
async function getDuplicateYoutubeIds() {
  // First, find YouTube IDs that appear more than once
  const duplicates = await db
    .select({
      youtubeVideoId: talks.youtubeVideoId,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        sql`${talks.youtubeVideoId} IS NOT NULL`
      )
    )
    .groupBy(talks.youtubeVideoId)
    .having(sql`COUNT(*) > 1`);

  // For each duplicate, get the talks
  const result = await Promise.all(
    duplicates.map(async (dup) => {
      const affectedTalks = await db
        .select({
          id: talks.id,
          title: talks.title,
          speakerName: talks.speakerName,
        })
        .from(talks)
        .where(
          and(
            eq(talks.isDeleted, false),
            eq(talks.youtubeVideoId, dup.youtubeVideoId!)
          )
        );

      return {
        youtubeVideoId: dup.youtubeVideoId!,
        talks: affectedTalks,
      };
    })
  );

  return result;
}

/**
 * Get talks that only have YouTube URL (no TED.com URL)
 */
async function getTalksWithOnlyYoutubeUrl() {
  return await db
    .select({
      id: talks.id,
      title: talks.title,
      speakerName: talks.speakerName,
      youtubeUrl: talks.youtubeUrl,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        isNull(talks.tedUrl),
        sql`${talks.youtubeUrl} IS NOT NULL`
      )
    )
    .orderBy(talks.title);
}

/**
 * Get talks missing both URLs (should not happen with CHECK constraint)
 */
async function getMissingBothUrls() {
  return await db
    .select({
      id: talks.id,
      title: talks.title,
      speakerName: talks.speakerName,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        isNull(talks.tedUrl),
        isNull(talks.youtubeUrl)
      )
    )
    .orderBy(talks.title);
}

/**
 * Get talks missing thumbnails
 */
async function getMissingThumbnails() {
  return await db
    .select({
      id: talks.id,
      title: talks.title,
      speakerName: talks.speakerName,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        or(isNull(talks.thumbnailUrl), eq(talks.thumbnailUrl, ''))
      )
    )
    .orderBy(talks.title);
}

/**
 * Get talks with short or missing descriptions
 */
async function getShortDescriptions() {
  return await db
    .select({
      id: talks.id,
      title: talks.title,
      speakerName: talks.speakerName,
      description: talks.description,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        or(
          isNull(talks.description),
          sql`LENGTH(${talks.description}) < 50`
        )
      )
    )
    .orderBy(talks.title);
}

/**
 * Get cards without a primary mapping
 */
async function getCardsWithoutPrimaryMapping() {
  return await db
    .select({
      id: cards.id,
      name: cards.name,
      slug: cards.slug,
      imageUrl: cards.imageUrl,
      mappingsCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${cardTalkMappings}
        WHERE ${cardTalkMappings.cardId} = ${cards.id}
      )`,
    })
    .from(cards)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM ${cardTalkMappings}
        WHERE ${cardTalkMappings.cardId} = ${cards.id}
        AND ${cardTalkMappings.isPrimary} = true
      )`
    )
    .orderBy(cards.sequenceIndex);
}

/**
 * Get talks not mapped to any card
 */
async function getTalksNotMappedToAnyCard() {
  return await db
    .select({
      id: talks.id,
      title: talks.title,
      speakerName: talks.speakerName,
      thumbnailUrl: talks.thumbnailUrl,
    })
    .from(talks)
    .where(
      and(
        eq(talks.isDeleted, false),
        sql`NOT EXISTS (
          SELECT 1 FROM ${cardTalkMappings}
          WHERE ${cardTalkMappings.talkId} = ${talks.id}
        )`
      )
    )
    .orderBy(talks.title);
}

/**
 * Get soft-deleted talks
 */
async function getSoftDeletedTalks() {
  return await db
    .select({
      id: talks.id,
      title: talks.title,
      speakerName: talks.speakerName,
      deletedAt: talks.deletedAt,
    })
    .from(talks)
    .where(eq(talks.isDeleted, true))
    .orderBy(talks.deletedAt);
}

/**
 * Get validation summary counts
 */
export async function getValidationSummary() {
  const issues = await getValidationIssues();

  return {
    critical: issues.duplicateYoutubeIds.length,
    important:
      issues.talksWithOnlyYoutubeUrl.length +
      issues.missingBothUrls.length +
      issues.missingThumbnails.length +
      issues.shortDescriptions.length,
    mappings:
      issues.cardsWithoutPrimaryMapping.length +
      issues.talksNotMappedToAnyCard.length,
    info: issues.softDeletedTalks.length,
    total:
      issues.duplicateYoutubeIds.length +
      issues.talksWithOnlyYoutubeUrl.length +
      issues.missingBothUrls.length +
      issues.missingThumbnails.length +
      issues.shortDescriptions.length +
      issues.cardsWithoutPrimaryMapping.length +
      issues.talksNotMappedToAnyCard.length +
      issues.softDeletedTalks.length,
    details: {
      duplicateYoutubeIds: issues.duplicateYoutubeIds.length,
      talksWithOnlyYoutubeUrl: issues.talksWithOnlyYoutubeUrl.length,
      missingBothUrls: issues.missingBothUrls.length,
      missingThumbnails: issues.missingThumbnails.length,
      shortDescriptions: issues.shortDescriptions.length,
      cardsWithoutPrimaryMapping: issues.cardsWithoutPrimaryMapping.length,
      talksNotMappedToAnyCard: issues.talksNotMappedToAnyCard.length,
      softDeletedTalks: issues.softDeletedTalks.length,
    },
  };
}
