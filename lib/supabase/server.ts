/**
 * SERVER ONLY - Supabase Service Client
 *
 * This file uses the service_role key which bypasses Row Level Security (RLS).
 * NEVER import this file from client components.
 * NEVER export createServiceClient from lib/supabase/index.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with service role credentials.
 * Creates a fresh client per request (serverless-safe).
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Get the storage bucket name for talk thumbnails.
 */
export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'talk-thumbnails';
}

/**
 * Get the card images bucket name (hardcoded since it's static).
 */
export function getCardImagesBucket(): string {
  return 'card-images';
}

/**
 * Construct a public URL for a file in the talk thumbnails bucket.
 */
export function getPublicStorageUrl(filename: string, bucket?: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = bucket || getStorageBucket();
  return `${url}/storage/v1/object/public/${bucketName}/${filename}`;
}

/**
 * Check if a URL is from Supabase Storage (any bucket).
 */
export function isSupabaseStorageUrl(url: string | null): boolean {
  if (!url) return false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabase = supabaseUrl ? url.startsWith(`${supabaseUrl}/storage/`) : false;
  console.log('[isSupabaseStorageUrl]', {
    url: url?.substring(0, 60) + '...',
    supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    isSupabase,
  });
  return isSupabase;
}

/**
 * Check if a URL is a legacy local path (e.g., /images/talks/...).
 */
export function isLocalPath(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith('/images/');
}
