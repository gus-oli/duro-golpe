## Why

Badges already exist, but the catalog is still too small to make the ranking feel alive across normal matchdays. League creators also have no way to remove a league they created, which leaves test or abandoned private leagues stuck in the product.

## What Changes

- Add a badge pack focused on scoring behavior that can be evaluated from existing match score and user total data.
- Award the following one-time badges automatically after scoring updates:
  - `PRIMEIRA_CRAVADA`: first exact score.
  - `HAT_TRICK_EXATO`: three exact scores.
  - `REI_DO_SALDO`: five winner-plus-goal-difference results.
  - `GOL_DE_HONRA`: first positive points from match scoring.
  - `REGULARIDADE`: positive points in ten different matches.
  - `VOLTA_POR_CIMA`: a correct result immediately after a cold streak of at least three total misses.
- Keep `ZEBRA_HUNTER` unchanged for this change; broader zebra expansion waits until underdog classification is wired into the scoring context.
- Add an administrative badge backfill command that evaluates historical non-superseded match scores without sending old badge toasts.
- Let the user who created a league delete that league.
- Delete league membership and mural data with the league, while preserving user accounts, match predictions, scores, outright selections, and badges.
- Add frontend affordances for creator-only league deletion with explicit confirmation and post-delete navigation.
- No breaking API changes.

## Capabilities

### New Capabilities

- `scoring-badge-expansion`: Additional automatically awarded badges based on scoring totals, exact-score counts, goal-difference counts, positive scoring, and recovery from a cold streak.
- `league-owner-management`: Creator-owned league management behavior, including owner-only league deletion and cleanup expectations.

### Modified Capabilities

- None.

## Impact

- Backend badge catalog seed, badge rule registry, badge evaluation context, scoring aggregation queries, badge backfill command, and badge tests.
- Backend league service/routes for `DELETE /api/v1/leagues/:leagueId`, including creator authorization and cascade expectations.
- Frontend badge icon mapping and ranking/toast compatibility for the new badge types.
- Frontend league detail/list surfaces and Next proxy route for creator-only deletion.
- Integration and E2E coverage for new badge awards and league deletion authorization.
