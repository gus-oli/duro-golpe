## Why

The current provider-backed cutover path is blocked because the free API-Football plan does not expose World Cup 2026 data. The beta is already resettable, the social layer is ready to be rebuilt by real friends, and the next practical step is to load real tournament fixtures without introducing paid infrastructure pressure right now.

At the same time, the app still needs a way to keep match state moving after the seed:

- real fixtures and teams must come from a provider the operator can actually use on the free plan
- match status and scores must keep updating without relying on the old API-Football webhook path
- the operator needs a manual contingency path when delayed provider data or quota issues make automation too slow

## What Changes

- Add a new `football-data.org` v4 provider adapter for World Cup 2026 teams and fixtures, using the free `Worldcup` competition coverage instead of API-Football for the real-fixture beta path.
- Replace the current provider seed assumption with a `football-data`-backed seed flow that imports the 48 teams and 104 fixtures for `WC` season `2026` into the existing schema.
- Introduce a polling-based match sync path that updates relevant tournament matches from `football-data.org` on a quota-safe cadence and maps provider statuses into the app's local match lifecycle.
- Add a manual CLI contingency flow for operators to apply live/final match updates when provider data is delayed or unavailable, while reusing the same scoring and realtime downstream effects as automated sync.
- Update operator docs and seed-mode guidance so the hosted beta cutover path no longer depends on a paid API-Football plan to move beyond demo fixtures.

## Capabilities

### New Capabilities
- `football-data-world-cup-ingestion`: Defines provider-backed ingestion of World Cup 2026 teams and fixtures from `football-data.org`.
- `provider-result-polling`: Defines quota-aware polling of provider match updates and reconciliation into the app's local match/result pipeline.
- `manual-match-override`: Defines the CLI contingency path for operator-driven match status and result updates.

### Modified Capabilities
- `provider-backed-beta-reset`: The existing cutover flow now needs to document and support `football-data.org` as the default free provider-backed path.
- `seed-mode-separation`: Seed guidance now needs to distinguish demo seeding from `football-data` ingestion and explain the delayed-score/manual-fallback operating model.

## Impact

- Affected backend code: `backend/src/config.ts`, `backend/src/data-providers/**`, provider seed scripts, scheduler/bootstrap wiring, and CLI tooling for manual overrides.
- Affected docs and operator flow: `backend/.env.example`, `docs/launch-runbook.md`, and any local-tunnel beta docs that still assume API-Football is the real-fixture path.
- Existing local lock scheduling remains useful and should stay in place; provider sync will complement it rather than replace it.
- The API-Football webhook path may remain in the codebase temporarily, but it will no longer be the primary free beta data strategy.
