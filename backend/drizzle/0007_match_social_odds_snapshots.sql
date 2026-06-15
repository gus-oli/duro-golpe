CREATE TABLE IF NOT EXISTS "match_social_odds_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE cascade,
  "home_win_count" integer DEFAULT 0 NOT NULL,
  "draw_count" integer DEFAULT 0 NOT NULL,
  "away_win_count" integer DEFAULT 0 NOT NULL,
  "total_predictions" integer DEFAULT 0 NOT NULL,
  "home_win_bps" integer DEFAULT 0 NOT NULL,
  "draw_bps" integer DEFAULT 0 NOT NULL,
  "away_win_bps" integer DEFAULT 0 NOT NULL,
  "minimum_sample" integer NOT NULL,
  "underdog_threshold_bps" integer NOT NULL,
  "captured_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "match_social_odds_snapshots"
    ADD CONSTRAINT "match_social_odds_snapshots_match_unique" UNIQUE ("match_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
