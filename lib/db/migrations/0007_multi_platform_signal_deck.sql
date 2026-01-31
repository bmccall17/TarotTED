-- Migration: Multi-Platform Signal Deck Extension
-- Adds Instagram to platform enum
--
-- After running this migration, update the codebase:
-- 1. In lib/db/schema.ts: Update platformEnum to include 'instagram'
-- 2. In lib/utils/social-handles.ts: Add 'instagram' to Platform type
-- 3. In components: Re-add Instagram to platform selectors
-- 4. Search for "NOTE: Add Instagram" comments and uncomment

-- Add 'instagram' to platform enum
DO $$ BEGIN
  ALTER TYPE platform ADD VALUE IF NOT EXISTS 'instagram';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
