## 1. Data Model and Catalog Foundation

- [x] 1.1 Add or refresh failing tests for outright catalog, 3200-point ceiling, and 48-team tournament assumptions before changing implementation
- [x] 1.2 Replace the old outright catalog constants and seed definitions with the 7-market launch catalog totaling 600 points
- [x] 1.3 Update shared scoring constants and references from a 3130-point maximum to a 3200-point maximum
- [x] 1.4 Remove hard-coded 32-team assumptions from seed and validation logic and align tournament ingestion with 48 teams and 104 matches
- [x] 1.5 Redesign outright prediction persistence to support one-or-many selections per market, including exactly two selections for `Finalistas`
- [x] 1.6 Add outright market result persistence that supports both single-winner and multi-winner resolution
- [x] 1.7 Generate and verify the database migrations needed for the outright model changes

## 2. Core Match and Auth Journey

- [x] 2.1 Add or refresh failing tests for enriched match payloads, prediction persistence, and auth onboarding before implementation
- [x] 2.2 Implement shared backend DTO builders for enriched match list and match detail payloads with team metadata required by the web UI
- [x] 2.3 Update match list and match detail routes to return the enriched match contract used by the frontend
- [x] 2.4 Add the missing frontend registration flow and ensure launch onboarding works with email/password auth
- [x] 2.5 Wire the existing prediction form to real create/update prediction API calls from the match detail page
- [x] 2.6 Ensure prediction success and error states reflect persisted backend responses instead of optimistic local-only state

## 3. Outright Submission and Resolution

- [x] 3.1 Add or refresh failing tests for the 7-market outright contract, multi-selection `Finalistas`, and launch resolution rules before implementation
- [x] 3.2 Expose outright markets from the backend with options, selection cardinality, lock state, and user selection state
- [x] 3.3 Update the outrights UI to render the 7-market catalog, including the renamed `Melhor Ataque` market
- [x] 3.4 Implement `Finalistas` UX and validation for exactly two team selections before market lock
- [x] 3.5 Implement outright submit/update service logic for both single-selection and multi-selection markets
- [x] 3.6 Implement official resolution rules for `Campeao`, `Artilheiro`, `Bola de Ouro`, `Finalistas`, `Revelacao`, `Melhor Ataque`, and `Lanterna`
- [x] 3.7 Add an operator-safe resolution path for outright results so official outcomes can be recorded and scored at launch

## 4. Scoring, Totals, and Rankings

- [x] 4.1 Add or refresh failing tests for outright aggregation, total score math, ranking totals, and the approved 15-point rule before implementation
- [x] 4.2 Extend outright scoring so resolved outright points are persisted and included in user totals
- [x] 4.3 Update scoring APIs and frontend progress displays to use the 3200-point theoretical maximum
- [x] 4.4 Ensure `totalPoints = matchPoints + outrightPoints` across score responses, ranking queries, and WebSocket score updates
- [x] 4.5 Align the 15-point match scoring tier implementation with the approved rule and update the corresponding test expectations

## 5. Real-Time Event Hardening

- [x] 5.1 Add or refresh failing tests for live match event publication and consumption before implementation
- [x] 5.2 Publish explicit match status, live score, and final result events from the lock scheduler and webhook pipeline
- [x] 5.3 Replace literal wildcard Redis subscriptions with pattern subscriptions for live match event broadcasting
- [x] 5.4 Verify the frontend listeners for live score, lock state, total score, and ranking updates consume the published event payloads correctly

## 6. Release Hardening and Launch Verification

- [x] 6.1 Fix backend TypeScript errors and missing declarations so the backend typecheck passes cleanly
- [x] 6.2 Fix frontend TypeScript and Playwright typing/dependency issues so the frontend typecheck passes cleanly
- [x] 6.3 Replace stubbed critical integration tests with real coverage for predictions, outrights, webhook handling, and scoring aggregation
- [x] 6.4 Add a deterministic bootstrap flow for dependencies, migrations, match seed, outright seed, and badge seed
- [x] 6.5 Complete the runtime environment contract, including webhook, frontend redirect, and WebSocket URL configuration
- [x] 6.6 Remove or replace launch-blocking broken references tied to deferred push/PWA scope, including invalid manifest assumptions
- [ ] 6.7 Run and document launch smoke scenarios for register/login, match browsing, prediction submission, league join/ranking, outrights, and live updates
