## 1. Backend Catalog And Scoring

- [x] 1.1 Add failing catalog/scoring tests for eight outright markets, `BEST_GOALKEEPER`, 670 outright points, and 3270 theoretical maximum.
- [x] 1.2 Add `BEST_GOALKEEPER` to the outright market codes and market catalog with label `Melhor Goleiro`, 70 points, `PLAYER` option type, and single-selection rules.
- [x] 1.3 Update scoring constants and backend expectations that derive from total outright points.
- [x] 1.4 Add goalkeeper market options to the current player option catalog with source tier, featured flags, team labels, and stable sort order.
- [x] 1.5 Verify seeding creates or updates the market/options idempotently without deleting existing prediction-facing player options.

## 2. Frontend Experience

- [x] 2.1 Add failing frontend scoring-reference tests for the new market, 670 outright points, and 3270 theoretical maximum.
- [x] 2.2 Update shared scoring-reference data and scoring page copy to include `Melhor Goleiro` and the Golden Glove resolution rule.
- [ ] 2.3 Verify `/outrights` renders the goalkeeper market through the existing player-card featured/search/selected-pinning behavior.
- [x] 2.4 Update any route, smoke, or selector expectations that assume exactly seven outright markets.

## 3. Operations And Documentation

- [x] 3.1 Update the launch runbook with `BEST_GOALKEEPER` resolution guidance and example command.
- [x] 3.2 Document hosted rollout order: deploy, run seed, verify market count/options, and only then invite users to fill the new market.
- [x] 3.3 Document rollback guidance for the new market before and after user selections exist.

## 4. Verification

- [ ] 4.1 Run backend unit/integration tests covering outrights and scoring.
- [x] 4.2 Run frontend unit tests covering scoring reference and player option state.
- [ ] 4.3 Smoke test `/outrights` on desktop and mobile enough to confirm the new player market appears and search works.
- [x] 4.4 Run OpenSpec validation for `add-best-goalkeeper-outright`.
