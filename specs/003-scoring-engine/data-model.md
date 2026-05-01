# Data Model: Motor de Pontuação (The Engine)

**Branch**: `003-scoring-engine` | **Date**: 2026-04-28
**Depends on**: research.md, spec.md

---

## Entities

### ScoringTier (Enum)

The five possible outcomes of scoring evaluation, in descending priority order.

| Value | Points | Label (PT-BR) |
|-------|--------|---------------|
| `EXACT_SCORE` | 25 | Placar Exato |
| `WINNER_AND_GOAL_DIFF` | 15 | Vencedor + Saldo de Gols |
| `WINNER_OR_DRAW` | 10 | Vencedor ou Empate |
| `ONE_TEAM_GOALS` | 5 | Acerto de Gols de um Time |
| `TOTAL_MISS` | 0 | Erro Total |

**Constraint**: Exactly one tier is assigned per (MatchPrediction, MatchResult) pair. No combination or stacking.

---

### MatchResult

Represents the official confirmed final score for a match. A match may have multiple MatchResult records over time if the official score is amended.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique result record identifier |
| `match_id` | UUID | FK → matches.id, NOT NULL | The match this result belongs to |
| `home_goals` | integer | NOT NULL, ≥ 0 | Official home team goals |
| `away_goals` | integer | NOT NULL, ≥ 0 | Official away team goals |
| `status` | enum | NOT NULL | `PENDING` / `CONFIRMED` / `AMENDED` / `CANCELLED` |
| `confirmed_at` | timestamptz | NULLABLE | When result was officially confirmed |
| `source` | varchar(100) | NOT NULL | Data provider that supplied this result |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Record creation time |

**State transitions**:
```
PENDING → CONFIRMED → AMENDED (if corrected)
PENDING → CANCELLED
CONFIRMED → CANCELLED (rare; reverses points)
```

**Business rules**:
- Only one `CONFIRMED` MatchResult per match at any time.
- An amendment creates a new record with status `CONFIRMED`; the previous record is updated to `AMENDED`.
- A `CANCELLED` result triggers point reversal for all associated MatchScores.

---

### MatchScore

The record produced by the scoring engine for each (user, match) pair after a result is confirmed. This is the immutable ledger of how many points were awarded and why.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique score record identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | The user who made the prediction |
| `match_id` | UUID | FK → matches.id, NOT NULL | The match being scored |
| `prediction_id` | UUID | FK → match_predictions.id, NOT NULL | The specific prediction scored |
| `match_result_id` | UUID | FK → match_results.id, NOT NULL | The result used for scoring |
| `tier` | ScoringTier | NOT NULL | The tier awarded |
| `points` | integer | NOT NULL, ≥ 0 | Points awarded (matches tier's point value) |
| `is_superseded` | boolean | NOT NULL, DEFAULT false | True if a later amendment replaced this score |
| `calculated_at` | timestamptz | NOT NULL, DEFAULT now() | When the engine calculated this score |

**Unique constraint**: `(prediction_id, match_result_id)` — guarantees idempotency.

**Business rules**:
- `points` MUST always equal the point value of `tier` — enforced at application layer and verifiable by a DB check constraint.
- When a result is amended: existing MatchScore records for that match are marked `is_superseded = true`; new MatchScore records are inserted for the amended result.
- A `CANCELLED` result sets `is_superseded = true` on all associated MatchScores and reverses the delta in `user_totals`.

---

### UserTotal

Denormalized running aggregate of each user's accumulated points. Updated transactionally alongside every MatchScore insert.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_id` | UUID | PK, FK → users.id | One row per user |
| `total_points` | integer | NOT NULL, DEFAULT 0, ≥ 0 | Sum of all active (non-superseded) points |
| `match_points` | integer | NOT NULL, DEFAULT 0, ≥ 0 | Points from match predictions only |
| `outright_points` | integer | NOT NULL, DEFAULT 0, ≥ 0 | Points from resolved outrights only |
| `exact_score_count` | integer | NOT NULL, DEFAULT 0, ≥ 0 | Number of EXACT_SCORE tiers earned (tiebreaker 1) |
| `winner_goal_diff_count` | integer | NOT NULL, DEFAULT 0, ≥ 0 | Number of WINNER_AND_GOAL_DIFF tiers earned (tiebreaker 2) |
| `last_updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last time this row was modified |

**Business rules**:
- `total_points = match_points + outright_points` — invariant enforced at application layer.
- `total_points` is bounded [0, 3130] — no negative values, no values above the theoretical maximum.
- All columns updated atomically in a single `UPDATE` within the same DB transaction as the MatchScore insert.
- Row-level locking (`SELECT FOR UPDATE`) used during the update to prevent concurrent processors from corrupting the running total.

---

### LeagueRanking (Computed)

Not a persisted table — computed at query time by sorting UserTotals within league membership. The query is cached in Redis with a short TTL (10 seconds) to avoid redundant computation during peak traffic.

**Conceptual fields** (query output):

| Field | Source |
|-------|--------|
| `rank` | Row number, ordered by total_points DESC, exact_score_count DESC, winner_goal_diff_count DESC, display_name ASC |
| `user_id` | user_totals.user_id |
| `display_name` | users.display_name |
| `total_points` | user_totals.total_points |
| `exact_score_count` | user_totals.exact_score_count |
| `winner_goal_diff_count` | user_totals.winner_goal_diff_count |
| `match_points` | user_totals.match_points |
| `outright_points` | user_totals.outright_points |

---

## Relationships

```
Match
 ├── 1:N → MatchPrediction (one per user who predicted)
 └── 1:N → MatchResult (usually 1, more if amended)

MatchPrediction
 └── 1:1 → MatchScore (after result confirmed)

MatchResult
 └── 1:N → MatchScore (one per prediction for that match)

MatchScore
 └── N:1 → UserTotal (updates running aggregate)

User
 ├── 1:1 → UserTotal
 ├── 1:N → LeagueMembership
 └── LeagueMembership → LeagueRanking (computed per league)
```

---

## Scoring Algorithm (Formal)

```
function calculateTier(predicted: Score, actual: Score): ScoringTier

  let predicted_diff = predicted.home - predicted.away
  let actual_diff    = actual.home - actual.away
  let predicted_outcome = sign(predicted_diff)  // +1, 0, -1
  let actual_outcome    = sign(actual_diff)     // +1, 0, -1

  if predicted.home == actual.home AND predicted.away == actual.away:
    return EXACT_SCORE (25)

  if predicted_outcome == actual_outcome AND predicted_outcome != 0
     AND predicted_diff == actual_diff:
    return WINNER_AND_GOAL_DIFF (15)
    // Note: actual_outcome != 0 guards against draws (where diff is always 0)

  if predicted_outcome == actual_outcome:
    return WINNER_OR_DRAW (10)

  if predicted.home == actual.home XOR predicted.away == actual.away:
    return ONE_TEAM_GOALS (5)
    // Exactly one team's goal count matches; outcome is wrong

  return TOTAL_MISS (0)
```

**Invariants**:
1. Exactly one branch is taken per call.
2. WINNER_AND_GOAL_DIFF never fires for draws (`predicted_outcome != 0` guard).
3. ONE_TEAM_GOALS only fires when outcome is wrong — a correct-outcome prediction always lands in WINNER_OR_DRAW or higher.

---

## Database Indexes

| Table | Index | Reason |
|-------|-------|--------|
| `match_results` | `(match_id, status)` | Fast lookup of CONFIRMED result for a match |
| `match_scores` | `UNIQUE (prediction_id, match_result_id)` | Idempotency enforcement |
| `match_scores` | `(user_id, is_superseded)` | User score history queries |
| `match_scores` | `(match_id, is_superseded)` | Per-match score summary |
| `user_totals` | PK `user_id` | O(1) total lookup and update |
| `league_memberships` | `(league_id, user_id)` | Ranking query join |
