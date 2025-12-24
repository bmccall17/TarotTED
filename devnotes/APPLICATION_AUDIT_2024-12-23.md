# TarotTED Comprehensive Application Audit

**Audit Date:** December 23, 2024
**Auditor:** Claude Code
**Application Version:** v1.0.1

---

## Executive Summary

This audit covers security vulnerabilities, performance issues, and functional dead ends in the TarotTED Next.js application. **2 critical security issues require immediate action before public release.**

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 2 | 3 | 3 | 2 | 10 |
| Performance | 0 | 3 | 2 | 4 | 9 |
| Functional | 0 | 1 | 3 | 2 | 6 |
| **Total** | **2** | **7** | **8** | **8** | **25** |

---

## CRITICAL SECURITY ISSUES

### 1. Secrets Exposed in Git History

**Severity:** CRITICAL - ACTIVELY EXPLOITABLE
**Status:** [ ] Not Fixed

Your `.env.local` was committed to git history before being added to `.gitignore`. These secrets are permanently stored and recoverable:

- Supabase database passwords
- Supabase JWT secret & service role key
- YouTube API key

**Evidence:**
- Commit `5ee6fa01086e1b0a8deb3c3ab379cc8909f87e7a` deleted `.env.local`
- Commit `7339840c806328c9a68547e689afbe4ab3d622b1` added all credentials
- Secrets remain in git history even though file is deleted

**Impact:**
- Anyone with repository access can extract all database credentials
- Supabase database is fully compromisable
- All data in the database is at risk

**Required Actions:**
- [ ] Rotate ALL Supabase credentials immediately
- [ ] Rotate YouTube API key
- [ ] Use `git-filter-repo` to remove secrets from history
- [ ] Force push to clean repository

---

### 2. No Rate Limiting on Admin Login

**Severity:** CRITICAL
**Status:** [ ] Not Fixed
**Files:** `middleware.ts`, `app/admin/login/page.tsx`

The login endpoint performs no rate limiting on token verification attempts. An attacker can brute-force the admin token indefinitely.

```typescript
// middleware.ts - NO rate limiting on token check
if (!validToken || token !== validToken) {
  // Unauthorized response - no attempt tracking
}
```

**Impact:** Admin account compromise possible through repeated attempts

**Required Actions:**
- [ ] Implement rate limiting (max 5 attempts per minute per IP)
- [ ] Use Upstash or Vercel KV for distributed rate limiting
- [ ] Add exponential backoff after failed attempts

---

## HIGH SEVERITY ISSUES

### 3. Token Debug Endpoint Exposes Token

**Severity:** HIGH
**Status:** [ ] Not Fixed
**File:** `app/api/admin/test-token/route.ts`

```typescript
tokenPreview: token?.substring(0, 10) + '...' + token?.substring(token.length - 10)
```

This endpoint exposes the first and last 10 characters of your admin token, drastically reducing the keyspace an attacker needs to brute-force.

**Required Actions:**
- [ ] Remove this endpoint entirely, OR
- [ ] Remove `tokenPreview` and `tokenLength` fields

---

### 4. Timing-Unsafe Token Comparison

**Severity:** HIGH
**Status:** [ ] Not Fixed
**Files:** `middleware.ts:20`, `app/admin/login/page.tsx:10`

```typescript
if (token !== validToken)  // Vulnerable to timing attacks
```

Token comparison uses `===` which is vulnerable to timing attacks. Response time varies based on how many characters match.

**Required Actions:**
- [ ] Use `crypto.timingSafeEqual()` for token comparison:
```typescript
import crypto from 'crypto';
const tokenBuffer = Buffer.from(token);
const validBuffer = Buffer.from(validToken);
if (!crypto.timingSafeEqual(tokenBuffer, validBuffer)) { }
```

---

### 5. In-Memory Rate Limiting Non-Functional

**Severity:** HIGH
**Status:** [ ] Not Fixed
**File:** `lib/utils/rate-limit.ts`

```typescript
const rateLimitMap = new Map<string, number[]>();
```

This is in-memory and resets on every serverless invocation. Rate limiting on the metadata fetch endpoint is completely non-functional in Vercel's serverless environment.

**Required Actions:**
- [ ] Switch to distributed rate limiting (Upstash, Vercel KV, or Redis)

---

### 6. N+1 Database Query in getAllTalks()

**Severity:** HIGH (Performance)
**Status:** [ ] Not Fixed
**File:** `lib/db/queries/talks.ts:5-33`

```typescript
const talksWithCards = await Promise.all(
  allTalks.map(async (talk) => {
    const [primaryCard] = await db.select()...  // One query per talk!
  })
);
```

**Impact:** If you have 100 talks, this executes 101 queries (1 initial + 100 for each talk's primary card).

**Required Actions:**
- [ ] Refactor to use a single JOIN query with window functions

---

### 7. N+1 Database Query in getAllThemes()

**Severity:** HIGH (Performance)
**Status:** [ ] Not Fixed
**File:** `lib/db/queries/themes.ts:5-38`

```typescript
const themesWithCounts = await Promise.all(
  allThemes.map(async (theme) => {
    const [cardCount] = await db.select()...  // Query 1 per theme
    const [talkCount] = await db.select()...  // Query 2 per theme
  })
);
```

**Impact:** 1 theme query + (2 × theme count) additional queries. With 17 themes, that's 35 queries total.

**Required Actions:**
- [ ] Refactor to use subqueries or window functions in a single query

---

### 8. Missing Database Indexes

**Severity:** HIGH (Performance)
**Status:** [ ] Not Fixed
**File:** `lib/db/migrations/0000_fantastic_nocturne.sql`

No indexes on critical foreign keys:
- `card_talk_mappings.card_id`
- `card_talk_mappings.talk_id`
- `card_talk_mappings.is_primary`
- `card_themes.card_id` / `theme_id`
- `talk_themes.talk_id` / `theme_id`
- `talks.is_deleted`

**Impact:** Every JOIN query does sequential table scans.

**Required Actions:**
- [ ] Create new migration with indexes:
```sql
CREATE INDEX idx_card_talk_mappings_card_id ON card_talk_mappings(card_id);
CREATE INDEX idx_card_talk_mappings_talk_id ON card_talk_mappings(talk_id);
CREATE INDEX idx_card_talk_mappings_is_primary ON card_talk_mappings(is_primary);
CREATE INDEX idx_card_themes_card_id ON card_themes(card_id);
CREATE INDEX idx_card_themes_theme_id ON card_themes(theme_id);
CREATE INDEX idx_talk_themes_talk_id ON talk_themes(talk_id);
CREATE INDEX idx_talk_themes_theme_id ON talk_themes(theme_id);
CREATE INDEX idx_talks_is_deleted ON talks(is_deleted);
```

---

### 9. Unoptimized Talk Thumbnails

**Severity:** HIGH (Performance)
**Status:** [ ] Not Fixed
**File:** `components/talks/TalksGrid.tsx:118`

```typescript
<img src={talk.thumbnailUrl} ... />  // Plain HTML img, not next/image
```

**Problems:**
- No lazy loading, width/height constraints, or responsive images
- No WebP format conversion
- Thumbnails could be 200KB+ each

**Impact:** Poor Core Web Vitals (LCP, CLS), larger page weight.

**Required Actions:**
- [ ] Replace with `<Image>` component
- [ ] Add proper `sizes` prop for responsive images
- [ ] Update `next.config.ts` with `remotePatterns`

---

## MEDIUM SEVERITY ISSUES

### 10. Theme Management Not Implemented

**Severity:** MEDIUM (Functional)
**Status:** [ ] Not Fixed
**File:** `components/admin/ui/AdminNav.tsx`

The Themes navigation link is commented out. No `/admin/themes` page or theme CRUD API routes exist.

**Required Actions:**
- [ ] Implement theme management admin UI
- [ ] Create `/api/admin/themes` CRUD endpoints

---

### 11. Dead Links When URLs Missing

**Severity:** MEDIUM (Functional)
**Status:** [ ] Not Fixed
**Files:** `app/cards/[slug]/page.tsx:155`, `app/talks/[slug]/page.tsx:67, 130`

```typescript
href={talk.tedUrl || talk.youtubeUrl || '#'}  // '#' does nothing
```

When both URLs are null, "Watch Talk" button is non-functional.

**Required Actions:**
- [ ] Hide the button when no URL exists, OR
- [ ] Show disabled state with tooltip explaining issue

---

### 12. No Custom Error Pages

**Severity:** MEDIUM (Functional)
**Status:** [ ] Not Fixed
**Location:** No `error.tsx` or `not-found.tsx` files in app directories

Users see generic Next.js error pages instead of branded error pages.

**Required Actions:**
- [ ] Create `app/error.tsx` with branded error UI
- [ ] Create `app/not-found.tsx` with helpful navigation

---

### 13. Missing Security Headers

**Severity:** MEDIUM (Security)
**Status:** [ ] Not Fixed
**File:** `next.config.ts`

No configuration for:
- Content-Security-Policy
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options

**Required Actions:**
- [ ] Add security headers to `next.config.ts`:
```typescript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
    ],
  }];
}
```

---

### 14. Unprotected JSON.parse() Calls

**Severity:** MEDIUM (Functional)
**Status:** [ ] Not Fixed
**Files:** `app/cards/[slug]/page.tsx:42`, `app/search/page.tsx:297`, `app/talks/[slug]/page.tsx:146, 198`

```typescript
const keywords = JSON.parse(card.keywords);  // Crashes if malformed
```

Only `themes/[slug]/page.tsx` has null-check protection.

**Required Actions:**
- [ ] Wrap all JSON.parse() in try-catch or add null checks:
```typescript
const keywords = card.keywords ? JSON.parse(card.keywords) : [];
```

---

### 15. Aggressive Cache Revalidation

**Severity:** MEDIUM (Performance)
**Status:** [ ] Not Fixed
**Files:** Most page files

```typescript
export const revalidate = 60;  // Every 60 seconds
```

Card/talk data rarely changes. 60 seconds causes unnecessary revalidation overhead.

**Required Actions:**
- [ ] Increase to 1 hour (3600) for static content pages
- [ ] Keep 60 seconds only for frequently updated pages

---

### 16. No API Route Caching

**Severity:** MEDIUM (Performance)
**Status:** [ ] Not Fixed
**File:** `app/api/search/route.ts`

No `Cache-Control` headers. Every search hits the database.

**Required Actions:**
- [ ] Add cache headers:
```typescript
return NextResponse.json(results, {
  headers: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
  }
});
```

---

### 17. YouTube API Error Message Leaks Info

**Severity:** MEDIUM (Security)
**Status:** [ ] Not Fixed
**File:** `app/api/admin/fetch-metadata/route.ts:113-115`

```typescript
if (reason === 'keyInvalid') {
  return { error: 'YouTube API key is invalid - check Vercel environment variables' };
}
```

Error message reveals implementation details.

**Required Actions:**
- [ ] Use generic error messages

---

## LOW SEVERITY ISSUES

### 18. Client-Side Performance: JSON.parse on Every Render

**Severity:** LOW (Performance)
**Status:** [ ] Not Fixed
**File:** `components/cards/CardsGrid.tsx:62`

```typescript
const keywords = JSON.parse(card.keywords);  // Parsed per render
```

**Required Actions:**
- [ ] Parse keywords on server, send as array to client

---

### 19. Client-Side Performance: Multiple Accordion States

**Severity:** LOW (Performance)
**Status:** [ ] Not Fixed
**File:** `components/cards/CardDetailClient.tsx:39-43`

```typescript
const [showFullMeaning, setShowFullMeaning] = useState(false);
const [showSymbolism, setShowSymbolism] = useState(false);
// ... 5 separate state variables
```

**Required Actions:**
- [ ] Combine into single state object

---

### 20. Client-Side Performance: No Memoization

**Severity:** LOW (Performance)
**Status:** [ ] Not Fixed
**File:** `components/cards/CardsGrid.tsx`

Filtered cards list recalculates on every render.

**Required Actions:**
- [ ] Use `useMemo` for filtered results

---

### 21. Home Page Entirely Client Component

**Severity:** LOW (Performance)
**Status:** [ ] Not Fixed
**File:** `app/page.tsx:1`

```typescript
'use client';  // Entire page is client component
```

Only 3 pieces of state need client interactivity.

**Required Actions:**
- [ ] Split into server component with client islands

---

### 22. Search Results Missing youtubeUrl

**Severity:** LOW (Functional)
**Status:** [ ] Not Fixed
**File:** `app/search/page.tsx:35-42`

Talk type in search results doesn't include `youtubeUrl`, so YouTube-only talks can't be watched from search.

**Required Actions:**
- [ ] Add `youtubeUrl` to search results type and query

---

### 23. Console-Based Audit Logs

**Severity:** LOW (Security)
**Status:** [ ] Not Fixed
**Files:** `lib/db/queries/admin-talks.ts:215`, `lib/db/queries/admin-mappings.ts:212-246`

```typescript
console.log(`[AUDIT] ${new Date().toISOString()} | TALK_HARD_DELETED | ...`);
```

Audit logs use console which is ephemeral in serverless.

**Required Actions:**
- [ ] Consider database audit table or external logging service

---

### 24. npm Audit Vulnerabilities

**Severity:** LOW (Security)
**Status:** [ ] Not Fixed

```
esbuild <=0.24.2
Severity: moderate
4 moderate severity vulnerabilities
```

Affects `drizzle-kit` (dev dependency only).

**Required Actions:**
- [ ] Monitor for drizzle-kit update that fixes this

---

### 25. Empty State Fallbacks Missing

**Severity:** LOW (Functional)
**Status:** [ ] Not Fixed
**Files:** `app/talks/page.tsx`, `app/cards/page.tsx`

If database returns empty, no friendly message shown - just empty grid.

**Required Actions:**
- [ ] Add empty state UI with helpful message

---

## Prioritized Action Plan

### Phase 1: Immediate (Before Release)
- [ ] 1. Rotate ALL secrets (Supabase, YouTube API key)
- [ ] 2. Remove `/api/admin/test-token` endpoint or strip sensitive data
- [ ] 3. Add rate limiting to login (Upstash/Vercel KV)

### Phase 2: This Week
- [ ] 4. Add database indexes for foreign keys
- [ ] 5. Fix N+1 queries in `getAllTalks()` and `getAllThemes()`
- [ ] 6. Replace `<img>` with `<Image>` for thumbnails
- [ ] 7. Add security headers in `next.config.ts`
- [ ] 8. Use `crypto.timingSafeEqual()` for token comparison

### Phase 3: Next Sprint
- [ ] 9. Implement theme management admin portal
- [ ] 10. Add custom error pages (`error.tsx`, `not-found.tsx`)
- [ ] 11. Add try-catch around all `JSON.parse()` calls
- [ ] 12. Increase revalidation to 1 hour for static content
- [ ] 13. Add Cache-Control headers to API routes

### Phase 4: Backlog
- [ ] 14. Switch to distributed rate limiting
- [ ] 15. Implement persistent audit logging
- [ ] 16. Add `useMemo` for filtered lists
- [ ] 17. Split home page into server/client components
- [ ] 18. Add youtubeUrl to search results
- [ ] 19. Add empty state UI components

---

## Appendix: Files Requiring Changes

### Critical Security
- `middleware.ts`
- `app/admin/login/page.tsx`
- `app/api/admin/test-token/route.ts`
- `.env.local` (rotate all values)

### High Priority Performance
- `lib/db/queries/talks.ts`
- `lib/db/queries/themes.ts`
- `lib/db/migrations/` (new migration for indexes)
- `components/talks/TalksGrid.tsx`

### Medium Priority
- `next.config.ts`
- `app/cards/[slug]/page.tsx`
- `app/talks/[slug]/page.tsx`
- `app/search/page.tsx`
- `app/api/search/route.ts`
- `components/admin/ui/AdminNav.tsx`

### Low Priority
- `components/cards/CardsGrid.tsx`
- `components/cards/CardDetailClient.tsx`
- `app/page.tsx`
- `lib/db/queries/admin-talks.ts`
- `lib/db/queries/admin-mappings.ts`
