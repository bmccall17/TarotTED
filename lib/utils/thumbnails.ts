import { isSupabaseStorageUrl } from '@/lib/supabase';

/**
 * Get the best thumbnail URL for a talk
 *
 * Priority order:
 * 1. Supabase Storage URLs (our controlled, reliable storage)
 * 2. YouTube thumbnails (reliable fallback)
 * 3. Any other stored URL (external URLs that haven't been migrated)
 */
export function getThumbnailUrl(
  thumbnailUrl: string | null,
  youtubeVideoId: string | null
): string | null {
  // 1. Prefer Supabase Storage URLs (our controlled storage)
  if (thumbnailUrl && isSupabaseStorageUrl(thumbnailUrl)) {
    return thumbnailUrl;
  }

  // 2. YouTube thumbnail as reliable fallback
  if (youtubeVideoId) {
    return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }

  // 3. Fall back to whatever URL is stored
  return thumbnailUrl;
}
