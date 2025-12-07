CREATE TYPE "public"."arcana_type" AS ENUM('major', 'minor');--> statement-breakpoint
CREATE TYPE "public"."suit" AS ENUM('wands', 'cups', 'swords', 'pentacles');--> statement-breakpoint
CREATE TYPE "public"."theme_category" AS ENUM('emotion', 'life_phase', 'role', 'other');--> statement-breakpoint
CREATE TABLE "card_talk_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"talk_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"strength" integer NOT NULL,
	"rationale_short" text NOT NULL,
	"rationale_long" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_themes" (
	"card_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"arcana_type" "arcana_type" NOT NULL,
	"suit" "suit",
	"number" integer,
	"sequence_index" integer NOT NULL,
	"image_url" text NOT NULL,
	"keywords" text NOT NULL,
	"summary" text NOT NULL,
	"upright_meaning" text,
	"reversed_meaning" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "talk_themes" (
	"talk_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(300) NOT NULL,
	"speaker_name" varchar(200) NOT NULL,
	"ted_url" text NOT NULL,
	"description" text,
	"duration_seconds" integer,
	"event_name" varchar(200),
	"year" integer,
	"thumbnail_url" text,
	"language" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "talks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"short_description" text NOT NULL,
	"long_description" text,
	"category" "theme_category",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "themes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "card_talk_mappings" ADD CONSTRAINT "card_talk_mappings_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_talk_mappings" ADD CONSTRAINT "card_talk_mappings_talk_id_talks_id_fk" FOREIGN KEY ("talk_id") REFERENCES "public"."talks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_themes" ADD CONSTRAINT "card_themes_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_themes" ADD CONSTRAINT "card_themes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talk_themes" ADD CONSTRAINT "talk_themes_talk_id_talks_id_fk" FOREIGN KEY ("talk_id") REFERENCES "public"."talks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talk_themes" ADD CONSTRAINT "talk_themes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;