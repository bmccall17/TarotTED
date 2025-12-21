-- Step 1: Add new columns
ALTER TABLE "talks" ADD COLUMN "youtube_url" text;--> statement-breakpoint
ALTER TABLE "talks" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "talks" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint

-- Step 2: Migrate YouTube URLs from ted_url to youtube_url
UPDATE "talks"
SET "youtube_url" = "ted_url"
WHERE "ted_url" LIKE 'https://www.youtube.com%' OR "ted_url" LIKE 'https://youtu.be%';--> statement-breakpoint

-- Step 3: Clear YouTube URLs from ted_url (set to NULL where it was a YouTube URL)
UPDATE "talks"
SET "ted_url" = NULL
WHERE "youtube_url" IS NOT NULL;--> statement-breakpoint

-- Step 4: Make ted_url nullable
ALTER TABLE "talks" ALTER COLUMN "ted_url" DROP NOT NULL;--> statement-breakpoint

-- Step 5: Add CHECK constraint to ensure at least one URL exists
ALTER TABLE "talks" ADD CONSTRAINT "chk_at_least_one_url"
CHECK ("ted_url" IS NOT NULL OR "youtube_url" IS NOT NULL);--> statement-breakpoint

-- Step 6: Add unique partial index for primary mappings (only one primary per card)
CREATE UNIQUE INDEX "idx_one_primary_per_card"
ON "card_talk_mappings" ("card_id")
WHERE "is_primary" = true;