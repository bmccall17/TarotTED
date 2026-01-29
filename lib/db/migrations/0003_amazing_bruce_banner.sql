CREATE TABLE "behavior_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(12) NOT NULL,
	"event_name" varchar(50) NOT NULL,
	"timestamp" bigint NOT NULL,
	"properties" text DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_events_session" ON "behavior_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_events_name_time" ON "behavior_events" USING btree ("event_name","timestamp");--> statement-breakpoint
CREATE INDEX "idx_events_created" ON "behavior_events" USING btree ("created_at");