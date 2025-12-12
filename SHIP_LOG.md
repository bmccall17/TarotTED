# 🚢 TarotTED Ship Log

A chronological record of major releases and feature deployments for TarotTED.

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

**Built with ❤️ by the TarotTED team**
