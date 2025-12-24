/**
 * Get the best thumbnail URL for a talk
 * Always prefers YouTube thumbnails when available for maximum reliability
 */
export function getThumbnailUrl(
  thumbnailUrl: string | null,
  youtubeVideoId: string | null
): string | null {
  // If we have a YouTube video ID, always use YouTube's thumbnail
  // (more reliable across all devices and doesn't have CORS/CDN issues)
  if (youtubeVideoId) {
    return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }

  // Fall back to the provided thumbnail URL if no YouTube ID
  return thumbnailUrl;
}
