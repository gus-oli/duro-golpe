CREATE TABLE IF NOT EXISTS "outright_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "market_id" uuid NOT NULL REFERENCES "outright_markets"("id") ON DELETE cascade,
  "points" integer NOT NULL,
  "calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "outright_scores"
    ADD CONSTRAINT "outright_scores_user_market_unique"
    UNIQUE ("user_id", "market_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
