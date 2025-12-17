# TarotTED Admin Portal Implementation Plan

## Overview
Build an admin portal at `/admin` to manage TED talks and card-talk mappings, with a data validation dashboard to fix quality issues. No authentication initially.

## User Requirements
- ✅ Build admin portal FIRST (data fixes through UI, not scripts)
- ✅ No authentication initially
- ✅ Let user decide per-talk whether to use TED.com vs YouTube URLs
- ✅ Features: Add/edit/delete talks, manage card-talk mappings, data validation dashboard

## Current Data Issues (76 talks)
- **Duplicate YouTube IDs**: 4 talks affected (Angela Duckworth has Gretchen Rubin's ID, Shonda Rhimes has Laura Vanderkam's ID)
- **Missing YouTube IDs**: 2 talks (Caroline Casey, Steve Jobs)
- **YouTube URLs in tedUrl**: 11 talks have YouTube URLs instead of TED.com URLs
- **Generic descriptions**: Many formulaic descriptions vs official TED content
- **Thumbnail quality**: Mix of TED CDN (64 talks) vs YouTube (12 talks)

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
**Goal**: Set up admin structure with talks CRUD

**New Files to Create**:
```
/lib/db/queries/admin-talks.ts              # Admin-specific talk queries
/app/api/admin/talks/route.ts               # GET (list) / POST (create)
/app/api/admin/talks/[id]/route.ts          # GET / PUT / DELETE
/app/admin/layout.tsx                       # Admin layout with nav
/app/admin/page.tsx                         # Dashboard with stats
/app/admin/talks/page.tsx                   # Talks list (server component)
/components/admin/ui/AdminNav.tsx           # Vertical navigation
/components/admin/ui/StatsCard.tsx          # Dashboard stat cards
/components/admin/talks/TalkList.tsx        # Searchable talks table (client)
/components/admin/talks/TalkRow.tsx         # Individual row with actions
/components/admin/ui/ConfirmDialog.tsx      # Delete confirmation
/components/admin/ui/Toast.tsx              # Success/error messages
```

**Key Functions in `/lib/db/queries/admin-talks.ts`**:
- `getAllTalksForAdmin()` - List all with data quality flags
- `getTalkByIdForAdmin(id)` - Single talk with mappings
- `searchTalksForAdmin(query)` - Search by title/speaker
- `createTalk(data)` - Insert new talk
- `updateTalk(id, data)` - Update existing
- `deleteTalk(id)` - Delete (cascade removes mappings)
- `getTalksStats()` - Dashboard statistics

**Patterns to Follow** (from existing code):
- Query pattern: `/lib/db/queries/talks.ts` (lines 5-32)
- API route pattern: `/app/api/search/route.ts` (lines 6-93)
- Client component pattern: `/components/talks/TalksGrid.tsx` (lines 40-193)
- Dark theme colors: gray-900, indigo-950, purple-950 gradient

---

### Phase 2: Talk Editing
**Goal**: Full talk create/edit with metadata fetching

**New Files to Create**:
```
/app/admin/talks/new/page.tsx                           # Create talk page
/app/admin/talks/[id]/edit/page.tsx                     # Edit talk page
/app/api/admin/talks/[id]/fetch-metadata/route.ts       # Fetch YouTube/TED metadata
/components/admin/talks/TalkForm.tsx                    # Create/edit form (client)
/components/admin/talks/MetadataFetcher.tsx             # Fetch & preview metadata
/components/admin/talks/TalkPreview.tsx                 # Live preview
```

**TalkForm Component Features**:
- All fields editable: title, speaker, tedUrl, description, year, duration, thumbnail, youtubeVideoId
- Slug auto-generation from speaker + title
- Client-side validation (required fields, URL format)
- Integration with MetadataFetcher

**MetadataFetcher Workflow**:
1. User enters YouTube or TED URL
2. Click "Fetch Metadata" button
3. API calls YouTube Data API or TED oEmbed API
4. Show side-by-side comparison (current vs fetched)
5. User selects which fields to update
6. Apply selected fields to form

**API Endpoint**: `POST /api/admin/talks/[id]/fetch-metadata`
- Accepts: `{ source: 'youtube' | 'ted', url: string }`
- Returns: `{ title, description, durationSeconds, year, thumbnailUrl }`
- Uses existing patterns from `/scripts/fetch-youtube-metadata.ts`

---

### Phase 3: Mappings Management
**Goal**: Card-talk mapping interface

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
- `getAllMappingsForAdmin()` - All mappings with card & talk details
- `getMappingsByCardId(cardId)` - Mappings for specific card
- `getCardsWithoutPrimaryMapping()` - Cards missing primary talk
- `upsertMapping(data)` - Create or update mapping
- `deleteMapping(id)` - Remove mapping
- `getMappingsStats()` - Dashboard statistics

**MappingEditor Layout**:
```
┌─────────────────────────────────────────────────┐
│  Select Card:  [Four of Wands ▼]                │
├────────────────┬────────────────────────────────┤
│ Cards List     │ Current Mappings for Card      │
│                │                                 │
│ □ The Fool     │ ✓ Primary: Priya Parker talk   │
│ □ The Magician │   Strength: 5                  │
│ ☑ Four of Wands│   "The Four of Wands..."       │
│ □ Five of Wands│   [Edit] [Delete]              │
│ ...            │                                 │
│                │ [+ Add New Mapping]             │
└────────────────┴────────────────────────────────┘
```

**Validation**:
- Only one isPrimary per card
- Prevent duplicate card-talk pairs
- Strength must be 1-5
- rationaleShort required

---

### Phase 4: Validation Dashboard
**Goal**: Data quality dashboard with fix workflows

**New Files to Create**:
```
/lib/db/queries/admin-validation.ts                  # Validation queries
/app/api/admin/validation/route.ts                   # GET validation issues
/app/admin/validation/page.tsx                       # Validation page (server)
/components/admin/validation/ValidationDashboard.tsx # Overview (client)
/components/admin/validation/IssueCard.tsx           # Individual issue display
/components/admin/validation/DuplicateVideoIds.tsx   # Fix duplicates
/components/admin/validation/MissingYoutubeIds.tsx   # Add missing IDs
/components/admin/validation/YoutubeUrlsInTedUrl.tsx # Suggest TED.com URLs
```

**Validation Issues Detected**:
```typescript
interface ValidationIssues {
  duplicateYoutubeIds: Array<{
    youtubeVideoId: string;
    talks: Array<{ id, title, speakerName }>;
  }>;
  missingYoutubeIds: Array<{ id, title, speakerName, tedUrl }>;
  youtubeUrlsInTedUrl: Array<{ id, title, speakerName, tedUrl }>;
  missingThumbnails: Array<{ id, title, speakerName }>;
  shortDescriptions: Array<{ id, title, speakerName, description }>;
  cardsWithoutPrimaryMapping: Array<{ id, name, slug }>;
  orphanedMappings: Array<{ id, cardId, talkId }>;
}
```

**Fix Workflows**:
1. **Duplicate YouTube IDs**: Inline edit to correct video ID
2. **YouTube URLs in tedUrl**:
   - Button to search TED.com (opens in new tab)
   - Input for corrected TED.com URL
   - "Fetch Metadata" to preview
   - Option to move YouTube URL to youtubeVideoId field
3. **Missing data**: Link to edit page with field highlighted

---

### Phase 5: Polish & UX
**Goal**: Production-ready experience

**Enhancements**:
- Toast notifications for all actions (create, update, delete)
- Optimistic UI updates (remove from list before API response)
- Loading states (spinners, skeleton loaders)
- Confirmation dialogs for destructive actions
- Keyboard shortcuts (Ctrl+S to save form)
- Better error messages with recovery suggestions
- Form auto-save to prevent data loss

---

## Critical Files & Patterns

### 5 Most Critical Files (implement in order):

1. **`/lib/db/queries/admin-talks.ts`**
   - Core data access layer
   - Pattern: Follow `/lib/db/queries/talks.ts` structure
   - Use Drizzle ORM with `eq`, `desc`, `ilike`, `or`, `sql`

2. **`/app/api/admin/talks/route.ts`**
   - First API endpoint
   - Pattern: Follow `/app/api/search/route.ts` (lines 6-93)
   - Error handling with try/catch and proper HTTP status codes

3. **`/components/admin/talks/TalkForm.tsx`**
   - Central UI component
   - Pattern: Client component with `'use client'` directive
   - Form state management with controlled inputs

4. **`/app/admin/layout.tsx`**
   - Admin portal structure
   - Pattern: Follow `/app/layout.tsx` but add sidebar nav
   - Dark gradient theme: `from-gray-900 via-indigo-950 to-purple-950`

5. **`/components/admin/talks/MetadataFetcher.tsx`**
   - Solves core data quality problem
   - Fetch from YouTube Data API or TED oEmbed
   - Side-by-side preview (current vs fetched)

### UI Theme Constants:
```typescript
// Reuse from existing components
bg-gray-900, bg-gray-800/50
border-gray-700, border-gray-600 (hover)
text-gray-100, text-gray-400
bg-indigo-600 hover:bg-indigo-700 (primary button)
bg-gradient-to-br from-indigo-900/40 to-purple-900/40 (cards)
rounded-xl, shadow-sm
```

### API Integration:
- **YouTube Data API**: `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={videoId}&key={API_KEY}`
- **TED oEmbed**: `https://www.ted.com/services/v1/oembed.json?url={tedUrl}`
- Environment variable: `YOUTUBE_API_KEY` in `.env.local`

---

## Database Schema (Reference)

**Tables Used**:
- `talks` - All TED talk data
- `cards` - 78 Tarot cards
- `cardTalkMappings` - Many-to-many relationship with rationale
- `themes` - Curated collections (future use)

**Key Fields**:
- `talks.slug` - Unique identifier for URLs
- `talks.youtubeVideoId` - For metadata fetching
- `talks.tedUrl` - Can be TED.com or YouTube URL (user decides)
- `cardTalkMappings.isPrimary` - One per card
- `cardTalkMappings.strength` - 1-5 rating

---

## Success Criteria

### Phase 1 Complete:
- [ ] Admin portal accessible at `/admin`
- [ ] Dashboard shows talk statistics
- [ ] Talks list page with search and filters
- [ ] Can delete talks with confirmation

### Phase 2 Complete:
- [ ] Can create new talks with all fields
- [ ] Can edit existing talks
- [ ] Metadata fetcher shows preview from YouTube/TED
- [ ] Slug auto-generates from speaker + title

### Phase 3 Complete:
- [ ] Can view all card-talk mappings
- [ ] Can create/edit mappings with rationale
- [ ] Can delete mappings
- [ ] Prevents duplicate card-talk pairs
- [ ] Enforces one primary per card

### Phase 4 Complete:
- [ ] Validation dashboard shows all 7 issue types
- [ ] Can fix duplicate YouTube IDs inline
- [ ] Can search for TED.com URLs for YouTube talks
- [ ] Can add missing YouTube IDs
- [ ] Shows cards without primary mappings

### Phase 5 Complete:
- [ ] Toast notifications working
- [ ] Loading states on all actions
- [ ] Keyboard shortcuts functional
- [ ] No console errors
- [ ] Mobile responsive

---

## Next Steps After Implementation

1. **Add Authentication** (when ready):
   - Install NextAuth.js or use Supabase Auth
   - Protect `/app/admin/layout.tsx` with auth check
   - Protect all `/app/api/admin/*` routes

2. **Data Export**:
   - Add "Export to JSON" button
   - Integrate with existing `/scripts/export-db-to-seed-files.ts`

3. **Bulk Operations** (if needed):
   - CSV import for talks
   - Bulk metadata refresh
   - Batch assign talks to themes

4. **Analytics**:
   - Track which talks are most viewed (if adding analytics)
   - Show popular card-talk pairings

---

## Files to Reference During Implementation

**Existing Patterns**:
- Query: `/lib/db/queries/talks.ts`
- API: `/app/api/search/route.ts`
- Component: `/components/talks/TalksGrid.tsx`
- Layout: `/app/layout.tsx`

**Scripts to Leverage**:
- `/scripts/upsert-talks.ts` - CRUD pattern
- `/scripts/fetch-youtube-metadata.ts` - API integration
- `/scripts/upsert-mappings.ts` - Mapping logic

**Schema**:
- `/lib/db/schema.ts` - Table definitions
- `/lib/db/seed-data/helpers.ts` - generateSlug() function
