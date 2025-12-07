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

## 🚧 Phase 1: Core Data Layer - IN PROGRESS

### Completed
- [x] Helper utilities created (`helpers.ts`)
  - `getCardImageUrl()` - Generates correct image paths
  - `generateSlug()` - Creates URL-friendly slugs
  - `extractTalkInfo()` - Parses TED talk data from CSV
- [x] All 78 Tarot cards seed data created
  - 22 Major Arcana cards with meanings
  - 56 Minor Arcana cards (14 each of Wands, Cups, Swords, Pentacles)
  - All cards include: name, slug, arcana type, suit, number, image URL, keywords, summary, upright/reversed meanings

### Next Steps
1. **Parse CSV Data for Talks** - Extract unique TED talks from all CSV files
2. **Create Talks Seed Data** - Build talks.ts with:
   - Talk titles and speakers
   - TED/YouTube URLs
   - Descriptions
   - Duration (to be added)
3. **Create Mappings Seed Data** - Link cards to talks with:
   - Primary mapping flags
   - Strength ratings (1-5)
   - Rationale short (from CSV)
   - Rationale long (optional)
4. **Create Themes Seed Data** - Initial themes:
   - Emotions (grief, joy, etc.)
   - Life phases (beginnings, endings, transitions)
   - Roles (leader, artist, parent)
5. **Main Seed Script** - Tie everything together
6. **Test Seeding** - Run `npm run db:seed` and verify in Drizzle Studio

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
