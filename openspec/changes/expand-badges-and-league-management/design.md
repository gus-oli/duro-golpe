## Context

The badge system already has a catalog table, a `user_badges` award table, a Redis-driven `badge.evaluate` event, and a registry of independent badge rules. The scoring aggregator publishes badge evaluation context after recomputing user totals, and the frontend already renders generic badge grids and `badge:awarded` toasts.

Leagues already record `createdBy`, and league-scoped membership and mural data reference `leagues.id` with `onDelete: cascade`. Match predictions, match scores, outright selections, user totals, and user badges are user/tournament data rather than league-owned data.

This change extends those existing surfaces instead of introducing a new gamification subsystem or a league administration model.

## Goals / Non-Goals

**Goals:**

- Add six one-time scoring badges that are awarded by the existing badge evaluator.
- Keep award writes idempotent through the existing `(user_id, badge_type)` uniqueness model.
- Extend the badge evaluation context only with aggregate fields needed by the new rules.
- Preserve the current WebSocket toast and ranking badge display behavior for all new badges.
- Add owner-only league deletion with explicit frontend confirmation.
- Delete only league-owned data when a league is deleted.

**Non-Goals:**

- Do not redesign `user_badges` into a generic progress table.
- Do not implement new zebra/underdog classification in this change.
- Do not revoke previously awarded badges when results are amended.
- Do not delete user predictions, scores, outright selections, accounts, or badges when a league is deleted.
- Do not add transfer-of-ownership or league admin roles.

## Decisions

### Badge expansion reuses the existing registry

Each new badge will be implemented as a `BadgeRule` and registered in `BADGE_REGISTRY`. This matches the existing `O_MESTRE`, `PE_FRIO`, and `ZEBRA_HUNTER` pattern and keeps each rule independently testable.

Alternative considered: move all badge rules into a database-driven expression system. That would be more flexible later, but it is unnecessary for six deterministic rules and would add runtime complexity before the product needs it.

### Use aggregate scoring context instead of per-rule database fan-out

The aggregator should enrich `BadgeEvaluationContext` with fields that the new rules need after `recomputeUserTotal(userId)` completes:

- `exactScoreCount`
- `winnerGoalDiffCount`
- `matchPoints`
- `positiveMatchScoreCount`
- `previousConsecutiveIncorrect`

Rules then evaluate against the context and perform only their award insert/update. This avoids each rule running its own count query and keeps the badge evaluator simple.

Alternative considered: let every badge rule query the database directly. That is simpler locally for one rule but creates duplicated queries as the catalog grows.

### Define recovery from cold streak chronologically

`VOLTA_POR_CIMA` is awarded when the current scored match is a correct result and the immediately preceding non-superseded scored matches for that user, ordered by kickoff time before the current match, contain at least three consecutive `TOTAL_MISS` rows.

The aggregator must calculate `previousConsecutiveIncorrect` relative to the current match, not from the post-update global latest streak, because a correct current result breaks the visible incorrect streak.

Alternative considered: infer recovery from the post-update `consecutiveIncorrect` value. That would not work because the value becomes zero after the recovery match.

### Keep badges one-time in this package

All six new badges are one-time achievements. `zebraCount` remains special to `ZEBRA_HUNTER`; the new badges return `zebraCount: null` in public responses and ranking payloads.

Alternative considered: rename `zebraCount` to a generic progress count. That would be cleaner long-term, but it requires a migration and API compatibility decision that this package does not need.

### League deletion is a hard delete owned by the creator

`DELETE /api/v1/leagues/:leagueId` should delete the league only when the authenticated user equals `leagues.createdBy`. PostgreSQL cascades remove `league_memberships` and `mural_posts`; non-league-owned data remains.

Alternative considered: soft delete with an `is_deleted` flag. That would make undo/audit easier, but the current beta need is removing abandoned/test leagues, and soft delete would require filtering every league query.

### Frontend deletion uses a protected proxy and explicit confirmation

The frontend should call a Next route handler such as `DELETE /api/leagues/:leagueId`, which forwards the request with the auth cookie token and uses the existing untrusted-mutation rejection pattern. The league page should show the destructive action only to the creator and require explicit confirmation before deleting.

Alternative considered: call the backend directly from the browser. Existing league mutations use proxy routes, so keeping that pattern preserves CSRF and origin checks.

## Risks / Trade-offs

- [Risk] Badge awards can occur during result amendment processing and are not revoked later. -> Mitigation: keep this consistent with current badge semantics and document badges as one-way achievements.
- [Risk] Recovery badge calculation can be wrong if it relies on processing order instead of kickoff order. -> Mitigation: compute `previousConsecutiveIncorrect` using match kickoff ordering around the current match.
- [Risk] Adding many badges can clutter the compact ranking row. -> Mitigation: keep using the existing badge grid and verify wrapping/truncation with the expanded catalog.
- [Risk] Hard deleting a league surprises users if they expect recoverability. -> Mitigation: restrict to the creator, use explicit confirmation, and state that members/mural are removed while personal scores remain.
- [Risk] Open WebSocket clients may still be viewing a deleted league. -> Mitigation: no realtime deletion event is required for this change; subsequent fetches return not found or access denied and the deleting user is redirected to `/leagues`.

## Migration Plan

No database schema migration is expected. Deploy steps:

1. Deploy backend code that can seed and evaluate the expanded badge catalog.
2. Run the existing badge seed/bootstrap flow to upsert the six new badge rows.
3. Deploy frontend code with icon mappings and league deletion UI.
4. Existing users receive new badges only when future scoring evaluations meet the criteria; no retroactive backfill is included.

Rollback:

- Revert rule registration and frontend icon/UI additions if needed.
- The seeded badge catalog rows may remain harmlessly unused, or be removed manually if the rollback policy requires it.
- League deletion has no automatic rollback after a successful delete.

## Open Questions

- Should any of the new badges be backfilled for already-scored beta data later, or remain forward-only for launch simplicity?
- Should the confirmation require typing the league name, or is a modal confirmation enough for beta?
