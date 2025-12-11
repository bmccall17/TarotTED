# TarotTED Project Cleanup Plan

## Overview

This project has accumulated **~40MB+ of obsolete files** from data migration and debugging. This plan categorizes files for cleanup.

---

## Phase 1: HIGH PRIORITY - Duplicate Images (~40MB)

### DELETE: Image Subdirectories (78 duplicate files)

These subdirectories contain old low-res duplicates. The high-res images are in the parent directory.

```
public/images/cards/cups/           (14 files)
public/images/cards/major-arcana/   (22 files)
public/images/cards/pentacles/      (14 files)
public/images/cards/swords/         (14 files)
public/images/cards/wands/          (14 files)
```

**Why:** The app now uses `/images/cards/{slug}.jpg` (flat structure). These subdirectories are no longer referenced.

**Savings:** ~40MB

---

## Phase 2: One-Time Scripts (~250KB)

### DELETE: Verification & Debug Scripts (7 files)

Used for one-time data troubleshooting:

```
scripts/check-wands.ts
scripts/debug-wands-update.ts
scripts/list-wands.ts
scripts/verify-cups.ts
scripts/verify-pentacles.ts
scripts/verify-swords.ts
scripts/verify-wands.ts
```

### DELETE: Individual Card Fix Scripts (4 files)

One-time fixes for specific cards:

```
scripts/update-five-of-cups.ts
scripts/update-wheel-of-fortune.ts
scripts/fix-five-of-cups.ts
scripts/fix-remaining-major-arcana.ts
```

### DELETE: Suit Update Scripts (4 files, ~120KB)

Contain hardcoded card data used for one-time DB updates:

```
scripts/update-cups-meanings.ts
scripts/update-pentacles-meanings.ts
scripts/update-swords-meanings.ts
scripts/update-wands-meanings.ts
```

**Note:** The data from these is now in your database and seed files.

### DELETE: JSONL Import Scripts (2 files)

```
scripts/clean-and-update-jsonl.ts
scripts/update-card-meanings-jsonl.ts
```

### DELETE: Incomplete Experimental Scripts (3 files)

```
scripts/generate-complete-seed-files.ts
scripts/merge-full-meanings-to-seed.ts
scripts/generate-updated-seed-files.md
```

### DELETE: Migration Script (already applied)

```
scripts/apply-migration.ts
```

---

## Phase 3: Temporary Data Files (~231KB)

### PLEASE IGNORE ALL FILES IN docs/

---

## Phase 4: OPTIONAL - Review & Decide

### TED Talk Scripts (6 files)

May be useful if you add new talks or refresh metadata:
Talks will continue to be updated. so we will keep these scripts related to fetching details.

### DELETE: Utility Scripts (3 files)

```
scripts/update-card-meanings.ts      (generic card updater)
scripts/update-card-images.ts        (image URL updater)
scripts/download-hires-images.ts     (downloads images)
```

---

## Summary

### Recommended for Deletion (High Confidence)
- **21 script files** (~250KB)
- **11 data files** (~231KB)
- **78 duplicate images** (~40MB)
- **1 temp file** (deploymenterrors.txt)

**Total savings: ~40MB+ and much cleaner project**

---

## Execution Plan

Once approved, I will:

1. **Create backup branch** (safety first)
2. **Delete files in phases** (starting with duplicates)
3. **Update .gitignore** to prevent future temp files
4. **Commit cleanup** with clear message
5. **Verify nothing broke** (run build, check images)

**Ready to proceed when you approve!**
