# Implementation Plan: Gamificação Social e Mecânicas Detalhadas de Apostas

**Branch**: `002-social-gamification` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-social-gamification/spec.md`

## Summary

Extend the platform (001) with four gamification and social features: (1) Match Cards with a 15-minute prediction lock enforced via WebSocket push; (2) 8 Outright markets with specific point values seeded in the database and locked 1 hour before the opening match; (3) Mural de Resenha — a per-league, per-match comment feed with real-time WebSocket push; (4) automatic Badge awarding (O Mestre, Pé Frio, Zebra Hunter) triggered post-scoring engine via a registry-based evaluator. Depends on 001 (data model, auth, WebSocket) and 003 (scoring engine events).

## Technical Context

**Language/Version**: TypeScript 5.5 + Node.js 22 LTS (same as 001/003)
**Primary Dependencies**: Extends 001/003 stack; adds no new external dependencies
**Storage**: PostgreSQL 16 — new tables: `mural_posts`, `badges`, `user_badges` (all in existing schema)
**Testing**: Vitest + testcontainers (unit + integration) + Playwright (e2e: lock UI, mural real-time, badge notification)
**Target Platform**: Same as 001 — Linux server + Next.js 15 mobile-first PWA
**Project Type**: Extension to existing web application — no new top-level service
**Performance Goals**: Mural posts appear for all league members within 5 seconds (SC-005); badge awarded within 60 seconds of qualifying event (SC-006); Match Card lock updates without page reload
**Constraints**: Mural isolated per (league_id, match_id); badge unique per user per type; badge evaluation idempotent; zebra classification depends on API-Football metadata
**Scale/Scope**: Same platform scale as 001; Mural fanout bounded by league size (≤500 members per league)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Qualidade de Código**: Badge registry pattern (each badge = one testable rule object); Mural service clearly separated from scoring; no logic in route handlers; strict TypeScript; ESLint + Prettier.
- [x] **II. TDD**: All 7 quickstart scenarios written as failing tests first; badge idempotency verified via unit test; Mural isolation verified via integration test with testcontainers; Red-Green-Refactor enforced.
- [x] **III. UX Fluida e Consistente**: Match Card lock state updated via WebSocket (no reload); Mural posts appear in real-time (≤5s); badge awarded as celebratory toast notification; all labels in PT-BR; no silent failures.
- [x] **IV. Performance Rápida e Leve**: No new external dependencies; Redis fanout for Mural; badge evaluation is O(1) per badge type after streak query; Match Card uses RSC + Client Component overlay (minimal JS).

## Project Structure

### Documentation (this feature)

```text
specs/002-social-gamification/
├── plan.md           ← this file
├── research.md       ← Match Card UI, Mural architecture, Badge registry decisions
├── data-model.md     ← MuralPost, Badge, UserBadge + BadgeEvaluationContext
├── quickstart.md     ← 7 critical scenarios: lock UI, mural isolation, badges
├── contracts/
│   └── social-api.md     ← Mural REST, Badges REST, mural:post:new, badge:awarded, badge.evaluate
└── tasks.md          ← created by /speckit-tasks
```

### Source Code (repository root)

Extends the existing `backend/src/` and `frontend/src/` from feature 001.

```text
backend/src/
├── mural/
│   ├── routes.ts           # GET/POST /leagues/:id/matches/:id/mural
│   ├── service.ts          # Post creation, membership validation, Redis fanout
│   └── broadcaster.ts      # Publishes mural:post:new to league WebSocket subscribers
├── badges/
│   ├── evaluator.ts        # Registry of badge rules; called after each MatchScore
│   ├── rules/
│   │   ├── o-mestre.ts     # Rule: 5+ consecutive correct results
│   │   ├── pe-frio.ts      # Rule: 5+ consecutive TOTAL_MISS
│   │   └── zebra-hunter.ts # Rule: correct result on a zebra-classified match
│   └── routes.ts           # GET /users/:id/badges
└── outrights/
    └── seed.ts             # Seeds 8 markets with correct point values at DB init

backend/tests/
├── unit/badges/
│   ├── o-mestre.test.ts    # RED first: streak logic, edge cases
│   ├── pe-frio.test.ts
│   └── zebra-hunter.test.ts
└── integration/
    ├── mural.test.ts       # Isolation, fanout, membership guard (testcontainers)
    └── badges.test.ts      # Full pipeline: scoring → badge.evaluate → user_badges

frontend/src/
├── components/
│   ├── MatchCard/
│   │   ├── LockOverlay.tsx      # Disables inputs + shows lock indicator on WebSocket event
│   │   └── PredictionInput.tsx  # Large numeric inputs (min 48px touch target)
│   ├── Mural/
│   │   ├── MuralFeed.tsx        # Real-time comment feed (WebSocket mural:post:new)
│   │   ├── MuralPost.tsx        # Single post: avatar, name, content, time
│   │   └── MuralInput.tsx       # Text input + submit button
│   └── Badges/
│       ├── BadgeGrid.tsx        # User badge display on profile / ranking
│       ├── BadgeToast.tsx       # Celebratory notification on badge:awarded event
│       └── BadgeIcon.tsx        # Icon per badge type
└── tests/e2e/
    ├── match-card-lock.spec.ts   # Playwright: lock fires at T-15min, no reload
    ├── mural-realtime.spec.ts    # Two-user real-time comment test
    └── badge-award.spec.ts       # Badge:awarded toast appears after qualifying event
```

**Structure Decision**: Extension to the 001 web application. All new code added to existing `backend/src/` and `frontend/src/` trees. No new top-level directories or services required. The badge evaluator consumes `badge.evaluate` events from the scoring engine (003) via the existing Redis pub/sub channel.
