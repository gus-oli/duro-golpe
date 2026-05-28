## 1. Dependency Security Gate

- [ ] 1.1 Upgrade production dependencies with known advisories, prioritizing `@fastify/jwt`, `fastify`, `drizzle-orm`, `@fastify/websocket`, `ws`, `uuid`, `next`, and affected transitive packages where compatible
- [ ] 1.2 Refresh `package-lock.json` and verify backend/frontend builds still resolve with the upgraded dependency graph
- [ ] 1.3 Add a repeatable production dependency audit command for release checks, scoped to production dependencies
- [ ] 1.4 Document any remaining unfixable high/critical advisory with exploitability analysis, mitigation, owner, and revisit date

## 2. Session Lifecycle

- [ ] 2.1 Add an additive user session invalidation marker to the database schema and migration
- [ ] 2.2 Include the current session invalidation marker when issuing login, registration, and OAuth JWTs
- [ ] 2.3 Update authenticated request verification to reject tokens older than the user's current invalidation marker
- [ ] 2.4 Update password change and password reset success paths to advance the invalidation marker
- [ ] 2.5 Verify the supported browser flow still uses only the `auth_token` HttpOnly cookie and does not introduce a refresh token
- [ ] 2.6 Add tests for expired, malformed, and stale-after-password-change session rejection

## 3. Request Hardening Utilities

- [ ] 3.1 Add a reusable `validateParams` middleware for backend route params using Zod schemas
- [ ] 3.2 Add a centralized same-origin guard for mutating Next API proxy routes
- [ ] 3.3 Add a Redis-backed rate limiter with IP, route, user, and email bucket support where needed
- [ ] 3.4 Add a safe redirect helper for login and logout flows that only allows same-origin relative paths
- [ ] 3.5 Add compatible CSP, HSTS, Permissions-Policy, and existing security headers to hosted frontend responses

## 4. Route Coverage

- [ ] 4.1 Apply param/query validation to backend auth, account, league, match, prediction, mural, scoring, outright, webhook, and websocket route inputs where applicable
- [ ] 4.2 Apply rate limits to login, registration, password reset request/confirm, webhook, league creation/join, mural posts, batch predictions, outright predictions, profile updates, and password changes
- [ ] 4.3 Apply same-origin mutation validation to all mutating Next API proxy routes
- [ ] 4.4 Remove or harden GET logout behavior so logout cannot be abused for cross-site nuisance redirects
- [ ] 4.5 Restrict or document remote image host handling for flags, avatars, and player photos under the final CSP

## 5. Security Regression Tests

- [ ] 5.1 Add SQL injection payload tests for login, league join/ranking, friend picks, matches filters, mural, predictions, and outrights
- [ ] 5.2 Add CSRF/origin rejection tests for mutating Next API proxy routes
- [ ] 5.3 Add rate-limit tests for login, password reset, webhook, and representative authenticated mutations
- [ ] 5.4 Add invalid route param/query tests that assert 400 responses before service/database calls
- [ ] 5.5 Add open redirect tests for login `from` and logout redirect behavior
- [ ] 5.6 Add security header tests for hosted frontend responses

## 6. Verification And Release Readiness

- [ ] 6.1 Run backend typecheck, backend tests, frontend typecheck/build, and the production dependency audit gate
- [ ] 6.2 Run launch smoke coverage for login, protected pages, predictions, league ranking, mural, outrights, password reset, and provider/webhook paths
- [ ] 6.3 Update the launch runbook with the security gate, known no-refresh-token decision, rate-limit behavior, and hosted environment requirements
- [ ] 6.4 Validate the OpenSpec change and mark tasks complete only after tests and smoke checks pass
