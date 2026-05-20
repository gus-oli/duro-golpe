## Context

The repository already contains substantial backend logic for authentication, predictions, leagues, scoring, badges, mural, and WebSocket delivery, but the product is not launch-ready because the core user journey is not wired end to end. The most severe problems are mismatched frontend/backend contracts for match and outright data, incomplete outright lifecycle support, missing launch bootstrap/release hardening, and outdated assumptions around the 2026 tournament shape.

This change is cross-cutting:
- It modifies the core prediction journey used by matches, scoring, and leagues.
- It changes the launch outright catalog and the scoring maximum.
- It requires data model changes for `Finalistas`.
- It narrows the release slice by explicitly deferring push notifications and full PWA packaging from the day-one launch target.

Primary stakeholders:
- Product: wants a shippable v1 now
- Engineering: needs a smaller, coherent release slice
- Operations: needs deterministic seed/bootstrap and environment setup

## Goals / Non-Goals

**Goals:**
- Make the launch-critical journey work end to end: register, browse matches, submit prediction, join league, see totals/rankings update.
- Replace the old outright catalog with the approved 7-market launch catalog and a 3200-point total ceiling.
- Support `Finalistas` as a two-team all-or-nothing market without relying on fragile synthetic options.
- Ensure outright points are actually resolved, aggregated, and visible in totals/rankings.
- Align tournament assumptions, seeds, and docs with 48 teams and 104 matches.
- Keep TDD as a central delivery rule so launch-critical behavior is captured by failing automated checks before implementation and verified green before release.
- Establish a release gate with green typecheck/build, runnable seed/bootstrap, complete env docs, and smoke coverage for the launch slice.

**Non-Goals:**
- Full push notification delivery for goal events in v1 launch.
- Full PWA packaging or app-store-grade installability in v1 launch.
- New social features beyond stabilizing what already exists.
- A generalized admin back office for tournament operations.

## Decisions

### 1. Ship a narrower v1 launch slice instead of forcing every planned feature into day one

We will treat push notifications and full PWA packaging as post-launch work. Launch readiness focuses on the functional web product that supports predictions, leagues, outrights, and live updates in-browser.

Why:
- The codebase already has multiple release blockers in the core flow.
- Shipping a stable web experience is more valuable than preserving all aspirational launch requirements.

Alternatives considered:
- Keep the original launch scope intact. Rejected because it would delay launch and mix critical blockers with unfinished nice-to-have work.
- Remove real-time from launch. Rejected because live updates are central to the product value and the WebSocket foundation already exists.

### 2. Standardize match payloads in the backend and make the frontend consume enriched DTOs

Match list and match detail responses will be generated from shared backend DTO builders that join the required team metadata and expose the fields the UI actually renders.

Why:
- The frontend currently expects `homeTeam` and `awayTeam` objects that the backend does not return.
- Fixing this at the backend contract layer prevents multiple ad hoc client fetch paths and keeps SSR pages simple.

Alternatives considered:
- Stitch team data client-side with additional requests. Rejected because it increases latency and multiplies contract complexity.
- Introduce a separate BFF service. Rejected as too heavy for the current monorepo and launch timeline.

### 3. Keep match prediction flow centered on the match detail page and wire the existing form to real API calls

The existing `PredictionInput` component remains the user entry point, but it must receive an explicit submit handler and operate against the real prediction endpoints. Success state must only reflect persisted writes.

Why:
- The current client component can show a success message without saving anything.
- This is the highest-risk user-visible bug in the launch flow.

Alternatives considered:
- Move prediction submission to a new dedicated page. Rejected because it increases scope and duplicates UI.

### 4. Replace single-option outright predictions with a parent/child selection model

We will remodel outright predictions to support markets with one or more required selections:
- `outright_predictions` becomes the prediction header
- `outright_prediction_selections` stores one or more option selections per prediction
- market metadata defines allowed cardinality

`Finalistas` will require exactly two team selections and scoring remains all-or-nothing.

Why:
- The current schema only supports one `optionId` per market prediction.
- Synthetic pair options for all finalist combinations would be brittle, noisy, and hard to operate with 48 teams.

Alternatives considered:
- Store `Finalistas` as a single synthetic combined option. Rejected because it explodes option count and couples selection UX to precomputed combinations.
- Store selected team IDs as JSON on the prediction row. Rejected because it weakens relational integrity and complicates joins and validation.

### 5. Introduce a result model for outright resolution instead of encoding everything in a single winning option

We will model outright outcomes as explicit resolved selections per market, allowing one or many winning entries depending on the market:
- single winner for `Campeão`, `Artilheiro`, `Bola de Ouro`, `Revelação`, `Melhor Ataque`, `Lanterna`
- two winners for `Finalistas`

Resolution logic compares prediction selections against resolved selections according to market rules.

Why:
- `Finalistas` cannot be expressed correctly with a single `result_option_id`.
- This keeps the resolution path consistent across single-select and multi-select markets.

Alternatives considered:
- Keep a single `result_option_id` and special-case `Finalistas` elsewhere. Rejected because it creates an inconsistent model and leaks market-specific exceptions across the codebase.

### 6. Treat outright resolution as an explicit processing pipeline that feeds scoring aggregation

Outrights will follow the same operational philosophy as match results:
1. market is resolved with official outcome data
2. outright scores are calculated for affected users
3. user totals are recomputed
4. ranking/score events are published

Why:
- Today outright points never enter `user_totals`.
- Launch requires totals and rankings to reflect both match and outright scoring.

Alternatives considered:
- Recompute outright points inline on every read. Rejected because it makes totals/rankings more expensive and undermines the current denormalized scoring design.

### 7. Use official FIFA sources for award and standings-based outright resolution

Resolution authority for launch markets:
- `Bola de Ouro`: official FIFA Golden Ball winner
- `Revelação`: official FIFA breakthrough/revelation-style award source selected by product/ops
- `Melhor Ataque`: highest goals scored; tiebreaker is best official final tournament standing published by FIFA

Why:
- These rules remove ambiguity and reduce disputes.

Alternatives considered:
- Community/media award sources. Rejected because they are less canonical and harder to defend.

### 8. Publish explicit match events and use Redis pattern subscriptions consistently

The live pipeline will publish explicit event names such as:
- `match:status:changed`
- `match:score:live`
- `match:result:confirmed`

Redis subscribers for live match broadcasting will use pattern subscriptions rather than literal wildcard strings.

Why:
- The current setup does not close the loop between webhook/lock updates and the UI listeners.
- Consistent event naming simplifies debugging and frontend subscription logic.

Alternatives considered:
- Polling for match state. Rejected because it weakens the live product experience and duplicates work already invested in WebSocket infrastructure.

### 9. Treat launch readiness as a release gate, not a best-effort checklist

The change is only complete when these release conditions hold:
- typecheck/build are green
- env contract is complete and documented
- migrations and seed are runnable in one deterministic flow
- smoke scenarios for the launch slice pass

Why:
- The project currently marks several tasks complete while relying on stubs or failing typechecks.

Alternatives considered:
- Preserve the current “implemented enough” status and ship. Rejected because it would create a fragile and misleading launch.

### 10. Treat TDD as a delivery constraint for launch-critical work

Implementation will follow a test-first approach for the critical launch slice wherever automation is practical:
- define or refresh failing tests for broken contracts and core flows first
- implement against those tests
- keep the release gate dependent on green results

Why:
- The project already contains places where "implemented" status drifted away from verified behavior.
- Launch readiness depends on confidence in regressions, not just manual optimism.

Alternatives considered:
- Add tests after implementation. Rejected because it recreates the current mismatch between perceived completion and verified behavior.

## Risks / Trade-offs

- [Outright schema migration is larger than a UI-only fix] → Mitigation: keep the redesign limited to prediction selections and market results, and reset prelaunch outright data if needed.
- [Changing the outright catalog affects multiple specs and constants] → Mitigation: centralize the new catalog and total ceiling in one backend source of truth, then propagate to UI/tests/docs.
- [Deferring push notifications may reduce perceived completeness] → Mitigation: make the launch scope explicit and preserve the requirement as a future change instead of shipping a broken implementation.
- [Provider data for 2026 tournament structure may evolve] → Mitigation: remove hard-coded 32-team assumptions and keep seeding/validation driven by provider data plus explicit sanity checks.
- [Official award resolution may still require manual operations] → Mitigation: design the resolution path so results can be loaded manually or scripted without needing a full admin system.

## Migration Plan

1. Update outright schema to support multi-selection predictions and multi-selection market results.
2. Update market seed definitions to the 7-market launch catalog and 3200-point maximum.
3. Reset or backfill prelaunch outright data as needed. Because the product is not live yet, data reset is acceptable and preferred over fragile migration logic.
4. Update score aggregation to include outright points.
5. Update frontend contracts for matches and outrights.
6. Enable release gate checks: typecheck, build, seed/bootstrap, smoke scenarios.
7. Roll out to production with a fresh seed/bootstrap flow.

Rollback strategy:
- Restore the previous application release and database schema backup if migration fails before launch.
- If rollout fails after deploy but before public launch, re-run seed/bootstrap against the previous schema/catalog and roll the app back.

## Open Questions

- Which exact official FIFA artifact or page will be treated as the authority for `Revelação` if the tournament branding differs from prior editions?
- Will outright resolution be triggered manually by operators, by scripts, or by a protected internal endpoint in v1?
- Do we want to allow editing outright selections until lock, or is single-submit behavior acceptable for launch? The current implementation behaves as single-submit.
- Should the launch smoke suite include a lightweight production-like environment run, or only local/containerized verification?
