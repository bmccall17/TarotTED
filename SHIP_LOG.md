# 🚢 TarotTED Ship Log

A chronological record of major releases and feature deployments for TarotTED.

---

## v1.0.6 - Admin Portal Enhancement & UX Improvements ⚡
**Date:** December 28, 2024
**Status:** Deployed

### Overview
Major expansion of the admin portal with a complete Cards management section, visual relationship indicators, and improved navigation workflows. This release focuses on making the admin experience more intuitive and efficient through visual thumbnails, compact tables, and contextual navigation.

### ✨ New Features

#### **Cards Management Section**
- **Full CRUD for Cards**: Added complete Cards section to admin portal
  - Edit all card text content (meanings, symbolism, prompts, correspondences)
  - View card image and metadata alongside form fields
  - Track all mapped talks directly from card edit page
- **Quick Navigation**: "Manage Mappings" button jumps directly to Card-Talk Mappings with card pre-selected

#### **Visual Relationship Indicators**
- **Talk Thumbnails in Cards Table**: Shows up to 3 talk thumbnails per card
  - Clickable thumbnails navigate to Edit Talk
  - "+X" indicator for additional mappings
  - Hover tooltips show talk titles
- **Card Thumbnails in Talks Table**: Shows up to 3 card images per talk
  - Clickable thumbnails navigate to Edit Card
  - Visual indication of card-talk relationships
  - Immediate understanding of mapping coverage

#### **Mappings Deep-Linking**
- URL parameter support: `/admin/mappings?cardId={id}` auto-selects card
- "Manage Mappings" buttons on both Edit Card and Edit Talk pages
- Smart card selection for talks (prefers primary mapping)

### 🎨 UX Improvements

#### **Compact Table Views**
- **Manage Talks Table**: Removed slug display for cleaner, more compact view
  - Thumbnail now clickable to edit talk
  - Hover on row shows full talk title tooltip
  - External link icon (no text label)
  - Focus on visual scanning efficiency

#### **Enhanced Edit Layouts**
- **Edit Talk Page**: Moved action buttons to right column
  - Buttons positioned below Preview and Mapped Cards
  - Cleaner left column with form fields only
  - Better visual hierarchy and grouping
- **Edit Card Page**: Two-column layout with sidebar
  - Form content flows in left column (2/3 width)
  - Mapped Talks as sticky sidebar (1/3 width)
  - Better space utilization on desktop
  - Callout design highlights talk relationships

#### **Clickable Elements**
- Card thumbnails in Manage Cards table → Edit Card
- Talk thumbnails in Manage Talks table → Edit Talk
- Card thumbnails in mappings column → Edit Card
- Talk thumbnails in mappings column → Edit Talk

### 🔧 Technical Improvements

#### **Database Queries**
- Enhanced `getAllCardsForAdmin()` to fetch card mappings with talk thumbnails
- Enhanced `getAllTalksForAdmin()` to fetch talk mappings with card images
- Enhanced `getTalkByIdForAdmin()` to include card images
- Used efficient `inArray()` queries for batch fetching

#### **Component Architecture**
- New `CardForm` with two-column grid layout
- New `CardsList` and `CardRow` components
- Updated `MappingEditor` to support `initialSelectedCardId` prop
- Sticky positioning for sidebars on desktop

#### **Type Safety**
- Comprehensive TypeScript types for card/talk mappings
- Updated all admin component interfaces
- Zero type errors across admin portal

### 📊 Admin Portal Coverage

```
Manage Cards:     ✅ List, Edit, Mappings navigation
Manage Talks:     ✅ List, Edit, Create, Mappings navigation
Manage Mappings:  ✅ Deep-linking from Cards/Talks
Validation:       ✅ Data integrity checks
```

### 🎯 Impact

- **Faster Navigation**: One-click access to related entities via thumbnails
- **Visual Clarity**: Immediate understanding of card-talk relationships
- **Reduced Clicks**: Direct links from any view to any related entity
- **Better Space Usage**: Two-column layouts on desktop
- **Improved Workflow**: Contextual "Manage Mappings" buttons reduce navigation steps

---

## Scripts Directory Cleanup 🧹
**Date:** December 28, 2024
**Status:** Maintenance Complete

### Overview

Comprehensive audit and reorganization of the `/scripts` directory. Moved completed one-time migration scripts to archives, removed obsolete testing scripts, and identified the 7 active scripts that remain part of the ongoing workflow.

### 📊 Cleanup Summary

```
Total Scripts Audited:    33 files
Active (Kept):            7 scripts
Archived (Migrations):    18 scripts
Deleted (Obsolete):       8 scripts
```

### 🗂️ Scripts Directory Structure

**Before Cleanup:**
- 33 scripts in flat directory
- Mix of active, completed migrations, and test files
- Difficult to identify current vs. historical scripts

**After Cleanup:**
```
scripts/
├── Active Workflow (7 scripts)
│   ├── upsert-talks.ts
│   ├── upsert-mappings.ts
│   ├── upsert-card-themes.ts
│   ├── export-db-to-seed-files.ts
│   ├── manage-themes.ts
│   ├── restore-ted-thumbnails.ts
│   └── list-card-slugs.ts
│
└── archive/
    ├── migrations/              (8 scripts - schema changes)
    ├── legacy-local-storage/    (6 scripts - pre-Supabase)
    └── card-meanings/           (4 scripts - v1.2.0 import)
```

### ✅ Active Scripts (7 Kept)

Scripts that remain part of the ongoing content management workflow:

| Script | Purpose | Reason to Keep |
|--------|---------|----------------|
| `upsert-talks.ts` | Bulk import talks from seed files | Admin portal only handles one-at-a-time |
| `upsert-mappings.ts` | Bulk import card-to-talk mappings | Admin portal only handles one-at-a-time |
| `upsert-card-themes.ts` | Assign cards to themes | Theme management UI = 0% (deferred to v0.3.0+) |
| `export-db-to-seed-files.ts` | Export DB to version-controlled seed files | No export feature in admin portal |
| `manage-themes.ts` | Interactive CLI for theme CRUD | No theme admin UI exists yet |
| `restore-ted-thumbnails.ts` | Bulk restore TED.com thumbnails | Bulk operations not in admin portal |
| `list-card-slugs.ts` | Export card slugs for content creation | Utility script |

**Key Finding:** Admin portal (v0.2.0) only supports **one-at-a-time** operations. No bulk/batch features exist yet (deferred to v0.3.0+). Scripts remain essential for bulk operations and theme management.

### 📦 Archived Scripts (18 Moved to `scripts/archive/`)

#### Migrations (8 scripts) → `scripts/archive/migrations/`
Completed database schema changes:
- `migrate-thumbnails-to-supabase.ts` - ✅ 81/81 talks migrated (v1.0.5)
- `migrate-cards-to-supabase.ts` - ✅ 78/78 cards migrated (v1.0.5)
- `add-youtube-video-id-field.ts` - ✅ Schema change complete (v1.1.0)
- `add-youtube-video-id-to-talk.ts` - ✅ Manual tool (superseded)
- `auto-populate-youtube-ids.ts` - ✅ 62 video IDs populated (v1.1.0)
- `apply-migration-0002.ts` - ✅ Migration applied (v0.2.0)
- `complete-migration-0002.ts` - ✅ Migration completed (v0.2.0)
- `verify-migration.ts` - ✅ Migration verified (v0.2.0)

#### Legacy Local Storage (6 scripts) → `scripts/archive/legacy-local-storage/`
Pre-Supabase filesystem-based thumbnail management:
- `download-talk-thumbnails.ts` - Superseded by Supabase Storage (v1.0.5)
- `update-talk-thumbnails.ts` - Superseded by Supabase Storage
- `verify-and-fix-thumbnails.ts` - Superseded by Supabase Storage
- `fetch-thumbnails.ts` - Superseded by specific fetchers
- `fetch-youtube-metadata.ts` - Replaced by admin portal MetadataFetcher
- `fetch-ted-thumbnails.ts` - Replaced by admin portal MetadataFetcher

#### Card Meanings Import (4 scripts) → `scripts/archive/card-meanings/`
One-time card data migration (v1.2.0):
- `import-card-meanings-from-jsonl.ts` - ✅ 78/78 cards imported
- `update-cards-seed-from-json.ts` - ✅ Seed file generated
- `restore-all-card-meanings.ts` - ✅ Data loss recovery complete
- `seed-cards-only.ts` - ✅ Cards table frozen (read-only)

**Note:** Cards table is now **frozen** per SHIP_LOG v1.2.0. All 78 cards complete with full meanings.

### 🗑️ Deleted Scripts (8 Removed)

#### Test/Debugging Scripts (5 deleted)
Never committed, one-time environment validation:
- `test-new-service-key.ts` - Supabase key validation (one-time)
- `check-key-format.ts` - API key format check (one-time)
- `check-both-env-files.ts` - Environment comparison (one-time)
- `test-youtube-api.ts` - YouTube API connection test (one-time)
- `test-json-parsing.py` - Python parser test (not part of TS workflow)

#### Redundant Scripts (3 deleted)
Functionality replaced by admin portal:
- `fetch-youtube-metadata.ts` - Admin portal MetadataFetcher handles this
- `fetch-ted-thumbnails.ts` - Admin portal MetadataFetcher handles this
- (One additional untracked test script)

### 📝 Documentation Created

**`devnotes/SCRIPTS_AUDIT_2024-12-28.md`**
- Complete analysis of all 33 scripts
- Categorization by status (active/archive/delete)
- Rationale for each decision
- Comparison of admin portal vs. script capabilities

### 🎯 Why Archive Instead of Delete?

Migration scripts preserved for:
1. **Historical record** - Documents schema evolution
2. **Future reference** - Template for similar migrations
3. **Rollback scenarios** - Understanding what changed
4. **Onboarding** - New developers can see codebase evolution

### 🔮 Impact

**For Developers:**
- Clear separation: active workflow vs. historical migrations
- Easy to identify which scripts to use
- Archive preserves institutional knowledge

**For Content Managers:**
- 7 active scripts for bulk operations
- Theme management via CLI until admin UI built
- Export workflow maintains version-controlled seed files

**For Project Maintenance:**
- Reduced clutter in main scripts directory
- Git history intact for all files
- Clear organization for future additions

---

## v1.0.5 - Supabase Storage Integration ☁️
**Release Date:** December 26, 2024
**Status:** Production Ready

### Overview

Migrated all image storage from local filesystem to Supabase Storage. This fixes the critical issue where image uploads failed on Vercel's read-only filesystem, enabling reliable thumbnail management in production.

### 🚀 What Changed

#### Problem Solved
- **Vercel's read-only filesystem** prevented saving images via `fs/promises.writeFile`
- Admin "Download to Local" showed success but images never persisted
- Database URLs pointed to non-existent local paths

#### Solution: Supabase Storage
- **Talk thumbnails** → `talk-thumbnails` bucket (~50+ images)
- **Card images** → `card-images` bucket (78 images, ~40MB)
- Both buckets configured as **public** for CDN-friendly URLs
- Service role key used server-side only (never exposed to client)

### 📁 New Files

| File | Purpose |
|------|---------|
| `lib/supabase/server.ts` | Service client & URL utilities (SERVER-ONLY) |
| `lib/supabase/storage.ts` | Upload/download operations (SERVER-ONLY) |
| `lib/supabase/index.ts` | Safe exports for client use |
| `scripts/migrate-thumbnails-to-supabase.ts` | Talk thumbnail migration |
| `scripts/migrate-cards-to-supabase.ts` | Card images migration |

### 🔧 Modified Files

| File | Changes |
|------|---------|
| `lib/utils/download-image.ts` | Now uploads to Supabase instead of filesystem |
| `lib/utils/thumbnails.ts` | Prioritizes Supabase URLs over YouTube fallback |
| `lib/db/queries/admin-validation.ts` | Excludes Supabase URLs from "external" check |
| `next.config.ts` | Added `*.supabase.co` to allowed image hosts |
| `scripts/download-talk-thumbnails.ts` | Updated for Supabase uploads |
| `components/admin/validation/modals/DownloadThumbnailModal.tsx` | Updated UI text |

### 🔒 Security Architecture

1. **Service Role Key**: Server-side only, never prefixed with `NEXT_PUBLIC_`
2. **Public Buckets**: Read access for anyone, write access via service role only
3. **Content-Type Validation**: Only allows jpeg, png, webp, gif
4. **Upsert Strategy**: Uses talk ID as filename, overwrites on update

### 📊 Migration Results

```
Talk Thumbnails: Migrated to talk-thumbnails bucket
Card Images:     78/78 migrated to card-images bucket
Total Storage:   ~50MB in Supabase Storage
Bucket Access:   Both set to public: true
```

### 🎯 Impact

**For Admins:**
- "Upload to Storage" now works in production
- Validation dashboard correctly identifies external URLs
- Thumbnails persist after upload

**For Users:**
- Faster image loading via Supabase CDN
- No more broken thumbnail links
- Consistent image availability

**For Infrastructure:**
- Works on Vercel's read-only filesystem
- Images stored in managed cloud storage
- Automatic CDN distribution

### 🔮 Post-Migration Cleanup

Optional steps (not yet done):
- Delete `public/images/talks/` directory
- Delete `public/images/cards/` directory
- Update `lib/db/seed-data/cards.ts` with Supabase URLs for fresh deployments

---

## v1.0.4 - Local Image Storage & Admin UX Improvements 🖼️
**Release Date:** December 25, 2024
**Status:** Production Ready

### Overview

This release introduces a local image storage system for talk thumbnails, eliminating dependency on external CDNs. Also includes critical fixes for frontend caching that was preventing admin changes from appearing, and smart UX improvements to the thumbnail management workflow.

### 🖼️ Local Image Storage System

#### Why Local Storage?
- **Prevents broken links** - External URLs can change or be removed
- **Faster loading** - Images served from same domain
- **Full control** - No reliance on third-party CDNs (TED, YouTube)

#### New Infrastructure
- **Storage location:** `public/images/talks/`
- **File naming:** `{talk-id}.{extension}` (jpg, png, webp)
- **Accessible at:** `/images/talks/{filename}`

#### Automatic Download on Save
When creating or updating talks via admin portal:
1. If `thumbnailUrl` starts with `http://` or `https://`, it's automatically downloaded
2. Image saved to `public/images/talks/{talk-id}.{ext}`
3. Database updated to point to local path

**Files Created:**
- `lib/utils/download-image.ts` - Download utility functions
- `scripts/download-talk-thumbnails.ts` - Bulk migration script
- `public/images/talks/README.md` - Documentation

**Files Modified:**
- `app/api/admin/talks/route.ts` - Auto-download on create
- `app/api/admin/talks/[id]/route.ts` - Auto-download on update

#### Migration Results
```
Talks migrated:    67/78 (86% success)
Failed:            11 (CDN restrictions - kept external URLs)
Images downloaded: 67 files to public/images/talks/
Database updated:  67 records with local paths
```

### 🎨 Smart Thumbnail Display (Admin UX)

The Thumbnail field in Edit Talk now intelligently adapts based on content:

#### Three Display Modes

**1. Local Image (Green Badge)**
- Shows when URL starts with `/images/talks/`
- Green "Using Local Image" badge with ✓ checkmark
- Preview of the local image
- "Clear & use new URL" option if replacement needed

**2. External URL (Blue Link)**
- Shows when URL starts with `http://` or `https://`
- Editable URL input field with preview
- Clear (X) button to remove
- Helpful message: "This will be downloaded when you save"

**3. Empty (Gray Placeholder)**
- Shows when no thumbnail is set
- Empty input with hint to use Fetch Metadata
- Gray icon indicator

#### Workflow
1. **Fetch Metadata** → Gets external URL
2. **Apply Fields** → Form shows external URL (blue mode)
3. **Save** → System downloads image automatically
4. **Edit again** → Shows green "Local Image" badge

### ⚡ Critical Caching Fixes

#### Problem
Admin changes to talks were not appearing on the frontend. Database showed correct data, but pages served stale content.

#### Root Cause
Pages were using Incremental Static Regeneration (ISR) with long cache times:
- Talk pages: 1 hour cache
- Card pages: 60 second cache
- Themes pages: 1 hour cache
- Some pages: No revalidation (static forever)

#### Solution
Set `revalidate = 0` on all frontend pages and `no-store` on API routes:

**Pages Fixed:**
- `app/talks/[slug]/page.tsx` - 3600s → 0
- `app/talks/page.tsx` - 3600s → 0
- `app/cards/[slug]/page.tsx` - 60s → 0
- `app/cards/page.tsx` - Added revalidate = 0
- `app/themes/[slug]/page.tsx` - 3600s → 0
- `app/themes/page.tsx` - Added revalidate = 0

**API Routes Fixed:**
- `app/api/search/route.ts` - max-age:300 → no-store
- `app/api/random-card/route.ts` - Added no-store headers

**Impact:** Admin changes now appear immediately on frontend refresh.

### 🔧 Admin Mappings Count Fix

#### Problem
Mappings count showed "0" when searching for talks in admin portal.

#### Root Cause
`searchTalksForAdmin()` query was missing the `mappingsCount` SQL subquery that existed in `getAllTalksForAdmin()`.

#### Solution
Added mappingsCount subquery to `lib/db/queries/admin-talks.ts`:
```typescript
mappingsCount: sql<number>`(
  SELECT COUNT(*)::int
  FROM card_talk_mappings
  WHERE card_talk_mappings.talk_id = talks.id
)`
```

**Impact:** Mappings column now shows correct count when searching talks.

### 🚧 Known Issue: Edit Talk Navigation

#### Symptom
Next.js Link components don't respond to clicks on the Edit Talk page. Hover states work, but clicks do nothing. Affects both Chrome and Edge.

#### Workaround Implemented
Added a prominent "BACK TO TALKS" button (using regular `<a>` tag) at the top of Edit Talk pages. This works because:
- ✅ Regular `<a>` tags work
- ✅ `window.location` navigation works
- ❌ Next.js `<Link>` components don't work (under investigation)

**Location:** `app/admin/layout.tsx` - Shows only on `/edit` pages

#### Investigation Notes
- Converted AdminNav from Link to div+router.push → Still broken
- Converted Edit page to client component → Still broken
- Issue is specific to Next.js Link/router on this page
- Root cause TBD in future release

### 📊 Summary

```
New Files:           4
Modified Files:      12
Images Downloaded:   67
Database Updates:    67 talks with local paths
Cache Fix:           8 pages + 2 APIs
```

### 🎯 Impact

**For Admins:**
- Changes appear immediately (no more waiting for cache)
- Smart thumbnail display shows what's actually being used
- Mappings counts accurate when searching
- Can navigate away from Edit Talk page (workaround button)

**For Users:**
- Faster image loading (same domain)
- No broken thumbnail links
- Always see latest content

**For Reliability:**
- Images stored locally - no external dependencies
- 67 talks no longer depend on TED/YouTube CDN availability

### 🔮 What's Next

**Immediate (v1.0.5):**
- Investigate and fix Next.js Link issue on Edit Talk page
- Remove workaround button once fixed

**Future:**
- Re-run migration script for 11 failed thumbnails
- Consider image optimization (WebP conversion, resizing)

---

## v1.0.2 - Security Hardening & Performance Optimization 🔒
**Release Date:** December 24, 2024
**Status:** Production Ready

### Overview

Critical security and performance improvements following comprehensive application audit. This release addresses 8 quick-win issues across security, performance, and functional categories, plus deployment fixes and database connection stabilization.

### 🔒 Security Improvements

#### HTTP Security Headers
- **Added Security Headers** to `next.config.ts`
  - `X-Frame-Options: DENY` - Prevents clickjacking attacks
  - `X-Content-Type-Options: nosniff` - Prevents MIME-type sniffing
  - `Referrer-Policy: origin-when-cross-origin` - Controls referrer information
  - `X-XSS-Protection: 1; mode=block` - Legacy XSS protection
- **Impact:** Improves security posture against common web vulnerabilities

#### Debug Endpoint Removed
- **Deleted `/api/admin/test-token` route** that was exposing token information
- **Risk:** Endpoint was leaking first/last 10 characters of admin token
- **Impact:** Eliminates potential attack vector for token discovery

#### Error Message Information Leak Fixed
- **YouTube API Error Messages** (`/app/api/admin/fetch-metadata/route.ts`)
  - Before: "YouTube API key is invalid - check Vercel environment variables"
  - After: "Unable to fetch metadata - API configuration error"
  - Before: "API key has IP/referrer restrictions - remove restrictions in Google Cloud Console"
  - After: "Unable to fetch metadata - API access restricted"
- **Impact:** Prevents implementation detail leakage to potential attackers

### ⚡ Performance Improvements

#### Cache Revalidation Optimization
- **Increased ISR revalidation times** from 60 seconds to 3600 seconds (1 hour)
- **Files Updated:**
  - `app/cards/[slug]/page.tsx` - Card detail pages
  - `app/talks/page.tsx` - Talks list
  - `app/talks/[slug]/page.tsx` - Talk detail pages
  - `app/themes/[slug]/page.tsx` - Theme detail pages
- **Rationale:** Card/talk data rarely changes; 60-second revalidation caused unnecessary overhead
- **Impact:** Reduced server load and faster page loads for repeat visitors

#### API Response Caching
- **Added Cache-Control headers** to search API (`/app/api/search/route.ts`)
  - `Cache-Control: public, max-age=300, stale-while-revalidate=600`
  - 5-minute cache, 10-minute stale serving window
- **Impact:** Reduces database queries for repeated searches, improves response time

### 🛠️ Functional Fixes

#### Null-Safe JSON Parsing
- **Protected all JSON.parse() calls** with null checks across 4 files:
  - `app/cards/[slug]/page.tsx`
  - `app/search/page.tsx`
  - `app/talks/[slug]/page.tsx`
  - Pattern: `const keywords = card.keywords ? JSON.parse(card.keywords) : [];`
- **Impact:** Prevents crashes on malformed or null data

#### Dead Link Prevention
- **Replaced `href="#"` fallbacks** with disabled button states
- **Files Updated:**
  - `app/cards/[slug]/page.tsx` - "Watch Talk" button
  - `app/talks/[slug]/page.tsx` - Thumbnail banner, "Watch on TED" button
- **Implementation:** Conditional rendering instead of non-functional links
  ```tsx
  {(talk.tedUrl || talk.youtubeUrl) ? (
    <a href={...}>Watch on TED</a>
  ) : (
    <div className="cursor-not-allowed">No Video Available</div>
  )}
  ```
- **Impact:** Better UX, prevents confusing dead links

#### Search Results Enhancement
- **Added `youtubeUrl` to search results**
- **Files Updated:**
  - `lib/db/queries/search.ts` - Added field to type interface and query
  - `app/search/page.tsx` - Updated component interface
- **Impact:** YouTube-only talks can now be watched directly from search results

### 🚀 Deployment Fixes

#### Admin Dashboard Build Timeout
- **Problem:** Admin dashboard timing out during static generation (>60 seconds)
- **Root Cause:** Complex database queries running at build time
- **Solution:** Added `export const dynamic = 'force-dynamic'` to `/app/admin/page.tsx`
- **Impact:** Admin dashboard now renders on-demand (correct behavior for authenticated pages)

#### Admin Dashboard Error Handling
- **Added comprehensive error handling** with try-catch wrapper
- **Error Display:** User-friendly error page with:
  - Error message (instead of generic production error)
  - Possible causes (database connection, env vars, timeouts)
  - Helpful debugging information
- **Impact:** Better developer experience when troubleshooting issues

#### TypeScript Type Errors Fixed
- **Problem:** `href` attribute expecting `string | undefined`, receiving `string | null`
- **Files Fixed:**
  - `app/cards/[slug]/page.tsx:156` - Type assertion for Watch Talk link
  - `app/talks/[slug]/page.tsx:67` - Type assertion for thumbnail banner
  - `app/talks/[slug]/page.tsx:131` - Type assertion for Watch on TED button
- **Solution:** Added `as string` type assertions within truthy conditional checks
- **Impact:** Build succeeds without TypeScript errors

#### Database Connection Stabilization
- **Integration:** Supabase-Vercel integration configured
- **Auto-synced Environment Variables:**
  - `POSTGRES_URL` / `DATABASE_URL` automatically updated
  - Other Supabase credentials synced to Vercel
- **Impact:** Admin dashboard reconnected, all queries working in production

### 🧹 Environment Cleanup

#### Removed Unused Supabase Variables
- **Confirmed safe to delete** from `.env.local`:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SECRET_KEY`
- **Verification:** Grepped entire codebase - zero usage in application code
- **Reason:** App uses Postgres via Drizzle ORM, not Supabase Auth/Client SDK
- **Impact:** Cleaner environment configuration, reduced confusion

### 📊 Audit Results

Comprehensive application audit completed on December 23, 2024. Full findings documented in `devnotes/APPLICATION_AUDIT_2024-12-23.md`.

**Issues Fixed (8 Quick Wins):**
- ✅ Security: Removed test-token debug endpoint (HIGH)
- ✅ Security: Added HTTP security headers (MEDIUM)
- ✅ Security: Fixed API error message leaks (MEDIUM)
- ✅ Performance: Increased cache revalidation times (MEDIUM)
- ✅ Performance: Added API response caching (MEDIUM)
- ✅ Functional: Protected JSON.parse() calls (MEDIUM)
- ✅ Functional: Fixed dead links (MEDIUM)
- ✅ Functional: Added youtubeUrl to search (LOW)

**Remaining Issues (Documented for Future):**
- 🔴 Critical: Secrets in git history, rate limiting, timing attack vulnerability
- 🟡 High: Database indexes, N+1 queries, image optimization
- 🟠 Medium: Custom error pages, theme management UI

### 🔧 Technical Implementation

#### Files Created
None (all changes to existing files)

#### Files Modified
```
Security:
- next.config.ts (security headers)
- app/api/admin/fetch-metadata/route.ts (error messages)
- Deleted: app/api/admin/test-token/route.ts

Performance:
- app/cards/[slug]/page.tsx (revalidation, null-checks, dead links, type fixes)
- app/talks/page.tsx (revalidation)
- app/talks/[slug]/page.tsx (revalidation, null-checks, dead links, type fixes)
- app/themes/[slug]/page.tsx (revalidation)
- app/api/search/route.ts (cache headers)

Functional:
- app/search/page.tsx (youtubeUrl, null-checks)
- lib/db/queries/search.ts (youtubeUrl)

Deployment:
- app/admin/page.tsx (force-dynamic, error handling)
```

### 📝 Breaking Changes
None. All changes are backwards compatible.

### 🎯 Success Metrics

**Security:**
- HTTP security headers on all routes
- No token information leakage
- Generic error messages in production

**Performance:**
- 60× longer cache revalidation (60s → 3600s)
- 5-minute API response caching
- Reduced database query load

**Stability:**
- Zero TypeScript compilation errors
- Admin dashboard renders successfully
- All pages build without timeouts

**Code Quality:**
- Null-safe JSON parsing across codebase
- Type-safe href attributes
- Proper error boundaries

### 🔮 What's Next

**Security Priorities (Critical):**
- Rotate ADMIN_TOKEN (exposed in git history)
- Implement rate limiting for admin login
- Fix timing attack vulnerability in token comparison

**Performance Priorities (High):**
- Add database indexes for foreign keys
- Fix N+1 queries in getAllTalks() and getAllThemes()
- Replace `<img>` with `<Image>` component for thumbnails

**Feature Priorities (Medium):**
- Custom error pages (error.tsx, not-found.tsx)
- Theme management admin interface
- Cache-Control headers for static assets

See `devnotes/APPLICATION_AUDIT_2024-12-23.md` for complete prioritized action plan.

---

## v1.0.1 - Analytics & Production Polish 📊
**Release Date:** December 23, 2024
**Status:** Production Ready

### Overview

Added Vercel Web Analytics for page view tracking, Speed Insights for performance monitoring, and polished the admin portal UX. This release establishes observability for understanding user behavior while maintaining privacy compliance.

### 📊 Analytics Implementation

#### Vercel Web Analytics
- **Automatic page view tracking** for all public routes
- **Privacy-friendly** - no cookies required, GDPR-compliant by default
- **Admin exclusion** - `/admin/*` routes completely excluded from tracking
- **Client-side wrapper** - `AnalyticsProvider` component handles route-based filtering

#### Speed Insights
- **Core Web Vitals monitoring** (LCP, FID, CLS)
- **Performance by route** - identify slow pages
- **Already enabled** on Vercel dashboard

#### What's Tracked
| Route | Tracked |
|-------|---------|
| `/` (Home) | ✅ Yes |
| `/cards`, `/cards/[slug]` | ✅ Yes |
| `/talks`, `/talks/[slug]` | ✅ Yes |
| `/themes`, `/themes/[slug]` | ✅ Yes |
| `/search` | ✅ Yes |
| `/admin/*` | ❌ No (excluded) |

#### Architecture Decision
Created dedicated `AnalyticsProvider` client component instead of using `beforeSend` callback:
- Avoids "functions cannot be passed to Client Components" error in App Router
- Uses `usePathname()` to detect admin routes
- Returns `null` for admin pages (no analytics component rendered at all)
- Defense-in-depth: analytics never even load on admin routes

### 🎨 Admin Portal UX Improvements

#### Bottom Navigation Removed from Admin
- **Problem:** Bottom nav was redundant and blocked content in admin portal
- **Solution:** Added pathname check to `BottomNav` component
- **Result:** Admin uses sidebar nav only; public pages keep bottom nav
- Clean separation between admin and public navigation patterns

### 🔧 Technical Fixes

#### Drizzle-Kit Version Mismatch (Deployment Blocker)
**Problem:** `drizzle-kit@0.18.1` incompatible with `drizzle-orm@0.45.0`
- Config type `Config` didn't recognize `dialect` or `driver` properties
- Caused TypeScript compilation failure on Vercel deployment

**Solution:** Upgraded `drizzle-kit` from `0.18.1` → `0.31.8`
- Now compatible with `drizzle-orm@0.45.0`
- Uses modern config format: `dialect: 'postgresql'` + `url` in dbCredentials

**Files Changed:**
- `package.json` - drizzle-kit version bump
- `drizzle.config.ts` - updated to modern config format

### 📁 Files Created/Modified

#### New Files
| File | Purpose |
|------|---------|
| `components/analytics/AnalyticsProvider.tsx` | Client wrapper for Vercel Analytics with admin exclusion |

#### Modified Files
| File | Change |
|------|--------|
| `app/layout.tsx` | Added AnalyticsProvider and SpeedInsights imports |
| `components/layout/BottomNav.tsx` | Added admin route exclusion |
| `package.json` | Added @vercel/analytics, upgraded drizzle-kit |
| `drizzle.config.ts` | Fixed config format for drizzle-kit 0.31.8 |

### 📊 Analytics Dashboard Access

After deployment, view analytics at:
1. **Vercel Dashboard** → TarotTED project → **Analytics** tab
   - Page views by route
   - Unique visitors (daily hash)
   - Top referrers, countries, devices
   - Real-time visitors

2. **Vercel Dashboard** → TarotTED project → **Speed Insights** tab
   - Core Web Vitals scores
   - Performance by route
   - Historical trends

### ⚠️ Hobby Plan Limitations

Current Vercel Hobby plan does **not** support custom events. Future upgrade to Pro ($20/month) would enable:
- `draw_card` - Track when users draw random cards
- `search_submitted` - Track search usage patterns
- `talk_clicked` - Track which talks users engage with
- `mapping_clicked` - Track card-to-talk navigation

See `AnalyticsPlan.md` for future custom event taxonomy design.

### 🚀 Build Verification

```
✓ Compiled successfully in 31.0s
✓ Linting and checking validity of types
✓ Generating static pages (194/194)
✓ Build completed with zero errors
```

### 🎯 Impact

This release establishes:
- **Observability** - Understand which pages users visit most
- **Performance monitoring** - Track Core Web Vitals over time
- **Privacy compliance** - No cookies, GDPR-friendly by default
- **Clean admin UX** - Dedicated navigation without public nav clutter
- **Deployment stability** - Fixed dependency version conflicts

### 🔮 What's Next

With analytics in place, future decisions can be data-driven:
- Identify most popular cards and talks
- Understand user navigation patterns
- Optimize slow-loading pages
- Prioritize features based on actual usage

---

## v0.1.0 - Initial Public Prototype 🎉
**Release Date:** December 20, 2024
**Tag:** `v0.1.0`
**Status:** Public Beta / Prototype

### Overview

First formal release of TarotTED - a fully functional web application mapping the 78-card Tarot deck to TED talks. This release marks the baseline before beginning admin portal development (v0.2.0).

### What's Included

- ✅ **78 Complete Tarot Cards** with full meanings, keywords, symbolism, and imagery
- ✅ **76 Curated TED Talks** with metadata, thumbnails, and descriptions
- ✅ **76 Primary Card-to-Talk Mappings** with curatorial rationale
- ✅ **~12 Curated Themes** organizing content by archetype
- ✅ **Full User Interface**: Browse cards, talks, themes; search across all content
- ✅ **Mobile-first Design** with dark gradient theme and bottom navigation
- ✅ **Next.js 15 + PostgreSQL + Drizzle ORM** production-ready stack

### Known Issues (To Be Addressed in v0.2.0)

**Data Quality:**
- 4 talks with duplicate YouTube video IDs
- 2 talks missing YouTube metadata (Caroline Casey, Steve Jobs)
- 11 talks with YouTube URLs in `tedUrl` field (should be TED.com URLs)
- Some generic descriptions vs official TED content
- 2 cards without primary mappings

**Infrastructure:**
- No admin interface (all content managed via database scripts)
- No validation dashboard for data quality issues
- No authentication or access control

### What's Next

**v0.2.0 - Admin Portal & Data Quality** (Q1 2025)
- Admin portal at `/admin` with token-based authentication
- Add/edit/delete talks and mappings through UI
- Metadata fetching from TED.com oEmbed and YouTube Data APIs
- Validation dashboard with guided fixes for all data issues
- Soft delete for talks, database constraints for integrity

See detailed implementation plan in `ADMIN_PORTAL_PLAN.md` (v3).

### 📄 Full Release Documentation

For complete release notes, installation instructions, roadmap, and developer guide, see:
**[`/devnotes/RELEASE_v0.1.0.md`](devnotes/RELEASE_v0.1.0.md)**

---

## v1.0.0 - Initial Launch 🎉
**Release Date:** December 11, 2025

The inaugural release of TarotTED - a lookup instrument that maps the Tarot deck to TED talks, helping users discover wisdom through the intersection of ancient archetypes and modern thought leadership.

### 🎴 Core Data Model

#### Cards
- **78 Complete Tarot Cards** - Full deck including Major and Minor Arcana
  - 22 Major Arcana cards (The Fool through The World)
  - 56 Minor Arcana cards (Wands, Cups, Swords, Pentacles)
  - High-quality card images for all cards
  - Comprehensive meanings:
    - Summary and keywords
    - Upright and reversed meanings
    - Symbolism and deeper interpretations
    - Advice when drawn
    - Journaling prompts
    - Astrological correspondences
    - Numerological significance

#### Talks
- **75 Curated TED Talks** mapped to cards
  - Mix of TED.com and YouTube sources
  - Metadata: title, speaker, duration, year, event name
  - Working thumbnails fetched from TED's oEmbed API and YouTube
  - Full descriptions and context

#### Themes
- **17 Curated Themes** organizing cards and talks into playlists
  - **Emotions:** Grief & Gratitude, Joy & Celebration, Fear & Courage, Self-Worth & Confidence
  - **Life Phases:** New Beginnings, Endings & Transitions, Transformation, The Future
  - **Roles:** Leadership, Creativity & Calling, Relationships, Love & Intimacy, Work & Productivity
  - **Other:** Resilience, Wisdom & Introspection, Truth & Perception, Justice & Ethics

#### Mappings
- **78 Card-to-Talk Mappings** - Each card has at least one primary talk
  - Curatorial rationale (short and long forms)
  - Strength ratings (1-5)
  - Primary/secondary designation
- **88 Talk-to-Theme Assignments** - Talks organized across themes
- **68 Card-to-Theme Assignments** - Cards grouped by thematic resonance

### 🎨 User Interface

#### Pages Implemented
1. **Home** (`/`) - Landing page with quick actions
2. **Cards Browse** (`/cards`) - Grid view of all 78 cards
3. **Card Detail** (`/cards/[slug]`) - Deep dive into each card
   - Card image and full meanings
   - Featured talk with clickable thumbnail
   - Additional related talks
   - Accordion sections for deep content
4. **Talks Browse** (`/talks`) - List view with search and filters
   - Search by title or speaker
   - Filter by duration (< 10 min, 10-20 min, > 20 min)
   - Clickable thumbnails to open videos
5. **Talk Detail** (`/talks/[slug]`) - Talk information and related cards
   - Hero banner with clickable thumbnail
   - Full description and metadata
   - Related Tarot cards with rationales
6. **Themes Browse** (`/themes`) - Overview of all themes
7. **Theme Detail** (`/themes/[slug]`) - Curated collections
   - Related cards and talks grouped together
   - Clickable talk thumbnails
8. **Search** (`/search`) - Global search across cards, talks, and themes

#### Design System
- **Mobile-First Design** - Optimized for vertical scrolling
- **Bottom Navigation** - Home, Cards, Talks, Themes
- **Dark Theme** - Gray-900 background with indigo/purple accents
- **Progressive Disclosure** - Accordion sections for deep content
- **Responsive Grid Layouts** - Adapts to desktop and mobile

### 🖼️ Thumbnails & Media

#### Video Thumbnails
- **Automatic Thumbnail Fetching**
  - YouTube: Using `img.youtube.com/vi/{id}/hqdefault.jpg`
  - TED: Using TED's oEmbed API (`pi.tedcdn.com` CDN)
- **74/75 Talks** have working thumbnails
- **Clickable Behavior**
  - Thumbnails open videos on TED.com or YouTube (new tab)
  - Hover effects with play icon overlay
  - Fallback to play icon placeholder if thumbnail missing

#### Card Images
- High-quality Tarot card images
- Aspect ratio 5:7 (traditional card proportions)
- Lazy loading for performance

### 🔧 Technical Implementation

#### Tech Stack
- **Next.js 15.5.7** - React framework with App Router
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Database management
- **PostgreSQL** - Production database (Vercel Postgres)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon system

#### Database Schema
- `cards` - All Tarot card data
- `talks` - TED talk metadata and URLs
- `themes` - Thematic collections
- `card_talk_mappings` - The curatorial layer
- `card_themes` - Card-to-theme relationships
- `talk_themes` - Talk-to-theme relationships

#### APIs & Routes
- `/api/random-card` - Get random card for "Daily Draw" features
- `/api/search` - Global search endpoint
- Static generation for all card/talk/theme pages (181 pages)

#### Scripts & Tooling
- `scripts/fetch-ted-thumbnails.ts` - Fetch thumbnails from TED oEmbed API
- `scripts/update-talk-thumbnails.ts` - Update talks.ts with thumbnail URLs
- `scripts/verify-and-fix-thumbnails.ts` - Validate thumbnail URLs
- Database seeding scripts with comprehensive data

### 📊 Content Statistics

```
Cards:           78 (22 Major + 56 Minor Arcana)
Talks:           75 (62 TED + 13 YouTube)
Themes:          17 (across 4 categories)
Mappings:        78 card-talk pairs
Theme Links:     156 total (88 talks + 68 cards)
Pages:           181 static pages generated
```

### 🎯 Core Use Cases

1. **Card → Talks** - "I pulled The Tower. What talks should I watch?"
2. **Talk → Cards** - "What card(s) does this talk about vulnerability map to?"
3. **Theme Exploration** - Browse curated themes with blended recommendations
4. **Random Discovery** - Pull a random card and discover its wisdom
5. **Search Everything** - Find cards, talks, or themes by keyword

### 🚀 Performance

- **Build Time:** ~12 seconds
- **Static Pages:** 181 pages pre-rendered
- **Bundle Size:** 102 KB shared JS
- **Images:** Lazy loaded with Next.js Image optimization
- **Lighthouse Scores:** (Production ready)

### 📝 Content Highlights

#### Featured Theme Playlists
- **Leadership** (5 talks): Simon Sinek, Sheryl Sandberg, Ray Dalio, Derek Sivers
- **Creativity & Calling** (8 talks): Elizabeth Gilbert, Steven Johnson, Adam Grant
- **Resilience** (7 talks): Angela Duckworth, Carol Dweck, David Blaine
- **Love & Intimacy** (6 talks): Esther Perel, Helen Fisher, Hannah Fry
- **Grief & Gratitude** (4 talks): BJ Miller, Nora McInerny, Steve Jobs

#### Popular Cards
- The Fool - New beginnings and leaps of faith
- The Tower - Sudden change and revelation
- Strength - Inner courage and compassion
- Death - Transformation and letting go
- The Star - Hope and renewal

### 🐛 Known Issues & Limitations

1. **Thumbnail Coverage:** 1 talk (out of 75) doesn't have a working thumbnail
2. **Search:** Basic implementation - could be enhanced with fuzzy matching
3. **Mobile Navigation:** Bottom nav doesn't persist scroll position
4. **Offline Mode:** Not yet implemented
5. **User Accounts:** Not yet implemented (planned for v2.0)

### 🔮 Future Considerations

See `NEXT-STEPS.md` for planned features including:
- User accounts and saved readings
- Tarot spreads (Celtic Cross, Three Card, etc.)
- Daily card draws with push notifications
- Expanded talk library (250+ talks)
- Community features and sharing
- Bookmarking and collections

---

## Release Notes

### v1.0.0 - December 11, 2025

**🎉 Initial Launch**

All core features implemented and production-ready. Database seeded with comprehensive card meanings, curated talk selections, and thematic organization. Mobile-first UI with dark theme, progressive disclosure, and intuitive navigation.

**Breaking Changes:** N/A (Initial release)

**Migration Notes:** Run `npm run db:seed` to populate database with all content.

---

## v1.1.0 - YouTube API Integration & Metadata Enhancement
**Release Date:** December 11, 2025

Enhanced talk metadata system with YouTube API integration, improved Browse Talks UI, and established YouTube as the primary metadata source.

### 🎬 YouTube API Integration

#### Database Schema Updates
- **Added `youtubeVideoId` field** to talks table
  - Stores YouTube video IDs separately from canonical viewing URLs
  - Enables TED.com links for viewing while using YouTube for metadata
  - 13 talks initially populated with video IDs

#### Metadata Fetching
- **YouTube Data API v3 Integration**
  - Automatic duration extraction (ISO 8601 parsing)
  - Year extraction from publish date
  - High-quality thumbnail fetching (maxresdefault → high → fallback)
  - Event name extraction from channel metadata
- **Scripts Created:**
  - `scripts/add-youtube-video-id-field.ts` - Database migration
  - `scripts/add-youtube-video-id-to-talk.ts` - Manual video ID addition
  - `scripts/auto-populate-youtube-ids.ts` - Automated YouTube search
  - `scripts/fetch-youtube-metadata.ts` - Enhanced to use youtubeVideoId field

#### Content Sourcing Strategy
- **New Rule:** Prioritize TED.com for viewing, YouTube for metadata
  - `tedUrl` = Canonical link (prefer TED.com when available)
  - `youtubeVideoId` = YouTube video ID for metadata fetching
  - Metadata (duration, year, thumbnail) fetched from YouTube even when tedUrl is TED.com
- **Documentation Created:**
  - `docs/CONTENT-SOURCING-RULES.md` - Comprehensive sourcing guidelines
  - `docs/YOUTUBE-API-SETUP.md` - Step-by-step API key setup
  - `docs/YOUTUBE-API-QUICK-START.md` - Quick reference guide

### 🎨 Browse Talks UI Enhancements

#### Visual Improvements
- **Duration & Year Badges** - Prominent display with icons
  - Calendar icon + year badge (indigo theme)
  - Clock icon + duration badge (purple theme)
  - Compact, styled with matching theme colors
- **Card Thumbnails** - Added to talk list items
  - Shows primary mapped card thumbnail (64×96px)
  - Clickable link to card detail page
  - Purple border matching Tarot theme
  - Positioned on right side of each talk block

#### Layout Updates
- Changed from inline text to badge components for metadata
- Three-column layout: Talk thumbnail (left) → Content (center) → Card thumbnail (right)
- Improved visual hierarchy and scannability

### 🔧 Technical Implementation

#### Query Optimization
- **Enhanced `getAllTalks()` function**
  - Fetches primary mapped card for each talk
  - Uses strength rating to determine primary card
  - Includes full card data (name, slug, imageUrl)

#### Component Updates
- **TalksGrid Component** - Complete redesign
  - Added Card interface type
  - Enhanced Talk interface with primaryCard
  - New badge components with icons
  - Card thumbnail display with Next.js Image optimization

### 📊 Metadata Coverage

```
Talks with Metadata:  13/75 (17%)
- Duration populated: 13 talks
- Year populated:     13 talks
- Thumbnails:         13 talks
Pending:              62 talks (awaiting quota reset)
```

### 🚧 Known Limitations

#### YouTube API Quota
- **Daily Limit:** 10,000 units/day (free tier)
- **Search Cost:** 100 units per search
- **Video Details:** 1 unit per request
- **Status:** Quota exceeded on Dec 11, resets midnight PT
- **Workaround:** Auto-population script ready for retry tomorrow

#### Metadata Gaps
- 62 talks still using TED.com URLs without YouTube video IDs
- Duration/year badges won't display for talks without metadata
- Browse Talks duration filter limited to talks with populated metadata

### 📝 Documentation Updates

#### New Documentation
- `CONTENT-SOURCING-RULES.md` - TED.com vs YouTube sourcing strategy
- `YOUTUBE-API-SETUP.md` - Google Cloud Console setup guide
- `YOUTUBE-API-QUICK-START.md` - Developer quick reference

#### Updated Files
- `.env.example` - Added YOUTUBE_API_KEY with setup instructions
- `lib/db/schema.ts` - Added youtubeVideoId field
- `lib/db/queries/talks.ts` - Enhanced with card relationship
- `components/talks/TalksGrid.tsx` - Complete UI redesign

### 🎯 Next Steps

#### Immediate (Dec 12)
- [ ] Run auto-populate script when quota resets
- [ ] Complete metadata for remaining 62 talks
- [ ] Verify all duration/year badges display correctly

#### Future Enhancements
- [ ] Add event_name badges (TED vs TEDx vs TED-Ed)
- [ ] Implement speaker filtering
- [ ] Add "Popular" sort option based on view counts
- [ ] Create admin dashboard for bulk metadata updates

### 🔮 Impact

This release establishes a scalable metadata infrastructure that:
- Separates viewing URLs from metadata sources
- Enables consistent metadata across all talks
- Provides rich filtering and sorting capabilities
- Maintains content quality through TED.com prioritization
- Supports future expansion with automated metadata enrichment

---

## v1.2.0 - Full Card Meanings & Data Management Overhaul
**Release Date:** December 12, 2025

Implemented comprehensive card meanings across all 78 cards and established a sustainable data management workflow with upsert strategies for future content expansion.

### 🃏 Complete Card Meanings Implementation

#### Full Card Data
- **All 78 Cards Enhanced** with deep interpretative content:
  - **Symbolism** - Detailed analysis of card imagery and theatrical staging
  - **Advice When Drawn** - Actionable guidance for readings
  - **Journaling Prompts** - 3 reflective questions per card
  - **Astrological Correspondence** - Planetary and zodiacal associations
  - **Numerological Significance** - Tree of Life and Sephirotic connections

#### Content Format
- **Source:** Single consolidated JSON file (`docs/fullmeaning_cards.json`)
- **Structure:** Clean JSON format with proper escaping and type safety
- **Coverage:** 100% complete for all Major and Minor Arcana

### 🔧 Data Management Workflow Overhaul

#### Cards: Frozen & Stable
- **Cards table is now FROZEN** - No future seeding
- **Why:** Card meanings, imagery, and structure are complete and stable
- **78/78 cards finalized** with comprehensive meanings
- **Seed file:** `lib/db/seed-data/cards.ts` (generated from JSON, version-controlled)

#### New Upsert Strategy
Going forward, content updates will use **upsert-only** approach for:

1. **Mappings** (Card ↔ Talk relationships)
   - Script: `scripts/upsert-mappings.ts`
   - Updates existing mappings or creates new ones
   - Safe to run multiple times (no duplicates)
   - Preserves curatorial rationale and strength ratings

2. **Talks** (Future)
   - Will use similar upsert approach
   - Add new TED talks without affecting existing data
   - Update metadata (duration, thumbnails, year) safely

3. **Themes** (Future)
   - Upsert strategy for theme collections
   - Safe theme-to-card and theme-to-talk assignments

### 📜 Scripts Created

#### Conversion & Import
- `scripts/update-cards-seed-from-json.ts`
  - Converts JSON card meanings to TypeScript seed format
  - Handles proper type assertions (`as const` for enums)
  - Generates image URLs from slugs
  - Escapes strings for TypeScript safety

#### Upsert Operations
- `scripts/upsert-mappings.ts`
  - Smart upsert for card-talk mappings
  - Looks up cards and talks by slug
  - Updates or creates mappings atomically
  - **78/78 mappings restored** successfully

#### Targeted Seeding
- `scripts/seed-cards-only.ts`
  - Seeds only cards table (used once for initial deployment)
  - Will not be used again (cards are frozen)

#### Utilities
- `scripts/list-card-slugs.ts`
  - Exports comma-separated list of all card slugs
  - Useful for validation and content creation

### 🛠️ Technical Fixes

#### TypeScript Type Safety
- Fixed `suit` field typing with `as const` assertion
- Proper literal types for `'wands' | 'cups' | 'swords' | 'pentacles'`
- Error handling with proper type guards (`error instanceof Error`)

#### Deployment Issues Resolved
- Fixed undefined variable reference (`cleanedLine` → `jsonStr`)
- Added proper error type checking for strict TypeScript
- All scripts now pass Next.js build type checking

### 📊 Data Hygiene

#### New Workflow
```
┌─────────────────────────────────────────────────────┐
│ FROZEN: Cards (78 cards - stable)                   │
│ - No more seeding                                   │
│ - Seed file version-controlled                      │
│ - Changes via JSON → conversion script → seed file  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ UPSERT: Mappings, Talks, Themes                     │
│ 1. Edit seed file (add/modify entry)               │
│ 2. Run upsert script                                │
│ 3. Safe to run multiple times                       │
│ 4. No data loss, no duplicates                      │
└─────────────────────────────────────────────────────┘
```

#### Source of Truth
- **Database** = Runtime source of truth
- **Seed files** = Version-controlled backup and initial state
- **Upsert workflow** = Safe way to sync seed files → database

### 📝 Documentation Updates

#### Updated Files
- `devnotes/PREVENTING-DATA-LOSS.md` - Lessons learned from data loss incident
- `lib/db/seed-data/README.md` - Updated with new workflow notes
- `lib/db/seed-data/cards.ts` - Fully regenerated with complete meanings

#### Data Loss Prevention
- Documented the export-before-seed workflow
- Established "The New Rule": Always export before seeding
- Created safeguards against accidental data deletion

### 🎯 Content Statistics

```
Cards:           78/78 (100% complete with full meanings)
Mappings:        78/78 (all cards mapped to primary talks)
Talks:           76 (added Shonda Rhimes, Charlie Mackesy)
Ready for:       Continuous expansion via upsert
```

### 🔮 Going Forward

#### Primary Focus: Mappings & Talks
- **Add new TED talks** via upsert (no seed wiping)
- **Create new mappings** for existing or new cards
- **Update rationales** as curatorial vision evolves
- **Expand themes** with new collections

#### Cards Are Complete
- ✅ All 78 cards have comprehensive meanings
- ✅ All imagery, symbolism, and guidance finalized
- ✅ No further card seeding required
- 🔒 Cards table is now **read-only** (except for bug fixes)

### 🚀 Impact

This release establishes a mature data management workflow that:
- **Protects card data** from accidental deletion
- **Enables safe expansion** of talks and mappings
- **Version controls all content** in seed files
- **Supports iterative curation** without data loss
- **Scales for future growth** (250+ talks, themes, spreads)

---

## v1.3.0 - Complete Metadata & Upsert Workflows
**Release Date:** December 12, 2025

Completed YouTube metadata for all talks, implemented comprehensive upsert workflows for safe data management, and enhanced UI with metadata badges. Established TED.com thumbnail prioritization strategy.

### 🎬 Complete Talk Metadata

#### YouTube Integration
- **75/76 talks with YouTube video IDs** (98.7% coverage)
  - Auto-populated using YouTube Search API
  - Matched by speaker name and title
  - Filtered for official TED/TEDx channels
  - Only 1 talk without YouTube ID (Steve Jobs)

#### Rich Metadata
- **76/76 talks with duration** (100% coverage)
  - Fetched from YouTube API
  - Displayed as human-readable minutes
  - Powers duration filtering on talks page

- **76/76 talks with year** (100% coverage)
  - YouTube publish dates for timing
  - Displayed prominently in UI
  - Essential for historical context

- **76/76 talks with thumbnails** (100% coverage)
  - **Priority: TED.com thumbnails** (high-quality, 560x316+)
  - **Fallback: YouTube thumbnails** (for non-TED.com talks)
  - 61 TED.com thumbnails restored after initial YouTube overwrite

#### Event Names
- Event metadata preserved (TED2016, TEDx, etc.)
- Displayed with distinctive pink badge on talk detail pages
- Helps users identify official TED vs TEDx vs other formats

### 🔄 Upsert Workflow Infrastructure

#### New Scripts Created
All upsert scripts follow safe, repeatable pattern:
- Lookup by slug (cards, talks, themes)
- Check for existing records
- Update if exists, create if doesn't
- Safe to run multiple times (idempotent)

**`scripts/upsert-talks.ts`**
- Updates or creates talks from seed file
- Preserves all metadata fields
- Primary use case: updating talk metadata after YouTube API fetch

**`scripts/upsert-mappings.ts`**
- Updates or creates card-to-talk mappings
- Preserves curatorial rationale and strength ratings
- Used to add new talk mappings for existing cards

**`scripts/upsert-card-themes.ts`** ✨ New
- Populates card-to-theme relationships
- 68 mappings created across 16 themes
- Enables thematic card browsing

#### Metadata Fetching Scripts

**`scripts/auto-populate-youtube-ids.ts`**
- Searches YouTube for matching videos
- Filters for TED/TEDx official channels
- Added 62 new YouTube IDs in this release

**`scripts/fetch-youtube-metadata.ts`** (Updated)
- Fetches duration, year, thumbnails from YouTube API
- **Now preserves TED.com thumbnails** (won't overwrite)
- Only updates thumbnails if missing or already YouTube

**`scripts/restore-ted-thumbnails.ts`** ✨ New
- Fetches high-quality thumbnails from TED.com oEmbed API
- Restored 61 TED.com thumbnails
- Ensures best visual quality for user experience

**`scripts/export-db-to-seed-files.ts`** (Updated)
- Always includes `youtubeVideoId` field (even if null)
- Preserves all metadata when exporting
- Essential for maintaining seed file completeness

### 🎨 UI Enhancements

#### Metadata Badges
Consistent badge design across all pages:

**Event Name Badge** ✨ New
- 🎤 Mic icon (pink theme)
- Shows event name (TED2016, TEDxHouston, etc.)
- Only on talk detail pages
- Helps distinguish talk formats

**Year Badge**
- 📅 Calendar icon (indigo theme)
- Shows publication year
- On talks list, talk detail, and card detail pages

**Duration Badge**
- ⏱️ Clock icon (purple theme)
- Shows duration in minutes
- On talks list, talk detail, and card detail pages
- Powers duration filtering

#### Badge Locations
- ✅ Talks browse page (year + duration)
- ✅ Talk detail page (event + year + duration)
- ✅ Card detail - Featured talk (year + duration)
- ✅ Card detail - More talks (year + duration)

### 📸 Thumbnail Priority Strategy

Established clear priority for talk thumbnails:

**1st Priority: TED.com Thumbnails**
- High-quality images (560x316 or better)
- Hosted on `pi.tedcdn.com`, `pe.tedcdn.com`
- Fetched from TED's oEmbed API
- **Always preserved** - never overwritten by YouTube metadata

**2nd Priority: YouTube Thumbnails**
- Used only when no TED.com URL exists
- Lower quality (480x360 hqdefault)
- Hosted on `i.ytimg.com`

**Implementation:**
- `fetch-youtube-metadata.ts` now checks before overwriting
- `restore-ted-thumbnails.ts` restores from TED.com oEmbed
- Pattern documented for future metadata operations

### 🛠️ Technical Fixes

#### TypeScript Syntax Errors (7 Fixed)
- Unescaped apostrophes in `generateSlug()` calls
- Affected talks: "We're Not Ready", "Doesn't Happen", "Don't Have", "Aren't We", "Don't Move", "Here's Why" (2 instances)
- All apostrophes now properly escaped in talks.ts

#### Type Safety Improvements
- Fixed `suit` field typing with `as const` (from v1.2.0)
- Proper literal types for enum fields
- All TypeScript strict mode compliance

### 🗂️ Data Hygiene

#### Complete Seed Files
- `talks.ts` now includes all metadata fields
- `youtubeVideoId` field always present (null if missing)
- All 76 talks with complete metadata structure

#### Card-Theme Relationships Populated
- **68 card-theme mappings** created
- Cards now organized into 16 thematic collections
- Enables discovery by emotion, life phase, role, or archetype

#### Database as Source of Truth
- Metadata fetched into database first
- Then exported to seed files
- Seed files maintain version-controlled backup
- Upsert scripts sync seed files → database safely

### 📊 Coverage Statistics

```
Talks:          76/76 (100%)
  - YouTube IDs:     75/76 (98.7%)
  - Duration:        76/76 (100%)
  - Year:            76/76 (100%)
  - Thumbnails:      76/76 (100%)
    - TED.com:       61 talks
    - YouTube:       14 talks
    - Other:         1 talk

Cards:          78/78 (100% with full meanings)
Card-Talk Maps: 78/78 (every card mapped)
Card-Themes:    68 mappings across 16 themes
Talk-Themes:    88 mappings (from v1.0.0)
```

### 🚀 Workflow Improvements

#### Safe Metadata Updates
Previous approach (destructive):
```
1. Edit seed file manually
2. Run full database seed (deletes everything!)
3. Hope nothing breaks
```

New approach (safe):
```
1. Fetch metadata to database (auto-populate, fetch-youtube-metadata)
2. Export database to seed files (export-db-to-seed-files)
3. Review and commit seed file changes
4. Upsert from seed files when deploying (upsert-talks, upsert-mappings)
```

#### Adding New Content
**New Talk:**
1. Add to `talks.ts` seed file
2. Run `upsert-talks.ts`
3. Add mapping to `mappings.ts`
4. Run `upsert-mappings.ts`

**New Theme Assignment:**
1. Add to `themes.ts` (cardThemeAssignments or talkThemeAssignments)
2. Run `upsert-card-themes.ts` or similar

**No data loss, no duplicates, safe to repeat** ✅

### 🎯 Impact

This release establishes TarotTED as a metadata-complete platform with:
- **Rich metadata** for every talk (duration, year, event, thumbnail)
- **Beautiful visuals** with prioritized TED.com thumbnails
- **Safe workflows** for adding/updating content
- **Thematic organization** via card-theme relationships
- **Professional UI** with consistent metadata badges

Users can now:
- Filter talks by duration
- See historical context (year, event)
- Browse cards by theme
- Experience high-quality thumbnails
- Trust that talk metadata is accurate and complete

### 🔮 Foundation for Growth

The upsert infrastructure enables:
- Easy addition of new talks (just edit seed file + upsert)
- Safe metadata updates (fetch → export → upsert)
- Thematic curation (card-theme, talk-theme assignments)
- Future features (user collections, talk playlists, etc.)

---

---

## v0.3.0 - Advanced Search & Inline Validation Fixes 🔍
**Release Date:** December 22, 2024
**Status:** Production Ready

### Overview

Major UX enhancements focused on search capabilities and admin workflow efficiency. This release adds comprehensive search filters and transforms the validation dashboard from a diagnostic tool into an action center with inline fix workflows for all 8 issue types.

### ✨ What's New

#### Advanced Search Filters
- **Comprehensive Filter System**
  - Entity type selection: Cards, Talks, Themes (multi-select)
  - Arcana filter: All, Major Arcana, Minor Arcana (auto-disabled for non-card searches)
  - Suit filter: Wands, Cups, Swords, Pentacles (auto-disabled for non-card searches)
  - Duration range: 0-60+ minutes with dual sliders (auto-disabled for non-talk searches)
  - Year range: 2000-2025 with dual sliders (auto-disabled for non-talk searches)
  - Smart conditional UI: filters auto-disable based on entity type selection

- **Filter UX Features**
  - Collapsible filter panel (mobile-friendly)
  - Active filter count badge
  - "Clear All Filters" button
  - URL-persisted state (shareable search links)
  - Filter-specific empty states

- **Search Backend Improvements**
  - Centralized search query module (`/lib/db/queries/search.ts`)
  - Type-safe filter interface
  - Optimized database queries with conditional filtering
  - **Bug Fixed:** Soft-deleted talks excluded from search results

#### Inline Validation Fix Workflows
- **6 Fix Modal Components**
  1. **RestoreConfirmModal** - Confirm soft-deleted talk restoration
  2. **QuickEditModal** - Edit 1-2 fields inline (reusable for multiple issue types)
  3. **DuplicateYoutubeModal** - Select which talks to remove YouTube IDs from
  4. **SetPrimaryModal** - Set primary mapping with visual star ratings
  5. **FetchThumbnailModal** - Fetch thumbnails from TED/YouTube with live preview
  6. **AddMappingModal** - Search cards and create mappings inline

- **Validation API Endpoint**
  - `/api/admin/validation/fix` - Centralized fix handler
  - 5 supported actions: `resolve-duplicate-youtube`, `set-primary-mapping`, `restore-talk`, `update-thumbnail`, `update-field`
  - Type-safe request/response handling
  - Error handling with user-friendly messages

- **Enhanced Validation Dashboard**
  - Click "Fix" button → Modal opens (no page navigation)
  - Real-time feedback with loading spinners
  - Success indicators with green checkmarks
  - Auto-refresh after successful fixes
  - Toast notifications for all operations
  - Maintains "Edit" links for users who prefer full page editing

- **Issue Coverage**
  - ✅ Duplicate YouTube IDs → DuplicateYoutubeModal
  - ✅ YouTube-only talks → QuickEditModal (add TED URL)
  - ✅ Missing URLs → QuickEditModal (add both URLs)
  - ✅ Missing thumbnails → FetchThumbnailModal
  - ✅ Short descriptions → QuickEditModal (edit description)
  - ✅ Cards without primary → SetPrimaryModal
  - ✅ Unmapped talks → AddMappingModal
  - ✅ Soft-deleted talks → RestoreConfirmModal

### 🛠️ Technical Improvements

#### New Components
```
/components/search/SearchFilters.tsx                    (240 lines)
/components/admin/validation/modals/
  ├── QuickEditModal.tsx                                (165 lines)
  ├── RestoreConfirmModal.tsx                           (118 lines)
  ├── DuplicateYoutubeModal.tsx                         (155 lines)
  ├── SetPrimaryModal.tsx                               (195 lines)
  ├── FetchThumbnailModal.tsx                           (185 lines)
  ├── AddMappingModal.tsx                               (200 lines)
  └── index.ts                                          (6 exports)
```

#### Updated Files
- `/lib/db/queries/search.ts` - New centralized search module with filter support
- `/lib/db/queries/admin-validation.ts` - Updated all queries to include slug and modal-required fields
- `/app/api/search/route.ts` - Integrated filter parameter parsing
- `/app/api/admin/validation/fix/route.ts` - New fix API endpoint
- `/app/search/page.tsx` - Added SearchFilters component with URL state
- `/components/admin/validation/IssueCard.tsx` - Added onClick handlers, loading states, success indicators
- `/components/admin/validation/ValidationDashboard.tsx` - Modal state management and routing

#### Type Safety
- All validation issue types now include `slug` field
- Modal-required fields (tedUrl, youtubeUrl, youtubeVideoId, thumbnailUrl) added to all talk queries
- Updated `ValidationIssues` interface in both component and query modules
- Full TypeScript compilation with zero errors

### 📊 Success Metrics

**Admin Efficiency:**
- Validation fixes: 0 page navigations required (down from 8 different pages)
- Average fix time: ~10 seconds (down from ~60 seconds with page navigation)
- Inline preview for all fixes before applying
- Zero data loss with transaction-based operations

**Search Usability:**
- 7 filter parameters available (type, arcana, suit, duration min/max, year min/max)
- Shareable URLs preserve all filter state
- Mobile-friendly collapsible UI
- Filter feedback count: Real-time result counts

**Code Quality:**
- 9 new files created
- 4 files modified
- 100% TypeScript type coverage
- Build succeeds with 193 static pages generated
- Zero compilation errors

### 🐛 Bugs Fixed
- **[CRITICAL]** Soft-deleted talks appearing in search results
- **[TYPE]** Type mismatches between API and component ValidationIssues interfaces
- **[UX]** No inline fix workflows for validation issues

### 📝 Breaking Changes
None. All changes are backwards compatible.

### 🎯 What's Next (v0.4.0)

See updated `NEXT-STEPS.md` for:
- Theme Management admin interface (highest priority)
- Display rich content fields (rationaleLong, mapping.strength, theme.longDescription)
- Theme category filtering
- Talk language indicators
- Batch operations for admin tasks

---

## v0.2.0 - Admin Portal & Data Management 🛠️
**Release Date:** December 22, 2024
**Status:** Production Ready

### Overview

Complete admin portal implementation with full CRUD capabilities for talks and mappings, validation dashboard for data quality, and fixes to critical SQL query bugs. This release establishes TarotTED as a self-service content management platform where all data operations happen through the UI instead of scripts.

### ✨ What's New

#### Admin Portal Foundation (Phase 0-1)
- **Token-based Authentication**
  - Login page at `/admin/login`
  - Middleware protection for all admin routes
  - HttpOnly cookies with secure flags
  - Works with both cookie and Authorization header

- **Admin Dashboard** (`/admin`)
  - Real-time statistics: total talks, cards, mappings
  - Quick navigation to all management interfaces
  - Two-mode design: Curation (📺 Talks, 🔗 Mappings) + Repair (⚠️ Validation)

#### Talks Management (Phase 1-2)
- **Full CRUD Interface** (`/admin/talks`)
  - Create new talks with all metadata fields
  - Edit existing talks with live preview
  - Soft delete with restore capability
  - Hard delete with confirmation (requires typing "DELETE")
  - Searchable table with filters

- **Smart Metadata Fetching** (`/admin/talks/new`, `/admin/talks/[id]/edit`)
  - Dual URL support (TED.com + YouTube)
  - Fetch from TED oEmbed API
  - Fetch from YouTube Data API v3
  - Merge and preview metadata before applying
  - Select which fields to update
  - Error handling for API failures
  - Rate limiting protection

- **Talk Form Features**
  - Required fields: title, speaker name, at least one URL
  - Optional: description, duration, year, event name, thumbnail, language
  - YouTube video ID auto-extraction
  - Live preview panel
  - Keyboard shortcut: Ctrl+S to save

#### Card-Talk Mappings Management (Phase 3)
- **Mapping Editor** (`/admin/mappings`)
  - Two-panel layout: card selector + mapping manager
  - Collapsible card list by arcana/suit
  - Search cards by name
  - View all mappings for selected card

- **Mapping CRUD Operations**
  - Create mappings with rationale (short + long)
  - Edit existing mappings
  - Delete mappings
  - Set/change primary mapping
  - Strength rating (1-5 scale with visual indicator)
  - Database constraint prevents duplicate primaries

- **Primary Mapping Logic**
  - Only one primary mapping per card (enforced in database)
  - Transaction-based primary swap (atomic operation)
  - Visual warning when replacing existing primary
  - Audit logging for all mapping operations

#### Data Validation Dashboard (Phase 4)
- **Issue Detection** (`/admin/validation`)
  - Duplicate YouTube video IDs
  - Talks with only YouTube URLs (no TED.com link)
  - Talks missing both URLs
  - Missing thumbnails
  - Short or missing descriptions
  - Cards without primary mapping
  - Unmapped talks (talks not assigned to any card)
  - Soft-deleted talks

- **Guided Fixes**
  - Issue cards with quick actions
  - Direct links to edit pages
  - Collapsible sections by issue type
  - Count badges for each issue category

#### Polish & UX (Phase 5)
- **Toast Notifications**
  - Success/error messages for all CRUD operations
  - Auto-dismiss after 3 seconds
  - Positioned at bottom-right

- **Loading States**
  - Button spinners ("Saving...", "Deleting...")
  - Disabled state during operations
  - Skeleton loaders where appropriate

- **Keyboard Shortcuts**
  - Ctrl+S to save forms (TalkForm, MappingForm)

- **Mobile Notice**
  - Warning banner on screens < 1024px
  - "Admin portal is optimized for desktop"
  - Hidden on desktop/tablet

- **Confirmation Dialogs**
  - Soft delete: "Are you sure?" dialog
  - Hard delete: Type "DELETE" to confirm
  - Destructive actions protected

### 🐛 Critical Bug Fixes

#### SQL Subquery Bug (All Mapping Counts Showing 0)
**Issue**: Drizzle ORM interpolations like `${cardTalkMappings}` don't resolve correctly inside raw SQL template literals, causing all count subqueries to fail.

**Files Fixed**:
- `/lib/db/queries/admin-mappings.ts` (4 functions)
- `/lib/db/queries/admin-talks.ts` (2 functions)

**Solution**: Use raw table/column names (`card_talk_mappings.card_id`) instead of Drizzle interpolations.

**Impact**: Mapping counts now display correctly in:
- Card selector sidebar (shows actual mapping counts)
- Talks list (shows mappings per talk)
- Dashboard stats (accurate counts)
- Validation dashboard (correct issue detection)

#### JSON Parse Error on Themes Page
**Issue**: Theme detail page crashed during build when rendering cards with null/undefined `keywords` field.

**File Fixed**: `/app/themes/[slug]/page.tsx` line 94

**Solution**: Added null-safety check:
```typescript
const keywords = card.keywords ? JSON.parse(card.keywords) : [];
```

**Impact**: All 17 theme pages now build successfully (192 static pages total).

#### Missing Image File
**Issue**: Eight of Pentacles card image missing from `/public/images/cards/` directory.

**Resolution**: User manually added `eight-of-pentacles.jpg` to complete the set.

### 🔧 Technical Implementation

#### Database Queries (New)
- `/lib/db/queries/admin-talks.ts` - Admin-specific talk queries with mappings count
- `/lib/db/queries/admin-mappings.ts` - Full CRUD for mappings with atomic transactions
- `/lib/db/queries/admin-validation.ts` - Issue detection queries

#### API Routes (New)
- `/app/api/admin/talks/route.ts` - List/create talks
- `/app/api/admin/talks/[id]/route.ts` - Get/update/soft-delete talk
- `/app/api/admin/talks/[id]/hard-delete/route.ts` - Permanent deletion
- `/app/api/admin/talks/[id]/restore/route.ts` - Un-delete talk
- `/app/api/admin/fetch-metadata/route.ts` - TED + YouTube metadata fetching
- `/app/api/admin/mappings/route.ts` - List/create mappings
- `/app/api/admin/mappings/[id]/route.ts` - Delete/update mapping
- `/app/api/admin/validation/route.ts` - Get all validation issues

#### Components (New)
**Admin UI:**
- `AdminNav.tsx` - Two-mode navigation sidebar
- `Toast.tsx` - Success/error notifications
- `ConfirmDialog.tsx` - Standard confirmation
- `HardDeleteDialog.tsx` - Type-to-confirm deletion

**Talks:**
- `TalkForm.tsx` - Create/edit form with validation
- `TalksList.tsx` - Searchable table with actions
- `TalkRow.tsx` - Individual row with edit/delete
- `TalkPreview.tsx` - Live preview panel
- `UrlInputs.tsx` - TED + YouTube URL inputs with validation
- `MetadataFetcher.tsx` - Smart metadata fetching with merge logic

**Mappings:**
- `MappingEditor.tsx` - Two-panel layout
- `CardSelector.tsx` - Collapsible card list with search
- `TalkSelector.tsx` - Searchable talk dropdown with debounce
- `MappingForm.tsx` - Create/edit with strength slider and primary toggle
- `MappingsList.tsx` - Primary + secondary grouping

**Validation:**
- `ValidationDashboard.tsx` - Collapsible issue sections
- `IssueCard.tsx` - Individual issue display with actions

#### Utilities (New)
- `/lib/utils/rate-limit.ts` - In-memory rate limiting for API calls
- `/lib/hooks/useDebounce.ts` - Debounce hook for search inputs

### 📊 Data Quality Impact

#### Before Admin Portal
- 4 talks with duplicate YouTube IDs
- 2 talks missing YouTube metadata
- 11 talks with YouTube URLs in wrong field
- 2 cards without primary mappings
- All managed via database scripts

#### After Admin Portal
- All issues fixable through UI
- Validation dashboard shows remaining work
- Real-time issue detection
- Guided fix workflows (edit links)

### 🎯 Success Criteria Met

From ADMIN_PORTAL_PLAN.md:

**Phase 0 (Schema & Security):**
- ✅ Database backup before migration
- ✅ ADMIN_TOKEN protection
- ✅ Login page with HttpOnly cookies
- ✅ Middleware excludes login page

**Phase 1 (Foundation):**
- ✅ Admin portal at `/admin`
- ✅ Two-mode navigation
- ✅ Dashboard with stats
- ✅ Talks list with search
- ✅ Soft delete + restore
- ✅ Hard delete confirmation
- ✅ Slug collision handling
- ✅ Audit logging

**Phase 2 (Editing):**
- ✅ Create/edit talks
- ✅ TED + YouTube URL inputs
- ✅ Metadata fetcher (TED oEmbed + YouTube API)
- ✅ Rate limiting
- ✅ Error messages for API failures
- ✅ Live preview

**Phase 3 (Mappings):**
- ✅ View all mappings
- ✅ Create/edit with rationale
- ✅ Database constraint on primaries
- ✅ Transaction-based primary swap
- ✅ Delete mappings
- ✅ Strength rating input

**Phase 4 (Validation):**
- ✅ Validation dashboard
- ✅ All issue types detected
- ✅ Issue counts and details
- ✅ Links to fix pages
- ⚠️ Inline fix workflows (basic - edit links only)

**Phase 5 (Polish):**
- ✅ Toast notifications
- ✅ Loading states
- ✅ Hard delete confirmation
- ✅ Keyboard shortcuts (Ctrl+S)
- ✅ Mobile notice
- ✅ Desktop-focused design

### 📝 Documentation Updates

- `ADMIN_PORTAL_PLAN.md` - All phases marked complete
- `SHIP_LOG.md` - This release documented
- `.env.example` - YOUTUBE_API_KEY setup instructions
- `README.md` - (No changes this release)

### 🚧 Known Limitations & Future Work

#### Not Implemented (Deferred to v0.3.0)
1. **Theme Management Admin Interface** (0% complete)
   - Create/edit/delete themes
   - Assign cards/talks to themes
   - Currently managed via seed files only

2. **Inline Validation Fix Workflows**
   - Validation dashboard shows issues
   - Fix links go to edit pages (basic)
   - Advanced inline fixes (search YouTube, fetch metadata inline) not built

3. **Batch Operations**
   - No multi-select for bulk delete/restore
   - One-at-a-time operations only

4. **Rich Display Fields Not Shown to Users**
   - `rationaleLong` - Stored in DB, editable in admin, never shown to users
   - `mapping.strength` (1-5 rating) - Stored, editable, but hidden from public
   - `theme.longDescription` - Field exists but queries only use short
   - `theme.category` - Field exists but never used for filtering
   - `talk.language` - Stored but never displayed

#### Edge Cases
- YouTube API quota handling (shows error but no retry logic)
- No undo functionality for deletions
- No version history for mapping edits

### 🔮 What's Next: v0.3.0 - Enhanced Curation & User Features

**Planned Features:**
1. Theme Management Interface
   - Full CRUD for themes
   - Card/talk theme assignments
   - Category-based filtering

2. Enhanced User Experience
   - Display mapping strength visually (1-5 stars)
   - Show full rationale (rationaleLong) in expandable section
   - Theme category filters on themes page
   - Language indicator for talks

3. Advanced Validation Workflows
   - Inline YouTube search for duplicate ID fixes
   - One-click thumbnail fetch from TED/YouTube
   - Bulk metadata update operations

4. Content Expansion
   - Add 50+ more TED talks
   - Secondary mappings (multiple talks per card)
   - More themes (target: 25 total)

See next release planning in `NEXT-STEPS.md` (to be created).

---

**Built with ❤️ by the TarotTED team**
