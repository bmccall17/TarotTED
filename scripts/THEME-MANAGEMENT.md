# Theme Management Script

## Overview

The `manage-themes.ts` script is a reusable tool for creating and updating themes, and managing their relationships with cards and talks.

## Features

- **Create new themes** - Automatically creates themes that don't exist
- **Update existing themes** - Updates theme details when you modify the definitions
- **Manage card associations** - Links cards to themes
- **Manage talk associations** - Links talks to themes
- **Idempotent** - Safe to run multiple times; will update existing data rather than duplicate

## Usage

### Run the script

```bash
# For local/development database
npx dotenv -e .env.local -- npx tsx scripts/manage-themes.ts

# For production database
npx dotenv -e .env.production -- npx tsx scripts/manage-themes.ts
```

### Adding a new theme

1. Open `scripts/manage-themes.ts`
2. Find the `themeDefinitions` array (starts around line 27)
3. Add a new theme definition:

```typescript
{
  slug: 'my-new-theme',
  name: 'My New Theme',
  shortDescription: 'A brief one-line description.',
  longDescription: 'A longer, more detailed description (optional).',
  category: 'emotion',  // or 'life_phase', 'role', 'other'
  cardSlugs: ['the-fool', 'ace-of-wands'],  // Optional
  talkSlugs: ['talk-slug-1', 'talk-slug-2'],  // Optional
}
```

4. Run the script (see above)

### Updating an existing theme

1. Open `scripts/manage-themes.ts`
2. Find the theme you want to update in `themeDefinitions`
3. Modify the name, descriptions, category, or associations
4. Run the script - it will automatically update the existing theme

### Adding cards or talks to a theme

Just add the slugs to the `cardSlugs` or `talkSlugs` arrays:

```typescript
{
  slug: 'grief-and-gratitude',
  name: 'Grief & Gratitude',
  // ... other fields ...
  cardSlugs: ['death', 'five-of-cups', 'ten-of-swords', 'six-of-cups'],  // Added six-of-cups
  talkSlugs: ['brene-brown-vulnerability'],  // Added talk
}
```

Run the script, and it will:
- Remove old associations
- Add the new associations
- Skip any cards/talks that don't exist (with a warning)

## Categories

Valid theme categories:
- `emotion` - Emotional states and feelings
- `life_phase` - Life transitions and phases
- `role` - Roles and archetypes
- `other` - Everything else

## Finding Card and Talk Slugs

**Cards:**
- Check the database or app (URL: `/cards/the-fool` → slug is `the-fool`)
- Or look at seed data: `lib/db/seed-data/cards.ts` and `cards-minor.ts`

**Talks:**
- Check the database or app (URL: `/talks/brene-brown-vulnerability` → slug is `brene-brown-vulnerability`)
- Or look at seed data: `lib/db/seed-data/talks.ts`

## Example Workflow

### Scenario: You added new TED talks and want to create a theme for them

1. Edit `manage-themes.ts`:

```typescript
{
  slug: 'innovation-and-technology',
  name: 'Innovation & Technology',
  shortDescription: 'Embracing change and the future of technology.',
  longDescription: 'How technology shapes our lives and how we can harness innovation for good.',
  category: 'other',
  cardSlugs: ['the-magician', 'ace-of-swords', 'eight-of-pentacles'],
  talkSlugs: ['simon-sinek-tech-talk', 'new-ai-talk-2024'],  // Your new talks
}
```

2. Run:
```bash
npx dotenv -e .env.local -- npx tsx scripts/manage-themes.ts
```

3. Script output:
```
Processing theme: Innovation & Technology...
  ✓ Created theme: Innovation & Technology
  ✓ Added 3 card associations
  ✓ Added 2 talk associations

═══════════════════════════════════════
Theme management complete!
═══════════════════════════════════════
Themes created: 1
Themes updated: 0
Card associations: 3
Talk associations: 2
═══════════════════════════════════════
```

4. Deploy to production when ready

## Tips

- **Always test locally first** using `.env.local`
- **Run against production** when you're ready to deploy changes
- **The script is safe to re-run** - it won't create duplicates
- **Removing a theme** - Just delete it from the definitions and it will remain in the database (orphaned). To fully remove, delete from the database manually.
- **Removing associations** - Just remove the slug from the array and re-run

## Troubleshooting

**"Card not found" or "Talk not found" warning:**
- Double-check the slug is correct
- Verify the card/talk exists in the database
- Check for typos

**No themes created/updated:**
- Check that your `.env.local` or `.env.production` has the correct `POSTGRES_URL`
- Verify the database connection string is valid
