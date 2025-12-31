# TarotTED Next Steps - Landing Page Ritual

**Date:** December 31, 2025
**Version:** v1.0.6 (Production)

---

# TarotTED Landing Page Next Steps: Ritual-First Homepage

**Goal**
Transform the landing page from a navigation hub into an initiation ritual: reduce choices, build trust, invite a first action.

**Product principle**
TarotTED is a meaning engine. The homepage should create presence and momentum, not ask users to think too hard or have to decide where to go.

---

## Primary UX Strategy

### 1) Hero = Invocation
* One poetic promise (e.g., **“One card. One talk. One moment of meaning.”**)
* Branding present but quiet (low opacity; not competing with the ritual)
* A time-based invocation line at the top (see “Time-Based Invocations”)

### 2) Primary CTA = Ritual
Replace “menu-like” CTAs with a single interactive draw experience:
* User sees a spread of **three face-down cards**
* Interaction includes subtle motion + a brief pause to honor the moment

### 3) Progressive Disclosure
De-emphasize “utility” paths until after the ritual moment:
* Search, Browse, Themes remain accessible below the fold, and visually secondary, smaller
* “How this works” becomes reassurance (“You’re in the right place”), not instruction

---
## What We Are Removing or De-emphasizing
**remove because these are accessible through the bottom navbar**
* Browse Cards
* Browse Talks
* Featured Theme
**De-emphasize (not delete):**
* Search
* Any utilitarian copy that increases cognitive load

**Outcome:** the page no longer feels like something users must “figure out.”

---

## Hero Interaction Spec: 3-Card Cascade

### Entrance
* On page load, animate **3 randomly selected cards** cascading in face-down
* Stagger timing: **333ms** between cards
* Use deck back image: `docs/smith-waite-deck-back_2013.webp`
* Color treatment: align deck back with the site’s purple theme

### Hover (face-down)
* Subtle tilt / “almost flip” tease (no reveal)

### Click (draw)
* Clicking a card reveals it:
  * Rotation: **360° over 777ms**
  * After reveal, show the card with a **Talk overlay**:
    * Talk overlay positioned bottom-right
    * Initial state: **40% opacity**, **no more than 1/4 card height**

### Card content on hover (revealed state)
* On hover over the revealed card: show
  * Card name
  * Archetype label
  * First 3 keywords

### Navigation behavior
* Click on the card (excluding talk overlay) → **Card detail page**
* Hover over talk overlay:
  * Expands to **2/5 card height**
  * Opacity to **100%**
  * Reveals talk title + duration
* Click talk overlay → **Talk detail page**

### Atmosphere
* Background: slow “breathing” sparkles animation (e.g., **1111ms** shimmer cycle)
* Add a short pause and fade before route navigation: **888ms** (to preserve ritual feel)

---

## Time-Based Invocations (Top Line)
Use local time-of-day (no cookies, no location required).
* Morning: “What wisdom does today hold?”
* Afternoon: “What insight calls to you now?”
* Evening: “What does the sunset reveal?”
* Night: “What speaks in the stillness?”
(These can later be upgraded to pull from card/talk language fragments, but keep v1 simple.)

---

## Progressive Disclosure Rules (Below the Fold)
* Content below hero starts at ~**66% opacity**
* Reveals to full opacity on hover/interaction
* Search can be hidden by default and revealed via explicit user intent
* Replace “How this works” accordion with a reassurance block:
  * e.g., “You are here and you know exactly why.”

Optional: gentle bounce/scroll indicator that disappears after first interaction.

---

## Design System Enhancements (Non-blocking)
1. Card & Talk hover: subtle glow + elevation
2. Loading states: skeletons / smooth transitions

---
