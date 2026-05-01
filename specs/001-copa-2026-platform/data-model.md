# Data Model: Plataforma de Engajamento Social - Copa do Mundo 2026

**Branch**: `001-copa-2026-platform` | **Date**: 2026-04-28
**Depends on**: research.md, spec.md

---

## Entities

### User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique user identifier |
| `email` | varchar(255) | UNIQUE, NOT NULL | Login email |
| `password_hash` | varchar(255) | NULLABLE | bcrypt hash; null for OAuth-only users |
| `display_name` | varchar(50) | NOT NULL | Public display name in rankings |
| `avatar_url` | varchar(500) | NULLABLE | Profile picture URL |
| `google_id` | varchar(255) | UNIQUE, NULLABLE | Google OAuth subject identifier |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Account creation timestamp |
| `last_seen_at` | timestamptz | NULLABLE | Last active timestamp |

**Business rules**:
- At least one of `password_hash` or `google_id` MUST be non-null.
- `email` is the unique login identifier for password-based auth.
- `display_name` is shown in league rankings and the Mural de Resenha.

---

### Team

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique team identifier |
| `name` | varchar(100) | NOT NULL | Full country name (e.g., "Brazil") |
| `name_pt` | varchar(100) | NOT NULL | Portuguese name (e.g., "Brasil") |
| `fifa_code` | char(3) | UNIQUE, NOT NULL | Official FIFA 3-letter code (e.g., "BRA") |
| `flag_url` | varchar(500) | NOT NULL | Flag image URL |
| `group_letter` | char(1) | NULLABLE | Group stage letter (A–L); null for knockout |
| `fifa_ranking` | integer | NULLABLE | FIFA ranking at time of seeding |

---

### Match

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique match identifier |
| `external_id` | varchar(50) | UNIQUE, NOT NULL | ID from API-Football provider |
| `home_team_id` | UUID | FK → teams.id, NULLABLE | Home team (null until knockout teams are confirmed) |
| `away_team_id` | UUID | FK → teams.id, NULLABLE | Away team (null until knockout teams are confirmed) |
| `phase` | enum | NOT NULL | `GROUP` / `ROUND_OF_32` / `ROUND_OF_16` / `QUARTER_FINAL` / `SEMI_FINAL` / `THIRD_PLACE` / `FINAL` |
| `group_letter` | char(1) | NULLABLE | Group letter (A–L); null for knockout rounds |
| `match_number` | integer | NOT NULL | Sequential match number (1–104) |
| `kickoff_time` | timestamptz | NOT NULL | Official kickoff time in UTC |
| `status` | enum | NOT NULL, DEFAULT 'SCHEDULED' | `SCHEDULED` / `LOCKED` / `LIVE` / `FINISHED` / `POSTPONED` / `CANCELLED` |
| `home_goals` | integer | NULLABLE | Final home goals (null until finished) |
| `away_goals` | integer | NULLABLE | Final away goals (null until finished) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | When match was seeded |

**State transitions**:
```
SCHEDULED → LOCKED (at kickoff_time − 15 minutes)
LOCKED    → LIVE   (at kickoff_time, triggered by API-Football event)
LIVE      → FINISHED (at final whistle)
SCHEDULED → POSTPONED
SCHEDULED → CANCELLED
POSTPONED → SCHEDULED (if rescheduled)
```

**Business rules**:
- `home_team_id` and `away_team_id` may be null for knockout matches until group stage is complete.
- Predictions cannot be submitted or edited when `status` is `LOCKED`, `LIVE`, `FINISHED`, `POSTPONED`, or `CANCELLED`.

---

### MatchPrediction

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique prediction identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | The predicting user |
| `match_id` | UUID | FK → matches.id, NOT NULL | The match being predicted |
| `home_goals` | integer | NOT NULL, ≥ 0 | Predicted home goals |
| `away_goals` | integer | NOT NULL, ≥ 0 | Predicted away goals |
| `submitted_at` | timestamptz | NOT NULL | When prediction was created or last updated |
| `locked_at` | timestamptz | NULLABLE | When the prediction was locked (match lock time) |

**Unique constraint**: `(user_id, match_id)` — one prediction per user per match.

**Business rules**:
- Prediction is mutable until the match status becomes `LOCKED`.
- `locked_at` is set by the lock cron job — it is informational (the authoritative lock is `matches.status`).

---

### League

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique league identifier |
| `name` | varchar(100) | NOT NULL | League display name |
| `invite_code` | char(8) | UNIQUE, NOT NULL | Shareable invite code (8 alphanumeric chars) |
| `owner_id` | UUID | FK → users.id, NOT NULL | The user who created the league |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | League creation timestamp |
| `member_count` | integer | NOT NULL, DEFAULT 1 | Denormalized member count for display |

---

### LeagueMembership

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique membership record |
| `league_id` | UUID | FK → leagues.id, NOT NULL | The league |
| `user_id` | UUID | FK → users.id, NOT NULL | The member |
| `joined_at` | timestamptz | NOT NULL, DEFAULT now() | When the user joined |
| `is_active` | boolean | NOT NULL, DEFAULT true | False if user left or was removed |

**Unique constraint**: `(league_id, user_id)`.

---

### OutrightMarket

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique market identifier |
| `type` | enum | NOT NULL | `CHAMPION` / `TOP_SCORER` / `GOLDEN_BALL` / `FINALISTS` / `ZEBRA` / `REVELATION` / `BEST_ATTACK` / `LANTERN` |
| `label_pt` | varchar(100) | NOT NULL | Display label in Portuguese |
| `points` | integer | NOT NULL | Points awarded on correct prediction |
| `lock_deadline` | timestamptz | NOT NULL | When predictions lock (1h before opening match) |
| `status` | enum | NOT NULL, DEFAULT 'OPEN' | `OPEN` / `LOCKED` / `RESOLVED` / `VOID` |
| `result_option_id` | UUID | FK → outright_options.id, NULLABLE | The winning option (set on resolution) |
| `resolved_at` | timestamptz | NULLABLE | When the market was officially resolved |

**Seeded data** (at launch):

| Type | Label PT | Points |
|------|----------|--------|
| CHAMPION | Campeão | 100 |
| TOP_SCORER | Artilheiro | 80 |
| GOLDEN_BALL | Bola de Ouro | 80 |
| FINALISTS | Finalistas | 70 |
| ZEBRA | Zebra | 60 |
| REVELATION | Revelação | 50 |
| BEST_ATTACK | Ataque + Positivo | 50 |
| LANTERN | Lanterna | 40 |

---

### OutrightOption

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique option identifier |
| `market_id` | UUID | FK → outright_markets.id, NOT NULL | The market this option belongs to |
| `option_type` | enum | NOT NULL | `TEAM` / `PLAYER` |
| `team_id` | UUID | FK → teams.id, NULLABLE | If option_type = TEAM |
| `player_name` | varchar(100) | NULLABLE | If option_type = PLAYER |
| `display_label` | varchar(100) | NOT NULL | Label shown to users |

---

### OutrightPrediction

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique prediction record |
| `user_id` | UUID | FK → users.id, NOT NULL | The predicting user |
| `market_id` | UUID | FK → outright_markets.id, NOT NULL | The outright market |
| `option_id` | UUID | FK → outright_options.id, NOT NULL | The selected option |
| `submitted_at` | timestamptz | NOT NULL | When prediction was submitted or last updated |

**Unique constraint**: `(user_id, market_id)` — one prediction per user per market.

**Business rules**:
- Mutable until `outright_markets.status = 'LOCKED'`.
- Points awarded to user when `outright_markets.status` transitions to `RESOLVED` and `option_id = result_option_id`.

---

## Relationships

```
User
 ├── 1:N → MatchPrediction
 ├── 1:N → League (as owner)
 ├── 1:N → LeagueMembership
 └── 1:N → OutrightPrediction

Match
 ├── N:1 → Team (home)
 ├── N:1 → Team (away)
 └── 1:N → MatchPrediction

League
 └── 1:N → LeagueMembership

OutrightMarket
 ├── 1:N → OutrightOption
 └── 1:N → OutrightPrediction
```

---

## Database Indexes

| Table | Index | Reason |
|-------|-------|--------|
| `users` | UNIQUE `email` | Login lookup |
| `users` | UNIQUE `google_id` | OAuth lookup |
| `matches` | `(status, kickoff_time)` | Lock cron + live feed queries |
| `match_predictions` | UNIQUE `(user_id, match_id)` | Prevent duplicate predictions |
| `match_predictions` | `(match_id)` | Batch scoring processor lookup |
| `leagues` | UNIQUE `invite_code` | Join-by-code lookup |
| `league_memberships` | UNIQUE `(league_id, user_id)` | Prevent duplicate membership |
| `league_memberships` | `(user_id, is_active)` | User's league list |
| `outright_predictions` | UNIQUE `(user_id, market_id)` | Prevent duplicate outright predictions |
