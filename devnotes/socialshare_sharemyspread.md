socialshare_sharemyspread.md

Here’s a clean **high-level concept + user flow** that matches what you described, while keeping it *ritual-first* and lightweight.

---

## Feature concept: “From symbols → to a single next idea”

**Read My Spread** is the moment TarotTALKS stops being “a set of cards + mapped talks” and becomes “a guided oracle for your next watch.”
It’s not trying to be a full tarot reader. It’s trying to do one magical thing:

> **Turn a multi-card spread into one bespoke talk recommendation with a compelling why.**

---

## Primary user flow (happy path)

### 0) Entry: ritual screen (cards)

* User flips cards as usual.
* Once **2+ cards are revealed**, a new CTA appears:

**CTA appears:** `Read My Spread`
(Keep it visually “earned” — it feels like the app noticed they went deeper.)

### 1) Tap: Read My Spread → “Focus” step (AI prompt, free)

**Screen: “Aim the reading”**

* Short framing: *“Want this reading to be about anything in particular?”*
* Offer **two modes** so it stays frictionless:

**Mode A — Quick Focus (no typing required)**

* Tap chips like:

  * Relationships
  * Work / calling
  * Courage / change
  * Grief / healing
  * Creativity
  * Money / stability
  * Identity / purpose
  * “Surprise me”

**Mode B — Open Focus (optional text)**

* One prompt box:

  * “What’s going on right now?”
  * “What decision are you facing?”
  * “What are you longing for?”

**CTA:** `Continue`

> This keeps it free-friendly because you’re collecting just enough intent to personalize without needing a long chat session.

### 2) Processing → “Your bespoke talk” reveal

**Screen: “Your Spread Reading”**

* Section 1: **Your Spread (recap)**

  * Cards shown in the same order/positions the user pulled.
  * A short label per position (if your ritual has positions), or just “Card 1 / Card 2 / Card 3”.

* Section 2: **Your Talk**

  * Talk thumbnail + title + speaker
  * Primary CTA: `Watch the Talk`

* Section 3: **Why this talk**

  * 3–6 bullets mapping:

    * card symbolism → theme
    * card-to-card relationship → tension / progression
    * their chosen focus → why it matches now
  * (This is the “believability engine.”)

* Section 4: **The Reading**

  * You said skip the logic for now — so you can treat this as a placeholder section that will later expand into the interpretation.

**After this screen loads:** reveal the next CTA:

**New CTA:** `Share My Spread`

### 3) Tap: Share My Spread → platform + share page

**Modal: “Share your spread”**

* Step 1: pick a platform (icons):

  * Twitter/X, BlueSky, LinkedIn, Facebook, Discord, WhatsApp
* Step 2: choose a share format:

  * **Link** (default)
  * **Image + link** (if platform supports it well)
  * **Copy text snippet** (for Discord/WhatsApp convenience)

**Action:** `Generate share link`

### 4) Share destination: a unique, public “Spread Page”

This is a simple, gorgeous permalink page on `tarottalks.app` that includes:

* The spread image (the 1200×630 social preview)
* The talk (thumbnail + title + speaker + link)
* A short “Why this talk” excerpt (not the full reading, unless you want it public)
* CTA: `Draw your own spread`

This page is what powers the social share cards “on the fly.”

---

## Key UX decisions that keep this crisp (and “free”)

### Make “Read My Spread” feel earned, not pushy

* It should appear only after 2+ flips and feel like a *reward for curiosity*.

### Keep the AI step bounded

* Don’t start with a full chat.
* Start with a **single intent capture** (chips + optional text).
* Then deliver a confident output.

### Treat “Why this talk” as the product

* The talk recommendation alone is nice.
* The rationale is what makes it *TarotTALKS*.

---

## Edge cases to design now (so nothing breaks the ritual)

1. **User flips 2 cards and stops**

* CTA still appears.
* The reading still works (two-card reading archetype: tension + invitation).

2. **No good talk match**

* Fallback gracefully:

  * “Here are 2 strong options” OR
  * “Here’s the closest TED talk + a TED-like alternative”

3. **User skips focus**

* Default: “Surprise me” and proceed.

4. **User wants privacy**

* On the share modal, offer:

  * “Share cards only”
  * “Share cards + talk”
  * (Optional later: “Include my prompt?” default OFF)

---

## What this flow unlocks next (without changing the core)

* “Save this reading” (lightweight history)
* “Try a different talk” (regenerate with same spread + focus)
* “Explain one card deeper”
* “More like this” (theme-based follow-up recommendations)

---

If you want a single-line summary to anchor the whole thing:

**Flip multiple cards → focus the question → get one talk + a tight rationale → share a gorgeous permalink page that invites others to draw.**

