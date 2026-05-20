ALTER TABLE "mural_posts" DROP CONSTRAINT IF EXISTS "mural_posts_match_id_matches_id_fk";

ALTER TABLE "mural_posts" ALTER COLUMN "match_id" DROP NOT NULL;

ALTER TABLE "mural_posts"
  ADD CONSTRAINT "mural_posts_match_id_matches_id_fk"
  FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE set null;

DROP INDEX IF EXISTS "mural_posts_feed_idx";

CREATE INDEX IF NOT EXISTS "mural_posts_league_feed_idx"
  ON "mural_posts" ("league_id", "created_at");

CREATE INDEX IF NOT EXISTS "mural_posts_match_context_idx"
  ON "mural_posts" ("league_id", "match_id", "created_at");
