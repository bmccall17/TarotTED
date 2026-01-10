# Seed Data Structure

This directory contains all the seed data for the TarotTALKS database.

## Files

- **helpers.ts** - Utility functions for generating slugs and image URLs
- **cards.ts** - All 78 Tarot cards (22 Major + 14 Wands + 14 Cups + 14 Swords + 14 Pentacles)
- **talks.ts** - Unique TED talks (deduplicated from CSVs)
- **mappings.ts** - Card-to-talk relationships with curatorial notes
- **themes.ts** - Curated theme collections

## Mapping Structure

Mappings link cards to talks with:
- **cardSlug**: References a card (e.g., "the-fool")
- **talkSlug**: References a talk (e.g., "charlie-mackesy-abandon-the-idea-of-being-good-and-just-try")
- **isPrimary**: Boolean - Is this the main talk for this card?
- **strength**: Number 1-5 - How strongly does this talk relate?
- **rationaleShort**: 1-2 sentence explanation
- **rationaleLong**: Optional deeper explanation

## Usage

The main seed script (`lib/db/seed.ts`) imports all these files and:
1. Clears existing data
2. Inserts all 78 cards
3. Inserts all talks
4. Creates card-talk mappings
5. Creates themes
6. Links cards and talks to themes

Run with: `npm run db:seed`
