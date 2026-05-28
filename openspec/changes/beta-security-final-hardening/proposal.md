## Why

The private beta is close to being shared with real users, so the application needs a final security hardening pass that addresses the concrete risks found in review rather than only relying on "small audience" assumptions.

The current foundation is good: authenticated state uses an HttpOnly cookie in the supported web flow, database access is mostly parameterized through Drizzle, and league/user scope checks already exist. The remaining risk is concentrated in dependency advisories, missing abuse controls, missing CSRF/origin validation, weak session revocation, and inconsistent route parameter validation.

## What Changes

- Upgrade production dependencies with known advisories, prioritizing JWT/Fastify, Drizzle, WebSocket, UUID, and Next/PostCSS related packages.
- Add a production security gate so builds or release checks fail when high/critical production vulnerabilities remain untriaged.
- Keep the beta session model simple: no refresh token for now, but require bounded access-token lifetime and invalidate sessions after password reset or password change.
- Harden the supported browser auth flow around HttpOnly cookie transport, safe redirects, and logout behavior.
- Add CSRF/origin protection for same-origin Next API proxy mutations.
- Add rate limiting for login, registration, password reset, webhook, and high-risk authenticated mutations.
- Add Zod validation for route params and query params that reach backend data access.
- Add safer response/security headers, including CSP/HSTS/Permissions-Policy where compatible with the hosted beta stack.
- Add regression tests for SQL injection payloads, CSRF/origin rejection, auth brute-force throttling, invalid UUID params, session invalidation, and open redirect prevention.

## Capabilities

### New Capabilities

- `request-surface-hardening`: Covers CSRF/origin validation, rate limiting, route param/query validation, safe redirects, and security response headers.
- `session-lifecycle-hardening`: Covers the beta session model, JWT lifetime, no-refresh-token decision, and session invalidation after credential changes.
- `dependency-security-governance`: Covers production dependency vulnerability remediation and release gating.

### Modified Capabilities

- `session-token-transport-hardening`: Clarifies that supported browser auth stores the durable session token only in an HttpOnly cookie and does not expose it through browser-readable storage or URL transport.

## Impact

- Backend auth, account, league, prediction, mural, scoring, outright, webhook, websocket, and server bootstrap code.
- Frontend Next API proxy routes, auth pages, logout flow, middleware redirect handling, and global response headers.
- Runtime dependencies and lockfile.
- Hosted environment configuration for secure cookies, CORS, CSP/HSTS expectations, and security gate commands.
- Test coverage for security regression paths across backend and frontend proxy behavior.
