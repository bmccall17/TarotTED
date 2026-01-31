/**
 * Get the best thumbnail URL for a talk
 *
 * Priority order:
 * 1. ANY non-empty thumbnailUrl stored in the database (user explicitly set this)
 * 2. YouTube thumbnails (reliable fallback when no URL is set)
 *
 * Note: We trust whatever URL is in the database. If it's set, use it.
 * Only fall back to YouTube when thumbnailUrl is null/empty.
 */
export function getThumbnailUrl(
  thumbnailUrl: string | null,
  youtubeVideoId: string | null
): string | null {
  // If there's ANY thumbnailUrl stored, use it (matches Signal Deck behavior)
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return thumbnailUrl;
  }

  // YouTube thumbnail as fallback when no URL is stored
  if (youtubeVideoId) {
    return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }

  return null;
}
