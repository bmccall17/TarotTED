/**
 * Get the best thumbnail URL for a talk
 * Prefers YouTube thumbnails over TED S3-hosted images for better mobile compatibility
 */
export function getThumbnailUrl(
  thumbnailUrl: string | null,
  youtubeVideoId: string | null
): string | null {
  // If we have a YouTube video ID and the thumbnail is from TED's S3 bucket,
  // use YouTube's thumbnail instead (more reliable on mobile)
  if (
    youtubeVideoId &&
    thumbnailUrl?.includes('talkstar-photos.s3.amazonaws.com')
  ) {
    return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }

  // Otherwise use the provided thumbnail URL
  return thumbnailUrl;
}
