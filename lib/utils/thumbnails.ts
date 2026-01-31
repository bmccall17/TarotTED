import { isSupabaseStorageUrl } from '@/lib/supabase';

/**
 * Get the best thumbnail URL for a talk
 *
 * Priority order:
 * 1. Supabase Storage URLs (our controlled, reliable storage)
 * 2. Any other stored full URL (http/https - external URLs or legacy)
 * 3. YouTube thumbnails (reliable fallback when no URL is set)
 * 4. Local paths (legacy, may not work)
 */
export function getThumbnailUrl(
  thumbnailUrl: string | null,
  youtubeVideoId: string | null
): string | null {
  // 1. Prefer Supabase Storage URLs (our controlled storage)
  if (thumbnailUrl && isSupabaseStorageUrl(thumbnailUrl)) {
    return thumbnailUrl;
  }

  // 2. Use any stored full URL (external URLs that haven't been migrated)
  if (thumbnailUrl && thumbnailUrl.startsWith('http')) {
    return thumbnailUrl;
  }

  // 3. YouTube thumbnail as fallback when no URL is explicitly set
  if (youtubeVideoId) {
    return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }

  // 4. Fall back to local paths (legacy, may need migration)
  return thumbnailUrl;
}
