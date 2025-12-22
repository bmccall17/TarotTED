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
    talks: Array<{ id: string; title: string; speakerName: string; slug: string }>;
  }>;

  // Important
  talksWithOnlyYoutubeUrl: Array<{
    id: string;
    title: string;
    speakerName: string;
    slug: string;
    youtubeUrl: string | null;
    tedUrl: string | null;
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
  }>;
  missingBothUrls: Array<{
    id: string;
    title: string;
    speakerName: string;
    slug: string;
    tedUrl: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
  }>;
  missingThumbnails: Array<{
    id: string;
    title: string;
    speakerName: string;
    slug: string;
    tedUrl: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
  }>;
  shortDescriptions: Array<{
    id: string;
    title: string;
    speakerName: string;
    slug: string;
    description: string | null;
    tedUrl: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
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
    slug: string;
    thumbnailUrl: string | null;
    tedUrl: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
  }>;

  // Info
  softDeletedTalks: Array<{
    id: string;
    title: string;
    speakerName: string;
    slug: string;
    deletedAt: Date | null;
    tedUrl: string | null;
    youtubeUrl: string | null;
    youtubeVideoId: string | null;
    thumbnailUrl: string | null;
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
          slug: talks.slug,
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
      slug: talks.slug,
      youtubeUrl: talks.youtubeUrl,
      tedUrl: talks.tedUrl,
      youtubeVideoId: talks.youtubeVideoId,
      thumbnailUrl: talks.thumbnailUrl,
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
      slug: talks.slug,
      tedUrl: talks.tedUrl,
      youtubeUrl: talks.youtubeUrl,
      youtubeVideoId: talks.youtubeVideoId,
      thumbnailUrl: talks.thumbnailUrl,
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
      slug: talks.slug,
      tedUrl: talks.tedUrl,
      youtubeUrl: talks.youtubeUrl,
      youtubeVideoId: talks.youtubeVideoId,
      thumbnailUrl: talks.thumbnailUrl,
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
      slug: talks.slug,
      description: talks.description,
      tedUrl: talks.tedUrl,
      youtubeUrl: talks.youtubeUrl,
      youtubeVideoId: talks.youtubeVideoId,
      thumbnailUrl: talks.thumbnailUrl,
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
      slug: talks.slug,
      thumbnailUrl: talks.thumbnailUrl,
      tedUrl: talks.tedUrl,
      youtubeUrl: talks.youtubeUrl,
      youtubeVideoId: talks.youtubeVideoId,
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
      slug: talks.slug,
      deletedAt: talks.deletedAt,
      tedUrl: talks.tedUrl,
      youtubeUrl: talks.youtubeUrl,
      youtubeVideoId: talks.youtubeVideoId,
      thumbnailUrl: talks.thumbnailUrl,
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
