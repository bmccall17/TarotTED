# GitHub Release Information

## Tag
```
v0.1.0
```

## Release Title
```
v0.1.0: Initial Public Prototype - 78 Cards, 76 Talks
```

## Release Notes (Copy below for GitHub)

---

## 🎯 TarotTED v0.1.0 - Initial Prototype Release

**First public release** of TarotTED, a web application that maps the 78-card Tarot deck to TED talks, helping users discover meaningful content through archetypal wisdom.

### ✨ What's Included

#### Core Features
- ✅ **78 Tarot Cards** with full meanings, keywords, and imagery
  - 22 Major Arcana
  - 56 Minor Arcana (Wands, Cups, Swords, Pentacles)
- ✅ **76 Curated TED Talks** mapped to cards
- ✅ **Card-to-Talk Mappings** with curatorial rationale
- ✅ **Search** across cards, talks, and themes
- ✅ **Curated Themes** for exploring related content
- ✅ **Random Card** feature for discovery
- ✅ **Mobile-first Design** with dark gradient theme

#### User-Facing Pages
- 🏠 Home page with quick navigation
- 🃏 Cards index with suit filters
- 📄 Card detail pages with meanings and related talks
- 🎤 Talks index with search and duration filters
- 📄 Talk detail pages with speaker info and card associations
- 📂 Themes index and detail pages
- 🔍 Global search across all content

#### Tech Stack
- Next.js 15 (App Router)
- PostgreSQL (Supabase)
- Drizzle ORM
- Tailwind CSS
- TypeScript

### 📊 Content Statistics

| Category | Count |
|----------|-------|
| Total Cards | 78 |
| Major Arcana | 22 |
| Minor Arcana | 56 |
| TED Talks | 76 |
| Primary Mappings | 76 |
| Curated Themes | ~12 |

### 🐛 Known Issues

This is a **prototype release** with some data quality issues to be addressed in v0.2.0:

- Duplicate YouTube video IDs (4 talks)
- Missing YouTube metadata (2 talks)
- URL inconsistencies (11 talks)
- Some generic descriptions
- 2 cards missing primary mappings
- No admin interface (content managed via scripts)

### 🚀 What's Next

**v0.2.0 - Admin Portal & Data Quality** (Q1 2025)
- Admin portal for managing talks and mappings
- Metadata fetching from TED.com and YouTube APIs
- Data validation dashboard
- Database integrity constraints

See `ADMIN_PORTAL_PLAN.md` for detailed roadmap.

### 🙏 Acknowledgments

- **TED** for incredible talks
- **Rider-Waite-Smith** for Tarot inspiration
- Beta testers and early adopters
- bibliography for Tarot knowledge:
  Cynova, Melissa. Kitchen Table Tarot: Pull Up a Chair, Shuffle the Cards, and Let’s Talk Tarot. First Edition. Woodbury, Minnesota: Llewellyn Publications, 2017. ISBN 978-0-7387-5077-4.
  Dore, Jessica. Tarot for Change: Using the Cards for Self-Care, Acceptance, and Growth. Illustrated by Xaviera López. New York: Penguin Life (Viking), 2021. ISBN 978-0-593-29593-9.
  Esselmont, Brigit. Everyday Tarot: Unlock Your Inner Wisdom and Manifest Your Future. Illustrated by Eleanor Grosch. New York: Running Press, 2018. ISBN 978-0-7624-9280-0.
  Graham, Sasha. Llewellyn’s Complete Book of the Rider-Waite-Smith Tarot: A Journey Through the History, Meaning, and Use of the World’s Most Famous Deck. Woodbury, Minnesota: Llewellyn Publications, 2018. ISBN 978-0-7387-5319-5.
  Katz, Marcus, and Tali Goodwin. Secrets of the Waite-Smith Tarot: The True Story of the World’s Most Popular Tarot. Woodbury, Minnesota: Llewellyn Publications, 2015. ISBN 978-0-7387-4436-0.
  Nichols, Sallie. Tarot and the Archetypal Journey: The Jungian Path from Darkness to Light. Foreword by Mary K. Greer. Newburyport, MA: Weiser Books, 2019. ISBN 978-1-57863-659-4.
  Pollack, Rachel. Seventy-Eight Degrees of Wisdom: A Tarot Journey to Self-Awareness. Third Edition. Newburyport, MA: Weiser Books, 2019. ISBN 978-1-57863-665-5.
  Tea, Michelle. Modern Tarot: Connecting with Your Higher Self Through the Wisdom of the Cards. Illustrated by Amanda Verwey. San Francisco: HarperElixir, 2017. ISBN 978-0-06-268240-6.
  Wen, Benebell. Holistic Tarot: An Integrative Approach to Using Tarot for Personal Growth. Berkeley, California: North Atlantic Books, 2015. ISBN 978-1-58394-835-4.
  Wintner, Bakara. WTF Is Tarot? ...& How Do I Do It? Illustrated by Autumn Whitehurst. Salem, MA: Page Street Publishing Co., 2017. eISBN 978-1-62414-451-6.
---

**Pull a card. Discover a talk. Explore new perspectives.** 🎴✨

---

## How to Create the Release on GitHub

1. Go to your repository on GitHub
2. Click **Releases** in the right sidebar
3. Click **Draft a new release**
4. Fill in:
   - **Tag**: `v0.1.0` (will be created on publish)
   - **Target**: `main` branch
   - **Release title**: `v0.1.0: Initial Public Prototype - 78 Cards, 76 Talks`
   - **Description**: Copy the "Release Notes" section above
5. Check **Set as the latest release**
6. Click **Publish release**

## Optional: Pre-release Checklist

Before tagging the release, ensure:
- [ ] All recent fixes are committed and pushed
- [ ] `package.json` version updated to `0.1.0`
- [ ] `.env.example` is up to date
- [ ] `README.md` reflects current state
- [ ] All scripts work (`npm run db:seed`, etc.)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors in production mode
