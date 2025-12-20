# TarotTED v0.1.0 - Initial Prototype Release

**Release Date**: December 20, 2024
**Tag**: `v0.1.0`
**Status**: Public Beta / Prototype

---

## 🎯 Release Title

**TarotTED v0.1.0: Initial Public Prototype - 78 Cards, 76 Talks**

---

## 📝 Release Notes

### Overview

TarotTED is a lookup instrument that maps the 78-card Tarot deck to TED talks, helping users discover meaningful content through the archetypal wisdom of Tarot. This initial release provides a fully functional web application with card browsing, talk discovery, search, and curated themes.

---

## ✨ What's Included

### Core Features

#### 1. Complete Tarot Deck (78 Cards)
- **22 Major Arcana**: The Fool through The World
- **56 Minor Arcana**: Full suits of Wands, Cups, Swords, and Pentacles
- Each card includes:
  - High-quality card imagery
  - Upright and reversed meanings
  - Keywords for quick reference
  - Symbolism and archetype descriptions
  - Related cards and cross-references

#### 2. TED Talk Database (76 Curated Talks)
- Carefully selected TED and TEDx talks mapped to Tarot archetypes
- Each talk includes:
  - Speaker name and bio
  - Talk title and description
  - Duration and year
  - Event name (TED, TEDx, TED Global, etc.)
  - High-quality thumbnails
  - Direct links to watch on TED.com or YouTube

#### 3. Card-to-Talk Mappings
- **76 primary mappings**: One featured talk per card
- Curated rationale explaining why each talk resonates with its card
- Strength ratings (1-5) for mapping quality
- Support for secondary mappings (multiple talks per card)

#### 4. User-Facing Pages

##### Home Page (`/`)
- Welcome message and app introduction
- Quick access to all sections
- Featured random card
- Mobile-first responsive design

##### Cards Index (`/cards`)
- Browse all 78 cards
- Filter by suit (Major Arcana, Wands, Cups, Swords, Pentacles)
- Visual grid layout with card images
- Click any card to view details

##### Card Detail (`/cards/[slug]`)
- Full card information and meanings
- Related TED talk(s) for this card
- "Pull Another Card" feature
- Related cards suggestions
- Beautiful dark gradient theme

##### Talks Index (`/talks`)
- Browse all 76 TED talks
- Search by speaker name or title
- Filter by duration (< 10 min, 10-20 min, > 20 min)
- Shows duration, year, and associated card
- Click thumbnail to watch talk (opens in new tab)

##### Talk Detail (`/talks/[slug]`)
- Full talk information
- Watch button linking to TED.com or YouTube
- Associated Tarot card with visual
- Speaker bio and event details

##### Themes Index (`/themes`)
- Curated collections of cards and talks
- Browse by archetypal themes
- Each theme includes description and card count

##### Theme Detail (`/themes/[slug]`)
- Cards and talks grouped by theme
- Explore related content within a theme

##### Search (`/search`)
- Omnibox search across all content
- Search cards by name, keywords, or meanings
- Search talks by title or speaker
- Search themes by name or description
- Real-time results as you type

##### Random Card (`/api/random-card`)
- API endpoint for random card discovery
- Used by "Pull Another Card" feature

#### 5. Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Hosting**: Vercel (recommended)

#### 6. Design System
- **Mobile-first**: Optimized for vertical scrolling
- **Dark theme**: Gradient backgrounds (gray-900 → indigo-950 → purple-950)
- **Bottom navigation**: Quick access on mobile (Home, Cards, Talks, Themes)
- **Typography**: Clean, readable sans-serif fonts
- **Accessibility**: Semantic HTML, proper contrast ratios

---

## 📊 Content Statistics

| Category | Count |
|----------|-------|
| Total Cards | 78 |
| Major Arcana | 22 |
| Minor Arcana | 56 |
| TED Talks | 76 |
| Primary Mappings | 76 |
| Curated Themes | ~12 |

---

## 🎨 User Experience Highlights

### Progressive Disclosure
- Essential information visible above the fold
- Deep content hidden in expandable sections
- "Read More" patterns for long descriptions

### Quick Actions
- "Watch Talk" button directly on talk cards
- "Pull Another Card" for instant exploration
- Search results appear instantly

### Visual Hierarchy
- Card images prominently displayed
- Clear typography and spacing
- Color-coded badges (duration, year, suit)

---

## 🐛 Known Issues (To Be Addressed)

This release includes some data quality issues that will be resolved in v0.2.0:

### Data Quality
1. **Duplicate YouTube IDs**: 4 talks share YouTube video IDs with other talks
2. **Missing YouTube IDs**: 2 talks (Caroline Casey, Steve Jobs) lack YouTube metadata
3. **URL inconsistencies**: 11 talks have YouTube URLs in `tedUrl` field instead of TED.com URLs
4. **Generic descriptions**: Some talk descriptions are formulaic rather than official TED content
5. **Thumbnail quality variance**: Mix of TED CDN (64) vs YouTube (12) thumbnails

### Missing Cards
- 2 cards do not yet have primary talk mappings

### No Admin Interface
- All content management currently done via database scripts
- No UI for adding/editing talks or mappings
- No validation dashboard for data quality issues

---

## 🚀 Future Roadmap

### v0.2.0 - Admin Portal & Data Quality (Planned)
**Focus**: Backend tools for content curation and data quality

- [ ] Admin portal at `/admin`
  - Authentication with token-based protection
  - Add/edit/delete TED talks
  - Manage card-talk mappings
  - Set primary vs secondary mappings
- [ ] Metadata fetching tools
  - Fetch from TED.com oEmbed API
  - Fetch from YouTube Data API v3
  - Merge and compare sources
- [ ] Data validation dashboard
  - Detect and fix duplicate video IDs
  - Find missing thumbnails
  - Improve descriptions
  - Ensure all cards have primary mappings
- [ ] Soft delete for talks (hide vs hard delete)
- [ ] Database constraints for data integrity

**Estimated**: Q1 2025

### v0.3.0 - Enhanced User Features (Planned)
**Focus**: User-facing improvements and engagement

- [ ] Multi-card spread builder
  - 3-card past/present/future
  - Celtic Cross spread
  - Custom spread creator
- [ ] Journaling prompts
  - Reflection questions per card
  - Save personal notes (local storage or accounts)
- [ ] Enhanced search
  - Full-text search with ranking
  - Filter combinations (suit + duration + year)
- [ ] User accounts (optional)
  - Save favorite talks
  - Track pulled cards
  - Personal reading history

**Estimated**: Q2 2025

### v0.4.0 - Community & Content Expansion (Planned)
**Focus**: Growing the content library and community

- [ ] Expand to 150+ TED talks
- [ ] Multiple talks per card (secondary mappings visible)
- [ ] User-submitted talk suggestions
- [ ] Share readings via social media
- [ ] RSS/newsletter integration
- [ ] API for third-party integrations

**Estimated**: Q3 2025

---

## 🛠️ Development Notes

### Installation & Setup

```bash
# Clone repository
git clone https://github.com/[username]/TarotTED.git
cd TarotTED

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your DATABASE_URL (Supabase PostgreSQL)

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables Required
```env
DATABASE_URL=postgresql://...  # Supabase connection string
```

### Key Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with cards, talks, mappings
- `npm run db:push` - Push schema changes to database

---

## 📁 Project Structure

```
TarotTED/
├── app/                        # Next.js App Router pages
│   ├── cards/                  # Card browsing and detail
│   ├── talks/                  # Talk browsing and detail
│   ├── themes/                 # Theme browsing and detail
│   ├── search/                 # Search page
│   └── api/                    # API routes
├── components/                 # React components
│   ├── cards/                  # Card-specific components
│   ├── talks/                  # Talk-specific components
│   ├── layout/                 # Layout components (nav, footer)
│   └── ui/                     # Reusable UI components
├── lib/
│   └── db/                     # Database layer
│       ├── schema.ts           # Drizzle schema definitions
│       ├── queries/            # Database query functions
│       ├── migrations/         # SQL migrations
│       └── seed-data/          # Seed data (cards, talks, mappings)
├── public/
│   └── images/
│       └── cards/              # Tarot card images (78 files)
└── scripts/                    # Utility scripts for data management
```

---

## 🎓 For Developers

### Contributing

This project welcomes contributions! Areas of interest:

1. **Data Quality**: Help fix incorrect talk metadata
2. **Content Curation**: Suggest new talk-to-card mappings
3. **Design**: Improve UI/UX, especially mobile experience
4. **Features**: Build new features from the roadmap
5. **Documentation**: Improve guides and documentation

### Code Standards
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Component-driven architecture
- Mobile-first responsive design
- Semantic HTML and accessibility

### Testing
- Manual testing for v0.1.0
- Automated testing planned for v0.2.0

---

## 📄 License

[Add your license here - MIT, Apache 2.0, etc.]

---

## 🙏 Acknowledgments

- **TED**: For creating and sharing incredible talks
- **Rider-Waite-Smith**: Traditional Tarot imagery inspiration
- **Community**: Beta testers and early adopters

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/[username]/TarotTED/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[username]/TarotTED/discussions)
- **Email**: [your-email@example.com]

---

## 🎉 What's Next?

After this release, development will focus on **v0.2.0 - Admin Portal & Data Quality**. The goal is to create a robust backend interface for managing content and fixing data quality issues before expanding user-facing features.

See `ADMIN_PORTAL_PLAN.md` for the detailed implementation plan.

---

**Thank you for trying TarotTED v0.1.0!**

We're excited to combine the wisdom of Tarot with the inspiration of TED talks. Pull a card, discover a talk, and explore new perspectives.
