-- Migration: Multi-Platform Signal Deck Extension
-- Adds Instagram to platform enum and metrics_source tracking

-- Add 'instagram' to platform enum (if not exists)
DO $$ BEGIN
  ALTER TYPE platform ADD VALUE IF NOT EXISTS 'instagram';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create metrics_source enum
DO $$ BEGIN
  CREATE TYPE metrics_source AS ENUM ('auto', 'manual');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add metrics_source column to social_shares
ALTER TABLE social_shares
ADD COLUMN IF NOT EXISTS metrics_source metrics_source DEFAULT 'auto';

-- Update existing Bluesky shares to 'auto' (they have API metrics)
UPDATE social_shares
SET metrics_source = 'auto'
WHERE platform = 'bluesky' AND metrics_source IS NULL;

-- Update existing non-Bluesky shares to 'manual' (metrics were entered manually)
UPDATE social_shares
SET metrics_source = 'manual'
WHERE platform != 'bluesky' AND metrics_source IS NULL AND (like_count > 0 OR repost_count > 0 OR reply_count > 0);
