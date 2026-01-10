 Supabase Storage Integration Plan (v2)

 Overview

 Migrate TarotTALKS from local filesystem image storage to Supabase Storage:
 - Talk thumbnails (public/images/talks/) → talk-thumbnails bucket
 - Card images (public/images/cards/) → card-images bucket

 The current implementation uses fs/promises.writeFile which doesn't work on Vercel's read-only filesystem.

 Image Inventory

 | Type            | Count | Size  | Bucket          | Behavior                 |
 |-----------------|-------|-------|-----------------|--------------------------|
 | Talk thumbnails | ~50+  | ~10MB | talk-thumbnails | Dynamic (admin uploads)  |
 | Card images     | 78    | ~40MB | card-images     | Static (one-time upload) |

 ---
 Security & Architecture Decisions

 Decision 1: Service Role Key Scope (CRITICAL)

 Choice: Server-Side Only, Never Exposed to Client

 The SUPABASE_SERVICE_ROLE_KEY bypasses Row Level Security (RLS). It must:
 - ONLY be used in server-side code (API routes, scripts)
 - NEVER be prefixed with NEXT_PUBLIC_
 - NEVER be imported in client components
 - Be instantiated fresh per-request (no long-lived singleton in serverless)

 // lib/supabase/server.ts - SERVER ONLY
 // This file should NEVER be imported from client components

 import { createClient } from '@supabase/supabase-js';

 export function createServiceClient() {
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

   if (!url || !key) {
     throw new Error('Missing Supabase server credentials');
   }

   // Create fresh client per request (serverless-safe)
   return createClient(url, key, {
     auth: { persistSession: false }
   });
 }

 Decision 2: Public Bucket (Read) with Protected Writes

 Choice: Public Bucket for Reads, Service Role for Writes

 Thumbnails are public-facing content. Anyone can view them via URL, but only server-side admin operations can write/delete.

 - Bucket visibility: Public (for CDN-friendly URLs)
 - Read access: Anyone with the URL (no signed URLs needed)
 - Write access: Service role only (server-side API routes)
 - Delete access: Service role only

 This means:
 - Frontend can use URLs directly in <img src="...">
 - No token/signature management for reads
 - All mutations go through our API routes

 Decision 3: Idempotency & Overwrite Strategy

 Choice: Upsert with Talk ID as Filename

 File naming: {talkId}.{extension} (e.g., abc123.jpg)

 Strategy:
 1. Same talk, new image: Overwrite existing file (upsert: true)
 2. Duplicate detection: Talk ID is unique, so filename collision = intentional update
 3. No orphan cleanup needed: One file per talk, always

 // Upsert behavior - overwrites if exists
 await storage.from(bucket).upload(filename, buffer, {
   upsert: true,  // Overwrite existing file with same name
   contentType: validatedContentType,
 });

 Decision 4: Content-Type Enforcement

 Choice: Validate MIME Type Before Upload

 Only allow image types. Reject anything else.

 const ALLOWED_CONTENT_TYPES = [
   'image/jpeg',
   'image/png',
   'image/webp',
   'image/gif',
 ] as const;

 type AllowedContentType = typeof ALLOWED_CONTENT_TYPES[number];

 function validateContentType(contentType: string | null): AllowedContentType {
   if (!contentType) {
     throw new Error('Missing content-type header');
   }

   // Normalize (strip charset, etc.)
   const normalized = contentType.split(';')[0].trim().toLowerCase();

   if (!ALLOWED_CONTENT_TYPES.includes(normalized as AllowedContentType)) {
     throw new Error(`Invalid content type: ${contentType}. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
   }

   return normalized as AllowedContentType;
 }

 ---
 Supabase Storage Policies (SQL)

 Run these in Supabase Dashboard > SQL Editor to configure bucket access:

 -- ============================================
 -- STORAGE POLICIES FOR BOTH BUCKETS
 -- ============================================
 -- Run this AFTER creating both buckets in Dashboard

 -- Helper: Define which buckets are managed by this app
 -- (Reusable pattern for future buckets)

 -- ====== TALK-THUMBNAILS BUCKET ======
[done by me]
 -- 1. PUBLIC READ: Anyone can view talk thumbnails
 CREATE POLICY "Public read access for talk thumbnails"
 ON storage.objects FOR SELECT
 USING (bucket_id = 'talk-thumbnails');

 -- 2. SERVICE ROLE INSERT: Only server-side can upload
 CREATE POLICY "Service role can upload talk thumbnails"
 ON storage.objects FOR INSERT
 WITH CHECK (
   bucket_id = 'talk-thumbnails'
   AND auth.role() = 'service_role'
 );

 -- 3. SERVICE ROLE UPDATE: Only server-side can update
 CREATE POLICY "Service role can update talk thumbnails"
 ON storage.objects FOR UPDATE
 USING (bucket_id = 'talk-thumbnails')
 WITH CHECK (auth.role() = 'service_role');

 -- 4. SERVICE ROLE DELETE: Only server-side can delete
 CREATE POLICY "Service role can delete talk thumbnails"
 ON storage.objects FOR DELETE
 USING (
   bucket_id = 'talk-thumbnails'
   AND auth.role() = 'service_role'
 );

 -- ====== CARD-IMAGES BUCKET ======
[done by me]

 -- 1. PUBLIC READ: Anyone can view card images
 CREATE POLICY "Public read access for card images"
 ON storage.objects FOR SELECT
 USING (bucket_id = 'card-images');

 -- 2. SERVICE ROLE INSERT: Only server-side can upload
 CREATE POLICY "Service role can upload card images"
 ON storage.objects FOR INSERT
 WITH CHECK (
   bucket_id = 'card-images'
   AND auth.role() = 'service_role'
 );

 -- 3. SERVICE ROLE UPDATE: Only server-side can update
 CREATE POLICY "Service role can update card images"
 ON storage.objects FOR UPDATE
 USING (bucket_id = 'card-images')
 WITH CHECK (auth.role() = 'service_role');

 -- 4. SERVICE ROLE DELETE: Only server-side can delete
 CREATE POLICY "Service role can delete card images"
 ON storage.objects FOR DELETE
 USING (
   bucket_id = 'card-images'
   AND auth.role() = 'service_role'
 );

 Bucket Configuration (Supabase Dashboard > Storage > Settings):

 | Setting            | talk-thumbnails      | card-images          |
 |--------------------|----------------------|----------------------|
 | Public bucket      | Yes                  | Yes                  |
 | File size limit    | 5MB                  | 2MB                  |
 | Allowed MIME types | jpeg, png, webp, gif | jpeg, png, webp, gif |

 ---
 Pre-Requisite: Supabase Storage Buckets

 Status: Both buckets already exist (user confirmed)

 | Bucket          | Purpose                       | Status  |
 |-----------------|-------------------------------|---------|
 | talk-thumbnails | Dynamic talk images           | Created |
 | card-images     | Static tarot card images (78) | Created |

 Credentials from Project Settings > API:
 - Project URL → NEXT_PUBLIC_SUPABASE_URL
 - service_role key → SUPABASE_SERVICE_ROLE_KEY (NEVER prefix with NEXT_PUBLIC_)
 - Bucket name → SUPABASE_STORAGE_BUCKET (value: talk-thumbnails)

 ---
 Implementation Phases

 Phase 1: Install Dependencies & Environment Setup

 1.1 Install package:
 npm install @supabase/supabase-js
[done by me]

 1.2 Update .env.example - Add:
 # Supabase Storage Configuration
 NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
 SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
 SUPABASE_STORAGE_BUCKET="talk-thumbnails"
[done by me]

 ---
 Phase 2: Create Supabase Server Utilities

 Create: lib/supabase/server.ts (SERVER-ONLY - never import from client)
 // SERVER ONLY - This file uses service_role key
 import { createClient, SupabaseClient } from '@supabase/supabase-js';

 export function createServiceClient(): SupabaseClient {
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

   if (!url || !key) {
     throw new Error('Missing Supabase credentials');
   }

   return createClient(url, key, {
     auth: { persistSession: false }
   });
 }

 export function getStorageBucket(): string {
   return process.env.SUPABASE_STORAGE_BUCKET || 'talk-thumbnails';
 }

 export function getPublicStorageUrl(filename: string): string {
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const bucket = getStorageBucket();
   return `${url}/storage/v1/object/public/${bucket}/${filename}`;
 }

 export function isSupabaseStorageUrl(url: string | null): boolean {
   if (!url) return false;
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   return supabaseUrl ? url.startsWith(supabaseUrl) : false;
 }

 export function isLocalPath(url: string | null): boolean {
   if (!url) return false;
   return url.startsWith('/images/');
 }

 Create: lib/supabase/storage.ts (SERVER-ONLY)
 import { createServiceClient, getStorageBucket, getPublicStorageUrl } from './server';

 const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
 type AllowedContentType = typeof ALLOWED_CONTENT_TYPES[number];

 function validateContentType(contentType: string | null): AllowedContentType {
   if (!contentType) throw new Error('Missing content-type');
   const normalized = contentType.split(';')[0].trim().toLowerCase();
   if (!ALLOWED_CONTENT_TYPES.includes(normalized as AllowedContentType)) {
     throw new Error(`Invalid content type: ${contentType}`);
   }
   return normalized as AllowedContentType;
 }

 function getExtensionFromContentType(contentType: AllowedContentType): string {
   const map: Record<AllowedContentType, string> = {
     'image/jpeg': 'jpg',
     'image/png': 'png',
     'image/webp': 'webp',
     'image/gif': 'gif',
   };
   return map[contentType];
 }

 export async function uploadImageBuffer(
   buffer: ArrayBuffer,
   talkId: string,
   contentType: string
 ): Promise<{ success: boolean; url?: string; error?: string }> {
   try {
     const validatedType = validateContentType(contentType);
     const ext = getExtensionFromContentType(validatedType);
     const filename = `${talkId}.${ext}`;

     const supabase = createServiceClient();
     const bucket = getStorageBucket();

     const { error } = await supabase.storage
       .from(bucket)
       .upload(filename, buffer, {
         contentType: validatedType,
         upsert: true, // Overwrite if exists
       });

     if (error) throw error;

     return { success: true, url: getPublicStorageUrl(filename) };
   } catch (err) {
     return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
   }
 }

 export async function downloadAndUploadImage(
   imageUrl: string,
   talkId: string
 ): Promise<{ success: boolean; url?: string; error?: string }> {
   try {
     const response = await fetch(imageUrl);
     if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

     const contentType = response.headers.get('content-type');
     const buffer = await response.arrayBuffer();

     return uploadImageBuffer(buffer, talkId, contentType);
   } catch (err) {
     return { success: false, error: err instanceof Error ? err.message : 'Download failed' };
   }
 }

 export async function deleteImage(filename: string): Promise<boolean> {
   const supabase = createServiceClient();
   const { error } = await supabase.storage.from(getStorageBucket()).remove([filename]);
   return !error;
 }

 Create: lib/supabase/index.ts - Public exports (URL helpers only)
 // Only export URL helpers for client-side use
 // NEVER export createServiceClient or storage functions here
 export { isSupabaseStorageUrl, isLocalPath, getPublicStorageUrl } from './server';

 ---
 Phase 3: Rewrite Core Image Utility

 Modify: lib/utils/download-image.ts

 Replace filesystem operations with Supabase Storage upload:

 import { downloadAndUploadImage } from '@/lib/supabase/storage';

 export async function downloadImage(imageUrl: string, filename: string): Promise<string | null> {
   const result = await downloadAndUploadImage(imageUrl, filename);
   return result.success ? result.url : null;
 }

 export async function downloadTalkThumbnail(talkId: string, imageUrl: string): Promise<string | null> {
   return downloadImage(imageUrl, talkId);
 }

 No changes needed to API routes - they already call downloadTalkThumbnail():
 - app/api/admin/talks/[id]/route.ts
 - app/api/admin/validation/fix/route.ts

 ---
 Phase 4: Update Validation Logic

 Modify: lib/db/queries/admin-validation.ts

 Update getExternalThumbnails() function to detect non-Supabase URLs:

 import { isSupabaseStorageUrl } from '@/lib/supabase';

 async function getExternalThumbnails() {
   const allTalks = await db.select(...).from(talks).where(...);

   // Filter to only those NOT in Supabase Storage
   return allTalks.filter(talk => !isSupabaseStorageUrl(talk.thumbnailUrl));
 }

 ---
 Phase 5: Update Thumbnail URL Utility

 Modify: lib/utils/thumbnails.ts

 Add Supabase URL priority:

 import { isSupabaseStorageUrl } from '@/lib/supabase';

 export function getThumbnailUrl(thumbnailUrl: string | null, youtubeVideoId: string | null): string | null {
   // 1. Prefer Supabase Storage URLs (our controlled storage)
   if (thumbnailUrl && isSupabaseStorageUrl(thumbnailUrl)) {
     return thumbnailUrl;
   }
   // 2. YouTube thumbnail as reliable fallback
   if (youtubeVideoId) {
     return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
   }
   // 3. Fall back to stored URL
   return thumbnailUrl;
 }

 ---
 Phase 6: Update Next.js Config

 Modify: next.config.ts

 Add Supabase domain to allowed image hosts:

 remotePatterns: [
   { protocol: 'https', hostname: 'pi.tedcdn.com' },
   { protocol: 'https', hostname: 'i.ytimg.com' },
   { protocol: 'https', hostname: '*.supabase.co' },  // ADD THIS
 ],

 ---
 Phase 7: Create Migration Script

 Create: scripts/migrate-thumbnails-to-supabase.ts

 Migration script that:
 1. Finds all talks with local paths (/images/talks/...)
 2. Reads files from public/images/talks/
 3. Uploads to Supabase Storage
 4. Updates database with new Supabase URLs
 5. Then processes any remaining external URLs

 Run with: npx dotenv -e .env.local -- tsx scripts/migrate-thumbnails-to-supabase.ts

 ---
 Phase 8: Update Batch Scripts

 Modify: scripts/download-talk-thumbnails.ts
 - Update to use downloadAndUploadImage() from Supabase storage module
 - Update URL detection to skip already-migrated Supabase URLs

 ---
 Phase 9: Minor UI Updates

 Modify: components/admin/validation/modals/DownloadThumbnailModal.tsx
 - Update text from "download to local" to "upload to storage"

 ---
 Phase 10: Card Images Migration

 Create: scripts/migrate-cards-to-supabase.ts

 One-time migration script for static card images:
 1. Read all 78 card images from public/images/cards/
 2. Upload each to card-images bucket with slug as filename (e.g., the-fool.jpg)
 3. Update cards.image_url in database with Supabase URLs
 4. Log success/failure for each card

 // Example structure
 const CARD_IMAGES_BUCKET = 'card-images';

 async function migrateCardImages() {
   const cardFiles = await fs.readdir(LOCAL_CARDS_DIR);
   const imageFiles = cardFiles.filter(f => f.endsWith('.jpg'));

   for (const file of imageFiles) {
     const slug = file.replace('.jpg', '');
     const buffer = await fs.readFile(path.join(LOCAL_CARDS_DIR, file));

     // Upload to Supabase
     const { error } = await supabase.storage
       .from(CARD_IMAGES_BUCKET)
       .upload(file, buffer, {
         contentType: 'image/jpeg',
         upsert: true,
       });

     if (!error) {
       // Update database
       const publicUrl = getPublicStorageUrl(file, CARD_IMAGES_BUCKET);
       await db.update(cards)
         .set({ imageUrl: publicUrl })
         .where(eq(cards.slug, slug));
     }
   }
 }

 Run with: npx dotenv -e .env.local -- tsx scripts/migrate-cards-to-supabase.ts

 Key difference from talk thumbnails:
 - Card images are static (78 fixed images, never change at runtime)
 - No need for dynamic upload API - just one-time migration
 - Seed data (lib/db/seed-data/cards.ts) will need URLs updated after migration

 ---
 Files Summary

 New Files (5)

 | File                                      | Purpose                                          |
 |-------------------------------------------|--------------------------------------------------|
 | lib/supabase/server.ts                    | Supabase client (SERVER-ONLY) & URL utilities    |
 | lib/supabase/storage.ts                   | Storage upload/download operations (SERVER-ONLY) |
 | lib/supabase/index.ts                     | Safe exports for client use (URL helpers only)   |
 | scripts/migrate-thumbnails-to-supabase.ts | One-time talk thumbnail migration                |
 | scripts/migrate-cards-to-supabase.ts      | One-time card images migration (78 cards)        |

 Modified Files (7)

 | File                                | Changes                        |
 |-------------------------------------|--------------------------------|
 | package.json                        | Add @supabase/supabase-js      |
 | .env.example                        | Add 3 Supabase env vars        |
 | lib/utils/download-image.ts         | Rewrite to use Supabase upload |
 | lib/utils/thumbnails.ts             | Add Supabase URL priority      |
 | lib/db/queries/admin-validation.ts  | Update external URL detection  |
 | next.config.ts                      | Add Supabase to allowed hosts  |
 | scripts/download-talk-thumbnails.ts | Update to use Supabase         |

 Optional Updates

 | File                                                          | Changes            |
 |---------------------------------------------------------------|--------------------|
 | components/admin/validation/modals/DownloadThumbnailModal.tsx | Update button text |

 ---
 Post-Migration

 1. Verify all images display correctly:
   - Talk thumbnails on talk detail pages
   - Card images on card grid and detail pages
 2. Delete local image directories:
   - public/images/talks/
   - public/images/cards/
 3. Update .gitignore if needed
 4. Update seed data (lib/db/seed-data/cards.ts) with Supabase URLs for fresh deployments

 ---
 Rollback Plan

 If issues arise:
 1. Restore lib/utils/download-image.ts from git (original filesystem version)
 2. Database backup: thumbnail_url values can be restored
 3. Supabase Storage images can remain (no cost if unused)

 ---
 Environment Variables Summary

 | Variable                  | Purpose                     | Secret? |
 |---------------------------|-----------------------------|---------|
 | NEXT_PUBLIC_SUPABASE_URL  | Supabase project URL        | No      |
 | SUPABASE_SERVICE_ROLE_KEY | Admin access for uploads    | Yes     |
 | SUPABASE_STORAGE_BUCKET   | Talk thumbnails bucket name | No      |

 Note: Card images bucket (card-images) is hardcoded since it's static and never changes.