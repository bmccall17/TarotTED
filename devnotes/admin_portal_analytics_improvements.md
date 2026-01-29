You are a senior product analytics + Next.js engineer. I’m building TarotTALKS (Next.js on Vercel) and I want to upgrade my Admin Dashboard to show “what users do after they land.”

CONTEXT
- TarotTALKS is a ritual-first landing page where users flip tarot cards. (It’s the home page experience.)
- A “Read My Spread” button appears once the user has revealed 2+ cards (then they can click it to open a spread reader experience). This is an important conversion moment.
- I already have Vercel Analytics enabled for pageviews, but my current dashboard doesn’t answer behavioral questions.
- Admin app already exists (tarottalks.app/admin) and shows content coverage metrics (cards/talks/mappings/themes) — I want to add BEHAVIOR metrics.

PRIMARY QUESTIONS (landing page)
1) Do users flip 0 / 1 / 2 / 3+ cards?
2) After flipping 2+, do they click “Read My Spread”?
3) How far do they go before they “bounce” (no meaningful interaction)?
4) What’s the funnel + dropoff at each step?
5) Time-to-first-action: how long until first flip? time between flips? time until “Read My Spread”?

CONSTRAINTS
- Prefer zero-cost / hobby-friendly approach.
- Respect privacy: do not store raw IP, do not collect PII; anonymous session IDs only.
- Keep performance tight: minimal client JS overhead; avoid heavy SDKs if possible.
- Make it debuggable: I want to validate events locally and in prod.
- Assume the landing page is the most important first step, but design the system so it can expand to the rest of the site later (Cards, Talks, Search, Themes).

TASK
Create a concrete plan to improve the Admin Dashboard and the instrumentation behind it.

DELIVERABLES (be explicit + actionable)
A) Event taxonomy for landing page (exact event names + when fired + required properties)
   - Include: page_view (if needed), card_flip, card_unflip (if possible), spread_ready (2+), read_spread_click, talk_click (from landing cards), card_detail_open (if applicable), etc.
   - Include properties like: session_id, page, device class, count_revealed, spread_size, elapsed_ms_from_page_load, etc.
   - Recommend which properties are truly necessary (keep it lean).

B) Definitions (so the dashboard is unambiguous)
   - Define “bounce” for THIS site (e.g., “left without any ritual interaction within X seconds”).
   - Define “engaged session”, “conversion”, “deep engagement”, etc.
   - Define the funnel steps precisely and how dropoff is computed.

C) Instrumentation options (pick the best, but provide fallback)
   Option 1: Use Vercel Web Analytics custom events (track()) if plan allows.
   Option 2: A lightweight first-party event pipeline:
     - Next.js Route Handler (/api/events) that receives events
     - Store in Supabase Postgres (or Vercel Postgres) with a simple schema
     - Create anonymous session_id in localStorage
     - Rate limit / spam guard
   - For each option: pros/cons, cost, effort, and accuracy.
   + Plan should prioritize Vercel Analytics Custom Events if feasible, define events and properties, and explain how to integrate Vercel Flags for experiments and segmentation.

D) Data model + queries
   - Proposed SQL tables (events, sessions optional)
   - Indexes
   - Example SQL queries to compute:
     - distribution of # flips per session
     - % sessions reaching 2 flips
     - % of 2+ sessions clicking “Read My Spread”
     - median time to first flip, time to 2nd flip, time to “Read My Spread”
     - bounce rate (per your definition)

E) Admin dashboard UX spec
   - A new “Behavior” section
   - Widgets/cards: “Sessions”, “Flip distribution”, “Landing funnel”, “Read My Spread CTR”, “Time to first flip”
   - A funnel visualization and a histogram-like distribution
   - Filters: date range, device (mobile/desktop), referrer/UTM (if available), route
   - Include how to handle small sample sizes and confidence warnings.
   + Include filters to view analytics by event name and by feature flag state.

F) Implementation plan (sequenced steps)
   1) Add event hooks on landing page
   2) Add storage/collection (or Vercel track)
   3) Build admin API endpoints
   4) Build dashboard UI components
   5) QA checklist + event validation (“does event fire exactly once?”)
   6) Rollout plan + how to monitor for regressions

G) Provide minimal code snippets/pseudocode where helpful:
   - How to generate session_id
   - How to fire events safely (debounce, once-per-session)
   - Example Next.js route handler for event ingestion
   - Example dashboard query endpoints

OUTPUT FORMAT
- Start with a 1-paragraph executive summary.
- Then provide the plan with headings A–G above.
- Keep it pragmatic. Avoid hand-wavy advice. Assume I will actually build this this week.
