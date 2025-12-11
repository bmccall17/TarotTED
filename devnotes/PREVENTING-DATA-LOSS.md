# Preventing Data Loss - What Happened & How to Avoid It

## What Happened

When you ran `npm run db:seed`, it:
1. **Deleted all existing cards** from Supabase (`await db.delete(cards)`)
2. Re-inserted cards from the seed files
3. The seed files only contained basic data (summary, short meanings)
4. This wiped out all the full meanings that had been added via update scripts

## Current State ✅

All data has been **fully restored**:
- ✅ All 78 cards have complete meanings in Supabase
- ✅ Site deployed with full card data
- ✅ Update scripts are working correctly

## IMPORTANT: Do Not Run `npm run db:seed` Again

The seed files in `/lib/db/seed-data/` still only contain basic card data. Running the seed script again will wipe out the full meanings.

## Two Approaches Going Forward

### Approach A: Use Update Scripts Only (Current Setup - RECOMMENDED)

**When to use:**
- Making changes to existing card data
- Adding new meanings or updating existing ones
- Quick updates to specific cards

**How to use:**
```bash
# Update specific suits
npm run tsx scripts/update-wands-meanings.ts
npm run tsx scripts/update-cups-meanings.ts
npm run tsx scripts/update-swords-meanings.ts
npm run tsx scripts/update-pentacles-meanings.ts

# Update Major Arcana
npm run tsx scripts/update-card-meanings.ts

# Fix specific cards
npm run tsx scripts/fix-five-of-cups.ts
npm run tsx scripts/fix-remaining-major-arcana.ts
```

**Advantages:**
- Quick and targeted updates
- No risk of data loss
- Scripts already exist and work

**When NOT to use:**
- Fresh database setup
- Complete database reset

---

### Approach B: Merge Data into Seed Files (Future Task)

To make the seed script safe to run again, you would need to:

1. **Merge all full meanings into seed files:**
   - Update `/lib/db/seed-data/cards.ts` (Major Arcana + Wands)
   - Update `/lib/db/seed-data/cards-minor.ts` (Cups, Swords, Pentacles)

2. **For each of the 78 cards, add these fields:**
   - `symbolism`
   - `adviceWhenDrawn`
   - `journalingPrompts` (as `JSON.stringify(array)`)
   - `astrologicalCorrespondence`
   - `numerologicalSignificance`

3. **This is a large task:**
   - 78 cards × 5 additional fields = 390 data points
   - Could be automated with a script but would take time to build and test
   - Would require careful review to ensure accuracy

**When you might need this:**
- Setting up development environment from scratch
- Onboarding new team members
- Database migrations or resets
- Ensuring data is version-controlled

---

## Recommendation

**For now:** Use **Approach A** (update scripts). Your data is safe and working.

**Later:** If you need to frequently reset the database or want everything in seed files, we can build an automated script to merge the data.

## Quick Reference

### Safe Commands ✅
```bash
# Update card meanings (safe - only updates specific fields)
npm run tsx scripts/update-wands-meanings.ts
npm run tsx scripts/update-cups-meanings.ts
npm run tsx scripts/update-swords-meanings.ts
npm run tsx scripts/update-pentacles-meanings.ts
npm run tsx scripts/update-card-meanings.ts

# Deploy to production
vercel --prod
```

### Commands to AVOID ⚠️
```bash
# DO NOT RUN - will wipe out full meanings
npm run db:seed

# Only use on a FRESH database, not on existing data
```

## Files to Know About

### Update Scripts (Safe to run)
- `scripts/update-wands-meanings.ts` - Has all Wands full meanings
- `scripts/update-swords-meanings.ts` - Has all Swords full meanings
- `scripts/update-pentacles-meanings.ts` - Has all Pentacles full meanings
- `scripts/update-cups-meanings.ts` - Reads from `docs/fullmeaning_Cups.jsonl`
- `scripts/update-card-meanings.ts` - Reads from `docs/archive/fullmeaning_MajorArcana.jsonl`

### Seed Files (Need updating - don't run seed script yet)
- `lib/db/seed.ts` - Main seed script (DELETES then re-inserts)
- `lib/db/seed-data/cards.ts` - Major Arcana + Wands (basic data only)
- `lib/db/seed-data/cards-minor.ts` - Cups, Swords, Pentacles (basic data only)

### Source Data Files
- `docs/archive/fullmeaning_MajorArcana.jsonl` - Major Arcana full meanings
- `docs/fullmeaning_Cups.jsonl` - Cups full meanings
- Update scripts contain Wands, Swords, Pentacles data inline
