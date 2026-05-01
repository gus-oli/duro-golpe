# Implementation Plan: Motor de Pontuação (The Engine)

**Branch**: `003-scoring-engine` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-scoring-engine/spec.md`

## Summary

Implement the core scoring engine that evaluates each user's match prediction against the official result using a 5-tier non-cumulative formula (Placar Exato 25pts → Vencedor+Saldo 15pts → Vencedor/Empate 10pts → Acerto de Gols 5pts → Erro Total 0pts), maintains denormalized running totals per user, and broadcasts score updates to connected clients via WebSocket within 60 seconds of a confirmed result. Theoretical maximum: 3,130 points (104 matches × 25 + 8 outrights = 530).

## Technical Context

**Language/Version**: TypeScript 5.5 + Node.js 22 LTS
**Primary Dependencies**: Fastify 5, ioredis 5, ws 8, Vitest 2, testcontainers, fast-check (property-based tests)
**Storage**: PostgreSQL 16 (`match_scores`, `user_totals`) + Redis 7 (pub/sub + ranking cache TTL 10s)
**Testing**: Vitest (unit + integration with testcontainers) + Playwright (e2e WebSocket scenarios)
**Target Platform**: Linux server (backend); mobile-first PWA via Next.js 15 (frontend)
**Project Type**: Web application — REST API + WebSocket server + Next.js 15 frontend
**Performance Goals**: Score update visible to clients within 60s of official result; ranking cache miss < 200ms; amendment processing < 5 minutes
**Constraints**: Zero incorrect tier assignments; idempotent processing (unique constraint on prediction_id + match_result_id); no negative totals; concurrent match processing without race conditions
**Scale/Scope**: Up to 50k concurrent users during peak group stage windows; 104 match events total over ~30 days

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Qualidade de Código**: Pure scoring function (zero side effects), clear TypeScript types for all tiers, ESLint + Prettier enforced, YAGNI — no extra abstraction layers beyond what the spec requires.
- [x] **II. TDD**: Full unit test matrix for all 5 tier boundary conditions written BEFORE implementation; property-based tests (fast-check) verify the "exactly one tier per prediction" invariant; integration tests use testcontainers for a real PostgreSQL instance.
- [x] **III. UX Fluida e Consistente**: Match card updates immediately on WebSocket push (no manual refresh); tier label in PT-BR with visual differentiation per tier; progress bar on dashboard; tier "Erro Total" shown without punitive language.
- [x] **IV. Performance Rápida e Leve**: O(1) scoring calculation (pure function, no DB reads); denormalized UserTotal avoids expensive SUM aggregations; Redis ranking cache (10s TTL); `ws` chosen over Socket.io to eliminate ~30KB overhead; no polling.

## Project Structure

### Documentation (this feature)

```text
specs/003-scoring-engine/
├── plan.md           ← this file
├── research.md       ← tech stack decisions, algorithm architecture
├── data-model.md     ← MatchResult, ScoringTier, MatchScore, UserTotal
├── quickstart.md     ← TDD test matrix + integration scenarios + real-time flow
├── contracts/
│   └── scoring-api.md    ← internal events + REST endpoints + WebSocket events
└── tasks.md          ← created by /speckit-tasks (next step)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── scoring/
│   │   ├── engine.ts          # Pure fn: calculateTier(predicted, actual) → ScoringResult
│   │   ├── processor.ts       # Event handler: match.result.confirmed → MatchScore + UserTotal
│   │   ├── aggregator.ts      # UserTotal transactional update (SELECT FOR UPDATE)
│   │   └── broadcaster.ts     # Redis sub → WebSocket emission per connected user
│   ├── models/
│   │   ├── match-result.ts    # MatchResult entity + ResultStatus enum
│   │   ├── match-score.ts     # MatchScore entity + ScoringTier enum
│   │   └── user-total.ts      # UserTotal entity
│   └── api/
│       └── routes/
│           ├── scores.ts      # GET /users/:id/score, GET /users/:id/scores/matches
│           └── rankings.ts    # GET /leagues/:id/ranking, GET /matches/:id/score-summary
└── tests/
    ├── unit/
    │   └── scoring/
    │       └── engine.test.ts      # Exhaustive tier boundary + property-based tests (RED first)
    └── integration/
        └── scoring/
            ├── processor.test.ts   # Full pipeline: event → DB → UserTotal (testcontainers)
            └── concurrent.test.ts  # Parallel match processing — no race conditions

frontend/
├── src/
│   ├── components/
│   │   ├── MatchCard/
│   │   │   ├── ScoredCard.tsx   # Concluded card showing tier label + points
│   │   │   └── TierBadge.tsx    # Visual per-tier label (Placar Exato, Vencedor+Saldo…)
│   │   └── Dashboard/
│   │       ├── ScoreTotal.tsx   # Running total + outright breakdown
│   │       └── ProgressBar.tsx  # Progress toward 3,130pt theoretical max
│   └── services/
│       └── websocket.ts         # Handles score:match:updated + score:total:updated events
└── tests/
    └── e2e/
        └── scoring.spec.ts      # Playwright: WebSocket update received after match result
```

**Structure Decision**: Web application (backend + frontend). The scoring engine is a self-contained module in `backend/src/scoring/` with a pure function at its core. No separate npm package is extracted at this stage (YAGNI — single consumer).
