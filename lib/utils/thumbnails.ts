import { isSupabaseStorageUrl } from '@/lib/supabase';

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
  console.log('[getThumbnailUrl] Input:', { thumbnailUrl, youtubeVideoId });

  // 1. If there's ANY thumbnailUrl stored, use it (matches Signal Deck behavior)
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    // Make sure it's a full URL
    if (thumbnailUrl.startsWith('http')) {
      console.log('[getThumbnailUrl] → Using stored URL:', thumbnailUrl);
      return thumbnailUrl;
    }
    // Local path - needs domain prefix
    if (thumbnailUrl.startsWith('/')) {
      console.log('[getThumbnailUrl] → Using local path (will prefix domain):', thumbnailUrl);
      return thumbnailUrl;
    }
    // Unexpected format - log and use anyway
    console.log('[getThumbnailUrl] → Unexpected format, using anyway:', thumbnailUrl);
    return thumbnailUrl;
  }

  // 2. YouTube thumbnail as fallback when no URL is stored
  if (youtubeVideoId) {
    const ytUrl = `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    console.log('[getThumbnailUrl] → No thumbnailUrl stored, falling back to YouTube:', ytUrl);
    return ytUrl;
  }

  // 3. Nothing available
  console.log('[getThumbnailUrl] → No thumbnail available');
  return null;
}
