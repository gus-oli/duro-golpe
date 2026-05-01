# Research: Motor de Pontuação (The Engine)

**Branch**: `003-scoring-engine` | **Date**: 2026-04-28
**Purpose**: Resolve all NEEDS CLARIFICATION items and establish technical decisions before design.

---

## Decision 1: Tech Stack (Full Platform Foundation)

**Decision**: TypeScript full-stack — Node.js 22 LTS + Fastify (backend), Next.js 15 (frontend, mobile-first PWA).

**Rationale**:
- Single language across frontend and backend eliminates context-switching and enables shared types (critical for the scoring tier enum and match/prediction models).
- Fastify is measurably faster than Express and has excellent TypeScript support; its plugin architecture keeps the codebase modular.
- Next.js 15 App Router provides SSR/ISR for fast initial loads, seamless mobile-first responsive UI, and PWA capability — covering the "mobile-first vibrante" requirement without the operational complexity of a separate React Native codebase.
- Node.js 22 LTS ships with native WebSocket support, reducing dependency count.
- The scoring engine (pure TS function) can be tested exhaustively with Vitest without any framework overhead.

**Alternatives considered**:
- **Python + FastAPI**: Strong for data-heavy workloads, but mixed-language stack adds operational friction and no advantage for this domain.
- **Go**: Excellent performance, but longer development cycles and less ecosystem for real-time social features; overkill for a Copa engagement app.
- **React Native (Expo)**: True native performance, but adds build complexity and a separate codebase; a mobile-optimized Next.js PWA ships to all platforms from one codebase and can be promoted to native via Capacitor if needed later.

---

## Decision 2: Scoring Algorithm Architecture

**Decision**: Pure deterministic function isolated in `backend/src/scoring/engine.ts`, called synchronously during result processing.

**Rationale**:
- A pure function `calculateTier(predicted: Score, actual: Score): ScoringResult` has zero side effects and is trivially testable with Vitest. All 5 tier boundary conditions — including edge cases for draws and concurrent-team-goals scenarios — can be exhaustively covered in unit tests before any implementation (TDD, NON-NEGOTIABLE per constitution).
- Moving the logic into a stored procedure (DB layer) would make it harder to test in isolation and tightly couple the scoring rules to the database engine.
- Keeping it in application code allows the tier formula to be changed without a database migration.

**Alternatives considered**:
- **PostgreSQL function**: Possible but not portable, not easily unit-testable with Vitest, and creates a hidden dependency on DB for a simple calculation.
- **Shared npm package**: Good for multi-app reuse; deferred for v1 (YAGNI) — the engine lives in `backend/src/scoring/` and can be extracted later if a second consumer emerges.

---

## Decision 3: Match Result Processing (Event-Driven, Idempotent)

**Decision**: Match results trigger an internal event (`match.result.confirmed`) consumed by a `ScoringProcessor` service. Processing is idempotent via an `idempotency_key` (matchResultId + version) stored in `MatchScore`.

**Rationale**:
- Event-driven design decouples the data ingestion layer (external feed integration) from the scoring calculation. The processor can be retried safely without double-crediting points.
- Idempotency is guaranteed by a unique index on `(predictionId, matchResultId)` in the `match_scores` table — duplicate processing attempts hit a unique constraint and are discarded.
- This satisfies FR-015 (result amendments): an amended result generates a new `MatchResult` record with a new `matchResultId`; the processor marks the previous `MatchScore` records as `superseded = true` and inserts fresh records for the new result.

**Alternatives considered**:
- **Database trigger**: Automatic but opaque, hard to test, hard to extend with notifications/badge evaluation.
- **Cron job polling**: Higher latency, wastes compute when no results are available.

---

## Decision 4: Real-Time Update Mechanism

**Decision**: WebSocket (native Node.js 22 `ws` library) for server → client score and ranking updates. Socket.io evaluated and rejected in favor of the lighter `ws` + a thin event bus.

**Rationale**:
- WebSocket is bidirectional and required for the Mural de Resenha (feature 002) anyway — using SSE (one-way) would require a second connection type.
- The `ws` library has zero external dependencies and integrates cleanly with Fastify via `@fastify/websocket`.
- Redis Pub/Sub (`ioredis`) is used as the message broker between the scoring processor (which may run on any backend instance) and the WebSocket emission layer. This allows horizontal scaling.
- Score updates must reach clients within 60 seconds (SC-001/SC-003); a direct WebSocket push after processing satisfies this without polling.

**Alternatives considered**:
- **Server-Sent Events (SSE)**: Simpler for one-way pushes but can't serve Mural de Resenha; maintaining two real-time protocols adds complexity.
- **Long polling**: Higher latency and more overhead per connection; does not scale to concurrent match traffic.
- **Socket.io**: Feature-rich but heavy (~30KB extra) and adds an abstraction layer that complicates debugging; the protocol overhead is unnecessary given the controlled payload sizes.

---

## Decision 5: UserTotal Storage and Ranking

**Decision**: `user_totals` table maintained as a denormalized running aggregate, updated transactionally by the scoring processor. League rankings computed as a sorted query over this table (no materialized view in v1).

**Rationale**:
- Running total updates are O(1) per user per match result — a single `UPDATE user_totals SET total_points = total_points + $delta WHERE user_id = $id` inside the same transaction as the `MatchScore` insert.
- PostgreSQL's row-level locking ensures concurrent match processors (parallel group stage games) don't corrupt totals — they serialize on the `user_totals` row for that user.
- The `exact_score_count` and `winner_goal_diff_count` tiebreaker columns are updated in the same transaction, keeping tiebreaker state consistent at zero extra cost.
- A materialized view adds cache-invalidation complexity for v1; the sorted query with a `LIMIT` is fast enough for typical league sizes (≤500 members per league per the spec's assumptions).

**Alternatives considered**:
- **Compute total from SUM(match_scores)**: Correct but expensive on read; 104 matches × many users = slow aggregation per request.
- **Redis sorted set**: Excellent for real-time leaderboards but adds a separate state to keep in sync; added only if profiling shows PostgreSQL ranking queries are too slow.

---

## Decision 6: Testing Strategy for The Engine

**Decision**: Exhaustive unit test matrix for all tier boundary conditions using Vitest. Integration tests for the full processing pipeline against a test PostgreSQL instance.

**Rationale (TDD-first per constitution)**:
- The scoring function has a finite, enumerable boundary space. Before any implementation, test cases cover: exact score (win, draw, loss), winner+goal-diff (win only), winner/draw correct, one team's goals correct with wrong outcome, and total miss — for all outcome directions.
- Property-based testing (fast-check) added to verify the invariant: "exactly one tier is ever awarded per (prediction, result) pair."
- Integration tests verify the full flow: mock result event → ScoringProcessor → DB records → WebSocket emission → correct UserTotal.

**Testing stack**:
- **Unit**: Vitest (fast, native TS, no config overhead)
- **Integration**: Vitest + testcontainers (spins up a real PostgreSQL for each test run)
- **E2E**: Playwright (browser-level real-time update verification)

---

## Summary: All NEEDS CLARIFICATION Resolved

| Item | Resolution |
|------|-----------|
| Language/Runtime | TypeScript + Node.js 22 LTS |
| Backend Framework | Fastify 5 |
| Frontend | Next.js 15 (App Router, mobile-first PWA) |
| Database | PostgreSQL 16 |
| Cache/Pub-Sub | Redis 7 (ioredis) |
| Real-time | WebSocket (`ws` + `@fastify/websocket`) |
| Testing | Vitest + testcontainers + Playwright |
| Scoring Logic | Pure function, application layer |
| Result Processing | Event-driven, idempotent via unique constraint |
| UserTotal Storage | Denormalized running aggregate in PostgreSQL |
