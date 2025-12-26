/**
 * Image Download & Upload Utilities
 *
 * Downloads images from external URLs and uploads them to Supabase Storage.
 * Replaces the previous filesystem-based approach which doesn't work on Vercel.
 */

import { downloadAndUploadImage } from '@/lib/supabase/storage';

/**
 * Download an image from a URL and upload it to Supabase Storage
 * @param imageUrl - The URL of the image to download
 * @param filename - The filename to use (will be used as the storage key)
 * @param bucket - Optional bucket name (defaults to talk-thumbnails)
 * @returns The Supabase Storage public URL or null if failed
 */
export async function downloadImage(
  imageUrl: string,
  filename: string,
  bucket?: string
): Promise<string | null> {
  const result = await downloadAndUploadImage(imageUrl, filename, bucket);

  if (result.success && result.url) {
    console.log(`✅ Uploaded to Supabase: ${result.url}`);
    return result.url;
  }

  console.error(`❌ Failed to upload: ${result.error}`);
  return null;
}

/**
 * Download a talk thumbnail and upload to Supabase Storage
 * @param talkId - The ID of the talk (used as filename)
 * @param imageUrl - The URL of the thumbnail
 * @returns The Supabase Storage public URL or null if failed
 */
export async function downloadTalkThumbnail(
  talkId: string,
  imageUrl: string
): Promise<string | null> {
  return downloadImage(imageUrl, talkId);
}
