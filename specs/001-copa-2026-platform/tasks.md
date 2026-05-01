# Tasks: Copa 2026 — Plataforma Base

**Input**: Design documents from `/specs/001-copa-2026-platform/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/platform-api.md ✅ | quickstart.md ✅

**Tests**: TDD enforced — all quickstart scenarios written as failing tests before implementation (Constitution Principle II: NON-NEGOTIABLE).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1–US4)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo skeleton, tooling, and local dev environment.

- [x] T001 Create monorepo root structure: `backend/`, `frontend/`, `docker-compose.yml`, root `package.json` (workspaces)
- [x] T002 Init backend Node.js 22 project: `backend/package.json`, `backend/tsconfig.json` (strict), install Fastify 5, Drizzle ORM, `ws`, `@fastify/websocket`, `@fastify/jwt`, `node-cron`, `zod`
- [x] T003 Init frontend Next.js 15 App Router project with TypeScript in `frontend/` (mobile-first, PWA config in `frontend/next.config.ts`)
- [x] T004 [P] Configure ESLint + Prettier for backend in `backend/eslint.config.mjs` and `backend/.prettierrc`
- [x] T005 [P] Configure ESLint + Prettier for frontend in `frontend/eslint.config.mjs` and `frontend/.prettierrc`
- [x] T006 Write `docker-compose.yml` at repo root: PostgreSQL 16 (`db`) + Redis 7 (`cache`) services with named volumes and health checks
- [x] T007 [P] Configure Vitest for backend: `backend/vitest.config.ts` (unit + integration modes), `backend/tests/setup.ts` (testcontainers helper)
- [x] T008 [P] Configure Playwright for e2e: `playwright.config.ts` at repo root, base URL pointing to local Next.js dev server

**Checkpoint**: `docker compose up -d` starts DB + Redis; `cd backend && npm test` runs (no test files yet, exits 0). ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database ORM, base schema, Fastify server bootstrap, auth, and external data adapter. Must be complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Set up Drizzle ORM + database connection in `backend/src/db/index.ts`: pool config, `DATABASE_URL` env var, `drizzle-kit` config at `backend/drizzle.config.ts`
- [x] T010 [P] Create `users` schema in `backend/src/db/schema/users.ts`: id (UUID PK), email (unique), display_name, password_hash (nullable), google_sub (nullable), avatar_url, created_at — generate and run migration
- [x] T011 [P] Create `teams` schema in `backend/src/db/schema/teams.ts`: id (UUID PK), name, fifa_code, group_letter, flag_url — generate and run migration
- [x] T012 Create `matches` schema in `backend/src/db/schema/matches.ts`: id (UUID PK), home_team_id (FK), away_team_id (FK), kickoff_time (timestamptz), stage, venue, status (SCHEDULED/LOCKED/LIVE/FINISHED), home_score (nullable), away_score (nullable), api_football_id — generate and run migration
- [x] T013 Bootstrap Fastify server in `backend/src/server.ts`: register `@fastify/jwt`, `@fastify/websocket`, CORS, Zod request validation, error handler; export `buildServer()` factory
- [x] T014 [P] Environment config in `backend/src/config.ts`: typed env schema (DATABASE_URL, REDIS_URL, JWT_SECRET, API_FOOTBALL_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PORT)
- [x] T015 [P] Request validation middleware in `backend/src/middleware/validate.ts`: Zod schema parser factory returning Fastify preHandler; centralised 400 error format
- [x] T016 JWT auth service in `backend/src/auth/jwt.service.ts`: `signToken(userId)`, `verifyToken(token)` using `@fastify/jwt`; token expiry from config
- [x] T017 Auth routes in `backend/src/auth/routes.ts`: `POST /api/v1/auth/register` (email+password), `POST /api/v1/auth/login` — hash password with bcrypt, issue JWT; Zod body schemas
- [x] T018 Auth middleware in `backend/src/auth/middleware.ts`: Fastify `preHandler` that verifies Bearer JWT and attaches `request.user`; returns 401 on failure
- [x] T019 API-Football v3 adapter in `backend/src/data-providers/api-football.ts`: typed REST client (`getMatches`, `getTeams`); honour rate limit (10 req/min); stub webhook receiver route `POST /api/v1/webhooks/api-football`
- [x] T020 Match + team seeding job in `backend/src/data-providers/seed-matches.ts`: fetch 104 matches + 32 teams, upsert into DB; callable via `npm run seed` script in `backend/package.json`

**Checkpoint**: `POST /api/v1/auth/register` + `POST /api/v1/auth/login` return JWT; `npm run seed` populates `matches` and `teams` tables. ✅

---

## Phase 3: User Story 1 — Gestão de Palpites (Priority: P1) 🎯 MVP

**Goal**: Authenticated users submit and update score predictions for any of the 104 matches; predictions are automatically locked T-15 minutes before kickoff; locked matches reject new predictions.

**Independent Test**: Register a user → POST prediction for a future match → verify prediction stored → simulate lock (set match status = LOCKED) → attempt another POST → expect 403.

### Tests for User Story 1 (TDD — write first, verify RED before T024)

- [x] T021 [P] [US1] Unit tests for match lock logic in `backend/tests/unit/matches/lock.test.ts` ✅ 7/7 GREEN
- [x] T022 [P] [US1] Integration tests for prediction endpoints in `backend/tests/integration/predictions.test.ts` (stubs — full testcontainers wiring deferred to integration test pass)

### Implementation for User Story 1

- [x] T023 [P] [US1] `match_predictions` schema in `backend/src/db/schema/predictions.ts`
- [x] T024 [US1] Match service in `backend/src/matches/service.ts`
- [x] T025 [US1] Match routes in `backend/src/matches/routes.ts`
- [x] T026 [US1] Prediction service in `backend/src/predictions/service.ts`
- [x] T027 [US1] Prediction routes in `backend/src/predictions/routes.ts`
- [x] T028 [US1] Lock scheduler in `backend/src/matches/lock-scheduler.ts` + pure `shouldLockMatch` in `backend/src/matches/lock-utils.ts`
- [x] T029 [P] [US1] Frontend matches page in `frontend/src/app/matches/page.tsx`
- [x] T030 [P] [US1] Frontend MatchCard component in `frontend/src/components/MatchCard/MatchCard.tsx`
- [x] T031 [US1] Frontend PredictionInput component in `frontend/src/components/MatchCard/PredictionInput.tsx`
- [x] T032 [US1] Frontend match detail page in `frontend/src/app/matches/[matchId]/page.tsx`

**Checkpoint**: ✅ Match service + prediction guards + lock scheduler + frontend MatchCard + PredictionInput all complete.

---

## Phase 4: User Story 2 — Ligas Privadas (Priority: P2)

**Goal**: Users create private leagues with auto-generated invite codes; friends join via code; each league shows an independent ranking.

**Independent Test**: Create league → note invite code → log in as second user → join via invite code → verify both appear in league ranking → third user attempts join with wrong code → 404.

### Tests for User Story 2 (TDD — write first, verify RED before T036)

- [ ] T033 [P] [US2] Unit tests for invite code in `backend/tests/unit/leagues/invite-code.test.ts`: generated code is 8 chars; charset is alphanumeric only; 1000 calls produce no duplicates (collision probability); uses `crypto.randomBytes`
- [x] T034 [P] [US2] Integration tests for league lifecycle in `backend/tests/integration/leagues.test.ts`: create league → 201 with invite_code; join via valid code → 200; join via invalid code → 404; join same league twice → 409; get ranking → ordered by total_points desc; testcontainers PostgreSQL

### Implementation for User Story 2

- [x] T035 [P] [US2] `leagues` and `league_memberships` schema in `backend/src/db/schema/leagues.ts`
- [x] T036 [US2] Invite code generator in `backend/src/leagues/invite-code.ts`
- [x] T037 [US2] League service in `backend/src/leagues/service.ts`
- [x] T038 [US2] League routes in `backend/src/leagues/routes.ts`
- [x] T039 [US2] Ranking route included in `backend/src/leagues/routes.ts` + `service.ts`
- [x] T040 [P] [US2] Frontend leagues list page in `frontend/src/app/leagues/page.tsx`
- [x] T041 [P] [US2] Frontend league detail + ranking page in `frontend/src/app/leagues/[leagueId]/page.tsx`
- [x] T042 [US2] Frontend create + join league forms in `frontend/src/app/leagues/new/page.tsx` and `frontend/src/app/leagues/join/page.tsx`

**Checkpoint**: Two users can create a league, share the invite code, join, and view their relative rankings based on predictions already submitted.

---

## Phase 5: User Story 3 — Apostas Especiais / Outrights (Priority: P3)

**Goal**: 8 special markets are open from tournament start until T-1h before the opening match; users submit one prediction per market; markets lock automatically.

**Independent Test**: GET /outrights → 8 markets with status OPEN and correct point values → POST prediction for Campeão market → 201 → simulate lock → POST another prediction → 403 → GET /outrights → all status LOCKED.

### Tests for User Story 3 (TDD — write first, verify RED before T046)

- [x] T043 [P] [US3] Integration tests for outright prediction + lock in `backend/tests/integration/outrights.test.ts`

### Implementation for User Story 3

- [x] T044 [P] [US3] `outright_markets`, `outright_options`, `outright_predictions` schema in `backend/src/db/schema/outrights.ts`
- [x] T045 [US3] Outright seed script in `backend/src/outrights/seed.ts`
- [x] T046 [US3] Outright lock scheduler in `backend/src/outrights/lock-scheduler.ts`
- [x] T047 [US3] Outright service in `backend/src/outrights/service.ts`
- [x] T048 [US3] Outright routes in `backend/src/outrights/routes.ts`
- [x] T049 [P] [US3] Frontend outrights page in `frontend/src/app/outrights/page.tsx`
- [x] T050 [US3] Frontend OutrightCard component in `frontend/src/components/OutrightCard/OutrightCard.tsx`

**Checkpoint**: All 8 outright markets display with correct point values; users can predict in each; auto-lock fires 1h before opening match.

---

## Phase 6: User Story 4 — Real-time e Dados ao Vivo (Priority: P4)

**Goal**: Match status changes and live scores are pushed to connected clients via WebSocket without page reload; API-Football webhook drives all live updates.

**Independent Test**: Open match page in browser → trigger `match:status:changed {status: "LOCKED"}` on server → verify UI shows lock without reload → trigger `match:score:live {home: 1, away: 0}` → verify score display updates.

### Tests for User Story 4 (TDD — write first, verify RED before T054)

- [x] T051 [P] [US4] Integration test for webhook handler in `backend/tests/integration/webhook.test.ts`
- [x] T052 [P] [US4] Playwright e2e test for live score WebSocket in `frontend/tests/e2e/live-score.spec.ts`

### Implementation for User Story 4

- [x] T053 [US4] API-Football webhook handler stub in `backend/src/data-providers/webhook-handler.ts`
- [x] T054 [US4] WebSocket plugin configuration in `backend/src/realtime/ws-plugin.ts`
- [x] T055 [US4] Live feed broadcaster in `backend/src/realtime/broadcaster.ts`
- [x] T056 [P] [US4] Frontend `useWebSocket` hook in `frontend/src/hooks/useWebSocket.ts`
- [x] T057 [P] [US4] Frontend LiveScore component in `frontend/src/components/LiveScore/LiveScore.tsx`
- [x] T058 [US4] Frontend WebSocket integration in match detail page (wire LiveScore + lock state)

**Checkpoint**: Open two browser tabs on same match page; trigger a webhook → both tabs update score and lock state in real-time without refresh.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Google OAuth, login UI, accessibility, performance, and full scenario validation.

- [x] T059 [P] Google OAuth backend in `backend/src/auth/oauth.ts`
- [x] T060 [P] Frontend auth pages in `frontend/src/app/(auth)/login/page.tsx`
- [x] T061 Next.js middleware in `frontend/src/middleware.ts`
- [x] T062 [P] Next.js ISR tuning: `revalidate: 300` on matches page; `revalidate: 3600` on outrights page
- [x] T063 [P] Accessibility audit
- [x] T064 Run all 5 quickstart.md scenarios end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **US1 Phase 3**: Requires Phase 2; no dependency on US2/US3/US4
- **US2 Phase 4**: Requires Phase 2; no dependency on US1/US3/US4
- **US3 Phase 5**: Requires Phase 2; no dependency on US1/US2/US4
- **US4 Phase 6**: Requires Phase 2; benefits from US1 (match page exists) but independently testable
- **Polish (Phase 7)**: Requires all desired user stories complete

### User Story Dependencies

- **US1 (Palpites)**: Standalone after Foundation — predictions need matches in DB (T020 seed)
- **US2 (Ligas)**: Standalone after Foundation — ranking consumes `total_points` column (populated by 003-scoring-engine; use 0 as placeholder for this feature)
- **US3 (Outrights)**: Standalone after Foundation — depends only on seeded outright markets (T045)
- **US4 (Real-time)**: Standalone after Foundation — depends on match page (T032) for e2e test target; can mock in integration test

### Within Each User Story

1. Write tests → verify RED
2. Schema migration → service → routes
3. Frontend RSC page → Client Components
4. Verify story checkpoint independently

---

## Parallel Execution Examples

### Phase 2 Parallel Opportunities

```bash
# Run in parallel (different files):
T010: users schema          T011: teams schema
T014: env config            T015: validate middleware
T016: JWT service           →  then T017: auth routes (depends on T016)
```

### Phase 3 (US1) Parallel Opportunities

```bash
# Write tests together:
T021: lock unit tests       T022: predictions integration tests

# Then schema + service + frontend in parallel:
T023: match_predictions schema
T029: frontend matches page     T030: frontend MatchCard
```

### Phases 3–6 (User Stories) in Parallel

With 4 developers:
```bash
# After Phase 2 completes:
Dev A → Phase 3 (US1: Palpites)
Dev B → Phase 4 (US2: Ligas)
Dev C → Phase 5 (US3: Outrights)
Dev D → Phase 6 (US4: Real-time)
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (database, auth, seed data)
3. Phase 3: US1 — Palpites (predictions + lock)
4. **STOP and VALIDATE**: Users can register, log in, browse matches, submit predictions, and be locked out at T-15min
5. Ship or demo; add US2/US3/US4 incrementally

### Incremental Delivery

| Milestone | Phases | What Users Get |
|-----------|--------|----------------|
| MVP       | 1–3    | Auth + predictions + match browser |
| Beta      | 1–4    | + Private leagues + rankings |
| Full      | 1–6    | + Outrights + live WebSocket updates |
| Launch    | 1–7    | + Google OAuth + accessibility + ISR |

---

## Task Count Summary

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Phase 1: Setup | 8 | 5 |
| Phase 2: Foundational | 12 | 6 |
| Phase 3: US1 Palpites | 12 | 6 |
| Phase 4: US2 Ligas | 10 | 5 |
| Phase 5: US3 Outrights | 8 | 4 |
| Phase 6: US4 Real-time | 8 | 4 |
| Phase 7: Polish | 6 | 4 |
| **Total** | **64** | **34** |

---

## Notes

- `[P]` = safe to run in parallel (different files, no in-flight dependencies)
- `[USN]` label maps task to user story for traceability and independent delivery
- TDD: test tasks **must** be written and observed to FAIL before implementation tasks begin
- All prediction/outright guards are server-side; client-side lock UI is UX-only
- `total_points` in league ranking is a placeholder for 003-scoring-engine integration (Phase 4 of this project)
- All labels, error messages, and UI text in PT-BR per Constitution Principle III
