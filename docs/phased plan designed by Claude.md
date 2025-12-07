phased plan designed by Claude

     Phase 0: Vercel Deployment Setup

     Goal: Initialize Next.js project, configure Vercel Postgres, create database schema, and
     deploy a working "hello world."

     Tasks

     1. Initialize Next.js Project
       - Run: npx create-next-app@latest . --typescript --tailwind --app --import-alias "@/*"
       - Select: TypeScript, ESLint, Tailwind, App Router, import alias
       - Install dependencies:
       npm install @vercel/postgres drizzle-orm dotenv
     npm install -D drizzle-kit tsx @types/node
     2. Set Up Vercel Postgres
       - Create Vercel project from GitHub repo
       - In Vercel Dashboard → Storage → Create Postgres Database
       - Copy DATABASE_URL to .env.local
       - Add to .env.example as template
     3. Create Database Schema
       - File: /lib/db/schema.ts
       - Define tables: cards, talks, card_talk_mappings, themes, card_themes, talk_themes
       - Use enums for arcana_type, suit, theme_category
       - File: /lib/db/index.ts - Database connection singleton
       - File: /drizzle.config.ts - Drizzle Kit configuration
     4. Generate and Push Schema
     npx drizzle-kit generate:pg
     npx drizzle-kit push:pg
       - Verify with: npx drizzle-kit studio
     5. Create Image Directory Structure
       - Create /public/images/cards/ with subdirectories
       - This is where you'll upload your 78 Tarot card images
     6. Configure Environment Variables
       - Set DATABASE_URL in Vercel Dashboard
       - Set NEXT_PUBLIC_BASE_URL in Vercel
       - Add helpful scripts to package.json:
           - db:generate, db:push, db:studio, db:seed
     7. Deploy Hello World
       - Update /app/page.tsx with simple homepage
       - Update /app/layout.tsx with metadata
       - Commit and push to trigger Vercel deployment
       - Verify deployment succeeds

     Verification Checklist

     - Next.js app runs locally (npm run dev)
     - Database tables exist (verified in Drizzle Studio)
     - Vercel deployment succeeds
     - Image directories created at /public/images/cards/
     - Environment variables set locally and in Vercel

     Critical Files

     - /lib/db/schema.ts - Database schema (cards, talks, mappings, themes)
     - /lib/db/index.ts - Database connection
     - /drizzle.config.ts - Drizzle configuration
     - /.env.local and /.env.example - Environment variables
     - /public/images/cards/ - Image storage structure

     ---
     Phase 1: Core Data Layer

     Goal: Populate database with Tarot cards, TED talks, and mappings. Create reusable
     data-fetching utilities.

     Tasks

     1. Create Seed Data Files
       - File: /lib/db/seed-data/cards.ts - All 78 Tarot cards with metadata
       - File: /lib/db/seed-data/talks.ts - TED talks with titles, speakers, URLs
       - File: /lib/db/seed-data/mappings.ts - Card-talk relationships with rationales
       - File: /lib/db/seed-data/themes.ts - Curated themes (grief, beginnings, etc.)
     2. Create Main Seed Script
       - File: /lib/db/seed.ts
       - Import seed data
       - Clear existing data (reverse order of dependencies)
       - Insert cards, talks, themes, mappings
       - Run with: npm run db:seed
     3. Create Query Utilities
       - File: /lib/db/queries/cards.ts
           - getAllCards(), getCardBySlug(), getCardWithMappings(), getCardsByArcana(),
     getCardsBySuit()
       - File: /lib/db/queries/talks.ts
           - getAllTalks(), getTalkBySlug(), getTalkWithMappedCards()
       - File: /lib/db/queries/themes.ts
           - getAllThemes(), getThemeBySlug(), getThemeWithContent()
       - File: /lib/db/queries/search.ts
           - searchAll(query) - Search across cards, talks, themes
     4. Create API Routes (Optional)
       - File: /app/api/search/route.ts - Search endpoint
       - Other API routes as needed for client-side fetching

     Verification Checklist

     - All 78 cards seeded successfully
     - At least 20-30 talks seeded
     - Primary mappings exist (1 primary talk per card)
     - At least 3-5 themes created
     - Query functions return expected data
     - Search works across all entity types

     Critical Files

     - /lib/db/seed.ts - Main seed script (your curatorial vision)
     - /lib/db/queries/cards.ts - Core card queries
     - /lib/db/seed-data/*.ts - All seed data

     ---
     Phase 2: Essential Pages (Mobile-First)

     Goal: Build core user-facing pages with mobile-first responsive design.

     Tasks

     1. Create Shared Components
       - File: /components/layout/BottomNav.tsx - Mobile bottom navigation (Home, Cards,
     Talks, Themes)
       - File: /components/cards/CardListItem.tsx - Card in list view
       - File: /components/cards/CardGrid.tsx - Grid of cards
       - File: /components/talks/TalkListItem.tsx - Talk in list view
       - File: /components/ui/SearchBar.tsx - Search input
       - File: /components/ui/Badge.tsx - Keyword chips
       - File: /components/ui/Button.tsx - Reusable button
     2. Build Home Page
       - File: /app/page.tsx
       - Search bar
       - Quick actions: Random Draw, Browse Cards, Browse Talks, Explore Themes
       - File: /app/actions.ts - Server action for random card draw
     3. Build Card Index
       - File: /app/cards/page.tsx
       - List all 78 cards with CardListItem
       - Show arcana type, suit, summary
       - Link to card detail pages
     4. Build Card Detail Page (⭐ Heart of the App)
       - File: /app/cards/[slug]/page.tsx
       - Above fold: Card image, name, keywords, 1 primary talk with rationale
       - Below fold: Additional mapped talks, upright/reversed meanings (accordions)
       - Mobile: vertical stack
       - Desktop: side-by-side layout
       - Static generation with generateStaticParams()
     5. Build Talk Index
       - File: /app/talks/page.tsx
       - List all talks with metadata
       - Show mapped card badges
       - Link to talk detail pages
     6. Build Talk Detail Page
       - File: /app/talks/[slug]/page.tsx
       - Talk title, speaker, duration
       - "Watch on TED" button
       - Grid of mapped cards with rationales
       - Static generation with generateStaticParams()
     7. Add Bottom Navigation to Layout
       - Update /app/layout.tsx to include <BottomNav />
       - Show on mobile, hide on desktop

     Verification Checklist

     - Home page renders with search and quick actions
     - Card index shows all 78 cards
     - Card detail shows card + primary talk above fold
     - Talk index shows all talks
     - Talk detail shows mapped cards
     - Bottom navigation works on mobile
     - All pages responsive (mobile and desktop)
     - Static generation works (npm run build succeeds)
     - Images load from /public/images/cards/

     Critical Files

     - /app/cards/[slug]/page.tsx - Card detail (most important UX)
     - /components/layout/BottomNav.tsx - Mobile navigation
     - /app/page.tsx - Home page

     ---
     Phase 3: Search & Themes

     Goal: Add search functionality and theme browsing/detail pages.

     Tasks

     1. Implement Search
       - File: /app/search/page.tsx
       - Accept ?q=query search param
       - Display grouped results: Cards, Talks, Themes
       - Show count for each category
       - Handle empty queries gracefully
       - Update /components/ui/SearchBar.tsx to redirect to search page
     2. Build Theme Index
       - File: /app/themes/page.tsx
       - List all themes grouped by category (emotion, life_phase, role)
       - Gradient card designs for visual appeal
       - Link to theme detail pages
     3. Build Theme Detail Page
       - File: /app/themes/[slug]/page.tsx
       - Theme name and description
       - Grid of cards in theme (clickable thumbnails)
       - List of talks in theme (with "Watch on TED" links)
       - Static generation with generateStaticParams()
     4. Optional: Add Advanced Filters
       - File: /components/cards/CardFilters.tsx
       - Filter by Major/Minor Arcana, Suit, Theme
       - Use URL search params for state
       - Update card index to accept filter params

     Verification Checklist

     - Search returns grouped results
     - Search handles empty queries
     - Themes index shows categorized themes
     - Theme detail shows related cards and talks
     - All links work correctly
     - Mobile and desktop layouts polished

     Critical Files

     - /app/search/page.tsx - Search results
     - /app/themes/[slug]/page.tsx - Theme detail

     ---
     Phase 4: Polish & Enhancement

     Goal: Optimize performance, add loading/error states, enhance desktop experience, improve
      SEO.

     Tasks

     1. Add Loading States
       - Files: /app/loading.tsx, /app/cards/loading.tsx, /app/talks/loading.tsx, etc.
       - File: /components/ui/CardSkeleton.tsx - Skeleton loader
       - Add skeletons for all list views
       - Smooth transitions between states
     2. Add Error Handling
       - File: /app/error.tsx - Global error boundary
       - File: /app/not-found.tsx - Custom 404 page
       - Files: /app/cards/[slug]/error.tsx, /app/talks/[slug]/error.tsx
       - Graceful degradation for missing data
     3. Performance Optimization
       - Add revalidate to static pages for ISR (Incremental Static Regeneration)
       - Example: export const revalidate = 3600; (1 hour)
       - Add database indexes:
       CREATE INDEX idx_cards_slug ON cards(slug);
     CREATE INDEX idx_talks_slug ON talks(slug);
     CREATE INDEX idx_card_talk_mappings_card_id ON card_talk_mappings(card_id);
       - Optimize images with next/image
       - Add pagination if needed for talks list
     4. Desktop Enhancements
       - File: /components/layout/DesktopNav.tsx - Desktop header nav
       - Side-by-side layouts for card/talk detail on desktop
       - Multi-column grids for theme pages
       - Sticky navigation
       - Hover states and keyboard navigation
     5. SEO Optimization
       - File: /app/sitemap.ts - Dynamic sitemap
       - Add Open Graph meta tags
       - Add Twitter Card meta tags
       - Add structured data (JSON-LD) for cards and talks
       - Ensure all images have alt text
     6. Analytics (Optional)
       - Install Vercel Analytics: npm install @vercel/analytics
       - Add <Analytics /> to /app/layout.tsx
       - Track page views, card views, talk clicks, search queries

     Verification Checklist

     - Loading states show on all pages
     - Error boundaries catch errors gracefully
     - 404 page shows for invalid URLs
     - ISR configured (pages rebuild periodically)
     - Images optimized and load quickly
     - Database has indexes
     - Desktop layouts enhance experience
     - SEO meta tags present
     - Sitemap generates correctly
     - Performance Lighthouse score >90
     - Final build succeeds: npm run build
     - Test on production URL
     - Test on mobile and desktop browsers

     Critical Files

     - /app/sitemap.ts - SEO sitemap
     - /app/error.tsx and /app/not-found.tsx - Error handling
     - Loading states for all major routes

     ---
     Database Schema Summary

     Core Tables

     cards
     - id (UUID), slug, name, arcana_type (major/minor), suit, number, sequence_index
     - image_url, keywords (JSON array), summary, upright_meaning, reversed_meaning
     - created_at, updated_at

     talks
     - id (UUID), slug, title, speaker_name, ted_url, description
     - duration_seconds, event_name, year, thumbnail_url, language
     - created_at, updated_at

     card_talk_mappings (The curatorial layer)
     - id (UUID), card_id (FK), talk_id (FK)
     - is_primary (bool), strength (1-5), rationale_short, rationale_long
     - created_at, updated_at

     themes
     - id (UUID), slug, name, short_description, long_description, category
     - created_at, updated_at

     card_themes and talk_themes (Join tables)
     - card_id/talk_id (FK), theme_id (FK)

     ---
     Core Use Cases (Priority Order)

     1. Card → Talks: User pulls a card, gets 1-3 recommended talks
     2. Talk → Cards: User finds talk, sees which cards it maps to
     3. Theme → Cards & Talks: User explores curated theme collections
     4. Search: Omnibox search across all entities
     5. Random Draw: Random card + talk pairing

     ---
     Key Design Principles

     - Mobile-first: Bottom navigation, vertical scrolling
     - Progressive disclosure: Essentials above fold, depth below/in accordions
     - Quick actions: 1-2 taps to value
     - Separation of concerns: Content (cards, talks) separate from mapping (curatorial layer)
     - Slugs everywhere: Clean URLs (/cards/the-tower)

     ---
     Post-Launch Future Ideas

     Phase 5: User accounts, saved favorites, journal entries
     Phase 6: Tarot spread builder, session generator, facilitator mode
     Phase 7: Content expansion (200+ talks, seasonal themes, daily cards)

     ---
     Next Steps

     1. Start with Phase 0: Set up Next.js, Vercel Postgres, database schema
     2. Upload your 78 Tarot card images to /public/images/cards/
     3. Proceed through phases sequentially
     4. Verify each phase before moving to the next
     5. Deploy early and iterate

     Each phase builds on the previous one with clear verification steps. The plan prioritizes
      getting a working app deployed quickly, then enhancing with polish and features.
