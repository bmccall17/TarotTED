# TarotTED → TarotTALKS Rebranding Plan

**New Brand:** TarotTALKS
**New URL:** tarottalks.app
**Date:** January 9, 2026
**Status:** ✅ COMPLETE - Released as v1.3.0

---

## Overview

This plan covers the complete rebranding from "TarotTED" to "TarotTALKS". The word "TALKS" uses the same red color (#EB0028) that "TED" previously used.

---

## Phase 1: Core Application Files (User-Facing) ✅ COMPLETE

### 1.1 Main Layout & Metadata
- [x] `app/layout.tsx` - Update site title, description, Open Graph metadata, siteName

### 1.2 Home Page
- [x] `app/page.tsx` - Update logo text (Tarot**TED** → Tarot**TALKS**), description text

### 1.3 Cards Section
- [x] `app/cards/page.tsx` - Update logo/header branding
- [x] `app/cards/[slug]/page.tsx` - Update page titles, meta tags, share button text

### 1.4 Talks Section
- [x] `app/talks/page.tsx` - Update logo/header branding
- [x] `app/talks/[slug]/page.tsx` - Update page titles, meta tags, keywords, share button text

### 1.5 Themes Section
- [x] `app/themes/page.tsx` - Update logo/header branding
- [x] `app/themes/[slug]/page.tsx` - Update page titles, meta tags, share button text

### 1.6 Search Page
- [x] `app/search/page.tsx` - No branding references found (clean)

**✅ CHECKPOINT 1 PASSED:** All public-facing pages show "TarotTALKS" branding

---

## Phase 2: UI Components ✅ COMPLETE

### 2.1 Install Banner (PWA)
- [x] `components/ui/InstallBanner.tsx` - Updated "TarotTALKS will appear on your home screen" and "Add TarotTALKS to Home Screen"

### 2.2 Ritual Card Component
- [x] `components/ritual/RitualCard.tsx` - Red color (#EB0028) remains unchanged (now for "TALKS"), "TED Talk" label kept (refers to TED content type)

### 2.3 Share Functionality
- [x] All ShareButton usages now pass "TarotTALKS" brand name (updated in Phase 1)

**✅ CHECKPOINT 2 PASSED:** All UI components reflect new branding

---

## Phase 3: Admin Portal ✅ COMPLETE

### 3.1 Admin Navigation
- [x] `components/admin/ui/AdminNav.tsx` - Updated "TarotTALKS Admin" header

### 3.2 Admin Pages
- [x] `app/admin/page.tsx` - Updated "TarotTALKS Content Management" text
- [x] `app/admin/mappings/page.tsx` - Updated page title
- [x] `app/admin/validation/page.tsx` - Updated page title
- [x] `app/admin/cards/page.tsx` - No branding references (clean)
- [x] `app/admin/talks/page.tsx` - No branding references (clean)
- [x] `app/admin/login/page.tsx` - No branding references (clean)

**✅ CHECKPOINT 3 PASSED:** Admin portal fully rebranded

---

## Phase 4: Configuration Files ✅ COMPLETE

### 4.1 PWA Manifest
- [x] `app/manifest.ts` - Updated `name` and `short_name` to "TarotTALKS"

### 4.2 Package Configuration
- [x] `package.json` - Updated `name` to "tarottalks"

### 4.3 Domain References
- [x] All domain references updated to tarottalks.app (in layout.tsx, detail pages)

**✅ CHECKPOINT 4 PASSED:** All config files updated

---

## Phase 5: Documentation ✅ COMPLETE

### 5.1 Primary Documentation
- [x] `README.md` - Updated project name, description, domain to tarottalks.app
- [x] `CLAUDE.md` - Updated project overview

### 5.2 Planning Documents
- [x] `ADMIN_PORTAL_PLAN.md` - Updated all references
- [x] `SHIP_LOG.md` - Updated all references

### 5.3 Dev Notes (Bulk Update) - 13 files updated
- [x] `devnotes/AnalyticsPlan.md`
- [x] `devnotes/APPLICATION_AUDIT_2024-12-23.md`
- [x] `devnotes/AUDIT_2024-12-30.md`
- [x] `devnotes/CLEANUP-PLAN.md`
- [x] `devnotes/disableImageOptimizationplan.md`
- [x] `devnotes/FULL_CARD_MEANINGS_IMPLEMENTATION.md`
- [x] `devnotes/GITHUB_RELEASE_NOTES.md`
- [x] `devnotes/NEXT-STEPS_adminportal.md`
- [x] `devnotes/SearchSystemAudit&ImprovementPlan.md`
- [x] `devnotes/SUPABASESTORAGEINTEGRATIONPLAN.md`
- [x] `devnotes/🔴 CRITICAL SECURITY ISSUE instructions.md`
- [x] `devnotes/Mobile Porting Assessment & Frontend Audit.md`
- [x] `devnotes/RELEASE_v0.1.0.md`

### 5.4 Release Notes - 10 files updated
- [x] `devnotes/releases/v0.0.3.md`
- [x] `devnotes/releases/v0.1.0.md`
- [x] `devnotes/releases/v0.2.0.md`
- [x] `devnotes/releases/v1.0.0.md`
- [x] `devnotes/releases/v1.0.1.md`
- [x] `devnotes/releases/v1.1.2.md`
- [x] `devnotes/releases/v1.1.4.md`
- [x] `devnotes/releases/v1.2.0.md`
- [x] `devnotes/releases/v1.2.2.md`
- [x] `devnotes/releases/archive/v1.2.0-alt3.md`

### 5.5 Database Documentation
- [x] `lib/db/backups/2024-12-20/README.md`
- [x] `lib/db/seed-data/README.md`

### 5.6 Intentionally NOT Changed
- `lib/hooks/*.ts` - localStorage keys (`tarotted-*`) kept for backwards compatibility
- `devnotes/cardimages_migrationlog.md` - Contains file paths only
- `devnotes/talkthumbnails_migrationlog.md` - Contains file paths only

**✅ CHECKPOINT 5 PASSED:** All documentation updated

---

## Phase 6: Verification & Testing ✅ COMPLETE

### 6.1 Code Verification Results

**Grep for "TarotTED":** 3 files found (all expected)
- `devnotes/REBRAND_PLAN.md` - This plan document (expected)
- `devnotes/cardimages_migrationlog.md` - File paths in terminal output (not brand references)
- `devnotes/talkthumbnails_migrationlog.md` - File paths in terminal output (not brand references)

**Grep for "tarotted":** 5 files found (all expected)
- `devnotes/REBRAND_PLAN.md` - This plan document (expected)
- `lib/hooks/useInstallPrompt.ts` - localStorage key (kept for backwards compatibility)
- `lib/hooks/useCardSounds.ts` - localStorage key (kept for backwards compatibility)
- `lib/hooks/useRitualState.ts` - localStorage key (kept for backwards compatibility)
- `package-lock.json` - Auto-generated (will update after `npm install`)

### 6.2 Post-Rebrand Actions Required
- [ ] Run `npm install` to regenerate package-lock.json with new name
- [ ] Run `npm run dev` and visually verify all pages
- [ ] Deploy to production
- [ ] Update DNS for tarottalks.app domain

**✅ CHECKPOINT 6 PASSED:** Code verification complete - no unexpected brand references remaining

---

## Branding Specification

### Text Transformations
| Old | New |
|-----|-----|
| TarotTED | TarotTALKS |
| Tarot TED | Tarot TALKS |
| tarotted | tarottalks |
| tarotted.com | tarottalks.app |

### Color Specification
- **Brand Red:** `#EB0028` (unchanged - previously for "TED", now for "TALKS")
- **Font for "TALKS":** Helvetica, Arial, sans-serif (same as "TED" was)

### Logo Pattern
```jsx
// Before
<span>Tarot</span><span style={{ color: '#EB0028' }}>TED</span>

// After
<span>Tarot</span><span style={{ color: '#EB0028' }}>TALKS</span>
```

---

## Files Summary

### High Priority (User-Facing)
1. `app/layout.tsx`
2. `app/page.tsx`
3. `app/cards/page.tsx`
4. `app/cards/[slug]/page.tsx`
5. `app/talks/page.tsx`
6. `app/talks/[slug]/page.tsx`
7. `app/themes/page.tsx`
8. `app/themes/[slug]/page.tsx`
9. `app/manifest.ts`
10. `components/ui/InstallBanner.tsx`

### Medium Priority (Admin/Config)
11. `components/admin/ui/AdminNav.tsx`
12. `app/admin/page.tsx`
13. `app/admin/mappings/page.tsx`
14. `app/admin/validation/page.tsx`
15. `package.json`

### Lower Priority (Documentation)
16-40. All markdown files in devnotes/, README.md, CLAUDE.md, etc.

---

## Estimated Scope

- **Total files to modify:** ~40 files
- **Primary code changes:** ~15 files
- **Documentation updates:** ~25 files
- **Risk level:** Low (text replacements only, no logic changes)
