# Tasks: Gamificação Social e Mecânicas Detalhadas de Apostas

**Input**: Design documents from `/specs/002-social-gamification/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/social-api.md ✅ | quickstart.md ✅

**Tests**: TDD enforced — all 7 quickstart scenarios written as failing tests before implementation (Constitution Principle II: NON-NEGOTIABLE).

**Organization**: Tasks grouped by user story. This feature extends 001 — no new project setup required; all tasks add to existing `backend/src/` and `frontend/src/` trees.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1–US4)
- All paths relative to repository root

---

## Phase 1: Setup (Schema Extensions)

**Purpose**: New database tables required by multiple user stories. Must be migrated before any story implementation begins.

- [X] T001 Create `badges` reference table schema in `backend/src/db/schema/badges.ts`: type varchar(50) PK, label_pt, description_pt, icon_key — generate and run migration
- [X] T002 [P] Create `user_badges` schema in `backend/src/db/schema/user-badges.ts`: id UUID PK, user_id FK, badge_type FK → badges.type, awarded_at, trigger_match_id FK nullable, zebra_count int NOT NULL DEFAULT 1 — unique (user_id, badge_type) — generate and run migration
- [X] T003 [P] Create `mural_posts` schema in `backend/src/db/schema/mural-posts.ts`: id UUID PK, league_id FK, match_id FK, user_id FK, content varchar(500) NOT NULL, is_hidden boolean NOT NULL DEFAULT false, created_at — index on (league_id, match_id, created_at DESC) — generate and run migration
- [X] T004 Seed `badges` reference data in `backend/src/badges/seed.ts`: upsert O_MESTRE ("O Mestre", "Acertou o resultado de 5 partidas consecutivas", "badge-mestre"), PE_FRIO ("Pé Frio", "Errou o resultado de 5 partidas consecutivas", "badge-pe-frio"), ZEBRA_HUNTER ("Zebra Hunter", "Acertou o resultado de uma partida zebra", "badge-zebra"); call from `npm run seed`

**Checkpoint**: All three new tables exist in DB; `badges` table has 3 rows.

---

## Phase 2: Foundational (Badge Infrastructure)

**Purpose**: Shared badge types and evaluator skeleton that all badge rules depend on.

**⚠️ CRITICAL**: Phase 6 (US4) cannot begin until this phase is complete.

- [X] T005 Define shared TypeScript interfaces in `backend/src/badges/types.ts`: `BadgeEvaluationContext` (userId, matchId, tier: ScoringTier, isZebraMatch: boolean, consecutiveCorrect: number, consecutiveIncorrect: number) and `BadgeRule` (evaluate(ctx): Promise<'awarded' | 'incremented' | null>)
- [X] T006 Scaffold badge evaluator in `backend/src/badges/evaluator.ts`: empty `BADGE_REGISTRY: BadgeRule[]` array; `runEvaluation(ctx: BadgeEvaluationContext)` loops registry calling each rule; subscribe to Redis channel `badge.evaluate`; parse payload into BadgeEvaluationContext; emit `badge:awarded` WebSocket event to user on award

**Checkpoint**: Evaluator skeleton subscribes to Redis and calls an empty registry without errors.

---

## Phase 3: User Story 1 — Match Cards com Lock UI (Priority: P1) 🎯 MVP

**Goal**: Match Card inputs disable and a lock indicator appears when the server pushes `match:status:changed {status: "LOCKED"}` via WebSocket — no page reload required.

**Independent Test**: Open match page in browser → server emits `match:status:changed {status: "LOCKED"}` → inputs become disabled + lock indicator visible + submit button hidden — all without navigation.

### Tests for User Story 1 (TDD — write first, verify RED before T009)

- [X] T007 [US1] Playwright e2e test in `frontend/tests/e2e/match-card-lock.spec.ts`: open match detail page as authenticated user → mock server sends `match:status:changed {status: "LOCKED"}` → assert PredictionInput inputs are disabled → assert submit button not visible → assert lock indicator text present → assert no page navigation occurred

### Implementation for User Story 1

- [X] T008 [P] [US1] LockOverlay component in `frontend/src/components/MatchCard/LockOverlay.tsx`: accepts `isLocked: boolean`; when true renders padlock icon + PT-BR label "Palpites encerrados" as an overlay; when false renders nothing; minimum 48px touch clearance around parent
- [X] T009 [P] [US1] Update PredictionInput component in `frontend/src/components/MatchCard/PredictionInput.tsx`: add `locked: boolean` prop; when true disable both number inputs and hide submit button via conditional className; do NOT remove from DOM (preserve a11y)
- [X] T010 [US1] Wire `match:status:changed` to lock state in `frontend/src/app/matches/[matchId]/page.tsx`: import `useWebSocket` hook from 001; on receiving event with `status: "LOCKED"` set local `isLocked` state to true; pass `isLocked` to `PredictionInput` + `LockOverlay`; no additional server fetch

**Checkpoint**: Match detail page shows prediction form; a simulated WebSocket lock event disables inputs and shows overlay without refreshing.

---

## Phase 4: User Story 2 — Outrights: 8 Categorias com Valores (Priority: P2)

**Goal**: Exactly 8 outright markets are seeded with correct point values; FINALISTS market enforces all-or-nothing scoring; all markets visible with point values in the UI.

**Independent Test**: GET /api/v1/outrights → exactly 8 markets, correct point values per market → FINALISTS service logic returns 0pts if only one finalist correct → 70pts if both correct.

### Tests for User Story 2 (TDD — write first, verify RED before T012)

- [X] T011 [P] [US2] Integration test in `backend/tests/integration/outrights-seed.test.ts`: GET /api/v1/outrights returns exactly 8 markets; assert each market name and point_value (Campeão 100, Artilheiro 80, Bola de Ouro 80, Finalistas 70, Zebra 60, Revelação 50, Ataque+Positivo 50, Lanterna 40); assert FINALISTS with one correct team = 0pts; assert FINALISTS with both correct = 70pts; testcontainers PostgreSQL

### Implementation for User Story 2

- [X] T012 [US2] Complete outright seed in `backend/src/outrights/seed.ts`: upsert all 8 markets with exact point values — Campeão 100, Artilheiro 80, Bola de Ouro 80, Finalistas 70, Zebra 60, Revelação 50, Ataque+Positivo 50, Lanterna 40; FINALISTS description notes "ambos os finalistas corretos ou 0 pontos"
- [X] T013 [US2] FINALISTS scoring validation in `backend/src/outrights/service.ts`: add `validateFinalistsPrediction(predicted: string[], actual: string[]): boolean` — returns true only if both team IDs match regardless of order; used by scoring engine (003) via outright result processing
- [X] T014 [P] [US2] OutrightCard component in `frontend/src/components/OutrightCard/OutrightCard.tsx`: display point_value as a prominent badge (e.g., "100 pts"); show description for FINALISTS market; locked state renders disabled overlay with "Mercado encerrado" label; all touch targets ≥ 48px

**Checkpoint**: GET /api/v1/outrights returns 8 markets with correct point values; OutrightCard displays point badge; FINALISTS validates both teams.

---

## Phase 5: User Story 3 — Mural de Resenha (Priority: P3)

**Goal**: Each league has an isolated per-match comment feed; posts broadcast in real-time (≤5s) to all league members currently viewing; non-members receive 403.

**Independent Test**: User A in League 1 posts "Vai Brasil!" → User B (also in League 1) sees the post within 5 seconds without refreshing → User B opens League 2 mural for same match → feed is empty → User C (not in League 1) GET mural → 403.

### Tests for User Story 3 (TDD — write first, verify RED before T017)

- [X] T015 [P] [US3] Integration test for mural isolation + membership in `backend/tests/integration/mural.test.ts`: POST to league1 mural → 201; GET league1 mural → post visible; GET league2 mural for same match → empty; non-member GET → 403; non-member POST → 403; empty content POST → 400; content > 500 chars POST → 400; testcontainers PostgreSQL + Redis
- [X] T016 [P] [US3] Playwright e2e for mural real-time in `frontend/tests/e2e/mural-realtime.spec.ts`: open two browser contexts (User A + User B, same league + match) → User A POSTs comment → assert User B's feed shows comment within 5 seconds without page navigation

### Implementation for User Story 3

- [X] T017 [US3] Mural service in `backend/src/mural/service.ts`: `createPost(userId, leagueId, matchId, content)` — validate league membership (403), validate content length 1–500 chars (400), insert mural_posts record, publish to Redis channel `mural:{leagueId}:{matchId}`; `getPosts(userId, leagueId, matchId, limit, before)` — validate membership (403), SELECT ordered by created_at DESC with cursor pagination
- [X] T018 [US3] Mural broadcaster in `backend/src/mural/broadcaster.ts`: subscribe to Redis pattern `mural:*:*`; on message parse leagueId + matchId from channel key; emit `mural:post:new` WebSocket event (with full post payload) to all WS sessions subscribed to that (leagueId, matchId) pair
- [X] T019 [US3] Mural routes in `backend/src/mural/routes.ts`: `GET /api/v1/leagues/:leagueId/matches/:matchId/mural` → 200 with posts array; `POST /api/v1/leagues/:leagueId/matches/:matchId/mural` → 201 with created post; auth middleware on both; wire to mural service
- [X] T020 [P] [US3] MuralFeed component in `frontend/src/components/Mural/MuralFeed.tsx`: Client Component; initial posts loaded via SSR props; subscribes to `mural:post:new` via `useWebSocket`; prepends new posts to list; scroll-to-bottom on own post
- [X] T021 [P] [US3] MuralPost component in `frontend/src/components/Mural/MuralPost.tsx`: displays avatar (img with alt), display_name, content, relative time (PT-BR locale); own posts aligned right
- [X] T022 [P] [US3] MuralInput component in `frontend/src/components/Mural/MuralInput.tsx`: Client Component; textarea with 500-char counter; submit button; POST to mural API on submit; clear on success; show inline error on 400/403
- [X] T023 [US3] Mural page route in `frontend/src/app/matches/[matchId]/mural/[leagueId]/page.tsx`: RSC — fetch initial posts server-side; render MuralFeed + MuralInput; handle 403 with redirect to league page

**Checkpoint**: Two authenticated users in the same league can chat in a match mural; posts appear in real-time (≤5s); different league's mural for same match is empty.

---

## Phase 6: User Story 4 — Badges Automáticos (Priority: P4)

**Goal**: After each match result, BadgeEvaluator automatically checks and awards O Mestre, Pé Frio, and Zebra Hunter; each badge awarded at most once (idempotent); user receives a celebratory toast notification.

**Independent Test**: Simulate 5 consecutive `badge.evaluate` events with correct tiers → O_MESTRE inserted in user_badges → WebSocket `badge:awarded` event fired → re-evaluate → no duplicate → GET /api/v1/users/:id/badges → O_MESTRE present.

### Tests for User Story 4 (TDD — write first, verify RED before T029)

- [X] T024 [P] [US4] Unit tests for O Mestre rule in `backend/tests/unit/badges/o-mestre.test.ts`: consecutiveCorrect = 5 → award; consecutiveCorrect = 4 → null; tier = TOTAL_MISS → streak broken at 0; boundary: exactly 5 is first award; 10 consecutive → still awarded (idempotent via DB, returns awarded once)
- [X] T025 [P] [US4] Unit tests for Pé Frio rule in `backend/tests/unit/badges/pe-frio.test.ts`: consecutiveIncorrect = 5 → award; consecutiveIncorrect = 4 → null; any non-TOTAL_MISS tier resets streak; streak of 6 → still awarded
- [X] T026 [P] [US4] Unit tests for Zebra Hunter rule in `backend/tests/unit/badges/zebra-hunter.test.ts`: isZebraMatch = true AND tier ≠ TOTAL_MISS → award/increment; isZebraMatch = false → null; TOTAL_MISS on zebra match → null (wrong prediction); second zebra correct → increment zebra_count
- [X] T027 [P] [US4] Integration test for full badge pipeline in `backend/tests/integration/badges.test.ts`: publish `badge.evaluate` events via Redis → assert user_badges row inserted; publish duplicate event → assert ON CONFLICT DO NOTHING (no duplicate); assert badge:awarded WS event emitted; testcontainers PostgreSQL + Redis
- [X] T028 [P] [US4] Playwright e2e for badge toast in `frontend/tests/e2e/badge-award.spec.ts`: server emits `badge:awarded` → BadgeToast appears with badge name and description → auto-dismisses after 5s

### Implementation for User Story 4

- [X] T029 [P] [US4] O Mestre rule in `backend/src/badges/rules/o-mestre.ts`: implements `BadgeRule`; evaluate checks `ctx.consecutiveCorrect >= 5`; if true → `INSERT INTO user_badges (user_id, badge_type, trigger_match_id) VALUES (..., 'O_MESTRE', ...) ON CONFLICT DO NOTHING` → returns 'awarded' if inserted, null if conflict
- [X] T030 [P] [US4] Pé Frio rule in `backend/src/badges/rules/pe-frio.ts`: implements `BadgeRule`; evaluate checks `ctx.consecutiveIncorrect >= 5`; same upsert pattern with 'PE_FRIO'; returns 'awarded' or null
- [X] T031 [P] [US4] Zebra Hunter rule in `backend/src/badges/rules/zebra-hunter.ts`: implements `BadgeRule`; evaluate checks `ctx.isZebraMatch && ctx.tier !== 'TOTAL_MISS'`; first award → INSERT with zebra_count = 1; subsequent → `UPDATE user_badges SET zebra_count = zebra_count + 1 WHERE user_id = ? AND badge_type = 'ZEBRA_HUNTER'`; returns 'awarded' or 'incremented'
- [X] T032 [US4] Register all rules in evaluator in `backend/src/badges/evaluator.ts`: import and push O_MESTRE_RULE, PE_FRIO_RULE, ZEBRA_HUNTER_RULE into BADGE_REGISTRY; after each rule returns non-null → send `badge:awarded` WS event to the user's WebSocket session
- [X] T033 [US4] Badge routes in `backend/src/badges/routes.ts`: `GET /api/v1/users/:userId/badges` — SELECT user_badges JOIN badges JOIN users; return userId, displayName, badges array with type, labelPt, descriptionPt, iconKey, awardedAt, zebraCount; auth required; visible to any authenticated user
- [X] T034 [P] [US4] BadgeIcon component in `frontend/src/components/Badges/BadgeIcon.tsx`: maps iconKey to SVG asset; accepts `size` prop; accessible alt text from badge labelPt
- [X] T035 [P] [US4] BadgeGrid component in `frontend/src/components/Badges/BadgeGrid.tsx`: renders grid of earned badges using BadgeIcon + labelPt; empty state "Nenhuma conquista ainda"; used on profile and league ranking pages
- [X] T036 [P] [US4] BadgeToast component in `frontend/src/components/Badges/BadgeToast.tsx`: Client Component; `aria-live="polite"`; celebratory animation (CSS keyframes); displays badge icon + labelPt + descriptionPt; auto-dismisses after 5 seconds; accessible close button
- [X] T037 [US4] Wire `badge:awarded` WebSocket event in `frontend/src/app/layout.tsx` (or root client layout): extend `useWebSocket` subscription; on `badge:awarded` event → render BadgeToast via portal; queue multiple toasts if rapid awards
- [X] T038 [US4] Badge display on league ranking page in `frontend/src/app/leagues/[leagueId]/page.tsx`: fetch user badges from `GET /api/v1/users/:userId/badges`; render BadgeGrid next to each member's name in ranking list

**Checkpoint**: Simulate 5 consecutive correct results via Redis → O_MESTRE badge inserted → BadgeToast appears on screen → second simulation → no duplicate badge → GET badges → zebraCount visible for ZEBRA_HUNTER.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, validation, and full quickstart scenario verification.

- [X] T039 Validate all 7 quickstart.md scenarios end-to-end: run each scenario manually or via Playwright; document results; fix any failing path before marking complete
- [X] T040 [P] Accessibility audit for new components: MuralInput textarea has `<label>`; BadgeToast has `aria-live="polite"`; LockOverlay conveys state to screen readers via `aria-disabled`; all interactive elements ≥ 48×48px
- [X] T041 [P] Mural moderation stub in `backend/src/mural/routes.ts`: add `PATCH /api/v1/leagues/:leagueId/matches/:matchId/mural/:postId/hide` (admin-only, sets is_hidden = true); returns 200; no UI in v1 — reserved for future moderation feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — BLOCKS Phase 6 (US4)
- **US1 Phase 3**: Requires 001 platform (match page + useWebSocket hook exist)
- **US2 Phase 4**: Requires 001 outright tables + routes (from 001 US3)
- **US3 Phase 5**: Requires Phase 1 complete (mural_posts table); independent of US1/US2/US4
- **US4 Phase 6**: Requires Phase 1 + Phase 2 complete (user_badges table + evaluator skeleton); requires 003 scoring engine for `badge.evaluate` events (can stub in integration tests)
- **Polish (Phase 7)**: Requires all user stories complete

### User Story Dependencies

- **US1 (Match Cards)**: Depends on 001 platform being deployed; extends existing MatchCard + useWebSocket
- **US2 (Outrights)**: Depends on 001 outright tables and routes existing; adds seed + FINALISTS logic
- **US3 (Mural)**: Depends only on Phase 1 schema; fully independent of US1/US2/US4
- **US4 (Badges)**: Depends on Phase 1 + Phase 2; depends on 003 scoring engine publishing `badge.evaluate`; badge rules independently testable via unit tests

### Within Each User Story

1. Write tests → verify RED
2. Schema (if any) → service → routes
3. Frontend components → page integration
4. Verify story checkpoint independently

---

## Parallel Execution Examples

### Phase 1 Parallel Opportunities

```bash
# Run in parallel (different files, no dependencies):
T002: user_badges schema
T003: mural_posts schema
# T001 and T004 are sequential (seed depends on badges table)
```

### Phase 6 (US4) Parallel Opportunities

```bash
# All unit tests in parallel (different files):
T024: o-mestre.test.ts
T025: pe-frio.test.ts
T026: zebra-hunter.test.ts
T028: badge-award.spec.ts

# All rule implementations in parallel:
T029: o-mestre.ts
T030: pe-frio.ts
T031: zebra-hunter.ts

# All frontend badge components in parallel:
T034: BadgeIcon.tsx
T035: BadgeGrid.tsx
T036: BadgeToast.tsx
```

### Cross-Story Parallel (after Phase 2)

With multiple developers:
```bash
Dev A → Phase 3 (US1: Match Card Lock)
Dev B → Phase 4 (US2: Outrights seed)
Dev C → Phase 5 (US3: Mural)
Dev D → Phase 2 + Phase 6 (Foundational + Badge rules)
```

---

## Implementation Strategy

### MVP (User Story 1 + User Story 3)

Feature 002's highest user-visible value comes from the Mural (social engagement) and Match Card lock (UX correctness):

1. Phase 1: Schema setup
2. Phase 3: US1 — Match Card lock UI (fixes silent failure in 001)
3. Phase 5: US3 — Mural de Resenha (primary social feature)
4. **STOP and VALIDATE**: Users can chat in real-time per league per match; match cards lock visually at T-15min
5. Add US2 (Outrights values) + US4 (Badges) incrementally

### Incremental Delivery

| Milestone | Phases | What Users Get |
|-----------|--------|----------------|
| Fix + Social | 1, 3, 5 | Match lock UI + Mural |
| Complete | 1–6 | + Outright values + Badges |
| Polished | 1–7 | + Accessibility + Moderation stub |

---

## Task Count Summary

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Phase 1: Setup (Schema) | 4 | 2 |
| Phase 2: Foundational (Badge infra) | 2 | 0 |
| Phase 3: US1 Match Cards | 4 | 2 |
| Phase 4: US2 Outrights | 4 | 2 |
| Phase 5: US3 Mural | 9 | 6 |
| Phase 6: US4 Badges | 15 | 11 |
| Phase 7: Polish | 3 | 2 |
| **Total** | **41** | **25** |

---

## Notes

- `[P]` = safe to run in parallel (different files, no in-flight dependencies)
- `[USN]` label maps task to user story for traceability and independent delivery
- TDD: test tasks **must** be written and observed to FAIL before implementation tasks begin
- All badge evaluation runs AFTER scoring engine commits — never before (enforced by Redis event ordering)
- ZEBRA_HUNTER uses UPDATE (not upsert) for `zebra_count` after first award — unique constraint guards the initial INSERT
- All labels, messages, and UI text in PT-BR per Constitution Principle III
- `is_hidden` flag on mural_posts costs nothing now; avoids a schema migration when moderation is added in a future spec
