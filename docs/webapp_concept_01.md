this is a *lookup instrument* for meaning and talks. treat it like a little product.

this document will walk through:

1. Core use cases
2. Information architecture & navigation (mobile-first)
3. Key screens & what’s shown by default vs hidden
4. How search / filters could work
5. Extra goodness for desktop

---

## 1. Core use cases

Design everything around these:

1. **Card → Talks**

   * “I pulled the Tower. What TED talks should I watch?”
   * UX: find card quickly, get 1–3 “anchor” talks, plus related talks.

2. **Talk → Card**

   * “I love this talk about vulnerability… what card(s) does it map to?”
   * UX: search talk by title/speaker, see mapped card(s) and why.

3. **Theme → Cards & Talks**

   * “I want talks about grief / new beginnings / leadership that match certain archetypes.”
   * UX: choose a theme, get blended decks of cards + talks.

4. **Exploration / Inspiration**

   * “Show me a random card + talk.”
   * “What’s a good talk if I’m starting something new / ending something big?”

5. **Reflection / Practice**

   * Save combinations, jot notes: “I watched X after pulling Y and it landed like this…”

Those use cases give us the structure.

---

## 2. Information architecture & navigation (mobile-first)

Think **very light, focused mobile app**:

**Global navigation (bottom nav, 4 items):**

1. **Home** – quick search + random discovery
2. **Cards** – browse all 78, filter by suit/major
3. **Talks** – browse/search talks (with filters)
4. **Themes** – curated themes, spreads, collections

Optional 5th nav if you want accounts later: **Saved** or **Journal**.

On mobile, each section is a *single stack*; avoid deep nesting.

---

## 3. Key screens & content hierarchy

### A. Home (mobile)

**Goal:** Instant “do something” in 1–2 taps.

**Above the fold (default):**

* **Search bar**: “Search cards, talks, or themes…”
* **Primary CTA buttons**:

  * “Draw a Card & Talk” (random card + mapped talk)
  * “Browse Cards”
  * “Browse Talks”
* **Maybe a single feature area**:
  “Featured theme this week: Beginnings” → card + talk thumbnail.

**Hidden / expandable:**

* “How this works” explainer (accordion)
* About Tarot of TED (link to About page)
* Advanced filters (you can get to them via search/talks page)

---

### B. Card index (Cards tab)

**Default view (mobile):**

* Simple list or grid of cards:

  * Card thumbnail
  * Name (e.g., “The Tower”)
  * Suit/major indicator
  * Chip: e.g., “3 talks mapped”

Sort / filter controls as a **top horizontal chip row**:

* [Major Arcana] [Wands] [Cups] [Swords] [Pentacles]
* [Archetype] [Transition] [Conflict] [Love] (theme chips)

**Hidden / expandable:**

* Detailed filters (orientation, mood, topic)
* Long-form text on card meanings

Tap a card → **Card detail.**

---

### C. Card detail screen (the heart of it)

For mobile, imagine a vertical stack:

**Above the fold (default):**

1. **Card hero**

   * Card image
   * Card name + short archetype label: “The Tower – Sudden upheaval, truth revealed”
2. **Short essence / keywords**

   * 1–2 lines max: “Disruption, revelation, rebuilding on new ground.”
3. **Top mapped talk (primary)**

   * Talk title
   * Speaker
   * Duration
   * A 1-line “why it matches this card”:
     “Because this talk invites us to see breakdown as a doorway to transformation.”
   * Primary button: **Watch talk**

That’s it above the fold.

**Below the fold (scroll):**

* **More talks mapped to this card**

  * Small cards with title, speaker, duration
* **“Reading note”** (your mapping rationale)

  * Short paragraph: “When this card shows up, these talks echo…”
* **Related cards**

  * “If this card resonates, you might also explore: The Tower ↔ Death ↔ The Star”
* **Tags / themes**

  * Chips: [Grief] [Resilience] [Systems Collapse] [Rebirth]

**Hidden in drawers/accordions:**

* Full upright meaning
* Reversed meaning
* Deeper mapping essay (if you’re writing those)
* Journaling prompts: “After watching, ask yourself…”

That gives casual users quick hits, and nerds a rabbit hole if they want it.

---

### D. Talk index (Talks tab)

This is more like a traditional media browser.

**Default:**

* Search bar
* Filters as chips: [Length < 10m] [10–20m] [>20m], [Popular], [Newest]
* List of talks:

  * Thumbnail
  * Title
  * Speaker
  * Duration
  * Small strip of **card badges** (“Mapped to: The Fool, The Magician”)

**Hidden / expanded filters:**

* Filter by card (dropdown/select)
* Filter by theme: [Leadership] [Grief] [Beginning Again] [Creativity]
* Filter by archetype: [Hero’s Journey] [Shadow Work] [Community]

Tap a talk → **Talk detail.**

---

### E. Talk detail screen

**Above the fold (mobile):**

* Talk title
* Speaker name
* Duration
* Play button / link out to TED/TEDx embed
* Chip: “Mapped cards: The Fool, The Magician, Ace of Wands”

**Just below:**

* **Card strip**:

  * Show small card art for each mapping. Tap → card detail.
* **One-sentence “why this mapping”**

  * “We paired this with The Fool because it’s about stepping into the unknown without a map.”

**Hidden / lower in the page:**

* Your description of the talk as seen through the card
* Themes tags
* Option to “Add to my spread / bookmark / journal”

---

### F. Themes tab

This is where your *curatorial magic* lives.

Types of themes:

* **By life phase**: Beginnings, Endings, Transitions, Grief, Legacy, Calling
* **By role**: Leader, Parent, Artist, Student, Organizer
* **By emotional state**: Stuck, On fire, Heartbroken, Curious

**Default themes view:**

* Simple cards:

  * Theme name
  * Short sentence: “Talks & cards for navigating grief.”
  * Chip: “5 cards • 8 talks”

Tap a theme → theme detail:

**Theme detail (mobile):**

* Short description
* **Featured spread** suggestion:
  “3-card spread for this theme” with card placeholders.
* Section: **Recommended cards** (small grid)
* Section: **Recommended talks** (list with play links)

You can keep all the philosophy of the theme in an accordion for those who want the deeper “meta.”

---

## 4. Search and filter UX

I’d recommend a **single omnibox search** that returns mixed results with filters:

User types: “grief”

**Result screen:**

* Tabs or filters along the top: [All] [Cards] [Talks] [Themes]
* Combined list under “All”:

  * Theme: “Grief & Gratitude”
  * Card: “Five of Cups”
  * Talk: “TEDx: On Grief and Gratefulness”

On mobile, you can show **3–5 results per type**, then a link: “See all cards for ‘grief’.”

Advanced search options behind a “Filter” button:

* Card filters: suit, major/minor, orientation
* Talk filters: length, year, TED vs TEDx, language
* Mood/intensity sliders (future idea): gentle → direct, individual → systemic

---

## 5. What’s default vs what’s tucked away

**Show by default:**

* Quick identifiers & actions:

  * Card: image, name, 3–5 keywords, 1 top talk.
  * Talk: title, speaker, duration, mapped card(s).
  * Theme: name, 1–2 sentence description, how many cards/talks.

**Hide behind drawers/accordions:**

* Longform teaching about the card (full upright/reversed essays)
* Extended mapping essays
* Transcripts or long quotes from talks
* Journaling prompts (open on demand)
* Anything that takes more than ~10 seconds to scan

Rule of thumb:

> First screen answers: *What is this?* and *What do I do next?*
> Drawers answer: *Why does this matter so much?*

---

## 6. Desktop enhancements

Once mobile is solid, desktop gets *bonus powers*:

1. **Side-by-side layouts**

   * Card details on the left, talk list or embedded video on the right.
   * For a spread: 3–5 cards across the top, selected card details below.

2. **Spread builder**

   * Drag cards from a deck panel onto positions (“Past / Present / Future”).
   * For each placed card, show suggested talks in a sidebar.

3. **Multi-filter control panel**

   * On desktop, keep filters visible on the left, results on the right.
   * Allow more complex queries: “Show all talks mapped to Cups cards about grief.”

4. **Workspace / Journal canvas**

   * Let users pin card-talk pairs and write notes in a persistent right-hand panel.
   * Perfect for facilitators planning a workshop or class.

5. **Keyboard shortcuts**

   * Arrow keys to move between cards.
   * Spacebar for “draw random card + talk.”

---

## 7. Optional future features (just planting seeds)

* **Facilitator mode**

  * Save “sets” of card-talk combos for workshops (e.g., “Leadership retreat deck”).
* **Session generator**

  * “I have 60 minutes and a theme of X” → propose a spread + 1–2 talks.
* **Public playlists**

  * Users share their own Tarot-of-TED mixes: “Breakup Healing Playlist,” etc.

---
