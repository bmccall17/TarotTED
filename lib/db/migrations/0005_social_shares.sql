-- Signal Deck: Social share tracking for TarotTALKS promotion
-- Manual logging of social media posts to track engagement

-- Create enums
CREATE TYPE "platform" AS ENUM ('x', 'bluesky', 'threads', 'linkedin', 'other');
CREATE TYPE "share_status" AS ENUM ('draft', 'posted', 'verified');

-- Create social_shares table
CREATE TABLE IF NOT EXISTS "social_shares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  -- Core fields
  "platform" "platform" NOT NULL,
  "post_url" varchar(500),
  "status" "share_status" DEFAULT 'posted' NOT NULL,
  "posted_at" timestamp DEFAULT now() NOT NULL,

  -- What was shared (optional FK refs)
  "card_id" uuid REFERENCES "cards"("id") ON DELETE SET NULL,
  "talk_id" uuid REFERENCES "talks"("id") ON DELETE SET NULL,
  "shared_url" varchar(500),

  -- Speaker tracking (Phase 3 prep)
  "speaker_handle" varchar(100),
  "speaker_name" varchar(200),

  -- Notes
  "notes" text,

  -- Timestamps
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_social_shares_posted_at" ON "social_shares" ("posted_at");
CREATE INDEX IF NOT EXISTS "idx_social_shares_platform" ON "social_shares" ("platform");
CREATE INDEX IF NOT EXISTS "idx_social_shares_status" ON "social_shares" ("status");
