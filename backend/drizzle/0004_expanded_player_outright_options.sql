DO $$ BEGIN
 CREATE TYPE "public"."outright_player_source_tier" AS ENUM('OFFICIAL', 'PRELIMINARY', 'LIKELY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "source_tier" "outright_player_source_tier";
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "outright_options"
ADD COLUMN IF NOT EXISTS "team_label" text;
--> statement-breakpoint
UPDATE "outright_options"
SET
  "source_tier" = CASE
    WHEN "source_tier" IS NULL THEN 'LIKELY'::"outright_player_source_tier"
    ELSE "source_tier"
  END,
  "is_active" = COALESCE("is_active", true),
  "is_featured" = COALESCE("is_featured", false),
  "sort_order" = COALESCE("sort_order", 0)
WHERE "source_tier" IS NULL OR "is_active" IS NULL OR "is_featured" IS NULL OR "sort_order" IS NULL;
