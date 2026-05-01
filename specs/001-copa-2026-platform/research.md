# Research: Plataforma de Engajamento Social - Copa do Mundo 2026

**Branch**: `001-copa-2026-platform` | **Date**: 2026-04-28
**Purpose**: Resolve tech stack decisions and integration patterns for the foundational platform.

---

## Decision 1: Tech Stack (same as established in 003-scoring-engine)

**Decision**: TypeScript 5.5 full-stack — Node.js 22 LTS + Fastify 5 (backend), Next.js 15 App Router (frontend), PostgreSQL 16 + Redis 7.

**Rationale**: Already decided in 003-scoring-engine research. Single-language stack, proven for real-time social applications, excellent TypeScript support, fast Fastify core for low-latency API responses.

See `specs/003-scoring-engine/research.md` → Decision 1 for full rationale and alternatives.

---

## Decision 2: Authentication

**Decision**: JWT-based stateless auth via `@fastify/jwt` (backend) + httpOnly cookie storage (frontend). Social login via Google OAuth 2.0 using `@fastify/oauth2`.

**Rationale**:
- JWT is stateless — no session store required, reducing Redis dependency for auth.
- httpOnly cookies prevent XSS access to tokens; combined with CSRF protection (`@fastify/csrf-protection`), this is the recommended secure pattern for web apps.
- Google OAuth is mandatory for a mobile-first Brazilian audience (large Android user base, Google accounts ubiquitous). Apple Sign-In is deferred to v2 (requires Apple Developer account; iOS share is lower in Brazil).
- Password auth (bcrypt, 12 rounds) is supported alongside OAuth for users who prefer it.

**Alternatives considered**:
- **Session-based auth + Redis**: Adds statefulness and Redis dependency for auth; JWT is simpler given the stateless API design.
- **Auth0 / Supabase Auth**: Reduces implementation work but adds external vendor dependency and cost at scale; not worth the lock-in for a focused product.

---

## Decision 3: External Football Data Provider

**Decision**: [API-Football](https://www.api-football.com) (v3) as the primary external data source for match schedules, live scores, and final results.

**Rationale**:
- API-Football v3 covers the 2026 World Cup with real-time live score webhooks and a generous free tier for development.
- Supports all 104 matches with team metadata (names, logos/flags, FIFA codes).
- Provides webhook events for goals, final whistle, and result corrections — enabling the event-driven scoring processor (003-scoring-engine) with minimal polling.
- REST API for batch match schedule ingestion on setup.

**Integration pattern**:
- Backend ingestion service polls the API-Football REST endpoint at tournament start to seed all 104 matches.
- Live updates via webhooks (API-Football → backend) during matches; fallback polling every 60s if webhook is not received.
- A thin adapter layer (`src/data-providers/api-football.ts`) isolates the provider contract — allows swapping providers without touching core logic.

**Alternatives considered**:
- **football-data.org**: Good free tier but less webhook support; polling latency could exceed 60s target.
- **ESPN API (unofficial)**: Unofficial, unstable; not viable for production.

---

## Decision 4: Match Prediction Lock Enforcement

**Decision**: Lock enforcement is a two-layer check — server-side gate at submission time + a scheduled job that marks matches as locked in the database at T-15min.

**Rationale**:
- Primary gate: every prediction submission validates `kickoff_time - now() > 15 minutes (UTC)`. This is the authoritative check.
- Secondary gate: a cron job (node-cron) running every minute updates `matches.status = 'LOCKED'` for matches where `kickoff_time - now() <= 15 minutes`. This allows the frontend to reflect lock state without polling the prediction endpoint.
- Dual-layer eliminates the edge case where a client sends a prediction milliseconds before the primary check fires.
- UTC-only time arithmetic; frontend converts to local timezone for display only.

**Alternatives considered**:
- **Database trigger**: Would enforce at DB level but is opaque, hard to test, and doesn't update the frontend lock state for display.
- **Client-side enforcement only**: Not acceptable — clients can be manipulated; server is the single source of truth.

---

## Decision 5: Private League Invite Codes

**Decision**: Cryptographically random 8-character alphanumeric code (uppercase, excluding ambiguous chars: O, 0, I, 1), generated with `crypto.randomBytes`.

**Rationale**:
- 8 chars from a 32-character alphabet (A-Z excluding O, I, 1 + digits 2-9) = 32^8 = ~1 trillion combinations. Collision probability is negligible at realistic league counts.
- Short enough to share verbally or via messaging apps without copy-paste.
- `crypto.randomBytes` (Node.js built-in) avoids an external dependency and is cryptographically secure.
- Unique constraint on `leagues.invite_code` in the database as the final collision guard.

**Alternatives considered**:
- **UUID**: Too long and not user-friendly for manual sharing.
- **Sequential numeric codes**: Predictable and enumerable; would allow brute-force discovery of private leagues.

---

## Decision 6: Outright Market Lock (T-1h before opening match)

**Decision**: A one-time cron job triggered at the scheduled time (opening match kickoff − 60 minutes) sets `outright_markets.status = 'LOCKED'` for all 8 markets simultaneously. No per-market lock.

**Rationale**:
- All 8 markets share a single lock deadline (1 hour before opening match). A single scheduled job is simpler than per-market scheduling.
- The lock time is derived from `matches WHERE phase = 'GROUP' ORDER BY kickoff_time ASC LIMIT 1`, computed at app startup and stored in the application config.
- Submission endpoint validates `outright_markets.status != 'LOCKED'` as the authoritative check.

---

## Summary: All Decisions Resolved

| Item | Resolution |
|------|-----------|
| Tech stack | TypeScript + Node.js 22 + Fastify 5 + Next.js 15 + PostgreSQL 16 + Redis 7 |
| Authentication | @fastify/jwt + Google OAuth 2.0; httpOnly cookies |
| Football data provider | API-Football v3 (webhooks + REST fallback) |
| Match lock enforcement | Server-side gate + minute-cron DB update |
| Invite code format | 8-char crypto random alphanumeric, unique DB constraint |
| Outright lock | Single scheduled job at T-1h before opening match |
