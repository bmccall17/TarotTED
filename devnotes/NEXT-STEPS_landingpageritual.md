# TarotTED Landing Page Ritual - Implementation Status

**Date:** December 31, 2025
**Version:** v1.1.1 (Production)
**Status:** ✅ **IMPLEMENTED** with refinements

---

# TarotTED Landing Page: Ritual-First Homepage

**Goal**
Transform the landing page from a navigation hub into an initiation ritual: reduce choices, build trust, invite a first action.

**Product principle**
TarotTED is a meaning engine. The homepage should create presence and momentum, not ask users to think too hard or have to decide where to go.

---

## Implementation Summary

### ✅ Completed Features

| Feature | Status | Notes |
|---------|--------|-------|
| 3-Card Stacked Deck | ✅ Complete | Cards stack with 25px horizontal offset, spread on reveal |
| Card Cascade Animation | ✅ Complete | Staggered 333ms entrance to stack position |
| Time-Based Invocations | ✅ Complete | Morning/Afternoon/Evening/Night messages |
| Flip Animation | ✅ Complete | Changed to 180° (from original 360° spec) |
| Talk Dock | ✅ Complete | Below card (not overlay), expands on hover/tap |
| Sparkle Atmosphere | ✅ Complete | Slowed to 8000ms/12000ms for subtlety |
| Progressive Disclosure | ✅ Complete | Search hidden, reassurance text below fold |
| 888ms Navigation Pause | ✅ Complete | Ritual feel preserved |
| Removed Menu CTAs | ✅ Complete | Browse Cards/Talks/Featured Theme removed |

### 🔧 Refinements Made

1. **Layout Order Changed**
   - Original spec: Invocation → Branding → Cards
   - **Current**: Branding → Invocation → Cards
   - *Reason*: User requested header at top, invocation immediately above cards

2. **Poetic Promise Removed**
   - Original spec included: "One card. One talk. One moment of meaning."
   - **Current**: Removed entirely
   - *Reason*: User preferred cleaner, simpler presentation

3. **Flip Animation: 360° → 180°**
   - Original spec: 360° rotation
   - **Current**: 180° rotation over 777ms
   - *Reason*: 360° showed card back twice during animation

4. **Card Dimensions Increased**
   - Original: Mobile 180×280px, Desktop 200×310px
   - **Current**: Mobile 200×340px, Desktop 220×370px (+60px height)
   - *Reason*: Prevent cropping on deck backs and revealed cards

5. **Sparkle Animation Dramatically Slowed**
   - Original spec: 1111ms breathe cycle
   - **Current**: 8000ms breathe, 12000ms float, opacity 0.1-0.25
   - *Reason*: User wanted very subtle atmosphere, not attention-drawing

6. **Card Hover Info Simplified**
   - Original spec: Card name + Archetype label + 3 keywords
   - **Current**: Card name + 3 keywords (archetype removed)
   - *Reason*: Cleaner presentation

7. **TED Branding Enhanced**
   - **Current**: Bold, TED Red (#EB0028), Helvetica typeface
   - *Reason*: Official TED brand alignment

8. **Stacked Deck Layout (Major Change)**
   - Original spec: 3 cards spread horizontally
   - **Current**: Cards stack with visible edges (25px horizontal offset)
   - First card reveals in place on stack
   - Additional card clicks trigger spread to 2-card or 3-card layout
   - *Reason*: Creates more focused, intentional deck-drawing ritual

9. **Talk Dock Moved Below Card**
   - Original spec: Talk overlay on bottom of card
   - **Current**: Compact dock sits below card (same width)
   - Collapsed: Play button, truncated title, chevron
   - Expanded: Rolls up with TED branding, full title, speaker, duration
   - Translucent with backdrop blur for card visibility
   - *Reason*: Cards always take visual priority

10. **CTA Text Simplified**
    - Original: "Choose a card to reveal your reading"
    - **Current**: "Choose a card to start" → "Click the card or talk for detailed information"
    - Removed "X cards remaining" message
    - *Reason*: Cleaner, more direct guidance

---

## Primary UX Strategy

### 1) Hero = Invocation ✅
* **TarotTED** branding at top with TED in bold red Helvetica
* Time-based invocation message immediately above cards
* Quiet, not competing with the ritual

### 2) Primary CTA = Ritual ✅
* User sees a spread of **three face-down cards**
* Interaction includes subtle motion + brief pause to honor the moment
* Single focused action: choose and reveal a card

### 3) Progressive Disclosure ✅
* Search hidden by default, revealed on user intent
* Reassurance text: "You are here and you know exactly why."
* Scroll indicator with smooth scroll to below-fold content

---

## What We Removed

**✅ Removed (accessible through bottom navbar):**
* Browse Cards
* Browse Talks
* Featured Theme
* Poetic promise line

**✅ De-emphasized:**
* Search (hidden until clicked)
* Utilitarian copy

**Outcome:** The page no longer feels like something users must "figure out." ✓

---

## Hero Interaction Spec: Stacked Deck

### ✅ Entrance (Implemented)
* On page load, animate **3 randomly selected cards** cascading into stacked position
* Stagger timing: **333ms** between cards
* Uses deck back image: `public/deck-back.webp`
* Cards: Mobile 200×340px, Desktop 220×370px
* **Stacked Layout**: Cards offset 25px horizontally (edges visible)
* Container: 280px wide, centered with `mx-auto`

### ✅ Stacked Position (Implemented)
* Card 0: Left edge of container (on top, z-index 3)
* Card 1: 25px from left (edge visible, z-index 2)
* Card 2: 50px from left (edge visible, z-index 1)

### ✅ Hover (face-down) (Implemented)
* Subtle tilt / "almost flip" tease (no reveal)
* Mystical purple glow on hover

### ✅ Click (draw) - First Card (Implemented)
* Clicking top card reveals it:
  * Rotation: **180° over 777ms**
  * Card stays in stacked position
  * **Talk Dock** appears below card (not overlay)

### ✅ Click (draw) - Additional Cards (Implemented)
* Clicking edge of second or third card:
  * That card flips and reveals
  * **All cards spread** into horizontal layout (600ms transition)
  * Container width expands: 280px → 480px (2 cards) → 720px (3 cards)

### ✅ Spread Layout (Implemented)
* Card positions when spread:
  * Card 0: 10px from left
  * Card 1: 250px from left
  * Card 2: 490px from left
* Z-index inverts (card 0 = z-index 0, card 2 = z-index 2)

### ✅ Card content on hover (revealed state - Desktop only)
* On hover over the revealed card: show
  * Card name *(archetype label removed)*
  * First 3 keywords
* **Mobile**: No hover overlay on cards

### ✅ Talk Dock Behavior (Implemented)
* Compact dock below each revealed card (same width as card)
* **Collapsed state**:
  * Red play button (5x5 circle)
  * Truncated talk title
  * Chevron up indicator
* **Expanded state** (hover on desktop, tap on mobile):
  * Rolls up with backdrop blur (12px)
  * Translucent gradient background (85% opacity)
  * "TED Talk" label in TED Red (#EB0028), Helvetica bold
  * Full talk title (wrapped)
  * Speaker name and duration
* **Seamless integration**: -3px negative margin overlaps card bottom

### ✅ Mobile Touch Behavior (Implemented)
* First tap on dock → expands rollup
* Second tap on dock → navigates to talk (with 888ms pause)
* Swipe up (30px threshold) → expands dock
* Swipe down (30px threshold) → collapses dock
* Tap outside → collapses dock

### ✅ Navigation behavior (Implemented)
* Click on the card → **Card detail page** (with 888ms pause)
* Click on Talk Dock → **Talk detail page** (with 888ms pause)

### ✅ Atmosphere (Implemented)
* Background: Very slow "breathing" sparkles animation
  * Breathe cycle: **8000ms** *(slowed from 1111ms)*
  * Float cycle: **12000ms**
  * Opacity range: **0.1 to 0.25** *(reduced from 0.3-0.8)*
  * Movement: **2-4px** *(reduced from 10-15px)*
* Navigation pause: **888ms** fade before route change

---

## Time-Based Invocations ✅

Implemented using local time-of-day (no cookies, no location required).
* **Morning** (5am-12pm): "What wisdom does today hold?"
* **Afternoon** (12pm-5pm): "What insight calls to you now?"
* **Evening** (5pm-9pm): "What does the sunset reveal?"
* **Night** (9pm-5am): "What speaks in the stillness?"

**Implementation details:**
* Component: `components/ritual/Invocation.tsx`
* Client-side only (prevents hydration mismatch)
* Gentle pulse animation (3000ms cycle)

---

## Progressive Disclosure (Below the Fold) ✅

* Search **hidden by default**, revealed when user clicks search button
* Scroll indicator (bouncing chevron) scrolls to below-fold content
* Reassurance block at **60% opacity**, reveals to 100% on hover:
  * "You are here and you know exactly why."
  * Brief explanation of card-talk pairings
* No "How this works" accordion

---

## Technical Implementation

### New Components Created
```
components/ritual/
├── RitualCard.tsx          # Individual card with flip animation
├── CardCascade.tsx         # Orchestrates 3 cards
├── Invocation.tsx          # Time-based greeting
├── SparkleBackground.tsx   # Atmosphere effect
└── index.ts                # Clean exports
```

### New API Endpoint
* `app/api/ritual-cards/route.ts` - Returns 3 random cards with primary talks

### New Animations (globals.css)
* `ritual-flip` - 180° card flip over 777ms
* `cascade-in` - Staggered card entrance
* `sparkle-breathe` - 8000ms subtle shimmer
* `sparkle-float` - 12000ms gentle movement
* `gentle-pulse` - 3000ms invocation text pulse

### Assets Added
* `public/deck-back.webp` - Tarot card back image

---

## Design System

### Typography
* **TarotTED branding**: Light gray "Tarot" + Bold red "TED" in Helvetica
* **Invocation**: Indigo italic with gentle pulse
* **Card name**: Bold white on dark gradient overlay
* **Keywords**: Small white pills with 20% opacity background

### Colors
* **TED Red**: `#EB0028` (official TED brand color)
* **Primary gradient**: Indigo 600 to Purple 600
* **Background**: Gray 900 with indigo/purple gradient
* **Sparkles**: White with purple box-shadow

### Animations & Timing
* **Card entrance**: 333ms stagger, 600ms animation
* **Card flip**: 777ms
* **Navigation pause**: 888ms
* **Sparkle breathe**: 8000ms
* **Sparkle float**: 12000ms
* **Invocation pulse**: 3000ms

---

## Future Enhancements (Not Yet Implemented)

1. **Dynamic Invocations**: Pull from card/talk language fragments instead of static messages
2. **Card Statistics**: Track which cards are drawn most frequently
3. **Share Feature**: Allow users to share their card draw
4. **Saved Readings**: User accounts to save card draws (requires auth)
5. **Multi-card Spreads**: 3-card, 5-card, Celtic Cross layouts
6. **Sound Design**: Subtle audio cues for card flip, navigation

---

## Performance Notes

* Build size: Landing page is **4.64 kB** (107 kB with JS)
* API response: 3 random cards typically returns in <100ms
* Animation performance: All animations use CSS transforms (GPU-accelerated)
* Image optimization: WebP format for deck back and card images

---

## Testing Checklist

- [x] Cards cascade into stacked position with proper timing
- [x] Card edges visible in stacked layout (25px offset)
- [x] Hover on face-down cards shows tilt tease
- [x] Click reveals card with 180° flip
- [x] First card stays stacked after reveal
- [x] Additional cards trigger spread layout transition
- [x] Talk dock appears below revealed cards
- [x] Talk dock expands on hover (desktop)
- [x] Talk dock tap-to-expand works (mobile)
- [x] Swipe gestures work for dock expand/collapse
- [x] Navigation has 888ms ritual pause
- [x] Sparkles are subtle and slow
- [x] Time-based invocation changes throughout day
- [x] Redraw button appears after all cards revealed
- [x] CTA text updates: "Choose a card to start" → "Click the card or talk..."
- [x] Search reveals on click
- [x] Mobile responsive (stacked deck fits on small screens)
- [x] TED branding uses correct red (#EB0028) and Helvetica
- [x] Card info overlay only shows on desktop (not mobile)

---

**Last Updated:** December 31, 2025 by Claude Code
**Implementation Status:** Production-ready v1.1.1 ✅
