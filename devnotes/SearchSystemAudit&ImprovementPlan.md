 TarotTED Search System Audit & Improvement Plan

 Executive Summary

 The TarotTED search system is functional but has inconsistent UX patterns, search quality gaps, and some
 performance issues. Given the current scale (~200 talks), performance is manageable but search quality
 improvements will have the most user-visible impact.

 User Priority: Search Quality (relevance, more searchable fields, highlighting)
 Data Scale: Small (<200 talks) - ILIKE acceptable, full-text optional
 Rollout Strategy: Direct deployment with git revert as fallback

 ---
 Part 1: Current State Audit

 1.1 Frontend Search Components

 | Component        | Location                                               | Searches             | Issues
                                                            |
 |------------------|--------------------------------------------------------|----------------------|--------------
 -----------------------------------------------------------|
 | Main Search Page | app/search/page.tsx                                    | Cards, Talks, Themes | No
 debouncing, silent error handling, filters don't auto-trigger search |
 | SearchFilters    | components/search/SearchFilters.tsx                    | N/A (filters)        | Logic bug in
 hasActiveFilters(), hardcoded defaults scattered           |
 | TalkSelector     | components/admin/mappings/TalkSelector.tsx             | Talks                | Uses
 useDebounce hook properly                                          |
 | AddMappingModal  | components/admin/validation/modals/AddMappingModal.tsx | Cards                | Manual
 setTimeout instead of hook, no keyboard nav                      |
 | CardsList        | components/admin/cards/CardsList.tsx                   | Cards                | Working
 correctly                                                       |
 | TalksList        | components/admin/talks/TalksList.tsx                   | Talks                | FIXED - was
 broken due to mismatched return types                       |

 1.2 Backend Search Implementation

 | Endpoint/Function     | Location                      | Pattern                     | Issues
                       |
 |-----------------------|-------------------------------|-----------------------------|---------------------------
 ----------------------|
 | GET /api/search       | app/api/search/route.ts       | ILIKE pattern matching      | No pagination, hardcoded
 limits (20/20/10)      |
 | searchWithFilters()   | lib/db/queries/search.ts      | ilike() on multiple columns | No relevance ranking, no
 full-text search       |
 | searchTalksForAdmin() | lib/db/queries/admin-talks.ts | ILIKE + mapping fetch       | FIXED - now returns
 consistent structure        |
 | getAllCardsForAdmin() | lib/db/queries/admin-cards.ts | ILIKE with inline search    | Working correctly
                       |
 | getAllTalks()         | lib/db/queries/talks.ts       | Fetches all + N+1           | CRITICAL: N+1 query (1 + N
  queries for N talks) |

 1.3 Database Schema (Search-Relevant)

 Currently Searched Columns:
 - cards: name, keywords, summary
 - talks: title, speakerName
 - themes: name, shortDescription

 NOT Searched (Opportunity):
 - talks.description - valuable metadata
 - cards.uprightMeaning, reversedMeaning, symbolism - rich content
 - cardTalkMappings.rationaleShort - curatorial content

 Existing Indexes: Only 1 custom index (idx_one_primary_per_card)

 Missing Critical Indexes:
 - talks.title - most searched field
 - talks.speaker_name - frequently searched
 - talks.is_deleted - every query filters this
 - cards.name, cards.keywords - search fields
 - Foreign keys on all junction tables

 1.4 Data Volume Estimates

 - Cards: 78 (fixed)
 - Talks: 500-5000+ (growing)
 - Themes: 10-20
 - Mappings: 390-1560+

 ---
 Part 2: Critical Issues (Fix First)

 P0 - Production Blockers

 1. N+1 Query in getAllTalks() - lib/db/queries/talks.ts:13-30
   - Impact: 200 talks = 201 database queries
   - Risk: Page timeout, database overload
 2. Missing Database Indexes
   - Impact: Full table scans on every search
   - Risk: Slow queries as data grows
 3. Logic Bug in hasActiveFilters() - components/search/SearchFilters.tsx:46-48
   - Impact: "Clear All" button visibility incorrect
   - Risk: User confusion

 P1 - Important UX Issues

 4. Filters Don't Trigger Search - Main search page
   - Changing filters updates URL but doesn't re-run search
 5. Inconsistent Debouncing - Multiple patterns used
   - Some use useDebounce hook, others manual setTimeout
 6. Silent Error Handling - Main search fails silently
   - Users see nothing when search errors
 7. No Pagination - Hard limits with no "load more"
   - Users can't see beyond 20 results

 ---
 Part 3: Improvement Strategy

 Strategy A: Database-First Optimization

 Focus on backend performance before UI improvements.

 Rationale: Current ILIKE queries will slow down as talks grow. Fix foundation first.

 Strategy B: Full-Text Search Migration

 Replace ILIKE with PostgreSQL full-text search (tsvector/tsquery).

 Rationale: Better relevance ranking, faster queries, phrase matching.

 Strategy C: Incremental UX Polish

 Fix frontend issues while keeping backend stable.

 Rationale: Fastest path to better user experience.

 Recommended: Hybrid Approach (A + C, then B)

 1. Fix critical bugs and add indexes (quick wins)
 2. Polish UX patterns (user-visible improvements)
 3. Migrate to full-text search (long-term scalability)

 ---
 Part 4: Implementation Phases (Reordered for Search Quality Priority)

 Phase 1: Quick Wins & Bug Fixes (Low Risk)

 Goal: Fix existing bugs, establish foundation

 | Task                                 | File(s)             | Risk |
 |--------------------------------------|---------------------|------|
 | Fix hasActiveFilters() logic bug     | SearchFilters.tsx   | Low  |
 | Auto-trigger search on filter change | app/search/page.tsx | Low  |
 | Add error feedback to main search    | app/search/page.tsx | Low  |
 | Standardize on useDebounce hook      | AddMappingModal.tsx | Low  |

 Phase 2: Search Quality Improvements (Medium Risk) ⭐ PRIMARY FOCUS

 Goal: Better relevance, more searchable content, result highlighting

 | Task                        | File(s)                  | Description
             |
 |-----------------------------|--------------------------|--------------------------------------------------------
 ------------|
 | Expand searchable fields    | lib/db/queries/search.ts | Add talks.description, cards.uprightMeaning,
 cards.reversedMeaning |
 | Add relevance scoring       | lib/db/queries/search.ts | Boost exact matches over partial matches
             |
 | Result ordering             | lib/db/queries/search.ts | Sort by relevance score, then alphabetically
             |
 | Search highlighting         | app/search/page.tsx      | Highlight matching terms in results
             |
 | "Did you mean?" suggestions | app/search/page.tsx      | Show related terms when few/no results
             |

 Relevance Scoring Strategy (without full-text search):
 // Score calculation per result:
 // - Exact match in name/title: 100 points
 // - Starts with query: 50 points
 // - Contains query in name/title: 25 points
 // - Match in description/keywords: 10 points
 // Sort by score descending

 Phase 3: UX Polish (Low Risk)

 Goal: Consistent patterns, better feedback

 | Task                                 | File(s)                                      | Risk |
 |--------------------------------------|----------------------------------------------|------|
 | Extract filter defaults to constants | New lib/constants/search.ts                  | Low  |
 | Add keyboard navigation to dropdowns | TalkSelector.tsx, AddMappingModal.tsx        | Low  |
 | Add "Load more" pagination           | app/search/page.tsx, app/api/search/route.ts | Low  |
 | Search in bottom nav (mobile)        | components/layout/BottomNav.tsx              | Low  |

 Phase 4: Performance & Infrastructure (Low Priority for Current Scale)

 Goal: Future-proof for growth

 | Task                       | File(s)                 | When                         |
 |----------------------------|-------------------------|------------------------------|
 | Add database indexes       | New migration           | When approaching 500+ talks  |
 | Fix N+1 in getAllTalks()   | lib/db/queries/talks.ts | When /talks page slows down  |
 | Full-text search migration | Schema + queries        | When approaching 1000+ talks |

 Note: At <200 talks, these are nice-to-have. Monitor performance and implement when needed.

 ---
 Part 5: Risk Mitigation Strategy (Simplified for Direct Deployment)

 Before Each Deployment

 1. Test locally with the development database
 2. Test in Vercel preview before merging to main
 3. Keep commits small and focused - one feature per commit

 Rollback Strategy

 - Git revert is the primary rollback mechanism
 - Each phase should be independently revertable via git
 - Test rollback procedure: git revert <commit-hash> before production issues

 Defensive Coding

 1. Fallback to existing behavior if new code fails
 2. Error boundaries around search components
 3. Graceful degradation - search should never crash the page
 4. Console logging for debugging without user-visible errors

 Monitoring (Post-Deployment)

 1. Check Vercel function logs for errors
 2. Manual testing of search flows after each deployment
 3. Monitor page load times in browser DevTools

 ---
 Part 6: Success Metrics

 | Metric             | Current        | Target     | Measurement    |
 |--------------------|----------------|------------|----------------|
 | Search query time  | Unknown        | <200ms p95 | Database logs  |
 | Queries per search | N+1 (variable) | ≤3         | Query counter  |
 | Search error rate  | Unknown        | <0.1%      | Error tracking |
 | Filter usage       | Unknown        | Track      | Analytics      |
 | Results clicked    | Unknown        | Track      | Analytics      |

 ---
 Part 7: Files to Modify (By Phase)

 Phase 1: Quick Wins & Bug Fixes

 components/search/SearchFilters.tsx      # Fix hasActiveFilters() logic bug
 app/search/page.tsx                      # Auto-trigger search, error feedback
 components/admin/validation/modals/AddMappingModal.tsx  # Use useDebounce hook

 Phase 2: Search Quality (Primary Focus)

 lib/db/queries/search.ts                 # Expand fields, add scoring, ordering
 app/search/page.tsx                      # Result highlighting, suggestions
 app/api/search/route.ts                  # Support new query parameters

 Phase 3: UX Polish

 lib/constants/search.ts (NEW)            # Centralize filter defaults
 components/admin/mappings/TalkSelector.tsx       # Keyboard navigation
 components/admin/validation/modals/AddMappingModal.tsx  # Keyboard navigation
 components/layout/BottomNav.tsx          # Add search to mobile nav

 Phase 4: Performance (Deferred)

 lib/db/migrations/XXXX_search_indexes.sql (NEW)  # When needed
 lib/db/queries/talks.ts                          # Fix N+1 when needed

 ---
 Appendix: User Requirements (Answered)

 | Question         | Answer                              |
 |------------------|-------------------------------------|
 | Data volume      | Small (<200 talks)                  |
 | Priority         | Search quality                      |
 | Rollout strategy | No feature flags, direct deployment |

---
## Implementation Progress Log

### 2026-01-02: Phase 1 Completed

**Pre-Phase 1 Fix (from earlier session):**
- [x] Fixed `searchTalksForAdmin()` in `lib/db/queries/admin-talks.ts` to return `mappings` array instead of `mappingsCount` - fixed admin/talks search crash

**Phase 1: Quick Wins & Bug Fixes - COMPLETED**

| Task | Status | Notes |
|------|--------|-------|
| Fix `hasActiveFilters()` logic bug | Done | Added parentheses for correct operator precedence in `SearchFilters.tsx:46-47` |
| Auto-trigger search on filter change | Done | Added `performSearch()` call in `handleFilterChange()` and `handleClearFilters()` in `app/search/page.tsx` |
| Add error feedback to main search | Done | Added error state, error UI with "Try Again" button, improved error handling in `performSearch()` |
| Standardize on useDebounce hook | Done | Replaced manual setTimeout with `useDebounce` hook in `AddMappingModal.tsx` |

**Files Modified:**
- `components/search/SearchFilters.tsx` - Fixed operator precedence bug
- `app/search/page.tsx` - Added error state, auto-trigger on filter change, error UI
- `components/admin/validation/modals/AddMappingModal.tsx` - Standardized debouncing with useDebounce hook
- `lib/db/queries/admin-talks.ts` - Fixed search return structure (pre-Phase 1)

**Ready for:** Phase 2 (Search Quality Improvements) or commit current changes