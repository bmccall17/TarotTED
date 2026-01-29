-- Tag Pack: Social media handles for speakers
-- Enables quick copy-to-clipboard for social sharing

ALTER TABLE "talks" ADD COLUMN "speaker_twitter_handle" varchar(50);
ALTER TABLE "talks" ADD COLUMN "speaker_bluesky_handle" varchar(100);
