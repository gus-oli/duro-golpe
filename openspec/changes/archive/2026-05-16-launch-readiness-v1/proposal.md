## Why

The product has substantial domain logic in place, but the core launch journey is still broken across key frontend/backend contracts, incomplete outright lifecycle support, and missing release hardening. We need a focused launch-readiness change now so the platform can be shipped with confidence for the 2026 World Cup format, including the correct assumption of 48 teams and 104 matches.

## What Changes

- Fix the end-to-end core journey so a new user can register, browse matches, submit predictions, join leagues, and see scores/rankings update correctly.
- Align match APIs and frontend pages around a single contract for match list and match detail payloads, including team metadata needed by the UI.
- Complete the outright feature for launch with the new 7-market catalog and revised scoring distribution targeting a 3200-point theoretical maximum.
- Treat TDD as a central implementation constraint for this change: critical launch flows must have failing automated tests or smoke checks defined first and only be considered complete once they are green.
- **BREAKING** Replace the old outright catalog of 8 markets with 7 markets by removing `Zebra`, renaming `Ataque + Positivo` to `Melhor Ataque`, and changing point values.
- **BREAKING** Change `Finalistas` from a single-option prediction model to a two-team all-or-nothing prediction model worth 90 points.
- Implement official resolution rules for launch outright markets, including FIFA-official award sources for `Bola de Ouro` and `Revelação`, and official tournament standings as the tiebreaker for `Melhor Ataque`.
- Wire outright resolution into total score aggregation so outright points are actually credited and reflected in rankings and progress.
- Align the product and seed assumptions with the real 2026 tournament shape: 48 teams and 104 matches.
- De-scope non-launch-critical features that are still unimplemented or unverified today, especially push notifications and full PWA packaging, so the release target matches the actual v1 slice.
- Close release blockers for environment configuration, build/type safety, seed/bootstrap flow, and launch smoke-test coverage.

## Capabilities

### New Capabilities
- `launch-readiness`: release-hardening capability covering end-to-end journey correctness, environment/bootstrap readiness, and launch smoke validation

### Modified Capabilities
- `001-copa-2026-platform`: core platform requirements change for launch-critical prediction flow, real-time behavior, onboarding completeness, and 48-team tournament alignment
- `002-social-gamification`: outright market requirements change for the 7-market launch catalog, revised point distribution, `Finalistas` two-team selection, and `Melhor Ataque` official tiebreaker
- `003-scoring-engine`: scoring requirements change for a 3200-point theoretical maximum and outright point aggregation into user totals and league rankings

## Impact

- Backend APIs for matches, predictions, outrights, scoring totals, and real-time event publishing
- Frontend pages for matches, match detail, auth onboarding, leagues, and outrights
- Outright schema, seeding, resolution, and score aggregation flows
- Environment and release configuration, including webhook/auth/frontend URL wiring and production smoke checks
- Specs, tests, and scoring references that currently assume 8 outright markets, 3130 total points, outdated tournament assumptions, or implementation without TDD discipline
