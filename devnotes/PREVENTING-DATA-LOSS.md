# Preventing Data Loss - Lessons Learned & Updated Plan

## 🚨 Critical Learning: December 11, 2025

### What Happened (Again)

When updating talk mappings (Queen of Pentacles → Shonda Rhimes, The Fool → Charlie Mackesy), we:

1. ✅ **Successfully** exported talks from database to seed files (preserved YouTube metadata)
2. ❌ **Failed** to export cards from database to seed files
3. ❌ Ran `npm run db:seed` which:
   - Deleted all 78 cards from the database
   - Re-inserted cards from seed files with **only basic data**
   - **Lost all full card meanings** (symbolism, advice, journaling prompts, astrological/numerological data)

### Why This Happened

The seed script (`lib/db/seed.ts`) **destructively rebuilds** the entire database:

```typescript
// 1. Clear existing data (in reverse order of dependencies)
await db.delete(cardTalkMappings);
await db.delete(cardThemes);
await db.delete(talkThemes);
await db.delete(themes);
await db.delete(talks);        // ← Deletes ALL talks
await db.delete(cards);        // ← Deletes ALL cards

// 2. Re-insert from seed files
await db.insert(cards).values(cardsSeedData);    // ← Only has basic data!
await db.insert(talks).values(talksSeedData);    // ← Only has basic data!
```

**The problem:** Seed files are **not** kept in sync with database enhancements.

### Current Status ❌

- **Cards:** Lost all full meanings (78 cards affected)
  - Lost: symbolism, adviceWhenDrawn, journalingPrompts, astrologicalCorrespondence, numerologicalSignificance
  - Remaining: name, keywords, summary, uprightMeaning, reversedMeaning
- **Talks:** ✅ Preserved (we exported them first!)
  - All YouTube metadata intact (13 video IDs, 24 durations, 27 years)
- **JSONL backups:** ⚠️ Malformed JSON, cannot be parsed reliably

---

## 📋 The Correct Workflow (Going Forward)

### ✅ ALWAYS Follow This Process Before Seeding

**Never run `npm run db:seed` without completing ALL these steps first:**

#### Step 1: Export Current Database to Seed Files

```bash
# Export talks with all metadata
npx dotenv-cli -e .env.local -- npx tsx scripts/export-db-to-seed-files.ts

# Export cards with all full meanings (SCRIPT NEEDED - see below)
npx dotenv-cli -e .env.local -- npx tsx scripts/export-cards-to-seed-files.ts
```

#### Step 2: Make Your Changes to Seed Files

```bash
# Example: Update a mapping
# Edit lib/db/seed-data/mappings.ts
# Add new talk to lib/db/seed-data/talks.ts
```

#### Step 3: Verify Seed Files Are Complete

```bash
# Check that seed files have:
# - All 78 cards with FULL meanings
# - All talks with YouTube metadata
# - All mappings
# - All themes
```

#### Step 4: NOW It's Safe to Seed

```bash
npm run db:seed
```

---

## 🛠️ Scripts We Have

### ✅ Working Export Scripts

- **`scripts/export-db-to-seed-files.ts`**
  - Exports talks from database to `lib/db/seed-data/talks.ts`
  - Preserves: youtubeVideoId, durationSeconds, year, eventName, thumbnailUrl
  - **Status:** ✅ Working perfectly

### ❌ Missing Export Scripts (Need to Create)

- **`scripts/export-cards-to-seed-files.ts`** (NEEDED!)
  - Should export all 78 cards with FULL meanings
  - Must include: symbolism, adviceWhenDrawn, journalingPrompts, astrologicalCorrespondence, numerologicalSignificance
  - Should update both `lib/db/seed-data/cards.ts` and `lib/db/seed-data/cards-minor.ts`

---

## 🎯 Action Plan to Fix Current Situation

### Immediate: Restore Lost Card Meanings

**Option 1: From Production Database (BEST)**
If you have a production deployment with full card meanings:
```bash
# Export from production
# Import to local database
```

**Option 2: Manual Re-entry (TIME-CONSUMING)**
- Re-enter full meanings for all 78 cards manually
- Or use AI to regenerate meanings based on card names

**Option 3: Fix JSONL Files & Re-import (RISKY)**
- Manually fix JSON syntax errors in JSONL files
- Run restoration script
- Verify all data

### Long-term: Build Export Infrastructure

1. **Create `scripts/export-cards-to-seed-files.ts`**
   - Similar to export-talks script
   - Exports ALL card fields including full meanings
   - Updates seed files with complete data

2. **Create `scripts/export-all-to-seed-files.ts`**
   - One command to export everything
   - Cards, talks, themes, mappings
   - Makes seed files the complete source of truth

3. **Update `npm run db:seed` workflow**
   - Add warning: "Have you exported current DB to seed files? (y/n)"
   - Or create `npm run db:safe-seed` that auto-exports first

---

## 📚 The New Rule

### 🔴 NEVER RUN `npm run db:seed` UNLESS:

1. ✅ You just exported the current database to seed files
2. ✅ You verified seed files have ALL data (not just basic fields)
3. ✅ You understand you will LOSE anything not in the seed files

### 🟢 ALWAYS:

- Export database → Update seed files → Then seed
- Treat seed files as the **source of truth** by keeping them updated
- Never assume seed files are current

---

## 🗂️ File Reference

### Export Scripts
- `scripts/export-db-to-seed-files.ts` - ✅ Talks export (working)
- `scripts/export-cards-to-seed-files.ts` - ❌ Missing (need to create)
- `scripts/export-all-to-seed-files.ts` - ❌ Missing (future nice-to-have)

### Seed Files (Source of Truth)
- `lib/db/seed-data/talks.ts` - Talk data with YouTube metadata
- `lib/db/seed-data/cards.ts` - Major Arcana (needs full meanings added)
- `lib/db/seed-data/cards-minor.ts` - Minor Arcana (needs full meanings added)
- `lib/db/seed-data/mappings.ts` - Card-to-talk relationships
- `lib/db/seed-data/themes.ts` - Thematic collections

### Seed Script (Dangerous!)
- `lib/db/seed.ts` - **DELETES THEN REBUILDS** entire database

### Backup Files (Not Reliable)
- `docs/archive/fullmeaning_MajorArcana.jsonl` - ⚠️ Malformed JSON
- `docs/fullmeaning_Cups.jsonl` - ⚠️ Malformed JSON
- `docs/fullmeaning_Pentacles.jsonl` - ⚠️ Malformed JSON
- `docs/fullmeaning_Swords.jsonl` - ⚠️ Malformed JSON
- `docs/fullmeaning_Wands.jsonl` - ⚠️ Malformed JSON

---

## 💡 Key Lessons

1. **Seed files are NOT automatically synced with the database**
   - Database can have richer data than seed files
   - Seeding will REPLACE database with seed file data
   - Always export before seeding

2. **We successfully preserved talks but lost cards**
   - We created an export script for talks ✅
   - We forgot to create one for cards ❌
   - Need to export ALL entity types before seeding

3. **JSONL backups are not reliable**
   - Contain markdown code fences
   - Have JSON syntax errors
   - Cannot be automatically parsed
   - Only 2 out of 78 cards restored

4. **The export-then-seed workflow works!**
   - We proved it with talks
   - YouTube metadata was preserved perfectly
   - Just need to apply the same pattern to all entity types

---

## 🎓 Summary

**The Safe Workflow:**
```
Current DB → Export Scripts → Seed Files → npm run db:seed → Updated DB
     ↑                                                            ↓
     └────────────────────────────────────────────────────────────┘
                    (Complete round trip)
```

**The Broken Workflow (What We Did):**
```
Current DB (with full card meanings)
     ↓
npm run db:seed (without exporting cards first!)
     ↓
Updated DB (cards lost full meanings) ❌
```

**Never again!** Always export first. 🛡️
