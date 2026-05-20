ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "player_photo_url" text;
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "player_photo_source" text;
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "player_photo_updated_at" timestamp with time zone;
