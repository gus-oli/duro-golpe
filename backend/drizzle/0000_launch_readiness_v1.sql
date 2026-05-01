CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE "match_status" AS ENUM ('SCHEDULED', 'LOCKED', 'LIVE', 'FINISHED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "result_status" AS ENUM ('PENDING', 'CONFIRMED', 'AMENDED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "outright_status" AS ENUM ('OPEN', 'LOCKED', 'RESOLVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "outright_option_type" AS ENUM ('TEAM', 'PLAYER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "password_hash" text,
  "google_sub" text UNIQUE,
  "avatar_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "teams" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "fifa_code" text NOT NULL UNIQUE,
  "group_letter" text,
  "flag_url" text,
  "api_football_id" text UNIQUE
);

CREATE TABLE IF NOT EXISTS "matches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "home_team_id" uuid NOT NULL REFERENCES "teams"("id"),
  "away_team_id" uuid NOT NULL REFERENCES "teams"("id"),
  "kickoff_time" timestamp with time zone NOT NULL,
  "stage" text NOT NULL,
  "venue" text,
  "status" "match_status" DEFAULT 'SCHEDULED' NOT NULL,
  "home_score" integer,
  "away_score" integer,
  "api_football_id" text UNIQUE
);

CREATE TABLE IF NOT EXISTS "match_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "match_id" uuid NOT NULL REFERENCES "matches"("id"),
  "predicted_home" integer NOT NULL,
  "predicted_away" integer NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "match_predictions_user_id_match_id_unique" UNIQUE ("user_id", "match_id")
);

CREATE TABLE IF NOT EXISTS "leagues" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "invite_code" text NOT NULL UNIQUE,
  "created_by" uuid NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "league_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "league_id" uuid NOT NULL REFERENCES "leagues"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "is_active" boolean DEFAULT true NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "badges" (
  "type" varchar(50) PRIMARY KEY NOT NULL,
  "label_pt" varchar(100) NOT NULL,
  "description_pt" varchar(300) NOT NULL,
  "icon_key" varchar(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_badges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "badge_type" varchar(50) NOT NULL REFERENCES "badges"("type"),
  "awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
  "trigger_match_id" uuid REFERENCES "matches"("id") ON DELETE set null,
  "zebra_count" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "user_badges_user_badge_unique" UNIQUE ("user_id", "badge_type")
);

CREATE TABLE IF NOT EXISTS "mural_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "league_id" uuid NOT NULL REFERENCES "leagues"("id") ON DELETE cascade,
  "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE cascade,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "content" varchar(500) NOT NULL,
  "is_hidden" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "match_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL REFERENCES "matches"("id"),
  "home_score" integer NOT NULL,
  "away_score" integer NOT NULL,
  "status" "result_status" DEFAULT 'PENDING' NOT NULL,
  "confirmed_at" timestamp with time zone,
  "source" varchar(100) DEFAULT 'api-football-v3' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "match_scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "match_id" uuid NOT NULL REFERENCES "matches"("id"),
  "prediction_id" uuid NOT NULL REFERENCES "match_predictions"("id"),
  "match_result_id" uuid NOT NULL REFERENCES "match_results"("id"),
  "tier" varchar(30) NOT NULL,
  "points" integer NOT NULL,
  "is_superseded" boolean DEFAULT false NOT NULL,
  "calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "match_scores_prediction_result_unique" UNIQUE ("prediction_id", "match_result_id")
);

CREATE TABLE IF NOT EXISTS "user_totals" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "total_points" integer DEFAULT 0 NOT NULL,
  "match_points" integer DEFAULT 0 NOT NULL,
  "outright_points" integer DEFAULT 0 NOT NULL,
  "exact_score_count" integer DEFAULT 0 NOT NULL,
  "winner_goal_diff_count" integer DEFAULT 0 NOT NULL,
  "last_updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "outright_markets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text,
  "name" text NOT NULL,
  "point_value" integer NOT NULL,
  "status" "outright_status" DEFAULT 'OPEN' NOT NULL,
  "description" text NOT NULL,
  "selection_min" integer DEFAULT 1,
  "selection_max" integer DEFAULT 1,
  "sort_order" integer DEFAULT 0,
  "option_type" "outright_option_type"
);

CREATE TABLE IF NOT EXISTS "outright_options" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "market_id" uuid NOT NULL REFERENCES "outright_markets"("id") ON DELETE cascade,
  "label" text NOT NULL,
  "team_id" uuid REFERENCES "teams"("id")
);

CREATE TABLE IF NOT EXISTS "outright_predictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "market_id" uuid NOT NULL REFERENCES "outright_markets"("id") ON DELETE cascade,
  "option_id" uuid NOT NULL REFERENCES "outright_options"("id") ON DELETE cascade,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$
BEGIN
  CREATE TYPE "outright_option_type" AS ENUM ('TEAM', 'PLAYER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "outright_status" ADD VALUE 'RESOLVED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "outright_markets" ADD COLUMN IF NOT EXISTS "code" text;
ALTER TABLE "outright_markets" ADD COLUMN IF NOT EXISTS "selection_min" integer DEFAULT 1;
ALTER TABLE "outright_markets" ADD COLUMN IF NOT EXISTS "selection_max" integer DEFAULT 1;
ALTER TABLE "outright_markets" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0;
ALTER TABLE "outright_markets" ADD COLUMN IF NOT EXISTS "option_type" "outright_option_type";

UPDATE "outright_markets"
SET
  "code" = 'CHAMPION',
  "name" = 'Campeão',
  "point_value" = 120,
  "description" = 'Selecione a selecao campea da Copa do Mundo 2026.',
  "selection_min" = 1,
  "selection_max" = 1,
  "sort_order" = 0,
  "option_type" = 'TEAM'
WHERE "name" LIKE 'Campe%';

UPDATE "outright_markets"
SET
  "code" = 'TOP_SCORER',
  "point_value" = 90,
  "description" = 'Selecione o artilheiro oficial do torneio.',
  "selection_min" = 1,
  "selection_max" = 1,
  "sort_order" = 1,
  "option_type" = 'PLAYER'
WHERE "name" = 'Artilheiro';

UPDATE "outright_markets"
SET
  "code" = 'GOLDEN_BALL',
  "point_value" = 90,
  "description" = 'Selecione o vencedor oficial da Bola de Ouro da FIFA.',
  "selection_min" = 1,
  "selection_max" = 1,
  "sort_order" = 2,
  "option_type" = 'PLAYER'
WHERE "name" LIKE 'Bola%';

UPDATE "outright_markets"
SET
  "code" = 'FINALISTS',
  "point_value" = 90,
  "description" = 'Selecione as duas selecoes finalistas. E preciso acertar as duas para pontuar.',
  "selection_min" = 2,
  "selection_max" = 2,
  "sort_order" = 3,
  "option_type" = 'TEAM'
WHERE "name" = 'Finalistas';

UPDATE "outright_markets"
SET
  "code" = 'REVELATION',
  "name" = 'Revelação',
  "point_value" = 70,
  "description" = 'Selecione o vencedor oficial do premio de revelacao da FIFA.',
  "selection_min" = 1,
  "selection_max" = 1,
  "sort_order" = 4,
  "option_type" = 'PLAYER'
WHERE "name" LIKE 'Revela%';

UPDATE "outright_markets"
SET
  "code" = 'BEST_ATTACK',
  "name" = 'Melhor Ataque',
  "point_value" = 80,
  "description" = 'Selecione a selecao com mais gols no torneio. Em caso de empate, vale a melhor classificacao final oficial da FIFA.',
  "selection_min" = 1,
  "selection_max" = 1,
  "sort_order" = 5,
  "option_type" = 'TEAM'
WHERE "name" IN ('Ataque+Positivo', 'Melhor Ataque');

UPDATE "outright_markets"
SET
  "code" = 'LAST_PLACE',
  "point_value" = 60,
  "description" = 'Selecione a selecao com a pior campanha oficial do torneio.',
  "selection_min" = 1,
  "selection_max" = 1,
  "sort_order" = 6,
  "option_type" = 'TEAM'
WHERE "name" = 'Lanterna';

DELETE FROM "outright_predictions"
WHERE "market_id" IN (
  SELECT "id" FROM "outright_markets" WHERE "name" = 'Zebra'
);

DELETE FROM "outright_options"
WHERE "market_id" IN (
  SELECT "id" FROM "outright_markets" WHERE "name" = 'Zebra'
);

DELETE FROM "outright_markets" WHERE "name" = 'Zebra';

ALTER TABLE "outright_markets" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "outright_markets" ALTER COLUMN "selection_min" SET NOT NULL;
ALTER TABLE "outright_markets" ALTER COLUMN "selection_max" SET NOT NULL;
ALTER TABLE "outright_markets" ALTER COLUMN "sort_order" SET NOT NULL;
ALTER TABLE "outright_markets" ALTER COLUMN "option_type" SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE "outright_markets"
    ADD CONSTRAINT "outright_markets_code_unique" UNIQUE ("code");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "outright_options"
    ADD CONSTRAINT "outright_options_market_id_label_unique" UNIQUE ("market_id", "label");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "outright_predictions" DROP CONSTRAINT IF EXISTS "outright_predictions_user_id_market_id_unique";

DO $$
BEGIN
  ALTER TABLE "outright_predictions"
    ADD CONSTRAINT "outright_predictions_user_id_market_id_option_id_unique"
    UNIQUE ("user_id", "market_id", "option_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "outright_market_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "market_id" uuid NOT NULL REFERENCES "outright_markets"("id") ON DELETE cascade,
  "option_id" uuid NOT NULL REFERENCES "outright_options"("id") ON DELETE cascade,
  "notes" text,
  "resolved_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$
BEGIN
  ALTER TABLE "outright_market_results"
    ADD CONSTRAINT "outright_market_results_market_id_option_id_unique"
    UNIQUE ("market_id", "option_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
