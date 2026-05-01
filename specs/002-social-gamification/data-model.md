# Data Model: Gamificação Social e Mecânicas Detalhadas de Apostas

**Branch**: `002-social-gamification` | **Date**: 2026-04-28
**Depends on**: research.md, spec.md, `001-copa-2026-platform/data-model.md`

This feature extends the data model from 001 with three new tables: `mural_posts`, `badges`, and `user_badges`. All existing entities (Match, MatchPrediction, League, etc.) are inherited from 001 with no schema changes.

---

## New Entities

### MuralPost

A text comment posted by a league member in the per-match, per-league feed.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Unique post identifier |
| `league_id` | UUID | FK → leagues.id, NOT NULL | The league this post belongs to |
| `match_id` | UUID | FK → matches.id, NOT NULL | The match this post is about |
| `user_id` | UUID | FK → users.id, NOT NULL | The author |
| `content` | varchar(500) | NOT NULL, min length 1 | Post text (emoji counted as text) |
| `is_hidden` | boolean | NOT NULL, DEFAULT false | Moderation flag (v1: always false; reserved for future use) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Post creation time |

**Business rules**:
- Users can only post in a league's Mural if they are active members of that league (`league_memberships.is_active = true`).
- Posts are text-only; no images, GIFs, or embedded media in v1.
- Posts from removed users are retained historically (`is_hidden` may be set to true on account deletion by request).
- No length restriction below 500 chars; empty posts are rejected at application layer.

**Indexes**:
- `(league_id, match_id, created_at DESC)` — primary query pattern for feed retrieval, ordered chronologically.
- `(user_id)` — for user activity lookup (if needed for moderation).

---

### Badge

Enumeration of available badge types. This is a reference table (not user-specific) seeded at application startup.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `type` | varchar(50) | PK | Unique badge identifier (e.g., `O_MESTRE`, `PE_FRIO`, `ZEBRA_HUNTER`) |
| `label_pt` | varchar(100) | NOT NULL | Display label in Portuguese |
| `description_pt` | varchar(300) | NOT NULL | Short description of how the badge is earned |
| `icon_key` | varchar(50) | NOT NULL | Key for the frontend icon asset |

**Seeded data (v1)**:

| type | label_pt | description_pt |
|------|----------|----------------|
| `O_MESTRE` | O Mestre | Acertou o resultado de 5 partidas consecutivas |
| `PE_FRIO` | Pé Frio | Errou o resultado de 5 partidas consecutivas |
| `ZEBRA_HUNTER` | Zebra Hunter | Acertou o resultado de uma partida zebra |

---

### UserBadge

Associates a user with an earned badge. Designed for idempotency — the unique constraint prevents re-awarding.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Record identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | The badge recipient |
| `badge_type` | varchar(50) | FK → badges.type, NOT NULL | The earned badge |
| `awarded_at` | timestamptz | NOT NULL, DEFAULT now() | When the badge was awarded |
| `trigger_match_id` | UUID | FK → matches.id, NULLABLE | The match that triggered the award |
| `zebra_count` | integer | NOT NULL, DEFAULT 1 | For ZEBRA_HUNTER: total zebra matches correctly predicted |

**Unique constraint**: `(user_id, badge_type)` — each badge type is awarded at most once per user (subsequent qualifying events increment `zebra_count` for ZEBRA_HUNTER instead of inserting a new row).

**Business rules**:
- Once awarded, a badge is never revoked.
- For `ZEBRA_HUNTER`: on first qualifying event, insert with `zebra_count = 1`. On subsequent events, `UPDATE user_badges SET zebra_count = zebra_count + 1 WHERE user_id = X AND badge_type = 'ZEBRA_HUNTER'`.
- `trigger_match_id` records the match that caused the initial award.

---

## Extended Entities from 001 (No Schema Changes)

The following 001 entities are consumed by 002 features but require no schema changes:

- **Match** — consumed by Mural (match_id FK) and Badge trigger (match classification for zebra)
- **MatchScore** — consumed by BadgeEvaluator (reads consecutive correct/incorrect streak)
- **League / LeagueMembership** — consumed by Mural (membership validation before posting)
- **OutrightMarket / OutrightOption / OutrightPrediction** — consumed as-is; 8 markets seeded per spec

---

## BadgeEvaluator Context Object

The `BadgeEvaluator` service receives the following context after each match result is processed:

```typescript
interface BadgeEvaluationContext {
  userId: string;
  matchId: string;
  tier: ScoringTier;           // from 003-scoring-engine
  isZebraMatch: boolean;       // derived from API-Football data or FIFA ranking delta
  consecutiveCorrect: number;  // count of consecutive WINNER_OR_DRAW or higher results
  consecutiveIncorrect: number; // count of consecutive TOTAL_MISS results
}
```

**Query to compute consecutiveCorrect/Incorrect**: Ordered window query on `match_scores` for that user, counting from the most recent result backward until the streak breaks.

---

## Relationships (additions to 001)

```
League
 └── 1:N → MuralPost (per-match-per-league feed)

Match
 └── 1:N → MuralPost

User
 ├── 1:N → MuralPost
 └── 1:N → UserBadge

Badge
 └── 1:N → UserBadge
```
