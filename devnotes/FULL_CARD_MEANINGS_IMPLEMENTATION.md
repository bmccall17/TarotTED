# Full Card Meanings Implementation - December 10, 2025

## Overview
Enhanced the card detail pages with comprehensive tarot card meanings including upright/reversed interpretations, symbolism, advice, journaling prompts, and correspondences for all 22 Major Arcana cards.

---

## Database Changes

### New Fields Added to `cards` Table

Five new columns were added to store comprehensive card information:

| Column Name | Type | Description |
|------------|------|-------------|
| `symbolism` | text | Description of imagery and symbols on the card |
| `advice_when_drawn` | text | Practical guidance when the card appears |
| `journaling_prompts` | text | JSON array of 3-5 reflection questions |
| `astrological_correspondence` | text | Associated zodiac sign/planet |
| `numerological_significance` | text | Meaning of the card's number |

### Migration File
**Location:** `lib/db/migrations/0001_mushy_ben_grimm.sql`

```sql
ALTER TABLE "cards" ADD COLUMN "symbolism" text;
ALTER TABLE "cards" ADD COLUMN "advice_when_drawn" text;
ALTER TABLE "cards" ADD COLUMN "journaling_prompts" text;
ALTER TABLE "cards" ADD COLUMN "astrological_correspondence" text;
ALTER TABLE "cards" ADD COLUMN "numerological_significance" text;
```

### Schema File Updated
**Location:** `lib/db/schema.ts` (lines 22-26)

---

## Scripts Created

### 1. Apply Migration Script
**Location:** `scripts/apply-migration.ts`

**Purpose:** Applies the database migration directly to Supabase (bypasses drizzle-kit push timeout issues)

**Usage:**
```bash
npx dotenv -e .env.local -- tsx scripts/apply-migration.ts
```

**What it does:**
- Adds the 5 new columns to the cards table using `IF NOT EXISTS` (safe to re-run)

### 2. Update Card Meanings Script
**Location:** `scripts/update-card-meanings.ts`

**Purpose:** Parses CSV file and updates database with comprehensive card meanings

**Usage:**
```bash
npx dotenv -e .env.local -- tsx scripts/update-card-meanings.ts
```

**What it does:**
- Reads `docs/newFullCardMeaning_MajorArcana.csv`
- Removes citation brackets `[1, 2, 3]` from all text
- Updates all 22 Major Arcana cards
- Handles slug generation (e.g., "The Fool" → "the-fool")

**Dependencies:** Requires `csv-parse` package
```bash
npm install csv-parse
```

---

## Data Source

### CSV File
**Location:** `docs/newFullCardMeaning_MajorArcana.csv`

**Structure:**
- 8 columns: Card, uprightMeaning, reversedMeaning, symbolism, adviceWhenDrawn, journalingPrompts, astrologicalCorrespondence, numerologicalSignificance
- 22 rows (one per Major Arcana card)
- Citations in brackets `[1, 2, 3]` are automatically stripped during import
- journalingPrompts stored as JSON array string

**Cards Updated:**
All 22 Major Arcana cards from The Fool (0) through The World (21)

---

## UI Changes

### Component Updated
**Location:** `components/cards/CardDetailClient.tsx`

**New Props Added:**
```typescript
interface CardDetailClientProps {
  uprightMeaning: string | null;
  reversedMeaning: string | null;
  symbolism: string | null;              // NEW
  adviceWhenDrawn: string | null;        // NEW
  journalingPrompts: string | null;      // NEW (JSON array)
  astrologicalCorrespondence: string | null;  // NEW
  numerologicalSignificance: string | null;   // NEW
  cardName: string;
}
```

**New Accordion Sections (5 total):**
1. **Full Card Meaning** - Upright and Reversed interpretations
2. **Symbolism & Imagery** - Visual elements and their meanings
3. **Advice When Drawn** - Practical guidance
4. **Journaling Prompts** - Personalized reflection questions (parsed from JSON)
5. **Correspondences** - Astrological and Numerological associations

### Page Updated
**Location:** `app/cards/[slug]/page.tsx` (lines 161-170)

Updated to pass all new props to CardDetailClient component.

### Queries
**Location:** `lib/db/queries/cards.ts`

No changes needed - queries using `.select()` without column specification automatically include all columns.

---

## Special Cases Handled

### Wheel of Fortune
- CSV lists as "The Wheel of Fortune"
- Database has "Wheel of Fortune" (no "The")
- Slug is `wheel-of-fortune`
- Required manual update via separate command

---

## How to Undo This Feature

### 1. Revert Database Changes
```sql
-- Run against Supabase database
ALTER TABLE "cards" DROP COLUMN IF EXISTS "symbolism";
ALTER TABLE "cards" DROP COLUMN IF EXISTS "advice_when_drawn";
ALTER TABLE "cards" DROP COLUMN IF EXISTS "journaling_prompts";
ALTER TABLE "cards" DROP COLUMN IF EXISTS "astrological_correspondence";
ALTER TABLE "cards" DROP COLUMN IF EXISTS "numerological_significance";
```

### 2. Revert Code Changes
```bash
# Checkout previous versions of these files
git checkout HEAD~1 -- lib/db/schema.ts
git checkout HEAD~1 -- components/cards/CardDetailClient.tsx
git checkout HEAD~1 -- app/cards/[slug]/page.tsx
```

### 3. Remove Scripts (optional)
```bash
rm scripts/apply-migration.ts
rm scripts/update-card-meanings.ts
```

### 4. Uninstall Package (optional)
```bash
npm uninstall csv-parse
```

---

## How to Redo/Update This Feature

### Update Content for Existing Cards
1. Edit `docs/newFullCardMeaning_MajorArcana.csv`
2. Run update script:
   ```bash
   npx dotenv -e .env.local -- tsx scripts/update-card-meanings.ts
   ```

### Add Content for Minor Arcana Cards
1. Create new CSV files:
   - `docs/newFullCardMeaning_Wands.csv` (14 cards)
   - `docs/newFullCardMeaning_Cups.csv` (14 cards)
   - `docs/newFullCardMeaning_Swords.csv` (14 cards)
   - `docs/newFullCardMeaning_Pentacles.csv` (14 cards)

2. Update script path in `scripts/update-card-meanings.ts`:
   ```typescript
   // Change line 50
   const csvPath = path.join(__dirname, '../docs/newFullCardMeaning_Wands.csv');
   ```

3. Run for each suit

### Verify Updates
Check a card in the browser:
```
http://localhost:3000/cards/the-fool
```

Expand the accordion sections to see all new content.

---

## Database Query Example

To check what data exists for a card:
```sql
SELECT
  name,
  symbolism IS NOT NULL as has_symbolism,
  advice_when_drawn IS NOT NULL as has_advice,
  journaling_prompts IS NOT NULL as has_prompts,
  astrological_correspondence,
  numerological_significance
FROM cards
WHERE slug = 'the-fool';
```

---

## Files Modified in This Implementation

### Created
- `lib/db/migrations/0001_mushy_ben_grimm.sql`
- `scripts/apply-migration.ts`
- `scripts/update-card-meanings.ts`
- `docs/FULL_CARD_MEANINGS_IMPLEMENTATION.md` (this file)

### Modified
- `lib/db/schema.ts` - Added 5 fields to cards table
- `components/cards/CardDetailClient.tsx` - Added 5 accordion sections
- `app/cards/[slug]/page.tsx` - Pass new props to component
- `package.json` - Added csv-parse dependency
- `.gitignore` - Excluded CSV files from version control

### No Changes Needed
- `lib/db/queries/cards.ts` - Already selects all columns
- All other query files

---

## Testing Checklist

- [ ] All 22 Major Arcana cards display new sections
- [ ] Accordion sections expand/collapse correctly
- [ ] Journaling prompts parse from JSON correctly
- [ ] Citations `[1, 2, 3]` are removed from all text
- [ ] Sections only show if data exists (graceful for Minor Arcana)
- [ ] Mobile responsive design maintained
- [ ] Dark theme styling consistent

---

## Notes

- **Minor Arcana:** Currently only Major Arcana (22 cards) have this comprehensive data. Minor Arcana cards (56 cards) still only show basic upright/reversed meanings.
- **CSV Format:** The CSV uses complex quoting for fields with JSON arrays. The `csv-parse` library with `relax_quotes: true` handles this correctly.
- **Performance:** No performance impact - data is loaded once per page load via server-side rendering.
- **Future:** Consider adding these fields for Minor Arcana cards using the same CSV import process.

---

## Contact/Questions

If you need to modify or extend this feature:
1. Check this document first
2. Review the scripts in `scripts/` folder
3. Look at the CSV structure in `docs/newFullCardMeaning_MajorArcana.csv`
4. Test changes on a single card before running for all cards

**Implementation Date:** December 10, 2025
**Developer:** Claude (Anthropic)
**Project:** TarotTALKS
