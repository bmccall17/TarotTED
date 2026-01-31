-- Signal Deck Phase 2-4: Metrics, Relationships, and Mentions

-- New status values for discovered mentions
ALTER TYPE "share_status" ADD VALUE IF NOT EXISTS 'discovered';
ALTER TYPE "share_status" ADD VALUE IF NOT EXISTS 'acknowledged';

-- Phase 2: Metrics columns
ALTER TABLE "social_shares"
  ADD COLUMN IF NOT EXISTS "like_count" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "repost_count" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reply_count" integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "metrics_updated_at" timestamp;

-- Phase 3: Relationship tracking
ALTER TABLE "social_shares"
  ADD COLUMN IF NOT EXISTS "following_speaker" boolean,
  ADD COLUMN IF NOT EXISTS "relationship_updated_at" timestamp;

-- Phase 4: Mention discovery
ALTER TABLE "social_shares"
  ADD COLUMN IF NOT EXISTS "discovered_at" timestamp,
  ADD COLUMN IF NOT EXISTS "at_uri" varchar(500),
  ADD COLUMN IF NOT EXISTS "author_did" varchar(100),
  ADD COLUMN IF NOT EXISTS "author_handle" varchar(100),
  ADD COLUMN IF NOT EXISTS "author_display_name" varchar(200);

-- Indexes for new queries
CREATE INDEX IF NOT EXISTS "idx_social_shares_at_uri" ON "social_shares" ("at_uri");
CREATE INDEX IF NOT EXISTS "idx_social_shares_engagement" ON "social_shares" (("like_count" + "repost_count" + "reply_count") DESC);
