# TarotTED Development Progress

## ✅ Phase 0: Vercel Deployment Setup - COMPLETE

### Completed
- [x] Next.js 15 project initialized with App Router
- [x] TypeScript, Tailwind CSS, ESLint configured
- [x] Vercel Postgres and Drizzle ORM installed
- [x] Database schema created (cards, talks, mappings, themes tables)
- [x] Environment variables configured (.env.example created)
- [x] Image directory structure created at `/public/images/cards/`
- [x] Helper scripts added to package.json (db:generate, db:push, db:studio, db:seed)
- [x] Homepage deployed and live on Vercel ✨
- [x] All 78 Tarot card images uploaded

### Card Image Naming Convention
**Major Arcana**: `00-The-Fool.jpg` through `21-The-World.jpg`
**Minor Arcana**: `Cups1.jpg` through `Cups14.jpg` (same for Wands, Swords, Pentacles)
- Numbers 1-10 = Ace through Ten
- Number 11 = Page
- Number 12 = Knight
- Number 13 = Queen
- Number 14 = King

## ✅ Phase 1: Core Data Layer - COMPLETE

### Completed
- [x] Helper utilities created (`helpers.ts`)
  - `getCardImageUrl()` - Generates correct image paths for actual filenames
  - `generateSlug()` - Creates URL-friendly slugs
  - `extractTalkInfo()` - Parses TED talk data from CSV
- [x] **All 78 Tarot cards seed data created**
  - 22 Major Arcana cards with full meanings
  - 56 Minor Arcana cards (14 each of Wands, Cups, Swords, Pentacles)
  - All cards include: name, slug, arcana type, suit, number, image URL, keywords, summary, upright/reversed meanings
- [x] **Talks seed data created** (`talks.ts`)
  - 25+ unique TED talks from CSV files
  - Includes: title, speaker, URL, description, year
  - Deduplicated (same talk doesn't appear twice)
- [x] **Card-talk mappings created** (`mappings.ts`)
  - Primary mappings for all Major Arcana
  - Key Minor Arcana mappings
  - Includes strength ratings (1-5) and rationale notes
- [x] **Themes seed data created** (`themes.ts`)
  - 11 curated themes across categories:
    - Emotions: Grief & Gratitude, Joy & Celebration, Fear & Courage
    - Life Phases: New Beginnings, Endings & Transitions, Transformation
    - Roles: Leadership, Creativity & Calling, Relationships
    - Other: Resilience, Wisdom & Introspection
  - Card-theme and talk-theme assignments
- [x] **Main seed script created** (`lib/db/seed.ts`)
  - Clears existing data
  - Inserts all cards, talks, themes
  - Creates mappings and theme assignments
  - Full logging and error handling

### ⚠️ Blocker: Database Connection

The seed data is ready, but we need to fix the Vercel Postgres connection first.

**Current Issue**: The `DATABASE_URL` in `.env.local` is pointing to `db.prisma.io` which returns a 404 error.

**Solution Required**:
1. Go to Vercel Dashboard → Your Project → Storage → Postgres Database
2. Click the **.env.local** tab
3. Copy ALL environment variables (not just DATABASE_URL)
4. Replace the contents of your local `.env.local` file
5. The correct URL should look like: `postgres://default:xxx@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb`

### Ready to Run
Once database connection is fixed:
```bash
npm run db:push    # Create tables
npm run db:seed    # Populate with all data
npm run db:studio  # Verify in GUI
```

## 📊 Data Status

### Cards
- ✅ 22 Major Arcana - Complete with meanings from CSV
- ✅ 14 Wands - Complete
- ✅ 14 Cups - Complete
- ✅ 14 Swords - Complete
- ✅ 14 Pentacles - Complete
- **Total: 78/78 cards ready**

### Talks (from CSV files)
- 📋 Arcana.csv - 22 talk mappings
- 📋 Cups.csv - 14 talk mappings
- 📋 Wands.csv - 14 talk mappings
- 📋 Swords.csv - 14 talk mappings
- 📋 Spheres.csv (Pentacles) - 13 talk mappings
- ⚠️ Some talks have full URLs, others have titles only (need to add URLs)
- ⚠️ Some talks are duplicated across multiple cards (need to deduplicate)

### Notable Talks from CSVs
- Brené Brown: The Power of Vulnerability (mapped to multiple cards)
- Elizabeth Gilbert: Your Elusive Creative Genius
- Simon Sinek: How Great Leaders Inspire Action
- Angela Duckworth: Grit
- Kelly McGonigal: How to Make Stress Your Friend
- Many more...

## 🎯 Database Setup

### Vercel Postgres
**Next Action for User:**
1. Go to Vercel Dashboard → Your Project → Storage
2. Create Postgres Database
3. Copy `DATABASE_URL` to environment variables
4. Add to `.env.local` for local development
5. Run `npm run db:push` to create tables

### Tables Created
- `cards` - All Tarot cards
- `talks` - TED talks
- `card_talk_mappings` - Relationships with curatorial notes
- `themes` - Curated collections
- `card_themes` - Many-to-many join
- `talk_themes` - Many-to-many join

## 📝 Files Created

### Configuration
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `drizzle.config.ts`
- `.gitignore`
- `.env.example`

### Database
- `lib/db/index.ts` - Database connection
- `lib/db/schema.ts` - Database schema (all tables)
- `lib/db/seed-data/helpers.ts` - Utility functions
- `lib/db/seed-data/cards.ts` - All 78 cards (Major + Wands)
- `lib/db/seed-data/cards-minor.ts` - Cups, Swords, Pentacles

### App
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Homepage
- `app/globals.css` - Global styles

### Documentation
- `public/images/cards/FILENAMES.md` - Image naming reference
- `docs/PROGRESS.md` - This file

## 🚀 Deployment Info

**Site**: Live on Vercel
**Status**: Phase 0 complete, homepage deployed
**Next Deployment**: After Phase 1 seed data is ready

## 📦 Package Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:seed      # Seed database with initial data
```

## 🎨 Design Notes

- Mobile-first approach
- Bottom navigation for mobile (Home, Cards, Talks, Themes)
- Progressive disclosure (essentials above fold, depth below)
- Card detail page is the heart of the app
- Clean URLs with slugs (e.g., `/cards/the-fool`)

## 🔧 Tech Stack Confirmed

- **Framework**: Next.js 15 (App Router)
- **Database**: Vercel Postgres (Serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

---

**Last Updated**: Phase 0 Complete, Phase 1 In Progress
**Next Milestone**: Complete seed data and populate Vercel database
