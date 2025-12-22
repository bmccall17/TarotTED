# TarotTED - Next Steps & Development Roadmap

**Last Updated:** December 22, 2024
**Current Version:** v0.2.0
**Next Target:** v0.3.0 - Enhanced Curation & User Features

---

## Current State Assessment

### ✅ What's Complete (v0.2.0)
- Full admin portal with authentication
- CRUD for talks (create/edit/delete/restore)
- CRUD for mappings (create/edit/delete with primary constraints)
- Validation dashboard (issue detection with edit links)
- Metadata fetching (TED oEmbed + YouTube API)
- All user-facing pages (cards, talks, themes, search)
- Mobile-first responsive design
- 78 cards with complete meanings
- 76+ talks with full metadata
- 17 themes with card/talk assignments

### ⚠️ Known Gaps (As of v0.2.0)
1. **Theme Management** - No admin interface (managed via seed files)
2. **Rich Content Not Displayed** - Database fields exist but hidden from users:
   - `rationaleLong` (full mapping explanation)
   - `mapping.strength` (1-5 rating)
   - `theme.longDescription`
   - `theme.category`
   - `talk.language`
3. **Advanced Validation** - Basic edit links only, no inline fix workflows
4. **Batch Operations** - No multi-select or bulk actions

---

## Priority Roadmap

### 🔥 High Priority (v0.3.0) - Next 2-4 Weeks

#### 1. Theme Management Admin Interface
**Why:** Themes are hardcoded in seed files, can't be created/edited through UI
**Impact:** Enables dynamic theme curation without code deployments

**Features to Build:**
- `/app/admin/themes/page.tsx` - List all themes with stats
- `/app/admin/themes/new/page.tsx` - Create new theme
- `/app/admin/themes/[id]/edit/page.tsx` - Edit theme details
- `/lib/db/queries/admin-themes.ts` - Theme CRUD queries
- `/app/api/admin/themes/route.ts` - GET/POST themes
- `/app/api/admin/themes/[id]/route.ts` - PUT/DELETE theme
- `ThemeForm.tsx` - Create/edit form with:
  - Name, slug, description (short + long)
  - Category selection (emotion, life_phase, role, other)
  - Card assignment (multi-select from all 78 cards)
  - Talk assignment (multi-select from all talks)
  - Preview of selected items

**Acceptance Criteria:**
- ✅ Can create new theme with name, slug, descriptions
- ✅ Can assign category to theme
- ✅ Can select cards to include in theme
- ✅ Can select talks to include in theme
- ✅ Can edit existing theme without data loss
- ✅ Can soft-delete themes (with restore)
- ✅ Themes page shows card/talk counts per theme
- ✅ Validation dashboard shows themes with < 3 cards/talks

**Files to Create:**
```
/app/admin/themes/page.tsx                    # List themes
/app/admin/themes/new/page.tsx                # Create theme
/app/admin/themes/[id]/edit/page.tsx          # Edit theme
/lib/db/queries/admin-themes.ts               # CRUD queries
/app/api/admin/themes/route.ts                # GET/POST
/app/api/admin/themes/[id]/route.ts           # PUT/DELETE
/app/api/admin/themes/[id]/soft-delete/route.ts
/components/admin/themes/ThemeForm.tsx        # Form component
/components/admin/themes/ThemesList.tsx       # Table view
/components/admin/themes/ThemeRow.tsx         # Individual row
/components/admin/themes/CardMultiSelect.tsx  # Card picker
/components/admin/themes/TalkMultiSelect.tsx  # Talk picker
```

**Estimated Effort:** 3-5 days

---

#### 2. Display Rich Mapping Content to Users
**Why:** Data exists but users can't see full rationale or connection strength
**Impact:** Enhances user understanding of card-talk connections

**2a. Show `rationaleLong` (Full Explanation)**

**User-Facing Pages to Update:**
- `/app/cards/[slug]/page.tsx` - Card detail page
  - Show `rationaleShort` above fold (current behavior)
  - Add "Read more" accordion/expandable for `rationaleLong`
  - Only show if `rationaleLong` is not null

- `/app/talks/[slug]/page.tsx` - Talk detail page
  - Currently shows only `rationaleShort` in mapping section
  - Add expandable section below for `rationaleLong`

**UI Pattern:**
```
Why This Mapping?
"The Tower represents sudden upheaval..." [rationaleShort]

[▼ Read Full Explanation]  ← Collapsible trigger

[When expanded:]
"The Tower is one of the most feared cards in the deck, yet it holds
profound wisdom about necessary change. This talk by [speaker] explores
how moments of crisis..." [rationaleLong - 3-5 paragraphs]
```

**Acceptance Criteria:**
- ✅ `rationaleLong` displays when present
- ✅ Graceful handling when `rationaleLong` is null
- ✅ Mobile-friendly expandable UI
- ✅ Doesn't break existing layout

**Estimated Effort:** 1 day

---

**2b. Show `mapping.strength` (Connection Rating)**

**Visual Representation:**
- 1-5 star rating display
- Show on both card and talk detail pages
- Visual indicator of connection strength

**UI Pattern:**
```
Why This Mapping?
★★★★★ (5/5 - Very Strong Connection)
"The Tower represents sudden upheaval..."
```

**Acceptance Criteria:**
- ✅ Star rating displays next to rationale
- ✅ 1 = ★☆☆☆☆, 5 = ★★★★★
- ✅ Color-coded (1-2 = gray, 3 = indigo, 4-5 = purple)
- ✅ Accessible (includes text "X/5" for screen readers)

**Estimated Effort:** 0.5 days

---

#### 3. Theme Category Filtering
**Why:** Themes have categories but users can't filter by them
**Impact:** Improves theme discovery and organization

**Pages to Update:**
- `/app/themes/page.tsx` - Themes browse page
  - Add filter buttons at top: All, Emotions, Life Phases, Roles, Other
  - Filter themes by selected category
  - Show count per category

**Query Updates:**
- `/lib/db/queries/themes.ts`
  - Add `getThemesByCategory(category: ThemeCategory)`
  - Already have `getAllThemes()`, just add filter

**UI Pattern:**
```
┌─────────────────────────────────────┐
│ Browse Themes                       │
├─────────────────────────────────────┤
│ [All (17)] [Emotions (4)] [Life ... │  ← Filter buttons
├─────────────────────────────────────┤
│ Theme cards grid...                 │
└─────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Can filter themes by category
- ✅ Count badges show themes per category
- ✅ "All" shows all themes
- ✅ URL updates with filter (e.g., `/themes?category=emotion`)
- ✅ Mobile-friendly button layout

**Estimated Effort:** 1 day

---

#### 4. Talk Language Indicator
**Why:** Language field exists but never shown to users
**Impact:** Helps users identify non-English talks

**Pages to Update:**
- `/app/talks/page.tsx` - Talks browse page
- `/app/talks/[slug]/page.tsx` - Talk detail page
- `/app/cards/[slug]/page.tsx` - Card detail (when showing talk)

**UI Pattern:**
```
Simon Sinek
How Great Leaders Inspire Action    🌐 EN
[Duration badge] [Year badge] [Language badge]
```

**Default Behavior:**
- If language = "en" → Don't show badge (majority are English)
- If language != "en" → Show badge with language code (e.g., "ES", "FR")

**Acceptance Criteria:**
- ✅ Non-English talks show language badge
- ✅ English talks don't show badge (clean UI)
- ✅ Badge uses flag emoji or simple text (e.g., "🇪🇸 ES")
- ✅ Admin can set language field when creating/editing talks

**Estimated Effort:** 0.5 days

---

### 🟡 Medium Priority (v0.3.5 or v0.4.0) - 1-2 Months

#### 5. Advanced Validation Fix Workflows
**Why:** Validation dashboard shows issues but no inline fixes
**Impact:** Speeds up data quality improvements

**Inline Fix Features:**

**5a. Duplicate YouTube IDs**
- Show both talks side-by-side
- "Search YouTube" button → Opens inline search
- Can search by title/speaker, see results
- Select correct video, update video ID
- One-click "Fetch Metadata" to verify

**5b. Missing Thumbnails**
- "Fetch from TED" button
- "Fetch from YouTube" button
- Preview thumbnail before applying
- Manual URL input as fallback

**5c. Cards Without Primary Mapping**
- Show card details inline
- Quick talk search (type-ahead)
- "Set as Primary" button
- Creates mapping in one click

**Components to Build:**
```
/components/admin/validation/InlineYouTubeSearch.tsx
/components/admin/validation/InlineThumbnailFetch.tsx
/components/admin/validation/InlinePrimaryAssign.tsx
```

**Estimated Effort:** 4-6 days

---

#### 6. Batch Operations
**Why:** One-at-a-time operations are tedious for bulk updates
**Impact:** Efficiency for admin tasks

**Features:**
- Multi-select checkboxes on talks/mappings lists
- "Select All" checkbox
- Bulk actions dropdown:
  - Bulk delete (soft)
  - Bulk restore
  - Bulk assign to theme
  - Bulk fetch metadata (for talks)

**UI Pattern:**
```
[☑ Select All]  [Bulk Actions ▼]  [Delete Selected] [Assign to Theme]

☑ Talk 1
☐ Talk 2
☑ Talk 3
```

**Acceptance Criteria:**
- ✅ Can select multiple items
- ✅ Bulk delete with confirmation
- ✅ Bulk operations show progress (e.g., "Deleting 3 of 10...")
- ✅ Errors handled gracefully (e.g., "2 failed, 8 succeeded")

**Estimated Effort:** 3-4 days

---

#### 7. Theme Long Description Display
**Why:** Field exists but never shown to users
**Impact:** Richer theme storytelling

**Pages to Update:**
- `/app/themes/[slug]/page.tsx` - Theme detail page
  - Show short description as teaser
  - Expandable "Read More" for long description

**Query Updates:**
- `/lib/db/queries/themes.ts`
  - Currently only selects `description` (which is short)
  - Update to select `longDescription` as well

**UI Pattern:**
```
New Beginnings
"Talks and cards for stepping into the unknown..." [short]

[▼ About This Theme]

[When expanded:]
"The archetype of new beginnings appears across many cards in the deck.
The Fool stepping off the cliff, the Ace of Wands bursting with potential,
the Eight of Cups leaving behind what no longer serves... Each represents
a different facet of starting fresh..." [long - 2-3 paragraphs]
```

**Acceptance Criteria:**
- ✅ Long description displays when present
- ✅ Graceful handling when null
- ✅ Expandable/collapsible
- ✅ Admin can edit long description in theme form

**Estimated Effort:** 0.5 days

---

### 🟢 Low Priority (v0.5.0+) - Future Enhancements

#### 8. Secondary Mappings (Multiple Talks Per Card)
**Current State:** Each card has one primary mapping
**Enhancement:** Allow multiple talks per card, all shown to user

**Features:**
- Keep "primary" mapping at top
- Show 2-5 secondary mappings below
- Each secondary has its own rationale and strength

**Impact:** Richer content discovery

**Estimated Effort:** 2-3 days

---

#### 9. Undo/Version History
**Why:** No undo for deletions or edits
**Impact:** Safety net for admin mistakes

**Features:**
- Track all CRUD operations with timestamps
- "Undo" button after delete (5-minute window)
- Version history view for mappings (see previous rationales)

**Estimated Effort:** 5-7 days

---

#### 10. Content Expansion
**Goal:** Expand from 76 talks to 150+ talks

**Strategy:**
1. Use validation dashboard to find cards without secondary mappings
2. Search YouTube for relevant TED/TEDx talks
3. Add via admin portal (talks + mappings)
4. Target: 2-3 talks per card (primary + secondaries)

**No Development Required** - Just content curation work

---

#### 11. Advanced Search Features
**Current:** Basic keyword search
**Enhancements:**
- Fuzzy matching (typo tolerance)
- Search by card number (e.g., "III" for The Empress)
- Search by astrological sign (e.g., "Aries" → The Emperor)
- Filter search results by type (cards only, talks only, themes only)

**Estimated Effort:** 3-4 days

---

#### 12. User Accounts & Saved Readings
**Why:** Enable personalized experiences
**Impact:** User engagement and retention

**Features (v1.0+):**
- User authentication (email/password or OAuth)
- Save daily card draws
- Bookmark favorite talks
- Create custom reading collections
- Track personal insights and notes

**Estimated Effort:** 2-3 weeks

---

#### 13. Tarot Spreads
**Why:** Traditional Tarot readings use multi-card spreads
**Impact:** Educational tool for Tarot learners

**Features:**
- Pre-defined spreads:
  - Celtic Cross (10 cards)
  - Three Card Spread (Past/Present/Future)
  - Single Card Draw (current)
  - Custom spreads
- Interactive card placement
- Positional meanings
- Related talks for each position

**Estimated Effort:** 2-3 weeks

---

## Implementation Plan for v0.3.0

### Week 1-2: Theme Management
- Day 1-2: Database queries and API routes
- Day 3-5: Admin UI components (ThemeForm, ThemesList)
- Day 6-7: Testing and refinement

### Week 3: Rich Content Display
- Day 1-2: Show `rationaleLong` with expandable UI
- Day 3: Show `mapping.strength` as star rating
- Day 4: Theme category filtering
- Day 5: Talk language indicator

### Week 4: Testing & Deployment
- Day 1-2: Integration testing
- Day 3: Fix bugs and polish
- Day 4: Documentation updates
- Day 5: Deploy v0.3.0

---

## Files That Need Modification (v0.3.0)

### New Files (Theme Management)
```
/app/admin/themes/page.tsx
/app/admin/themes/new/page.tsx
/app/admin/themes/[id]/edit/page.tsx
/lib/db/queries/admin-themes.ts
/app/api/admin/themes/route.ts
/app/api/admin/themes/[id]/route.ts
/components/admin/themes/ThemeForm.tsx
/components/admin/themes/ThemesList.tsx
/components/admin/themes/ThemeRow.tsx
/components/admin/themes/CardMultiSelect.tsx
/components/admin/themes/TalkMultiSelect.tsx
```

### Modifications (Rich Content Display)
```
/app/cards/[slug]/page.tsx         # Add rationaleLong, strength display
/app/talks/[slug]/page.tsx         # Add rationaleLong, strength display
/app/themes/page.tsx               # Add category filter
/app/themes/[slug]/page.tsx        # Add longDescription expandable
/app/talks/page.tsx                # Add language badge
/lib/db/queries/themes.ts          # Add category filter query
```

---

## Success Metrics for v0.3.0

**Admin Portal:**
- ✅ Can create/edit/delete themes through UI (no seed file edits)
- ✅ Theme admin takes < 5 minutes to create a new theme
- ✅ Zero data loss incidents during theme operations

**User Experience:**
- ✅ Users can read full mapping rationales (not just summaries)
- ✅ Users can see connection strength (visual star rating)
- ✅ Users can filter themes by category
- ✅ Non-English talks are clearly marked

**Data Quality:**
- ✅ All 17 existing themes migrated to admin-managed
- ✅ At least 3 new themes created through admin portal
- ✅ All themes have category assigned

---

## Long-Term Vision (v1.0 and Beyond)

**Content:**
- 150+ TED talks (double current library)
- 25+ themes (from 17)
- Every card has 2-3 mapped talks

**User Features:**
- User accounts with saved readings
- Custom collections and playlists
- Daily card draw with push notifications
- Community features (share readings, comment on talks)

**Admin Features:**
- Analytics dashboard (most viewed cards/talks)
- Bulk import/export tools
- AI-assisted talk suggestions for cards
- Automated metadata enrichment

**Technical:**
- Full TypeScript strict mode
- 100% test coverage on critical paths
- Performance optimization (< 2s page loads)
- Offline PWA capabilities

---

## Questions & Decisions Needed

1. **Theme Management Priority**: Confirm this is #1 priority for v0.3.0
2. **Rich Content UI**: Preference for expandable vs. always-visible long content?
3. **Language Badges**: Show for all talks or only non-English?
4. **Strength Rating**: Stars vs. numeric (1-5) vs. descriptive (Weak/Strong)?
5. **Content Expansion**: How many new talks should we target for v0.3.0?

---

**Next Review:** After v0.3.0 deployment (Est. mid-January 2025)
