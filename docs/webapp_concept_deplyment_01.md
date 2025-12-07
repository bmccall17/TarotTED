this document gives you:

1. Recommended stack (opinionated, Vercel-friendly)
2. Functional requirements (what the app must do)
3. Technical requirements (how it should work under the hood)
4. Vercel-specific setup requirements
5. A concrete “Phase 1” checklist so you can actually spin this up

---

## 1. Recommended stack (for Vercel)

Given what you want (DB-backed, SEO-friendly, mobile-first, Vercel deploy), I’d recommend:

* **Framework:** Next.js (latest, App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Database:** Postgres (Vercel Postgres or Supabase; I’ll assume Vercel Postgres for tight integration)
* **ORM:** Drizzle ORM or Prisma (Drizzle is very Vercel/Edge friendly; Prisma is great if you prefer its ecosystem)
* **Deployment:** Vercel, using:

  * Server Components + Route Handlers (`app/` directory)
  * Possibly `node` runtime functions (not edge) for DB access, at least initially

You *can* start with a static JSON file for data in dev and then wire the DB underneath, but since you’re already thinking “true database,” I’ll design the requirements assuming Postgres.

---

## 2. Functional requirements

These are the “what it must do” items for your Tarot-of-TED app.

### Core user stories (MVP)

1. **Browse cards**

   * User can see a list/grid of all Tarot cards.
   * User can tap a card to view its detail page.

2. **Card detail → mapped talks**

   * Card detail shows:

     * Card name + image + short summary/keywords.
     * 1 “primary” mapped talk with a short rationale.
     * Additional mapped talks (if they exist).
   * Each talk links to a Talk detail page and/or the TED URL.

3. **Browse talks**

   * User can see a list of all mapped talks.
   * User can tap a talk to view its detail page.

4. **Talk detail → mapped cards**

   * Talk detail shows:

     * Talk title, speaker, duration (if available).
     * TED/TEDx URL or embedded player.
     * Cards it’s mapped to, with short mapping rationale.

5. **Search**

   * Single search box (home + nav) that lets user type:

     * a card name (“tower”, “three of cups”)
     * a talk title/speaker (“Brené Brown”)
     * a theme/keyword (“grief”, “beginnings”)
   * Search results grouped by type: Cards, Talks, Themes.

6. **Themes**

   * User can browse a list of Themes.
   * Theme detail shows:

     * Short description of the theme.
     * Cards associated with the theme.
     * Talks associated with the theme.

7. **Random draw**

   * User can tap “Draw a card & talk” on Home.
   * App returns a random card + its primary mapped talk.

---

### Nice-to-have (not required for first deploy, but design for them)

1. **Filters**

   * Filter cards by suit/major.
   * Filter talks by duration or event.
   * Filter both by theme tags.

2. **Deep content**

   * Accordions for upright/reversed meanings.
   * Longer mapping essays / your notes.

3. **Facilitator tools (later)**

   * Save card-talk combos as “sets” or “playlists.”
   * Maybe a simple journal/notes feature.

---

## 3. Technical requirements (architecture)

### App structure (Next.js App Router)

Suggested route structure:

* `/` – Home (search + random draw + entry points)
* `/cards` – Cards index
* `/cards/[slug]` – Card detail
* `/talks` – Talks index
* `/talks/[slug]` – Talk detail
* `/themes` – Themes index
* `/themes/[slug]` – Theme detail
* `/api/*` – JSON endpoints (if you need them for client-side calls)

Each of the main pages can be **server components** that load data directly from the DB using your ORM.

---

### Data layer (DB + ORM)

Reflecting what we already designed, your DB needs at least:

**Tables:**

* `cards`
* `talks`
* `card_talk_mappings`
* `themes`
* `card_themes`
* `talk_themes`

(Optionally `tags` + `tag_links` later.)

**Minimal fields to support MVP:**

`cards`

* `id`, `slug`, `name`, `arcana_type`, `suit`, `number`, `sequence_index`
* `image_url`, `summary`, `keywords` (JSON/text)

`talks`

* `id`, `slug`, `title`, `speaker_name`, `ted_url`, `thumbnail_url`
* (optionally `duration_seconds`, `year`)

`card_talk_mappings`

* `id`, `card_id`, `talk_id`, `is_primary`, `strength`, `rationale_short`

`themes`

* `id`, `slug`, `name`, `short_description`

`card_themes`

* `card_id`, `theme_id`

`talk_themes`

* `talk_id`, `theme_id`

**Technical requirement:**

* One place defines the schema (Drizzle/Prisma models or SQL migrations).
* Vercel environment variable for `DATABASE_URL` points your ORM to the DB.

---

### Data access patterns

Each page needs fast, predictable queries:

* `Cards index`:

  * `SELECT id, name, slug, image_url, arcana_type, suit, number FROM cards ORDER BY sequence_index;`

* `Card detail`:

  * Fetch card by `slug`.
  * Fetch mappings for that card (join `card_talk_mappings` + `talks`).
  * Optionally fetch themes associated with that card.

* `Talks index`:

  * Fetch basic info for all talks (paginated).

* `Talk detail`:

  * Fetch talk by `slug`.
  * Fetch mapped cards via `card_talk_mappings`.

* `Themes`:

  * List all themes.
  * For a specific theme, join to `card_themes` and `talk_themes`.

* `Search`:

  * Small server action or `/api/search` that:

    * Runs a query against `cards`, `talks`, `themes` with `ILIKE '%query%'`.
    * Returns grouped results.

**Technical requirement:**

* Centralized data access layer (e.g. `lib/db/cards.ts`, `lib/db/talks.ts`) so pages don’t all hand-roll queries.

---

### Rendering / performance

Since it’s mostly read-only content:

* Use **SSG or ISR** where possible:

  * `cards/[slug]` and `talks/[slug]` can be statically generated from the DB at build time (or revalidated @ interval).
  * `cards` and `talks` indexes also good candidates for static generation with revalidation.
* Use **server-side data fetching** in server components, not client-side fetches for core pages.
* Use **client components** only where interactivity is needed:

  * Random draw button (could also use a simple server action).
  * Search field with live updates (if you want it).

**Technical requirement:**

* Clear choice per page: `generateStaticParams` + `revalidate` or not.
* Avoid heavy client libraries until you *need* them.

---

### UI layer

* **Tailwind CSS** for quick responsive UI.
* Component structure:

  * `components/CardGrid.tsx`
  * `components/CardSummary.tsx`
  * `components/TalkListItem.tsx`
  * `components/ThemeCard.tsx`
  * `components/SearchBar.tsx`
* Mobile-first layouts, then add desktop enhancements (two-column layouts) with responsive classes.

**Technical requirement:**

* Tailwind configured in `tailwind.config.js`.
* Design tokens (font size, spacing) that support readability for text-heavy views.

---

## 4. Vercel-specific setup requirements

To align with how Vercel likes to work:

1. **GitHub / Git repo**

   * Create a repo for this project.
   * Vercel will auto-deploy `main` (and preview branches).

2. **Project creation**

   * In Vercel dashboard:

     * “New Project” → import GitHub repo.
     * Framework: Next.js (detected).
     * Build command: `next build` (default).
     * Output: `.next` (default).

3. **Database**

   * Add a **Vercel Postgres** database (or connect Supabase).
   * Get `DATABASE_URL` from Vercel (or Supabase).
   * Add `DATABASE_URL` to:

     * Vercel Project → Settings → Environment Variables.
     * .env.local in your dev environment.

4. **Environment variables**

   * `DATABASE_URL` – connection string for Postgres.
   * Add any others you need later (analytics, etc).

5. **Build & runtime**

   * Next.js defaults are fine, but:

     * For DB queries, start with Node.js runtime (`runtime = 'nodejs'`) on any route handlers that talk to Postgres (if you run into edge incompatibility).
   * Set `output: 'standalone'` if you want to optimize performance for serverless.

6. **Domains**

   * Project will get a `*.vercel.app` URL automatically.
   * You can later attach a custom domain (e.g. `tarotofted.com`) under Domains.

**Technical requirement:**

* Environment-aware config (dev vs prod DB URLs).
* Deploy previews for branches so you can test new card layouts before merging.

---

## 5. Concrete Phase 1 checklist (so you can start today)

Here’s the minimal path from “idea” to a working Vercel deployment:

**Step 1 – Scaffold the app**

* [ ] `npx create-next-app@latest tarot-of-ted`

  * Use TypeScript
  * Use App Router
  * Use Tailwind
* [ ] Initialize git + push to GitHub.

**Step 2 – Set up Vercel project**

* [ ] Create new project in Vercel from this repo.
* [ ] Add Vercel Postgres (or connect existing Postgres) and copy `DATABASE_URL`.
* [ ] Add `DATABASE_URL` to Vercel env + `.env.local`.

**Step 3 – Define DB schema**

* [ ] Choose ORM: Drizzle or Prisma.
* [ ] Define schema for:

  * `cards`
  * `talks`
  * `card_talk_mappings`
  * `themes`
  * `card_themes`
  * `talk_themes`
* [ ] Run migrations to create tables.

**Step 4 – Seed initial data**

* [ ] Write a small `scripts/seed.ts` to insert:

  * A handful of cards (maybe Major Arcana first).
  * A handful of talks.
  * Some card-talk mappings.
  * 1–2 themes linking existing cards and talks.
* [ ] Run the script locally against the dev database.

**Step 5 – Build core pages**

* [ ] `/` – Simple home:

  * Search bar (non-functional or simple submit).
  * “Draw random card & talk” button calling a server action.
* [ ] `/cards` – Cards index (server component, DB query).
* [ ] `/cards/[slug]` – Card detail page:

  * Card info.
  * Primary mapped talk.
  * List of more talks.
* [ ] `/talks/[slug]` – Talk detail page:

  * Talk info.
  * Cards mapped to it.

**Step 6 – Add search (basic)**

* [ ] `/api/search` route handler:

  * Accepts `q` query param.
  * Queries cards/talks/themes with simple `ILIKE` matching.
* [ ] Home search bar hits `/search?q=…` or updates results client-side.

**Step 7 – Deploy and iterate**

* [ ] Push to `main`, confirm Vercel build + DB access works.
* [ ] Sanity-check pages on mobile.
* [ ] Start iterating on UI polish, themes, and content depth.

---

