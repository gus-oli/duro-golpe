# Research: Gamificação Social e Mecânicas Detalhadas de Apostas

**Branch**: `002-social-gamification` | **Date**: 2026-04-28
**Purpose**: Resolve design decisions for Match Cards UI, Outright categories, Mural de Resenha, and Badge system.

---

## Decision 1: Tech Stack

**Decision**: Same as 001 and 003 — TypeScript + Node.js 22 + Fastify 5 + Next.js 15 + PostgreSQL 16 + Redis 7.

All new functionality is added to the existing `backend/src/` and `frontend/src/` trees established in 001.

---

## Decision 2: Match Card UI Architecture

**Decision**: Match Cards are React Server Components (RSC) for the initial render (schedule + prediction state), with a Client Component overlay for the prediction input and lock state. Card states are managed client-side after WebSocket events update the local state.

**Rationale**:
- RSC renders the static match info (teams, kickoff time) at build/request time — fast initial load, no JS for read-only content.
- The prediction input (`<PredictionInput>`) is a Client Component — minimal JS shipped, only for the interactive portion.
- Lock state transitions (SCHEDULED → LOCKED) are pushed via WebSocket `match:status:changed` and update the card state without a full page reload.
- Large touch targets (minimum 48×48px per WCAG guidelines) enforced via Tailwind CSS utilities.

**Alternatives considered**:
- **Full client-side rendering**: Higher initial JS bundle, slower FCP on mobile — rejected given the mobile-first performance requirement.
- **Polling for lock state**: Higher server load; WebSocket push is already available from 001.

---

## Decision 3: Mural de Resenha (Trash Talk Feed)

**Decision**: Mural posts are stored in a `mural_posts` table scoped by `(league_id, match_id)`. New posts are broadcast via WebSocket to all league members currently viewing that match. No moderation in v1; a `is_hidden` flag is added to the schema to support future moderation without a migration.

**Rationale**:
- Per-league, per-match scoping maps directly to the spec: each league has its own isolated feed per match.
- WebSocket broadcasting reuses the existing connection (established for score updates in 001/003), adding a new event type `mural:post:new` without a new connection.
- `is_hidden: boolean DEFAULT false` costs nothing now and avoids a schema migration when reporting/moderation is added.
- Text-only v1: no image upload service needed, significantly reducing scope and attack surface.

**Fanout strategy**: When a user posts a comment, the backend:
1. Inserts `mural_posts` record.
2. Publishes to Redis channel `mural:{leagueId}:{matchId}`.
3. WebSocket layer broadcasts `mural:post:new` to all subscribers of that channel who have an open connection.

**Alternatives considered**:
- **Separate WebSocket endpoint for Mural**: Adds connection overhead; the existing WS connection handles it cleanly with an additional event type.
- **Polling for new comments**: Unacceptable latency for a "trash talk" experience; WebSocket push required.

---

## Decision 4: Badge System Architecture

**Decision**: Badges are evaluated by a `BadgeEvaluator` service called after every `MatchScore` is written (post-scoring engine). Badge criteria are defined as a registry of rule objects — each implementing a `evaluate(userId, context): Badge | null` interface. This makes adding new badges zero-migration: add a new rule object to the registry.

**Rationale**:
- Running badge evaluation after scoring (not before) is already specified in the 003 spec assumption. This ensures the badge logic always sees the latest score state.
- Registry pattern avoids a switch/if-else in a single monolithic evaluator — each badge is independently testable.
- The `user_badges` table stores awarded badges; re-evaluation does not re-award (idempotency via unique constraint on `(user_id, badge_type)`).

**Badge criteria (v1)**:

| Badge | Trigger | Idempotent? |
|-------|---------|-------------|
| O Mestre | 5+ consecutive correct match results (WINNER_OR_DRAW or higher) | Yes — once per streak start |
| Pé Frio | 5+ consecutive incorrect match results (TOTAL_MISS) | Yes — once per streak start |
| Zebra Hunter | Correct result of a match classified as a zebra (underdog wins) | Cumulative counter — badge awarded on first zebra; counter incremented on subsequent ones |

**"Zebra" classification**: A match is classified as a zebra when `api_football.match.underdog_wins = true` in the webhook payload, or when the winning team had a FIFA ranking ≥ 20 positions lower than the losing team at tournament start. The threshold will be confirmed before launch (documented as assumption in spec).

**Alternatives considered**:
- **Database trigger**: Opaque, hard to test, not extensible without migrations — rejected.
- **Scheduled batch job**: Higher latency; badges may take minutes to appear after a result. Real-time award (within 60s) is required by spec.

---

## Decision 5: Outright Point Categories (Point System Integration)

**Decision**: The 8 outright categories from spec 002 use the fixed point values defined in the `outright_markets` seed data (from 001's data model). The scoring engine (003) processes outright results identically to match results — the `UserTotal.outright_points` field accumulates outright awards.

**No additional architectural decision needed**: The data model (001) and scoring engine (003) already accommodate this. The only 002-specific work is:
- Seeding the exact 8 markets with their point values at DB initialization.
- Implementing the `FINALISTS` market as all-or-nothing (both finalists correct = 70pts; one correct = 0pts).

---

## Summary: All Decisions Resolved

| Item | Resolution |
|------|-----------|
| Match Card UI | RSC + Client Component overlay; WebSocket lock state updates |
| Mural de Resenha | `mural_posts` table; Redis fanout; `mural:post:new` WebSocket event; `is_hidden` for future moderation |
| Badge system | Registry pattern; `BadgeEvaluator` after scoring; unique constraint idempotency |
| Zebra classification | API-Football underdog flag OR FIFA ranking delta ≥ 20 positions |
| Outright point values | Already in 001 data model; FINALISTS is all-or-nothing |
