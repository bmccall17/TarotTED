# Landing Page Card Improvements - Mobile QOL Updates

**Status:** Ready for Implementation
**Target Release:** v1.2.0
**Created:** 2026-01-02

---

## Executive Summary

The landing page ritual experience needs polish for mobile users. Key issues include: card images appearing before shuffle animations complete, no audio feedback for interactions, and lost state when navigating to card/talk details.

---

## Issues Identified

| Issue | Severity | Description |
|-------|----------|-------------|
| **Image flash before animation** | High | Card images load and appear before `cascade-in` animation starts |
| **No audio feedback** | Medium | No sounds for shuffle, flip, or dock interactions |
| **State lost on navigation** | High | Back button from card/talk detail loses the 3-card ritual state |
| **Mobile dock friction** | Low | Two-tap requirement on mobile adds interaction overhead |

---

## Key Files

| File | Role |
|------|------|
| `/app/page.tsx` | Landing page wrapper, scroll management |
| `/components/ritual/CardCascade.tsx` | 3-card ritual orchestrator, fetch, layout transitions |
| `/components/ritual/RitualCard.tsx` | Individual card UI, flip animation, talk dock |
| `/components/ritual/Invocation.tsx` | Time-based greeting, journal prompts |
| `/app/globals.css` | Animation definitions (cascade-in, ritual-flip) |
| `/app/cards/[slug]/page.tsx` | Card detail page, back button |
| `/app/talks/[slug]/page.tsx` | Talk detail page, back button |
| `/app/api/ritual-cards/route.ts` | Random card selection API |

---

## Animation Timeline (Current)

| Event | Timing | Notes |
|-------|--------|-------|
| API fetch starts | 0ms | Cards requested |
| API response | ~200-400ms | Card data + image URLs received |
| Card images load | Variable | Browser lazy-loads, NO preloading |
| Cascade animation | 0-999ms | Staggered (333ms × 3 cards, 600ms each) |
| Card flip | 777ms | On user click |
| Layout spread | 600ms | When 2+ cards revealed |
| Navigation exit | 888ms | Fade + blur before route change |

---

## Implementation Plan

### Phase 1: Fix Image Preloading (High Priority)

**Goal:** Eliminate image flash by preloading before animation starts.

**Files to Modify:**
- `/components/ritual/CardCascade.tsx`

**Implementation:**
1. After API fetch returns, preload all 3 card images using `Image()` constructor
2. Add loading state (`imagesLoaded`) separate from data loading
3. Only render `RitualCard` components after images preloaded
4. Add fallback timeout (3s) to prevent infinite loading on slow connections

**Code Approach:**
```typescript
// In CardCascade.tsx after fetchCards()
const preloadImages = async (cards: CardData[]) => {
  const promises = cards.map(card => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Don't block on error
      img.src = card.imageUrl;
    });
  });
  await Promise.all(promises);
};
```

---

### Phase 2: Add Audio Feedback (Medium Priority)

**Goal:** Add subtle, satisfying sounds for card interactions.

**New Files:**
- `/lib/hooks/useCardSounds.ts` - Audio management hook
- `/public/sounds/shuffle.mp3` - Card shuffle sound
- `/public/sounds/flip.mp3` - Card flip sound

**Files to Modify:**
- `/components/ritual/CardCascade.tsx` - Trigger shuffle sound
- `/components/ritual/RitualCard.tsx` - Trigger flip sound

**Implementation:**
1. Create `useCardSounds()` hook with `playShuffleSound()` and `playFlipSound()`
2. Use `useRef` for audio elements, preload on mount
3. Call `playShuffleSound()` when first card animation starts
4. Call `playFlipSound()` when `isFlipping` becomes true
5. Respect user preference (localStorage toggle for mute)

**Audio Sources:**
- Free: Freesound.org, Zapsplat, BBC Sound Effects
- File specs: MP3, 128kbps, mono, total ~60KB

**Recommended Sounds:**
| Sound | Trigger | Duration | Character |
|-------|---------|----------|-----------|
| Shuffle | First card cascade starts | 600-800ms | Soft paper shuffle |
| Flip | `setIsFlipping(true)` | 100-200ms | Subtle swish |

---

### Phase 3: Dock Auto-Expand (Low Priority)

**Goal:** Reduce friction in dock interaction on mobile.

**Files to Modify:**
- `/components/ritual/RitualCard.tsx`

**Implementation:**
1. After card flip completes (777ms), wait additional 500ms
2. Auto-expand dock to show talk details
3. User can still tap to collapse or navigate

**Code Location:**
```typescript
// In RitualCard.tsx handleReveal()
// After flip animation completes:
setTimeout(() => {
  setIsDockExpanded(true);
}, 500); // 500ms after flip
```

---

## Deferred Work (Future Release)

### State Preservation via sessionStorage

**Goal:** Back button returns to ritual with same 3 cards in same reveal state.

**Approach:**
- Save ritual state (3 card slugs, reveal indices, layout mode) to sessionStorage
- Restore on back navigation from card/talk detail pages
- Smart back button that returns to ritual instead of collection pages
- Consider 30-minute expiry to prevent stale rituals

**New Files Needed:**
- `/lib/hooks/useRitualState.ts` - State persistence hook

**Files to Modify:**
- `/components/ritual/CardCascade.tsx` - Save/restore state
- `/app/cards/[slug]/page.tsx` - Smart back button
- `/app/talks/[slug]/page.tsx` - Smart back button
- `/app/api/ritual-cards/route.ts` - Support fetching by slugs

**Implementation Steps:**
1. Create `useRitualState()` hook
2. Save state before navigation in RitualCard
3. Check for saved state on CardCascade mount
4. Update detail page back buttons conditionally

---

## File Changes Summary

### This Release (v1.2.0)

**New Files:**
```
/lib/hooks/useCardSounds.ts      # Audio management
/public/sounds/shuffle.mp3       # Shuffle sound effect
/public/sounds/flip.mp3          # Flip sound effect
```

**Modified Files:**
```
/components/ritual/CardCascade.tsx    # Image preload, audio trigger
/components/ritual/RitualCard.tsx     # Flip sound trigger, dock auto-expand
```

### Future Release

**New Files:**
```
/lib/hooks/useRitualState.ts     # State persistence
```

**Modified Files:**
```
/components/ritual/CardCascade.tsx    # State save/restore
/app/cards/[slug]/page.tsx            # Smart back button
/app/talks/[slug]/page.tsx            # Smart back button
/app/api/ritual-cards/route.ts        # Fetch by slugs
```

---

## Risk Mitigation

### Audio Considerations
- Browser autoplay policies require user gesture first
- First sound may not play until user interacts with page
- Mute preference should persist in localStorage
- Graceful fallback if audio fails to load

### Image Preload Timeout
- Set 3-second timeout to prevent infinite loading
- Show cards with placeholder if images fail to load
- Console warn on timeout for debugging

### State Restoration Edge Cases (Future)
- sessionStorage not available (private browsing) → fallback to random cards
- Saved card no longer exists in database → fallback to random cards
- State expired (>30 min) → fetch fresh random cards
- Browser back button vs. in-app back link → both should work

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Image flash before animation | Visible | None |
| Audio feedback on interactions | None | Shuffle + flip sounds |
| Mobile dock interaction | 2 taps required | Auto-expand after flip |
| State preserved on back navigation | 0% | Deferred to future release |

---

## Implementation Order

1. **Phase 1: Image Preloading** - Highest impact, cleanest fix
2. **Phase 2: Audio Feedback** - Add shuffle + flip sounds
3. **Phase 3: Dock Auto-Expand** - 500ms delay after card reveals

---

## User Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| Audio files | Find sounds for me | Will source from Freesound.org/Zapsplat |
| State preservation | Skip for now | Document in SHIP_LOG.md as future work |
| Dock improvement | Auto-expand after flip | 500ms delay after card reveals |
