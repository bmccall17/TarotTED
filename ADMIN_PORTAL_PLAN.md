# TarotTED Admin Portal Implementation Plan (v3)

## Overview
Build an admin portal at `/admin` to manage TED talks and card-talk mappings, with a data validation dashboard to fix quality issues. Lightweight token-based protection from day one.

## User Requirements
- ✅ Build admin portal FIRST (data fixes through UI, not scripts)
- ✅ Lightweight token protection (ADMIN_TOKEN env var)
- ✅ Let user decide per-talk whether to use TED.com vs YouTube URLs
- ✅ Features: Add/edit/delete talks, manage card-talk mappings, data validation dashboard

## Mental Model: Two Modes

The admin portal is organized into two distinct modes:

### 🎨 Curation Mode
- **Talks**: Add/edit/delete TED talks with metadata
- **Mappings**: Assign talks to cards with rationale
- **Themes**: Manage curated collections (future)

### 🔧 Repair Mode
- **Validation Dashboard**: View all data quality issues
- **Guided Fixes**: Step-by-step workflows to resolve problems

---

## Current Data Issues (76 talks)
- **Duplicate YouTube IDs**: 4 talks affected (Angela Duckworth has Gretchen Rubin's ID, Shonda Rhimes has Laura Vanderkam's ID)
- **Missing YouTube IDs**: 2 talks (Caroline Casey, Steve Jobs)
- **YouTube URLs in tedUrl**: 11 talks have YouTube URLs instead of TED.com URLs
- **Generic descriptions**: Many formulaic descriptions vs official TED content
- **Thumbnail quality**: Mix of TED CDN (64 talks) vs YouTube (12 talks)

---

## Schema Changes Required

### 1. URL Field Clarification
**Problem**: `tedUrl` is ambiguous - can be TED.com or YouTube URL, but validation flags YouTube URLs as issues.

**Solution**: Rename and clarify fields:
```typescript
// Current (confusing)
tedUrl: text('ted_url').notNull()           // Can be TED or YouTube - unclear
youtubeVideoId: text('youtube_video_id')    // Just the ID

// New (clear)
tedUrl: text('ted_url')                     // TED.com URL only, nullable if not on TED
youtubeUrl: text('youtube_url')             // Full YouTube URL, nullable
youtubeVideoId: text('youtube_video_id')    // Extracted video ID for API calls
```

**Logic**:
- If talk exists on TED.com → `tedUrl` is set, use as primary link
- If talk only on YouTube → `tedUrl` is null, use `youtubeUrl` as primary link
- `youtubeVideoId` is always extracted from `youtubeUrl` for API metadata fetching
- Display logic: `talk.tedUrl || talk.youtubeUrl` for the "Watch" button

**Database Constraint** (🔴 RED FLAG #3 FIX):
```sql
-- At least one URL must be present
ALTER TABLE talks ADD CONSTRAINT chk_at_least_one_url
CHECK (ted_url IS NOT NULL OR youtube_url IS NOT NULL);
```

**Migration**: Add `youtubeUrl` column, migrate YouTube URLs from `tedUrl` to `youtubeUrl`, make `tedUrl` nullable, add CHECK constraint.

### 2. Soft Delete for Talks
**Add fields to talks table**:
```typescript
isDeleted: boolean('is_deleted').default(false)
deletedAt: timestamp('deleted_at')
```

**Behavior**:
- Default delete = soft delete (set `isDeleted=true`, `deletedAt=now()`)
- Hard delete requires typing "DELETE" in confirmation dialog
- Public queries filter `WHERE isDeleted = false`
- Admin can view and restore soft-deleted talks

**Cascade Behavior** (🔴 RED FLAG #5 FIX):
```sql
-- Document and verify foreign key behavior
-- card_talk_mappings should CASCADE on talk deletion
ALTER TABLE card_talk_mappings
  DROP CONSTRAINT IF EXISTS card_talk_mappings_talk_id_fkey,
  ADD CONSTRAINT card_talk_mappings_talk_id_fkey
  FOREIGN KEY (talk_id) REFERENCES talks(id) ON DELETE CASCADE;
```
When a talk is hard-deleted, all its mappings are automatically deleted. This is intentional.

### 3. Primary Mapping Constraint (Database Level)
**Add unique partial index**:
```sql
CREATE UNIQUE INDEX idx_one_primary_per_card
ON card_talk_mappings (card_id)
WHERE is_primary = true;
```

This guarantees at the database level that only one mapping per card can have `isPrimary=true`, preventing race conditions and manual edit errors.

---

## Implementation Phases

### Phase 0: Schema Migration & Protection Setup
**Goal**: Database changes and basic security before building UI

**Tasks**:

#### 0.1 Backup First (🟡 YELLOW FLAG #8 FIX)
```bash
# Before any schema changes, export current data
npx tsx scripts/export-db-to-seed-files.ts
# Store backup in /lib/db/backups/YYYY-MM-DD/
```

#### 0.2 Add `youtubeUrl` column to talks table
- Migrate existing YouTube URLs from `tedUrl` to `youtubeUrl`
- Make `tedUrl` nullable
- Add CHECK constraint for at least one URL
- Update seed data files

#### 0.3 Add soft delete columns
- Add `isDeleted` (boolean, default false)
- Add `deletedAt` (timestamp, nullable)

#### 0.4 Add primary mapping constraint
- Create unique partial index on `card_talk_mappings`
- Test with duplicate insert (should fail)
- Test in Supabase SQL editor first (🟡 YELLOW FLAG #7)

#### 0.5 Add ADMIN_TOKEN protection
- Create `/middleware.ts` to protect `/admin/*` routes
- Add token check to all `/api/admin/*` routes
- Add `ADMIN_TOKEN` to `.env.local`

**Files to Modify**:
```
/lib/db/schema.ts                    # Add new columns
/lib/db/migrations/XXXX_*.sql        # Migration file
/lib/db/backups/                     # NEW - backup directory
/middleware.ts                       # NEW - route protection
/.env.local                          # Add ADMIN_TOKEN
/.env.example                        # Document ADMIN_TOKEN
```

**Middleware Pattern** (🔴 RED FLAGS #1 & #2 FIX):
```typescript
// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 🔴 FIX #2: Exclude login page from protection
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // 🔴 FIX #1: Check both cookie AND Authorization header
    const token = request.cookies.get('admin_token')?.value
                || request.headers.get('Authorization')?.replace('Bearer ', '');

    const validToken = process.env.ADMIN_TOKEN;

    if (!validToken || token !== validToken) {
      // For API routes, return 401
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // For page routes, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

**Cookie Security** (🟡 YELLOW FLAG #1 FIX):
```typescript
// In /app/admin/login/page.tsx - when setting the cookie
import { cookies } from 'next/headers';

// Server action for login
async function login(token: string) {
  'use server';
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/admin',
  });
}
```

---

### Phase 1: Foundation (Core Infrastructure)
**Goal**: Set up admin structure with talks CRUD

**New Files to Create**:
```
/lib/db/queries/admin-talks.ts              # Admin-specific talk queries
/app/api/admin/talks/route.ts               # GET (list) / POST (create)
/app/api/admin/talks/[id]/route.ts          # GET / PUT / DELETE (soft)
/app/api/admin/talks/[id]/hard-delete/route.ts  # Hard delete (requires confirmation)
/app/admin/layout.tsx                       # Admin layout with nav
/app/admin/page.tsx                         # Dashboard with stats
/app/admin/login/page.tsx                   # Simple token login page
/app/admin/talks/page.tsx                   # Talks list (server component)
/components/admin/ui/AdminNav.tsx           # Vertical navigation (two modes)
/components/admin/ui/StatsCard.tsx          # Dashboard stat cards
/components/admin/talks/TalkList.tsx        # Searchable talks table (client)
/components/admin/talks/TalkRow.tsx         # Individual row with actions
/components/admin/ui/ConfirmDialog.tsx      # Delete confirmation
/components/admin/ui/HardDeleteDialog.tsx   # Type "DELETE" confirmation
/components/admin/ui/Toast.tsx              # Success/error messages
```

**Key Functions in `/lib/db/queries/admin-talks.ts`**:
```typescript
// List all (including soft-deleted for admin)
getAllTalksForAdmin(includeDeleted?: boolean)

// Single talk with mappings
getTalkByIdForAdmin(id: string)

// Search by title/speaker
searchTalksForAdmin(query: string)

// CRUD with slug collision handling (🔴 RED FLAG #4 FIX)
async function createTalk(data: InsertTalk) {
  let slug = generateSlug(data.speakerName, data.title);

  // Check for existing slug and handle collision
  const existing = await db.select({ slug: talks.slug })
    .from(talks)
    .where(eq(talks.slug, slug));

  if (existing.length > 0) {
    // Append timestamp to make unique
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return db.insert(talks).values({ ...data, slug });
}

updateTalk(id: string, data: Partial<InsertTalk>)
softDeleteTalk(id: string)      // Sets isDeleted=true
hardDeleteTalk(id: string)      // Actually removes from DB (cascades to mappings)
restoreTalk(id: string)         // Sets isDeleted=false

// Stats for dashboard
getTalksStats()
```

**Soft Delete Query Helper** (🟡 YELLOW FLAG #4 FIX):
```typescript
// lib/db/queries/talks.ts - Reusable filter
import { eq, and } from 'drizzle-orm';

// Active filter for public queries
export const activeFilter = eq(talks.isDeleted, false);

// Use in all public queries:
export async function getAllTalks() {
  return db.select()
    .from(talks)
    .where(activeFilter)  // Never forget this!
    .orderBy(desc(talks.createdAt));
}
```

**Audit Logging** (🟡 YELLOW FLAG #5 FIX):
```typescript
// lib/utils/audit.ts
export function auditLog(action: string, details: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT] ${timestamp} | ${action} |`, JSON.stringify(details));

  // Future: Write to audit_log table or external service
}

// Usage in API routes:
auditLog('TALK_HARD_DELETED', { talkId: id, talkTitle: talk.title });
auditLog('MAPPING_CREATED', { cardId, talkId, isPrimary });
```

**AdminNav Component (Two Modes)**:
```
┌─────────────────────────┐
│  TarotTED Admin         │
├─────────────────────────┤
│  🎨 CURATION            │
│    📺 Talks             │
│    🔗 Mappings          │
│    📂 Themes            │
├─────────────────────────┤
│  🔧 REPAIR              │
│    ⚠️ Validation        │
├─────────────────────────┤
│  ← Back to Site         │
└─────────────────────────┘
```

---

### Phase 2: Talk Editing & Metadata Fetching
**Goal**: Full talk create/edit with smart metadata fetching

**New Files to Create**:
```
/app/admin/talks/new/page.tsx                           # Create talk page
/app/admin/talks/[id]/edit/page.tsx                     # Edit talk page
/app/api/admin/talks/[id]/fetch-metadata/route.ts       # Fetch YouTube/TED metadata
/components/admin/talks/TalkForm.tsx                    # Create/edit form (client)
/components/admin/talks/MetadataFetcher.tsx             # Fetch & preview metadata
/components/admin/talks/TalkPreview.tsx                 # Live preview
/components/admin/talks/UrlInputs.tsx                   # TED + YouTube URL inputs
```

**TalkForm Fields** (updated for new schema):
```typescript
interface TalkFormData {
  title: string;           // Required
  speakerName: string;     // Required
  tedUrl: string | null;   // TED.com URL (nullable)
  youtubeUrl: string | null; // YouTube URL (nullable)
  youtubeVideoId: string | null; // Auto-extracted from youtubeUrl
  description: string | null;
  durationSeconds: number | null;
  year: number | null;
  eventName: string | null;
  thumbnailUrl: string | null;
  language: string;        // Default 'en'
}
```

**UrlInputs Component**:
- Two URL input fields: TED.com and YouTube
- Auto-extract `youtubeVideoId` from YouTube URL
- Validation: At least one URL required (matches DB constraint)
- Visual indicator showing which URL is "primary" for viewing

**Rate Limiting for Metadata Fetch** (🟡 YELLOW FLAG #2 FIX):
```typescript
// lib/utils/rate-limit.ts
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10; // max requests per minute

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window

  const requests = rateLimitMap.get(key) || [];
  const recentRequests = requests.filter(t => t > windowStart);

  if (recentRequests.length >= RATE_LIMIT) {
    return false; // Rate limited
  }

  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);
  return true;
}
```

**Error Handling for External APIs** (🟡 YELLOW FLAG #9 FIX):
```typescript
// In /app/api/admin/talks/[id]/fetch-metadata/route.ts

interface MetadataResult {
  ted: TedMetadata | null;
  youtube: YoutubeMetadata | null;
  merged: MergedMetadata;
  errors: {
    ted?: string;
    youtube?: string;
  };
}

async function fetchTedMetadata(url: string): Promise<TedMetadata | { error: string }> {
  try {
    const response = await fetch(`https://www.ted.com/services/v1/oembed.json?url=${encodeURIComponent(url)}`);

    if (response.status === 404) {
      return { error: 'Talk not found on TED.com - may have been removed' };
    }
    if (!response.ok) {
      return { error: `TED API error: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      return { error: 'TED.com request timed out - try again later' };
    }
    return { error: 'Failed to fetch from TED.com' };
  }
}

async function fetchYoutubeMetadata(videoId: string): Promise<YoutubeMetadata | { error: string }> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (response.status === 403) {
      return { error: 'YouTube API quota exceeded - try again tomorrow' };
    }
    if (!response.ok) {
      return { error: `YouTube API error: ${response.status}` };
    }

    const data = await response.json();
    if (!data.items?.length) {
      return { error: 'YouTube video not found - may have been deleted' };
    }

    return parseYoutubeData(data.items[0]);
  } catch (error) {
    return { error: 'Failed to fetch from YouTube API' };
  }
}
```

**MetadataFetcher Workflow** (improved):
1. User enters TED.com URL and/or YouTube URL
2. Click "Fetch Metadata" button
3. Check rate limit before calling APIs
4. **Try TED oEmbed first** for: title, thumbnail
5. **Use YouTube API for**: duration, year, description, thumbnail (as fallback)
6. **Merge results**: TED data preferred, YouTube fills gaps
7. **Show errors inline** if either API fails
8. Show side-by-side comparison (current vs fetched)
9. Checkboxes to select which fields to apply
10. Apply selected fields to form

**API Endpoint**: `POST /api/admin/talks/[id]/fetch-metadata`
```typescript
// Request
{
  tedUrl?: string;      // Optional TED.com URL
  youtubeUrl?: string;  // Optional YouTube URL
}

// Response
{
  ted: { title, thumbnailUrl } | null,
  youtube: { title, description, durationSeconds, year, thumbnailUrl } | null,
  merged: {
    title: string;
    description: string | null;
    durationSeconds: number | null;
    year: number | null;
    thumbnailUrl: string | null;
    source: { [field: string]: 'ted' | 'youtube' }  // Track where each field came from
  },
  errors: {
    ted?: string;      // Error message if TED fetch failed
    youtube?: string;  // Error message if YouTube fetch failed
  }
}
```

**YouTube API Key Security** (🟡 YELLOW FLAG #6):
- `YOUTUBE_API_KEY` is ONLY accessed in `/app/api/admin/talks/[id]/fetch-metadata/route.ts`
- NEVER import or reference this key in any client component
- The key stays server-side only

---

### Phase 3: Mappings Management
**Goal**: Card-talk mapping interface with database-enforced constraints

**New Files to Create**:
```
/lib/db/queries/admin-mappings.ts            # Mapping queries
/app/api/admin/mappings/route.ts             # GET (list) / POST (create/update)
/app/api/admin/mappings/[id]/route.ts        # DELETE
/app/admin/mappings/page.tsx                 # Mappings page (server)
/components/admin/mappings/MappingEditor.tsx # Main UI (client)
/components/admin/mappings/CardSelector.tsx  # Card dropdown/search
/components/admin/mappings/TalkSelector.tsx  # Talk dropdown/search
/components/admin/mappings/MappingForm.tsx   # Rationale, strength, isPrimary
/components/admin/mappings/MappingsList.tsx  # Show all for a card
```

**Key Functions in `/lib/db/queries/admin-mappings.ts`**:
```typescript
getAllMappingsForAdmin()                    // All mappings with card & talk details
getMappingsByCardId(cardId: string)         // Mappings for specific card
getCardsWithoutPrimaryMapping()             // Cards missing primary talk
getUnmappedTalks()                          // Talks not assigned to any card
upsertMapping(data: MappingData)            // Create or update mapping
deleteMapping(id: string)                   // Remove mapping
getMappingsStats()                          // Dashboard statistics
```

**Primary Mapping Logic with Transaction** (🟡 YELLOW FLAG #3 FIX):
```typescript
// When setting isPrimary=true on a new mapping
async function setAsPrimary(cardId: string, talkId: string, mappingData: MappingData) {
  // Use transaction to ensure atomicity
  await db.transaction(async (tx) => {
    // Step 1: Demote existing primary (if any)
    await tx.update(cardTalkMappings)
      .set({ isPrimary: false })
      .where(
        and(
          eq(cardTalkMappings.cardId, cardId),
          eq(cardTalkMappings.isPrimary, true)
        )
      );

    // Step 2: Upsert the new primary mapping
    await tx.insert(cardTalkMappings)
      .values({ ...mappingData, cardId, talkId, isPrimary: true })
      .onConflictDoUpdate({
        target: [cardTalkMappings.cardId, cardTalkMappings.talkId],
        set: { ...mappingData, isPrimary: true }
      });
  });

  // Database unique partial index is backup protection
  auditLog('MAPPING_SET_PRIMARY', { cardId, talkId });
}
```

**MappingEditor Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Card-Talk Mappings                          [+ Add Mapping]│
├────────────────────┬────────────────────────────────────────┤
│ 📇 Cards (78)      │ 🔗 Mappings for: Four of Wands        │
│                    │                                        │
│ ▸ Major Arcana     │ ⭐ PRIMARY                             │
│   The Fool         │ ┌────────────────────────────────────┐ │
│   The Magician     │ │ Priya Parker                       │ │
│   ...              │ │ "3 Steps to Turn Everyday..."      │ │
│ ▸ Wands            │ │ Strength: ●●●●● (5)                │ │
│   Ace of Wands     │ │ "The Four of Wands celebrates..."  │ │
│   Two of Wands     │ │ [Edit] [Demote] [Delete]           │ │
│   Three of Wands   │ └────────────────────────────────────┘ │
│   ★ Four of Wands  │                                        │
│   Five of Wands    │ ─ SECONDARY MAPPINGS ─                 │
│   ...              │ (none)                                 │
│ ▸ Cups             │                                        │
│ ▸ Swords           │ [+ Add Another Mapping]                │
│ ▸ Pentacles        │                                        │
└────────────────────┴────────────────────────────────────────┘
```

---

### Phase 4: Validation Dashboard (Repair Mode)
**Goal**: Data quality dashboard with guided fix workflows

**New Files to Create**:
```
/lib/db/queries/admin-validation.ts                  # Validation queries
/app/api/admin/validation/route.ts                   # GET validation issues
/app/admin/validation/page.tsx                       # Validation page (server)
/components/admin/validation/ValidationDashboard.tsx # Overview (client)
/components/admin/validation/IssueCard.tsx           # Individual issue display
/components/admin/validation/DuplicateVideoIds.tsx   # Fix duplicates
/components/admin/validation/MissingUrls.tsx         # Add missing TED/YouTube URLs
/components/admin/validation/MissingThumbnails.tsx   # Fix thumbnails
/components/admin/validation/ShortDescriptions.tsx   # Improve descriptions
/components/admin/validation/UnmappedItems.tsx       # Cards without talks, talks without cards
```

**Validation Issues Detected** (updated):
```typescript
interface ValidationIssues {
  // Critical (🔴)
  duplicateYoutubeIds: Array<{
    youtubeVideoId: string;
    talks: Array<{ id, title, speakerName }>;
  }>;

  // Important (🟡)
  talksWithOnlyYoutubeUrl: Array<{
    id, title, speakerName, youtubeUrl;
    suggestedTedUrl?: string;  // If we can find it
  }>;
  missingBothUrls: Array<{ id, title, speakerName }>;
  missingThumbnails: Array<{ id, title, speakerName }>;
  shortDescriptions: Array<{ id, title, speakerName, description }>;

  // Mapping Issues (🟠)
  cardsWithoutPrimaryMapping: Array<{ id, name, slug }>;
  talksNotMappedToAnyCard: Array<{ id, title, speakerName }>;

  // Info (ℹ️)
  softDeletedTalks: Array<{ id, title, deletedAt }>;
}
```

**Guided Fix Workflows**:

1. **Duplicate YouTube IDs**:
   - Show both talks side-by-side
   - "Search YouTube" button to find correct video for each
   - Inline edit to correct video ID
   - Fetch metadata to verify

2. **Talks with Only YouTube URL**:
   - "Search TED.com" button (opens TED search in new tab)
   - Input for TED.com URL
   - "Fetch & Compare" to preview metadata from both sources
   - Option to add TED URL or mark as "YouTube-only"

3. **Missing Thumbnails**:
   - "Fetch from YouTube" button
   - "Fetch from TED" button
   - Preview before applying
   - Manual URL input as fallback

4. **Cards Without Primary Mapping**:
   - Show card details
   - Quick search for relevant talks
   - One-click assign as primary

---

### Phase 5: Polish & UX
**Goal**: Production-ready experience

**Enhancements**:
- Toast notifications for all actions (create, update, delete)
- Optimistic UI updates (remove from list before API response)
- Loading states (spinners, skeleton loaders)
- Confirmation dialogs for destructive actions
- Hard delete requires typing "DELETE"
- Keyboard shortcuts (Ctrl+S to save form)
- Better error messages with recovery suggestions
- Form auto-save to prevent data loss
- Batch operations (select multiple, bulk delete/restore)

**Mobile Responsiveness** (🟡 YELLOW FLAG #10 FIX):
The admin portal is designed for **desktop use**. On mobile devices:
- MappingEditor: Stack columns vertically, use tabs for card/mapping selection
- TalkList: Collapse table into card view
- Minimum supported width: 768px (tablet portrait)
- Show "Best viewed on desktop" notice on narrow screens

---

## Critical Files & Implementation Order

### Phase 0 (Schema & Security):
1. `/lib/db/backups/` - Create backup before migration
2. `/lib/db/schema.ts` - Add new columns
3. `/lib/db/migrations/XXXX_add_youtube_url_soft_delete.sql` - Migration
4. `/middleware.ts` - Route protection (with login page exclusion)
5. `/app/admin/login/page.tsx` - Simple token login

### Phase 1 (Foundation):
6. `/lib/db/queries/admin-talks.ts` - Core data access (with slug collision handling)
7. `/lib/utils/audit.ts` - Audit logging utility
8. `/app/api/admin/talks/route.ts` - API endpoints
9. `/app/admin/layout.tsx` - Admin layout with two-mode nav
10. `/app/admin/page.tsx` - Dashboard
11. `/components/admin/talks/TalkList.tsx` - Table UI

### Phase 2 (Editing):
12. `/lib/utils/rate-limit.ts` - Rate limiting utility
13. `/components/admin/talks/TalkForm.tsx` - Form component
14. `/components/admin/talks/MetadataFetcher.tsx` - Smart fetching with error handling
15. `/app/api/admin/talks/[id]/fetch-metadata/route.ts` - Fetch API

### Phase 3 (Mappings):
16. `/lib/db/queries/admin-mappings.ts` - Mapping queries (with transactions)
17. `/components/admin/mappings/MappingEditor.tsx` - Mapping UI

### Phase 4 (Validation):
18. `/lib/db/queries/admin-validation.ts` - Validation queries
19. `/components/admin/validation/ValidationDashboard.tsx` - Fix workflows

---

## Summary of Fixes Applied

### 🔴 Red Flags (All Fixed)
| # | Issue | Fix |
|---|-------|-----|
| 1 | Middleware doesn't check headers | Added `Authorization` header check as fallback |
| 2 | Login page in protected route | Excluded `/admin/login` from middleware protection |
| 3 | No constraint for at least one URL | Added `CHECK (ted_url IS NOT NULL OR youtube_url IS NOT NULL)` |
| 4 | No slug collision handling | Added collision check and timestamp suffix in `createTalk()` |
| 5 | Cascade delete behavior undefined | Documented and verified `ON DELETE CASCADE` for mappings |

### 🟡 Yellow Flags (All Addressed)
| # | Issue | Fix |
|---|-------|-----|
| 1 | Cookie not HttpOnly/Secure | Added proper cookie settings in login |
| 2 | No rate limiting | Added rate limit utility for metadata fetch |
| 3 | Transaction not explicit | Added explicit transaction for primary mapping swap |
| 4 | Soft delete not filtered | Created reusable `activeFilter` helper |
| 5 | No audit logging | Added `auditLog()` utility for destructive actions |
| 6 | API key exposure risk | Verified key only used server-side |
| 7 | Partial index PostgreSQL | Test in Supabase SQL editor first |
| 8 | No backup before migration | Added backup step to Phase 0 |
| 9 | External API error handling | Added specific error messages for each failure mode |
| 10 | Mobile not responsive | Documented as desktop-focused with graceful degradation |

---

## UI Theme Constants
```typescript
// Reuse from existing components
bg-gray-900, bg-gray-800/50
border-gray-700, border-gray-600 (hover)
text-gray-100, text-gray-400
bg-indigo-600 hover:bg-indigo-700 (primary button)
bg-red-600 hover:bg-red-700 (danger button)
bg-gradient-to-br from-indigo-900/40 to-purple-900/40 (cards)
rounded-xl, shadow-sm
```

---

## API Integration

### YouTube Data API v3
```
Endpoint: https://www.googleapis.com/youtube/v3/videos
Params: part=snippet,contentDetails&id={videoId}&key={API_KEY}
Returns: title, description, duration, publishedAt, thumbnails
```

### TED oEmbed API
```
Endpoint: https://www.ted.com/services/v1/oembed.json
Params: url={tedUrl}
Returns: title, thumbnail_url (limited data)
```

### Metadata Fetching Strategy
1. If TED URL provided → fetch TED oEmbed for title/thumbnail
2. If YouTube URL provided → fetch YouTube API for all fields
3. Merge: TED data preferred for title/thumbnail, YouTube fills rest
4. Display source indicators in UI
5. Show user-friendly error messages if APIs fail

---

## Success Criteria

### Phase 0 Complete:
- [X] Database backup created before migration
- [X] `youtubeUrl` column added and migrated
- [X] CHECK constraint for at least one URL added
- [X] Soft delete columns added (`isDeleted`, `deletedAt`)
- [X] Cascade delete verified for mappings
- [X] Primary mapping unique index created
- [X] ADMIN_TOKEN protection working
- [X] Login page excluded from protection
- [X] Cookie set with HttpOnly/Secure flags

### Phase 1 Complete:
- [X] Admin portal accessible at `/admin`
- [X] Two-mode navigation (Curation / Repair)
- [X] Dashboard shows talk statistics
- [X] Talks list with search and filters
- [X] Soft delete working with restore option
- [X] Hard delete requires typing "DELETE"
- [X] Slug collisions handled automatically
- [X] Audit logging for destructive actions

### Phase 2 Complete:
- [X] Can create new talks with all fields
- [X] Can edit existing talks
- [X] TED + YouTube URL inputs working
- [X] At least one URL validation enforced
- [X] Metadata fetcher merges TED + YouTube data
- [X] Rate limiting active on metadata fetch
- [X] Error messages shown for API failures
- [X] Shows data source for each field

### Phase 3 Complete:
- [X] Can view all card-talk mappings
- [X] Can create/edit mappings with rationale
- [X] Database constraint prevents duplicate primaries
- [X] Transaction used for primary swap
- [X] UI shows warning when changing primary
- [X] Can delete mappings

### Phase 4 Complete:
- [X] Validation dashboard shows all issue types
- [X] Duplicate YouTube IDs fixable inline
- [X] Can add TED URLs to YouTube-only talks
- [X] Can fetch missing thumbnails
- [X] Shows unmapped cards and talks

### Phase 5 Complete:
- [ ] Toast notifications working
- [ ] Loading states on all actions
- [ ] Hard delete confirmation functional
- [ ] No console errors
- [ ] Desktop-focused with tablet support
- [ ] "Best on desktop" notice for mobile

---

## Files to Reference During Implementation

**Existing Patterns**:
- Query: `/lib/db/queries/talks.ts`
- API: `/app/api/search/route.ts`
- Component: `/components/talks/TalksGrid.tsx`
- Layout: `/app/layout.tsx`

**Scripts to Leverage**:
- `/scripts/upsert-talks.ts` - CRUD pattern
- `/scripts/fetch-youtube-metadata.ts` - YouTube API integration
- `/scripts/upsert-mappings.ts` - Mapping logic
- `/scripts/export-db-to-seed-files.ts` - Backup before migration

**Schema**:
- `/lib/db/schema.ts` - Table definitions
- `/lib/db/seed-data/helpers.ts` - generateSlug() function
