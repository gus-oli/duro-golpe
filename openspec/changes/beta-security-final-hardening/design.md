## Context

The application is entering a private beta with real users on the hosted Vercel + Render + managed Postgres/Redis stack. The current security baseline is stronger than the early local-tunnel prototype: the supported browser login/register flow stores the JWT in an `auth_token` HttpOnly cookie, WebSocket subscriptions require an auth cookie, league/user scoped endpoints contain authorization checks, and most SQL is generated through Drizzle's query builder.

The remaining security work is not one isolated bug. It is a cross-cutting hardening pass across dependencies, request handling, session lifecycle, and regression tests. The latest review found no obvious string-concatenated SQL injection path, but it did find production dependency advisories, no explicit refresh-token model, no session revocation after credential changes, missing rate limits, missing CSRF/origin validation on same-origin proxy mutations, inconsistent route param validation, and a few redirect/logout edge cases.

## Goals / Non-Goals

**Goals:**

- Make the hosted private beta safe enough to share with friends without known critical/high production advisories.
- Keep the beta auth model understandable: a bounded access JWT in an HttpOnly cookie, with no refresh token until the product needs multi-device session management.
- Add server-side session invalidation after password change/reset without introducing a full session table unless implementation proves it necessary.
- Add abuse controls for public/auth-sensitive routes and high-risk authenticated mutations.
- Prevent CSRF-style cross-site mutations through the Next API proxy.
- Normalize route param/query validation before backend data access.
- Add security regression tests so the hardening survives future product changes.

**Non-Goals:**

- Do not introduce social login back into the supported hosted flow.
- Do not implement enterprise-grade device/session management, refresh token rotation, or admin session dashboards for this beta.
- Do not add paid security infrastructure or paid WAF products.
- Do not redesign authorization policy for friend picks, mural, ranking, or score visibility beyond closing hardening gaps.

## Decisions

### Keep no-refresh-token beta sessions, but add revocation state

The beta should continue without `refresh_token`. Refresh tokens add database state, rotation rules, reuse detection, device management, and more support burden. For a private World Cup pool, the simpler model is safer to operate: issue one short-enough access JWT in an HttpOnly cookie and make users log in again when it expires.

To address the main weakness of stateless JWTs, add a per-user session invalidation marker. The preferred implementation is a `sessionVersion` or `credentialsUpdatedAt` column on users. JWTs include the current marker at issue time. `requireAuth` verifies the JWT and rejects it if it predates the current marker. Password change and password reset update the marker, immediately invalidating older cookies.

Alternatives considered:

- Refresh token rotation: stronger long-lived sessions, but too much complexity for beta.
- Server-side session table: useful later for per-device logout, but heavier than needed now.
- Only reduce JWT expiry: helps but does not solve stolen-token revocation after password change.

### Treat the Next API proxy as the browser security boundary

Browser clients should talk to same-origin Next routes for mutations. Those routes read the HttpOnly cookie server-side and forward a backend `Authorization: Bearer` header. This keeps JWT access out of browser JavaScript while preserving backend API compatibility.

All mutating Next proxy routes must validate `Origin`/`Referer` against the configured public frontend origin or the current host. Requests with missing/foreign origins should be rejected unless they are safe local development cases. Backend routes should remain protected by auth/authorization because a client can still call Render directly if they know the URL.

Alternatives considered:

- CSRF token cookie + hidden/header token: stronger but requires client plumbing across many forms.
- Rely only on `SameSite=Lax`: acceptable baseline, but not enough as a final beta gate.

### Add Redis-backed rate limiting where Redis is already required

The hosted backend already depends on Redis. Use it for low-cost rate limiting on:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/password-reset/request`
- `POST /api/v1/auth/password-reset/confirm`
- `POST /api/v1/webhooks/api-football`
- High-risk authenticated mutation routes such as batch predictions, mural posts, league creation/join, profile update, and password change

Limits should key by IP plus a stable route bucket, and by user ID when authenticated. Login and reset routes should additionally consider email-based buckets to slow account-specific attacks.

Alternatives considered:

- In-memory rate limits: easy, but Render restarts and horizontal scaling would weaken them.
- Third-party WAF: better at the edge, but violates the zero-cost constraint.

### Validate route params and query before service calls

Add a `validateParams` middleware mirroring `validateBody` and `validateQuery`. Route params that are UUIDs should be parsed as UUIDs. Invite codes, market codes, paging values, and dates should have explicit schemas. Invalid params should return 400 and should not reach Drizzle.

This is not primarily SQL injection protection; Drizzle parameterization already covers that. It prevents noisy 500s, accidental broad queries, and future mistakes when new raw SQL or dynamic ordering gets introduced.

### Patch dependency advisories before release

Dependency remediation is a release blocker because the current audit includes critical JWT advisories and a Drizzle SQL injection advisory. Update production packages to patched compatible versions, then run typecheck/test/security smoke. Add a documented release gate around `npm audit --omit=dev` so high/critical production advisories do not quietly return.

If a transitive advisory has no available fix and is not exploitable in this app's usage, it must be documented as an explicit temporary exception with a reason, owner, and revisit date.

### Harden redirects, logout, headers, and image surfaces

Login `from` redirects must only navigate to same-origin relative paths. Logout should prefer POST for mutation and should not use arbitrary `Referer` to choose a redirect origin. Next response headers should include the existing `nosniff`, `DENY`, and referrer policy plus compatible CSP, HSTS in production, and Permissions-Policy.

Remote images are currently broad enough to allow any HTTPS host. For beta, either restrict known provider hosts or keep browser-safe rendering while documenting the residual privacy/content risk.

## Risks / Trade-offs

- [Dependency upgrades can break Fastify/Drizzle typings or runtime behavior] -> Mitigation: upgrade in one focused task, run backend tests/typecheck, and smoke the hosted auth/matches/leagues/outrights flows before deploy.
- [Origin validation can block legitimate Vercel/Render/proxy traffic if public origin config is wrong] -> Mitigation: centralize origin derivation, allow explicit configured origins, and test local plus hosted origins.
- [Rate limiting can annoy beta users behind shared networks] -> Mitigation: use forgiving beta thresholds, return clear 429 messages, and separate public/auth limits from authenticated mutation limits.
- [Session invalidation adds a database lookup to every authenticated request] -> Mitigation: start with correctness; cache user session marker later only if profiling shows a real bottleneck.
- [No refresh token means users relog after JWT expiry] -> Mitigation: keep 7-day beta expiry or tune after feedback; this is a conscious simplicity tradeoff.
- [CSP can break inline styles/scripts generated by Next or third-party assets] -> Mitigation: start with a compatible policy and tighten after verification.

## Migration Plan

1. Upgrade production dependencies and lockfile.
2. Add session invalidation column/migration and update token issuance/verification.
3. Add request hardening utilities: `validateParams`, origin guard, rate limiter, safe redirect helper, and security headers.
4. Apply the utilities to auth/account/league/prediction/mural/outright/scoring/webhook/proxy routes.
5. Add regression tests and a release-gate command for production audit/typecheck/security tests.
6. Deploy backend first after migrations, then frontend. Verify login, logout, password reset, profile password change, predictions, mural, friend picks, provider sync, and webhook smoke.

Rollback:

- Dependency upgrades can be reverted with lockfile/package rollback if tests fail before deploy.
- Session invalidation column is additive and can remain unused if auth logic must be rolled back.
- Origin/rate-limit guards should be feature-flagged or centralized so emergency relaxation is possible without touching every route.

## Open Questions

- Exact rate-limit thresholds should be chosen during implementation after checking expected beta usage.
- CSP image host allowlist depends on the final decision for player photos and flags.
