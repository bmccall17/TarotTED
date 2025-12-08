 TarotTED - Design Integration Plan

 Current Status: DEPLOYED & WORKING

 Live Site: Deployed on Vercel with Supabase database
 Database: Supabase PostgreSQL (tarotted-db)

 ---
 Design Prototype Analysis

 What I See in the Prototype

 Visual Design System (Dark Theme)
 - Dark gradient background: from-gray-900 via-indigo-950 to-purple-950
 - Card backgrounds: bg-gray-800/50 with border-gray-700
 - Accent colors: Indigo/Purple gradients (from-indigo-600 to-purple-600)
 - Text: text-gray-100 (headings), text-gray-400 (body), text-gray-500 (muted)
 - Interactive elements: Indigo highlights (text-indigo-400, bg-indigo-500/20)

 Navigation (4-Tab Bottom Nav)
 - Home (House icon)
 - Cards (Grid icon)
 - Talks (Library icon)
 - Themes (Sparkles icon)
 - Fixed at bottom, bg-gray-900 with border-gray-800

 Page Designs

 1. HomePage
   - Sparkles logo + "Tarot of TED Talks" header
   - Search bar (full width)
   - "Draw a Card & Talk" CTA button (gradient)
   - "Browse Cards" / "Browse Talks" buttons (side by side)
   - Featured Theme card
   - "How this works" accordion
 2. CardsPage
   - Filter chips (All, Major Arcana, Wands, Cups, Swords, Pentacles)
   - 2-column responsive grid
   - Card thumbnails with colored backgrounds
   - Shows archetype + talk count
 3. CardDetailPage (THE HEART OF THE APP)
   - Sticky header with back button
   - Card image hero (2:3 aspect ratio)
   - Archetype + Essence text
   - Keywords as pills
   - Featured Talk section (gradient bg, prominent)
   - More Talks list
   - Related Cards grid
   - Themes pills
   - Accordions: "Full Card Meaning", "Journaling Prompts"
 4. TalksPage
   - Search bar
   - Duration filter chips (All, <10min, 10-20min, >20min)
   - Talk cards with thumbnail, title, speaker, duration
   - Mapped cards shown as clickable pills
 5. ThemesPage
   - Grid of theme cards
   - Color bar indicator per theme
   - Card/talk counts
   - "About Themes" info card at bottom
 6. ThemeDetailPage
   - Theme header with description
   - Cards section (grid)
   - Talks section (list)

 Key UX Patterns
 - Rounded corners (rounded-xl, rounded-lg)
 - Subtle borders (border-gray-700)
 - Hover states with shadow (hover:shadow-md)
 - Progressive disclosure via accordions
 - Cross-navigation (card → talk → card flows)

 ---
 Integration Plan

 Design Decisions:
 - Dark theme (purple/indigo gradient)
 - Client-side filtering for card suits (load all 78, filter in browser)

 ---
 Phase 1: Global Styling (Dark Theme)

 Files to modify:
 - app/globals.css - Dark theme CSS variables
 - tailwind.config.ts - Extend colors (indigo-950, gray-800, etc.)
 - app/layout.tsx - Dark gradient background

 Phase 2: Navigation & Layout

 Files to modify:
 - components/layout/BottomNav.tsx - Dark styling, 4 tabs (Home, Cards, Talks, Themes)

 Phase 3: HomePage Redesign

 File: app/page.tsx
 - Sparkles logo + title
 - Search bar (placeholder for now)
 - "Draw a Card & Talk" gradient button
 - "Browse Cards" / "Browse Talks" side-by-side buttons
 - Featured Theme card
 - "How this works" collapsible accordion

 Phase 4: Cards Pages

 Files:
 - app/cards/page.tsx - Add suit filter chips (client-side), dark grid styling
 - app/cards/[slug]/page.tsx:
   - Dark sticky header with back button
   - Card image hero
   - Keywords pills (indigo)
   - Featured Talk section (gradient bg)
   - More Talks list
   - Themes pills (purple)
   - "Full Card Meaning" accordion
   - "Journaling Prompts" accordion

 Phase 5: Talks Pages

 Files:
 - app/talks/page.tsx - Search bar, duration filter chips, dark cards with mapped card pills
 - app/talks/[slug]/page.tsx - Dark styling, mapped cards grid

 Phase 6: Themes Pages (NEW)

 Files to create:
 - app/themes/page.tsx - Themes grid with color bars
 - app/themes/[slug]/page.tsx - Theme detail with cards/talks sections
 - lib/db/queries/themes.ts - getAllThemes(), getThemeWithCardsAndTalks()

 Phase 7: Features

 - app/api/random-card/route.ts - Random card API for "Draw a Card"
 - Update components/ui/Badge.tsx - Dark theme variants

 ---
 Completed Phases

 Phase 0: Infrastructure

 - Next.js 15 with App Router
 - TypeScript + Tailwind CSS
 - Vercel deployment configured
 - All 78 Tarot card images uploaded

 Phase 1: Data Layer

 - Supabase PostgreSQL database connected
 - Drizzle ORM schema (6 tables)
 - Database seeded:
   - 78 Tarot cards
   - 25 TED talks
   - 22 card-talk mappings
   - 11 themes
   - 46 card-theme assignments
   - 6 talk-theme assignments

 Phase 2: Core Pages

 - /cards - Card index (all 78 cards)
 - /cards/[slug] - Card detail with primary talk mapping
 - /talks - Talk index (all 25 talks)
 - /talks/[slug] - Talk detail with mapped cards
 - Mobile bottom navigation
 - Static generation for all pages

 ---
 Tech Stack

 | Component | Technology              |
 |-----------|-------------------------|
 | Framework | Next.js 15 (App Router) |
 | Database  | Supabase PostgreSQL     |
 | ORM       | Drizzle ORM             |
 | Styling   | Tailwind CSS            |
 | Language  | TypeScript              |
 | Hosting   | Vercel                  |

 ---
 Key Files Reference

 lib/db/
 ├── index.ts          # DB connection (postgres-js)
 ├── schema.ts         # 6 tables schema
 ├── seed.ts           # Seed script
 ├── queries/
 │   ├── cards.ts      # Card queries
 │   └── talks.ts      # Talk queries
 └── seed-data/        # Seed data files

 app/
 ├── page.tsx          # Homepage
 ├── cards/
 │   ├── page.tsx      # Cards list
 │   └── [slug]/page.tsx  # Card detail
 └── talks/
     ├── page.tsx      # Talks list
     └── [slug]/page.tsx  # Talk detail

 ---
 Next Steps (Phase 3+)

 Immediate Improvements

 1. Add Themes Pages
   - /themes - Theme index
   - /themes/[slug] - Theme detail with cards + talks
 2. Homepage Enhancement
   - Random card feature ("Pull a Card")
   - Featured themes section
   - Quick links to popular cards
 3. Search Functionality
   - Omnibox search across cards, talks, themes
   - Filter by suit, arcana type

 Content Expansion

 4. Add More Card-Talk Mappings
   - Currently: 22 mappings
   - Goal: At least 1 primary mapping per card (78)
   - Add secondary mappings for richer connections
 5. Add More TED Talks
   - Currently: 25 talks
   - Import remaining talks from CSV files
   - Fill in missing metadata (duration, year, thumbnails)

 Future Features

 6. Spread Builder - Multi-card readings
 7. User Accounts - Save favorites, journal entries
 8. Journaling Prompts - Per-card reflection questions

 ---
 Environment Variables (for Vercel)

 Required in Vercel Project Settings:
 POSTGRES_URL=postgres://postgres.[ref]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=requir
 e

 ---
 npm Scripts

 npm run dev          # Local development
 npm run build        # Production build
 npm run db:push      # Push schema to DB
 npm run db:seed      # Seed database
 npm run db:studio    # Drizzle Studio GUI

 ---
 Notes

 - 2 mappings skipped during seed (Brene Brown talk slug mismatch)
 - Minor Arcana cards have placeholder mappings
 - All card images are uploaded and working