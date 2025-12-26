/**
 * Supabase Module - Public Exports
 *
 * SECURITY: Only export URL helper functions that are safe for client-side use.
 * NEVER export createServiceClient or storage mutation functions here.
 *
 * For server-side operations, import directly from:
 * - '@/lib/supabase/server' (for createServiceClient)
 * - '@/lib/supabase/storage' (for upload/download operations)
 */

export {
  isSupabaseStorageUrl,
  isLocalPath,
  getPublicStorageUrl,
  getStorageBucket,
  getCardImagesBucket,
} from './server';
