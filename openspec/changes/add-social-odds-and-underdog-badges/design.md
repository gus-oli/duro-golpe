## Context

The product already has match predictions, match locking, match result scoring, realtime/polling freshness, and badge evaluation. `ZEBRA_HUNTER` exists as a badge with an incrementing `zebra_count`, but the current badge context always publishes `isZebraMatch: false` and the original social-gamification assumptions depended on an external underdog source such as ranking or odds.

The new opportunity is to define underdog status from the product's own prediction community. This avoids betting-provider dependency, makes the rule explainable to users, and turns match cards into a more social surface.

## Goals / Non-Goals

**Goals:**

- Compute social odds for each match from submitted score predictions.
- Freeze a canonical odds snapshot when the match locks.
- Expose compact social odds in match listing/card surfaces and richer context on match detail.
- Use the frozen snapshot to decide whether a user's correct outcome qualifies as a zebra for `ZEBRA_HUNTER`.
- Keep the model independent from external betting providers.

**Non-Goals:**

- Integrate real bookmaker odds or betting-provider feeds.
- Support financial betting, odds movement history, payouts, or provider compliance flows.
- Build per-league social odds in the first version.
- Recalculate badge qualification from live, mutable post-lock aggregates.
- Require realtime odds updates before lock; polling/on-load freshness is enough for the first implementation.

## Decisions

### 1. Use global product-wide social odds as the canonical MVP metric

The first version should aggregate all valid predictions for a match across the product, not per league. The matches surface is global today, and `ZEBRA_HUNTER` is a user-level badge rather than a league-scoped achievement.

Alternative considered: per-league odds. That would make league banter more intimate, but it creates ambiguous badge outcomes for users in multiple leagues and produces noisy percentages in small leagues.

### 2. Derive odds from match outcome, not exact score

Each prediction maps to exactly one outcome:

- home win when `predictedHome > predictedAway`
- draw when `predictedHome === predictedAway`
- away win when `predictedAway > predictedHome`

The social odds snapshot stores counts and percentages for those three outcomes. Exact-score distribution can be a future layer, but it is too sparse for a first-card metric.

Alternative considered: exact score odds. Rejected because most exact scores would have tiny sample sizes and would make the UI noisier than useful.

### 3. Persist a frozen lock snapshot for canonical decisions

When a match transitions to `LOCKED`, the backend should compute and persist a social odds snapshot for that match. The snapshot should include:

- `matchId`
- counts for home win, draw, away win
- total prediction count
- percentages or basis points for each outcome
- `capturedAt`
- qualification settings used, such as minimum sample and underdog threshold

Before lock, the API may compute current odds on demand for display only. After lock, DTOs should prefer the frozen snapshot.

Alternative considered: always compute odds on read. That is simpler for display, but it makes badge qualification depend on mutable data if predictions are repaired or backfilled later.

### 4. Use all available predictions and a threshold rule for zebra qualification

The initial canonical rule should be:

- at least one prediction exists in the frozen snapshot
- the user's predicted outcome had at most 30% social share in the frozen snapshot
- the final match outcome equals the user's predicted outcome

This means a user earns/increments `ZEBRA_HUNTER` only when they backed an unpopular outcome and the unpopular outcome actually happened.

Alternative considered: any non-favorite outcome qualifies. Rejected because 35% vs. 33% vs. 32% is not a meaningful zebra.

### 5. Refine badge logic to correct-outcome tiers

`ZEBRA_HUNTER` should use the same correct-result definition as streak badges: `EXACT_SCORE`, `WINNER_AND_GOAL_DIFF`, or `WINNER_OR_DRAW`. A user who scores only through `ONE_TEAM_GOALS` did not correctly call the zebra outcome and should not receive the badge.

Alternative considered: keep the current `tier !== TOTAL_MISS` rule. Rejected because it would let a partial-goal hit count as calling an upset.

### 6. Gate pre-lock display to avoid influencing open predictions

Before lock, social odds should be visible to authenticated users only after they have submitted a prediction for that match. Locked and finished matches can show the frozen snapshot to users who can view the match.

Alternative considered: always show odds on open matches. Rejected because it encourages herd behavior and can distort the exact signal the feature is trying to measure.

## Risks / Trade-offs

- [Small sample creates silly zebras] -> Keep the 30% threshold: with very few players, a one-person pick usually remains too large a share to qualify unless there are enough different votes.
- [Users feel odds changed after they predicted] -> Freeze at lock and show `capturedAt`/lock-state copy where detail is needed.
- [Prediction repairs or admin backfills change historical data] -> Badge decisions use the persisted lock snapshot, not fresh aggregation.
- [Global odds feel less social than league odds] -> Keep per-league odds as a future enhancement after the canonical badge metric is stable.
- [The word "odds" sounds like gambling] -> UI copy should prefer "tendencia do bolao", "consenso" or "palpites da galera" rather than betting language.
- [Snapshot creation fails during lock] -> Make snapshot creation idempotent and recoverable through a backfill/operator command before result scoring.

## Migration Plan

1. Add the social odds snapshot table and migrations.
2. Backfill snapshots for already locked/finished seeded/demo matches where predictions exist.
3. Deploy backend support for snapshot creation and DTO exposure.
4. Deploy frontend display behind the new DTO fields with empty/low-sample states.
5. Refine `ZEBRA_HUNTER` logic and tests after snapshots are available to scoring/badge evaluation.
6. If rollback is needed, stop rendering social odds and publish `isZebraMatch: false`; preserve snapshot rows for audit unless data cleanup is explicitly required.

## Open Questions

- Should the UI say "Consenso do bolao", "Tendencia da galera", or another product term?
- Should the 30% threshold stay fixed during beta, or become league/operator configurable later?
- Should public/unauthenticated match views ever show locked social odds, or keep this as an authenticated social feature?
