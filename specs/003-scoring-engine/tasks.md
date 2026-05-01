# Tasks: Motor de Pontuação

**Input**: Design documents from `/specs/003-scoring-engine/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/scoring-api.md ✅ | quickstart.md ✅

**Tests**: TDD enforced — all 10 quickstart scenarios written as failing tests before implementation (Constitution Principle II: NON-NEGOTIABLE).

**Organization**: Tasks grouped by user story. This feature adds to the 001 platform — no new project setup required; all tasks extend existing `backend/src/` and `frontend/src/` trees.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1–US3)
- All paths relative to repository root

---

## Phase 1: Setup (Schema Extensions)

**Purpose**: New database tables required by all three user stories. Must be migrated before any story implementation.

- [X] T001 Create `match_results` schema in `backend/src/db/schema/match-results.ts`: id UUID PK, match_id FK → matches.id UNIQUE, home_score int NOT NULL, away_score int NOT NULL, status ('PENDING'|'CONFIRMED'|'AMENDED'|'CANCELLED') NOT NULL DEFAULT 'PENDING', confirmed_at timestamptz nullable — generate and run migration
- [X] T002 Create `match_scores` schema in `backend/src/db/schema/match-scores.ts`: id UUID PK, prediction_id FK → match_predictions.id, match_result_id FK → match_results.id, tier varchar(30) NOT NULL, points int NOT NULL, is_superseded boolean NOT NULL DEFAULT false — UNIQUE (prediction_id, match_result_id) — index on (prediction_id, is_superseded) — generate and run migration
- [X] T003 Create `user_totals` schema in `backend/src/db/schema/user-totals.ts`: id UUID PK, user_id FK → users.id UNIQUE, total_points int NOT NULL DEFAULT 0, match_points int NOT NULL DEFAULT 0, outright_points int NOT NULL DEFAULT 0, exact_score_count int NOT NULL DEFAULT 0, winner_goal_diff_count int NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now() — generate and run migration

**Checkpoint**: Three new tables exist in DB; `user_totals` row is auto-created when a user registers (via DB trigger or service hook from 001 auth).

---

## Phase 2: Foundational (Scoring Core)

**Purpose**: Pure scoring function and ScoringTier types — required by all user stories and testable independently of any DB or network.

**⚠️ CRITICAL**: This phase must be complete and GREEN before any user story implementation begins.

- [X] T004 Define `ScoringTier` enum and shared types in `backend/src/scoring/types.ts`: `ScoringTier` = EXACT_SCORE | WINNER_AND_GOAL_DIFF | WINNER_OR_DRAW | ONE_TEAM_GOALS | TOTAL_MISS; `TIER_POINTS: Record<ScoringTier, number>` = {EXACT_SCORE: 25, WINNER_AND_GOAL_DIFF: 15, WINNER_OR_DRAW: 10, ONE_TEAM_GOALS: 5, TOTAL_MISS: 0}; `MatchResultData` and `PredictionData` input types
- [X] T005 Implement `calculateTier(prediction, result): ScoringTier` pure function in `backend/src/scoring/engine.ts`: EXACT_SCORE if predicted_home === home_score && predicted_away === away_score; WINNER_AND_GOAL_DIFF if correct winner (non-draw) AND (predicted_home - predicted_away) === (home_score - away_score); WINNER_OR_DRAW if correct winner OR both predicted draw; ONE_TEAM_GOALS if either team's goals correct (but not higher tier); TOTAL_MISS otherwise — zero side effects, no DB calls, pure TypeScript

**Checkpoint**: `calculateTier` can be imported and called with any input; all branch paths reachable in unit tests.

---

## Phase 3: User Story 1 — Auto-Cálculo de Pontos (Priority: P1) 🎯 MVP

**Goal**: After a match result is confirmed, the scoring engine automatically calculates points for every prediction on that match, stores them idempotently, updates each user's running total, and publishes events for badges (002) and real-time updates (US3).

**Independent Test**: POST match result webhook → `match_results` row inserted → scoring processor runs → `match_scores` rows inserted (one per prediction) → `user_totals` updated → duplicate webhook → no duplicate `match_scores` rows.

### Tests for User Story 1 (TDD — write first, verify RED before T009)

- [X] T006 [P] [US1] Unit tests for `calculateTier()` in `backend/tests/unit/scoring/engine.test.ts`: test matrix covering all 5 tiers including boundary cases — exact score (home=2 away=1 pred=2/1 → EXACT_SCORE); correct winner + saldo (home=2 away=0 pred=3/1 → WINNER_AND_GOAL_DIFF); correct winner wrong saldo (home=2 away=0 pred=1/0 → WINNER_OR_DRAW); draw predicted draw (0/0 pred=0/0 → EXACT_SCORE); draw NOT predicted (home=1 away=1 pred=2/1 → ONE_TEAM_GOALS if one team correct, else TOTAL_MISS); WINNER_AND_GOAL_DIFF excludes draws (saldo=0 always); 15+ distinct scenarios covering all edge cases from quickstart.md
- [X] T007 [P] [US1] Integration tests for scoring processor pipeline in `backend/tests/integration/scoring-processor.test.ts`: publish `match.result.confirmed` to Redis → assert match_scores inserted with correct tier and points → assert user_totals updated → publish same event again → assert ON CONFLICT DO NOTHING (idempotent) → assert badge.evaluate published to Redis per user; testcontainers PostgreSQL + Redis

### Implementation for User Story 1

- [X] T008 [US1] Extend 001 webhook handler in `backend/src/data-providers/webhook-handler.ts`: on API-Football `match.finished` event → INSERT INTO match_results (match_id, home_score, away_score, status='CONFIRMED', confirmed_at=now()) ON CONFLICT (match_id) DO UPDATE SET home_score=EXCLUDED.home_score, away_score=EXCLUDED.away_score, status='CONFIRMED' → publish `match.result.confirmed` to Redis channel with {matchId, matchResultId, homeScore, awayScore}
- [X] T009 [US1] Scoring processor in `backend/src/scoring/processor.ts`: subscribe to Redis `match.result.confirmed`; fetch all non-superseded predictions for matchId; for each prediction call `calculateTier(prediction, result)`; INSERT INTO match_scores (prediction_id, match_result_id, tier, points) ON CONFLICT DO NOTHING; after all inserts publish `scores.updated` to Redis with {matchId, updatedUserIds[]}
- [X] T010 [US1] Streak query helper in `backend/src/scoring/streak.ts`: `getStreaks(userId): {consecutiveCorrect: number, consecutiveIncorrect: number}` — window query on match_scores JOIN match_predictions JOIN matches ordered by kickoff_time DESC; count consecutive correct (WINNER_OR_DRAW or higher tier, is_superseded=false) from most recent result until streak breaks; same for TOTAL_MISS streak
- [X] T011 [US1] Score aggregator in `backend/src/scoring/aggregator.ts`: subscribe to Redis `scores.updated`; for each updated userId → SELECT user_totals FOR UPDATE → recompute total_points = SUM(points WHERE is_superseded=false), exact_score_count, winner_goal_diff_count from match_scores JOIN predictions → UPDATE user_totals; publish `badge.evaluate` to Redis for each userId with {userId, matchId, tier, isZebraMatch, consecutiveCorrect, consecutiveIncorrect}
- [X] T012 [US1] Wire scoring processor + aggregator startup in `backend/src/server.ts`: import and start processor.subscribe() and aggregator.subscribe() on server boot; log subscription status

**Checkpoint**: Webhook delivers a match result → every prediction on that match gets a MatchScore → UserTotals update → second identical webhook produces no new rows.

---

## Phase 4: User Story 2 — Transparência do Cálculo (Priority: P2)

**Goal**: Users can see an itemised breakdown of points per match — which tier was awarded, why, and the total so far.

**Independent Test**: GET /api/v1/users/:userId/scores/matches → returns match list with tier, points, predicted scores, and actual scores for each finished match.

### Tests for User Story 2 (TDD — write first, verify RED before T014)

- [X] T013 [P] [US2] Integration tests for score breakdown endpoints in `backend/tests/integration/score-routes.test.ts`: GET /users/:id/score → UserTotal fields present; GET /users/:id/scores/matches → array with tier + points + predicted vs actual per match; GET /matches/:matchId/score-summary → all users' tiers for that match (league context); auth required on all; non-member match summary → 403; testcontainers PostgreSQL

### Implementation for User Story 2

- [X] T014 [US2] Score routes in `backend/src/scoring/routes.ts`: `GET /api/v1/users/:userId/score` → UserTotal record (total_points, match_points, outright_points, exact_score_count, winner_goal_diff_count); `GET /api/v1/users/:userId/scores/matches` → match_scores JOIN predictions JOIN matches with tier, points, predicted_home, predicted_away, actual_home, actual_away per finished match; `GET /api/v1/matches/:matchId/score-summary` → aggregate tier distribution for a match (league members only); auth required on all
- [X] T015 [P] [US2] ScoreBreakdown component in `frontend/src/components/Scoring/ScoreBreakdown.tsx`: Client Component; displays match row with team names, predicted score, actual score, tier badge (color-coded), and points earned; tier labels in PT-BR (Placar Exato, Vencedor+Saldo, Vencedor/Empate, Gols Parciais, Erro Total)
- [X] T016 [US2] Extend match detail page `frontend/src/app/matches/[matchId]/page.tsx`: when match status = FINISHED, fetch user's MatchScore and render ScoreBreakdown below the prediction form; show "Aguardando resultado" placeholder when LIVE

**Checkpoint**: User visits a finished match page and sees their prediction, the actual result, the tier awarded, and the points earned with a PT-BR tier label.

---

## Phase 5: User Story 3 — Total em Tempo Real e Progresso (Priority: P3)

**Goal**: Users see their running total update in real-time after each match result; league ranking reflects updated totals immediately; tiebreaker ordering (exact_score_count → winner_goal_diff_count → alphabetical) applied.

**Independent Test**: Match result processed → WebSocket `score:total:updated` event received by connected user → total displayed increases → league ranking re-orders correctly by tiebreaker when two users have equal total_points.

### Tests for User Story 3 (TDD — write first, verify RED before T018)

- [X] T017 [P] [US3] Integration test for ranking tiebreaker in `backend/tests/integration/ranking.test.ts`: create two users with equal total_points but different exact_score_count → GET /leagues/:id/ranking → user with higher exact_score_count ranked first; tie on exact_score_count → winner_goal_diff_count decides; full tie → alphabetical by display_name; testcontainers PostgreSQL
- [X] T018 [P] [US3] Playwright e2e for real-time total update in `frontend/tests/e2e/score-update.spec.ts`: connect to match page → server emits `score:total:updated` → TotalScore component displays new total without page reload

### Implementation for User Story 3

- [X] T019 [US3] Score broadcaster in `backend/src/scoring/broadcaster.ts`: subscribe to Redis `scores.updated`; for each updated userId → get UserTotal from DB → emit `score:match:updated` via WebSocket to that specific user session; emit `score:total:updated` to user session; emit `ranking:updated` to all members of leagues the user belongs to
- [X] T020 [US3] Update league ranking query in `backend/src/leagues/ranking.ts`: ORDER BY ut.total_points DESC, ut.exact_score_count DESC, ut.winner_goal_diff_count DESC, u.display_name ASC; JOIN user_totals on user_id; return tiebreaker counts in response
- [X] T021 [P] [US3] TotalScore component in `frontend/src/components/Scoring/TotalScore.tsx`: Client Component; shows total_points as large number + progress bar (total_points / 3130 * 100%); exact_score_count + winner_goal_diff_count as secondary stats; subscribes to `score:total:updated` via useWebSocket; animates count-up on update
- [X] T022 [P] [US3] Extend league ranking page `frontend/src/app/leagues/[leagueId]/page.tsx`: add TotalScore mini-display per member row; subscribe to `ranking:updated` WebSocket event and refetch ranking; show tiebreaker counts (Exatos: N) visible in PT-BR

**Checkpoint**: Two browser tabs on league ranking — match result fires → both tabs re-order ranking within seconds; tiebreaker columns visible.

---

## Phase 6: Polish & Data Integrity

**Purpose**: Amendment and cancellation handling, full pipeline validation.

- [X] T023 [P] Handle match result amendment in `backend/src/scoring/processor.ts`: subscribe to `match.result.amended` Redis event; mark all existing match_scores for the match as is_superseded=true; INSERT new match_scores with updated tier/points; re-run aggregator; publish scores.updated; integration test in `backend/tests/integration/scoring-amendment.test.ts`: confirm initial score → amend result → user_totals updated correctly → old scores superseded
- [X] T024 [P] Handle match result cancellation in `backend/src/scoring/processor.ts`: on `match.result.cancelled` → mark all match_scores is_superseded=true → recompute UserTotal (net zero for that match) → publish scores.updated; integration test covers "score was 25 → cancelled → user_totals restored to pre-match value"
- [X] T025 Run all 10 quickstart.md integration scenarios end-to-end: each of the 5 tiers, amendment, cancellation, idempotency, concurrency (two parallel processings of same event), full badge.evaluate publishing; document results; fix any failure before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — BLOCKS all user stories
- **US1 Phase 3**: Requires Phase 2; depends on 001 predictions + webhook handler existing
- **US2 Phase 4**: Requires Phase 3 complete (match_scores must be populated to query)
- **US3 Phase 5**: Requires Phase 3 complete (user_totals must be populated); can start in parallel with US2
- **Polish (Phase 6)**: Requires all user stories complete

### User Story Dependencies

- **US1 (Auto-Cálculo)**: Core engine — everything else depends on match_scores being populated
- **US2 (Transparência)**: Depends on US1 (reads match_scores); independently testable with seeded data
- **US3 (Total em Tempo Real)**: Depends on US1 (reads user_totals); can progress in parallel with US2 after US1 is complete

### Within Each User Story

1. Write tests → verify RED
2. Types/schema → pure functions → processor → aggregator
3. Routes → frontend components → page integration
4. Verify checkpoint independently before next story

---

## Parallel Execution Examples

### Phase 1 Parallel Opportunities

```bash
# Run in parallel (different schema files):
T002: match_scores schema
T003: user_totals schema
# T001 (match_results) must come first — match_scores has FK to it
```

### Phase 3 (US1) Parallel Opportunities

```bash
# Write both test suites in parallel:
T006: engine.test.ts (unit)
T007: scoring-processor.test.ts (integration)

# After T005 is GREEN, processor + streak can start in parallel:
T009: processor.ts
T010: streak.ts
```

### Phase 4 + Phase 5 in Parallel (after US1 complete)

```bash
Dev A → Phase 4 (US2: Score routes + ScoreBreakdown + match detail)
Dev B → Phase 5 (US3: Broadcaster + TotalScore + ranking update)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

The scoring engine has no UI value until scores are calculated. US1 is the entire foundation:

1. Phase 1: Schema setup (3 migrations)
2. Phase 2: calculateTier() pure function (testable immediately)
3. Phase 3: Processor + Aggregator pipeline
4. **STOP and VALIDATE**: Trigger a webhook → verify match_scores and user_totals correct → verify idempotency
5. Users on 001 platform now accumulate points from match results

### Incremental Delivery

| Milestone | Phases | What Users Get |
|-----------|--------|----------------|
| Core Engine | 1–3 | Points calculated automatically after each match |
| Transparent | 1–4 | + Per-match breakdown visible on match page |
| Real-time | 1–5 | + Live total update + ranking tiebreaker |
| Complete | 1–6 | + Amendment/cancellation handling |

### Integration with Features 001 and 002

- **001**: Match predictions (source data) + WebSocket infrastructure (used by broadcaster)
- **002**: badge.evaluate events published by this engine after each MatchScore (002's BadgeEvaluator subscribes)
- **Deployment order**: 001 → 003 → 002 (badges depend on scoring events)

---

## Task Count Summary

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Phase 1: Setup (Schema) | 3 | 2 |
| Phase 2: Foundational (Engine) | 2 | 0 |
| Phase 3: US1 Auto-Cálculo | 7 | 2 |
| Phase 4: US2 Transparência | 4 | 2 |
| Phase 5: US3 Real-time | 6 | 4 |
| Phase 6: Polish | 3 | 2 |
| **Total** | **25** | **12** |

---

## Notes

- `[P]` = safe to run in parallel (different files, no in-flight dependencies)
- `[USN]` label maps task to user story for traceability
- TDD: T006 and T007 **must** be observed FAILING before T008–T012 begin
- `calculateTier()` is a pure function — no DB, no network, no side effects; can be tested offline
- WINNER_AND_GOAL_DIFF (15pts) **never applies to draws** — goal difference in a draw is always 0 and there is no winner; documented assumption in spec
- `is_superseded = true` on amended/cancelled scores — UserTotal is always recomputed from non-superseded rows only
- `badge.evaluate` events published **after** aggregator commits UserTotal — ensures badge rules see consistent state
- All API labels and error messages in PT-BR per Constitution Principle III
