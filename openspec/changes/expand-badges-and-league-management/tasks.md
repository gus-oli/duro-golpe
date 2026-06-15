## 1. Badge Evaluation Context

- [x] 1.1 Extend `BadgeEvaluationContext` in `backend/src/badges/types.ts` with `exactScoreCount`, `winnerGoalDiffCount`, `matchPoints`, `positiveMatchScoreCount`, and `previousConsecutiveIncorrect`.
- [x] 1.2 Add scoring aggregation helpers to count positive non-superseded match scores and previous consecutive `TOTAL_MISS` rows before the current match by kickoff order.
- [x] 1.3 Update `backend/src/scoring/aggregator.ts` to populate the expanded badge evaluation context after `recomputeUserTotal(userId)`.
- [x] 1.4 Keep existing `O_MESTRE`, `PE_FRIO`, and `ZEBRA_HUNTER` rules compatible with the expanded context.

## 2. Badge Catalog and Rules

- [x] 2.1 Add seed rows for `PRIMEIRA_CRAVADA`, `HAT_TRICK_EXATO`, `REI_DO_SALDO`, `GOL_DE_HONRA`, `REGULARIDADE`, and `VOLTA_POR_CIMA` in `backend/src/badges/seed.ts`.
- [x] 2.2 Add pure rule utilities for the six expanded badge criteria in `backend/src/badges/badge-rule-utils.ts`.
- [x] 2.3 Implement `PRIMEIRA_CRAVADA`, `HAT_TRICK_EXATO`, and `REI_DO_SALDO` badge rule modules using idempotent `user_badges` inserts.
- [x] 2.4 Implement `GOL_DE_HONRA`, `REGULARIDADE`, and `VOLTA_POR_CIMA` badge rule modules using idempotent `user_badges` inserts.
- [x] 2.5 Register all expanded badge rules in `BADGE_REGISTRY` and ensure newly awarded expanded badges emit `badge:awarded`.
- [x] 2.6 Add unit tests for all expanded badge pure utilities and rule boundary cases.
- [x] 2.7 Add or update integration coverage for `badge.evaluate` awarding at least one expanded badge and preserving one-row idempotency.

## 3. League Deletion Backend

- [x] 3.1 Add `deleteLeague(userId, leagueId)` to `backend/src/leagues/service.ts` with `404` for missing league and `403` when `createdBy` does not match the actor.
- [x] 3.2 Add `DELETE /api/v1/leagues/:leagueId` to `backend/src/leagues/routes.ts` with auth, route param validation, and a successful deletion response.
- [x] 3.3 Add backend tests covering creator deletion, non-creator member rejection, non-member rejection, unauthenticated rejection, and missing league handling.
- [x] 3.4 Add backend test coverage or assertions that deletion removes memberships and mural posts while preserving predictions, scores, totals, outrights, users, and badges.

## 4. Frontend Badge and League UI

- [x] 4.1 Add frontend icon mappings for all expanded badge `iconKey` values in `frontend/src/components/Badges/BadgeIcon.tsx`.
- [x] 4.2 Verify `BadgeGrid` and ranking rows wrap or truncate expanded badge sets without layout breakage.
- [x] 4.3 Add `DELETE /api/leagues/[leagueId]` proxy route using the existing auth cookie forwarding and untrusted mutation rejection pattern.
- [x] 4.4 Expose `createdBy` in the league data consumed by the frontend league list/detail surfaces.
- [x] 4.5 Add a creator-only destructive delete control with explicit confirmation on the league detail or management surface.
- [x] 4.6 Redirect the creator to `/leagues` after successful deletion and show inline error feedback on failed deletion.

## 5. Verification

- [x] 5.1 Run backend badge unit tests and league deletion tests.
- [x] 5.2 Run backend typecheck.
- [x] 5.3 Run frontend typecheck.
- [x] 5.4 Run targeted frontend or E2E coverage for creator delete visibility, confirmation, and post-delete navigation.
- [x] 5.5 Manually verify or smoke test that new badges appear in ranking payloads and badge toasts use the expanded catalog metadata.

## 6. Badge Backfill

- [x] 6.1 Add a no-notification mode to `runEvaluation` so historical awards can be inserted without WebSocket toasts.
- [x] 6.2 Add a badge backfill command that loads non-superseded match scores in kickoff order and rebuilds badge context per user.
- [x] 6.3 Add `badges:backfill` npm scripts, including support for `--dry-run`.
- [x] 6.4 Add unit coverage for chronological context reconstruction and integration coverage for no-toast historical awards.
- [x] 6.5 Run targeted backfill tests and backend typecheck.
