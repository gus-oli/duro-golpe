# Launch Runbook

## Environment

### Backend

Copy `backend/.env.example` and provide:

- `DATABASE_URL`
- `DATABASE_MIGRATION_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `FOOTBALL_DATA_TOKEN` when using the free provider-backed World Cup 2026 seed or polling path
- `FOOTBALL_DATA_POLL_ENABLED` when the backend should run the adaptive provider sync loop automatically
- `LOCK_SCHEDULERS_ENABLED` when the backend should run minute-based match/outright lock jobs
- `LOCK_SCHEDULERS_START_AT` when the lock schedulers should stay armed but delay startup until a specific date/time
- `API_FOOTBALL_KEY` only for the legacy API-Football webhook path
- `WEBHOOK_SECRET`
- `BASE_URL`
- `FRONTEND_URL`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` only for legacy/local OAuth experiments
- `BIND_HOST`
- `PORT`
- `NODE_ENV`

Private-beta recommendations with managed Neon and Upstash:

```dotenv
DATABASE_URL=postgresql://<neon-pooled-runtime-url>?sslmode=require
DATABASE_MIGRATION_URL=postgresql://<neon-direct-migration-url>?sslmode=require
REDIS_URL=rediss://default:<upstash-password>@<upstash-host>:6379
JWT_SECRET=<32-plus-char-secret>
FOOTBALL_DATA_TOKEN=<football-data-token>
FOOTBALL_DATA_POLL_ENABLED=true
LOCK_SCHEDULERS_ENABLED=true
LOCK_SCHEDULERS_START_AT=2026-06-11T00:00:00-03:00
WEBHOOK_SECRET=<16-plus-char-secret>
BASE_URL=https://<public-tunnel-host>
FRONTEND_URL=https://<public-tunnel-host>
BREVO_API_KEY=<brevo-api-key>
BREVO_SENDER_EMAIL=<verified-sender@example.com>
BREVO_SENDER_NAME=Duro Golpe
BIND_HOST=127.0.0.1
PORT=3001
NODE_ENV=production
```

Guidance:

- Use the pooled Neon URL for `DATABASE_URL` when Neon provides one for runtime traffic.
- Use the direct Neon URL for `DATABASE_MIGRATION_URL` so `drizzle-kit migrate` does not rely on a pooled connection.
- Use the TLS Upstash URL for `REDIS_URL`.
- Leave Google OAuth unset for the hosted free beta path; email/password plus reset-by-email is the supported auth story.
- Keep `BIND_HOST=127.0.0.1` for the private-beta topology so the backend is not exposed to the local network by accident.
- Keep `FOOTBALL_DATA_POLL_ENABLED=false` if you only want real fixtures from the seed and plan to drive results manually.
- Set `LOCK_SCHEDULERS_START_AT=2026-06-11T00:00:00-03:00` before the tournament window if you want the lock schedulers deployed but not querying Postgres yet. Prediction routes still enforce the 15-minute lock by kickoff time, but DB statuses will not be proactively updated until schedulers start or a manual lock command is run.

### Frontend

Copy `frontend/.env.example` and provide:

- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_REALTIME_ENABLED`
- `NEXT_PUBLIC_MURAL_POLLING_ENABLED`
- `AUTH_COOKIE_SECURE`

Private-beta recommendations through a public tunnel:

```dotenv
API_URL=http://127.0.0.1:3001
NEXT_PUBLIC_API_URL=https://<public-tunnel-host>
NEXT_PUBLIC_WS_URL=wss://<public-tunnel-host>/ws
NEXT_PUBLIC_REALTIME_ENABLED=true
NEXT_PUBLIC_MURAL_POLLING_ENABLED=false
AUTH_COOKIE_SECURE=true
NODE_ENV=production
```

Guidance:

- `API_URL` is for frontend server-side calls on the operator machine, so keep it on loopback.
- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are for browser traffic, so they must use the public tunnel origin.
- Set `NEXT_PUBLIC_REALTIME_ENABLED=false` for the split-origin zero-cost hosted beta if you want to avoid browser WebSocket noise and rely on polling-first freshness.
- Keep `NEXT_PUBLIC_MURAL_POLLING_ENABLED=false` when WebSockets are healthy so the mural uses Redis/WebSocket events instead of recurring browser polling. Set it to `true` only as a temporary fallback.
- Only set `AUTH_COOKIE_SECURE=false` for temporary plain-HTTP testing on a raw local address. Keep it `true` for tunnel-based private beta because the public tunnel URL is HTTPS.

## Zero-Cost Hosted Beta

Supported free-hosting topology:

```text
Vercel
  -> Next.js frontend
  -> auth cookie lives on the frontend origin

Render free
  -> Fastify backend
  -> football-data poller
  -> schedulers + Redis subscribers

External keepalive
  -> GET https://<render-backend>/health every 5 minutes

Managed services
  -> Neon PostgreSQL
  -> Upstash Redis
```

Hosted environment guidance:

### Backend

```dotenv
DATABASE_URL=postgresql://<neon-pooled-runtime-url>?sslmode=require
DATABASE_MIGRATION_URL=postgresql://<neon-direct-migration-url>?sslmode=require
REDIS_URL=rediss://default:<upstash-password>@<upstash-host>:6379
JWT_SECRET=<32-plus-char-secret>
FOOTBALL_DATA_TOKEN=<football-data-token>
FOOTBALL_DATA_POLL_ENABLED=false
LOCK_SCHEDULERS_ENABLED=true
LOCK_SCHEDULERS_START_AT=2026-06-11T00:00:00-03:00
WEBHOOK_SECRET=<16-plus-char-secret>
BASE_URL=https://<render-backend-host>
FRONTEND_URL=https://<vercel-frontend-host>
BREVO_API_KEY=<brevo-api-key>
BREVO_SENDER_EMAIL=<verified-sender@example.com>
BREVO_SENDER_NAME=Duro Golpe
BIND_HOST=0.0.0.0
PORT=3001
NODE_ENV=production
```

### Frontend

```dotenv
API_URL=https://<render-backend-host>
NEXT_PUBLIC_API_URL=https://<render-backend-host>
NEXT_PUBLIC_WS_URL=wss://<render-backend-host>/ws
NEXT_PUBLIC_REALTIME_ENABLED=true
NEXT_PUBLIC_MURAL_POLLING_ENABLED=false
AUTH_COOKIE_SECURE=true
NODE_ENV=production
```

Hosted free-beta notes:

- Use email/password auth only; do not expose Google login in the Vercel login surface for this phase.
- Use the password-reset flow backed by Brevo instead of operator-driven manual resets.
- Ping `https://<render-backend-host>/health` every 5 minutes from an external uptime service to reduce Render sleep events.
- Keep `FOOTBALL_DATA_POLL_ENABLED=false` while no provider sync is needed.
- Keep `LOCK_SCHEDULERS_ENABLED=true` with `LOCK_SCHEDULERS_START_AT=2026-06-11T00:00:00-03:00` before opening day so the backend deploys with the lockers armed but does not run their minute jobs yet.
- Keep `NEXT_PUBLIC_REALTIME_ENABLED=true` and `NEXT_PUBLIC_MURAL_POLLING_ENABLED=false` when WebSockets are healthy so the mural is push-first instead of polling-first.
- Expect cold starts if the keepalive service fails or Render restarts the free service.
- If Brevo API IP allowlisting is enabled, expect reset-email delivery to break whenever Render free changes egress IP; the recommended beta setup is leaving Brevo API IP allowlisting disabled for this key.

### Hosted password reset verification

Before trusting `/forgot-password` in the hosted beta:

1. Run `npm run db:migrate` against the Neon target used by Render.
2. Confirm the local Drizzle journal includes `0003_free_beta_hosting_and_recovery`.
3. In Neon, verify `password_reset_tokens` exists with the expected indexes.
4. Confirm `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `FRONTEND_URL` are set on Render.
5. Trigger a reset request and confirm the backend no longer logs `relation "password_reset_tokens" does not exist`.
6. If Brevo returns `unrecognised IP address`, disable API IP allowlisting for the beta key or update the allowlist to the current Render egress IP.

### Hosted account + outright media verification

Before trusting `/profile`, friend picks, and `/outrights` in the hosted beta:

1. Run `npm run db:migrate` against the Neon target used by Render.
2. Confirm the local Drizzle journal includes `0005_outright_option_media`.
3. In Neon, verify `outright_options` includes `player_photo_url`, `player_photo_source`, and `player_photo_updated_at`.
4. Open `/outrights` and confirm the page shows markets or an explicit scoped error state instead of silently rendering a blank list.
5. Open a friend-picks modal and confirm it returns data or an empty state instead of a generic internal-server failure.

## Local Demo Bootstrap

From the repository root:

1. `npm run infra:up`
2. `npm run db:migrate`
3. `npm run seed:demo`
4. `npm run typecheck`

Or run the combined bootstrap flow:

1. `npm run bootstrap`

The demo seed is deterministic and does not call API-Football. It prints:

- seeded demo accounts
- league ids and invite codes
- match ids grouped by `SCHEDULED`, `LOCKED`, `LIVE`, and `FINISHED`

All demo accounts share the password `durogolpe123`.

## Provider-Backed Tournament Seed

Use the provider-backed seed when you want real World Cup 2026 fixtures without relying on the demo dataset:

1. Set `FOOTBALL_DATA_TOKEN` in `backend/.env`
2. `npm run seed`

What the provider-backed seed loads immediately:

- all `48` tournament teams
- all `104` tournament fixtures
- placeholder knockout participants for bracket slots the provider has not resolved yet

What happens automatically after that:

- the adaptive poller keeps status and scores moving when `FOOTBALL_DATA_POLL_ENABLED=true`
- the adaptive poller also replaces knockout placeholders with the real teams as soon as `football-data.org` starts filling those match participants
- you do not need to rerun `npm run seed` each time the bracket advances

Optional follow-up modes after the seed:

1. automatic delayed-sync mode
   - set `FOOTBALL_DATA_POLL_ENABLED=true`
   - restart the backend so the adaptive provider poller starts
2. manual contingency mode
   - keep `FOOTBALL_DATA_POLL_ENABLED=false`
   - use `npm run match:override -- <MATCH_ID_OR_PROVIDER_ID> <SCHEDULED|LIVE|FINISHED> [HOME] [AWAY]`

### Optional player-photo enrichment for outrights

If you want player faces in the individual outright cards:

1. configure `API_FOOTBALL_KEY` in `backend/.env`
2. run `npm --workspace=backend run outrights:enrich-player-media -- --limit=10` for a small first pass
3. run `npm --workspace=backend run outrights:enrich-player-media` for the full pass
4. use `npm --workspace=backend run outrights:enrich-player-media -- --refresh-all` when you want to recrawl players that already have cached photos

Operational notes:

- the script runs backend-side only and does not expose provider credentials to the frontend
- API-Football requires `league` or `team` for player search; by default the script uses `league=1` and `season=2022`, which stays in historical World Cup data available to free plans
- override the scope with `API_FOOTBALL_PLAYER_SEARCH_LEAGUE`, `API_FOOTBALL_PLAYER_SEARCH_SEASON`, `--league=<id>`, `--season=<year>`, or `--team=<id>` if needed
- matching is done by player name, with team label used as a tie-breaker when the provider returns multiple candidates
- if the provider does not return a usable photo, the UI falls back to flag or initial-based avatars automatically

If you want the full local showcase dataset after that, run `npm run seed:demo`.

### In-Place Hosted Beta Cutover

If the current hosted beta database already contains demo-oriented users, leagues, mural posts, predictions, or seeded fake competition, do not run the provider-backed seed on top of that state.

Use this cutover flow instead:

1. Capture a backup first.
2. Ensure `FOOTBALL_DATA_TOKEN` is configured in `backend/.env`.
3. Run migrations for the current app version:
   - `npm run db:migrate`
   - if migration metadata drift exists, confirm `backend/drizzle/meta/_journal.json` includes `0003_free_beta_hosting_and_recovery`
4. Clear the existing resettable beta application state in place:
   - `npm run beta:reset -- --confirm`
5. Load real tournament fixtures and catalogs:
   - `npm run seed`
6. Choose the post-seed update mode:
   - automatic polling: set `FOOTBALL_DATA_POLL_ENABLED=true` and restart the backend
   - manual contingency only: leave polling disabled and use `npm run match:override -- ...` as needed
7. Restart the backend if it was running during the reset.
8. Re-run the private-beta verification checklist before inviting players back.

What the reset intentionally removes:

- demo users
- demo leagues and invite flows tied to them
- demo mural posts
- demo predictions, scores, and totals
- demo outright predictions and resolutions
- demo match records and teams

What the provider-backed seed recreates:

- tournament teams
- tournament fixtures
- outright and badge catalogs

What only comes back through real player activity:

- leagues
- mural conversation
- predictions
- rankings driven by real play

What updates fixture state after the seed:

- delayed provider polling from `football-data.org` when enabled
- delayed provider reconciliation of knockout participants as the bracket becomes known
- manual operator overrides when provider updates lag behind the match experience you want to present

## Smoke Environment

For launch smoke validation, keep the backend stack available and let the smoke command resolve the seeded match id automatically:

1. `npm run infra:up`
2. `npm run db:migrate`
3. Ensure `WEBHOOK_SECRET` exists in the current environment or `backend/.env`
4. Start the backend with the configured environment
5. Run `npm run test:launch-smoke`

What the command handles for you:

- re-runs `npm --workspace=backend run seed:smoke`
- extracts the deterministic smoke match UUID
- passes `E2E_MATCH_ID` to Playwright automatically
- lets Playwright reuse or boot the frontend dev server

What still must already exist:

- Postgres and Redis
- the backend HTTP server
- a valid `WEBHOOK_SECRET` in environment configuration

Recommended local environment values:

- `E2E_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001`
- `NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001/ws`

## Private Beta Topology

Canonical local-tunnel beta shape:

```text
Internet
  -> HTTPS public tunnel URL
  -> Cloudflare Tunnel
  -> local Caddy on 127.0.0.1:8080
     -> "/" and Next.js routes -> 127.0.0.1:3000
     -> "/api/v1/*" -> 127.0.0.1:3001
     -> "/ws" -> 127.0.0.1:3001

Operator machine
  -> one frontend process
  -> one backend process
  -> no local Postgres in the canonical beta path
  -> no local Redis in the canonical beta path

Managed services
  -> Neon PostgreSQL
  -> Upstash Redis
```

Operational rules:

- Run exactly one backend instance in the private-beta environment.
- Keep ports `3000`, `3001`, and the local reverse-proxy port bound to loopback only.
- Expose the app publicly through Cloudflare Tunnel instead of opening raw inbound ports on the machine or router.
- Use the templates in `deploy/local-tunnel/` as the source of truth for the tunnel-facing reverse proxy.

## Private-Beta Security Checklist

Run this short checklist before inviting friends to the tunnel URL:

1. Confirm `BIND_HOST=127.0.0.1` in `backend/.env`.
2. Confirm `AUTH_COOKIE_SECURE=true` in `frontend/.env`.
3. Confirm Cloudflare Tunnel is the only intended public entrypoint; do not open raw inbound ports on the router or Windows firewall for `3000`, `3001`, or `8080`.
4. Confirm the backend, frontend, and Caddy listeners are reachable only on loopback addresses from the operator machine.
5. Confirm `JWT_SECRET`, `WEBHOOK_SECRET`, `DATABASE_URL`, and `REDIS_URL` are not reused from the compromised Oracle VM era.
6. Confirm Google OAuth is either disabled or completing without any JWT appearing in the browser URL.
7. Confirm browser realtime connects to `wss://<public-tunnel-host>/ws` without `?token=...` in the websocket URL.
8. Confirm a logged-in user cannot hide another user's mural post and cannot read or subscribe to a league feed they do not belong to.
9. Confirm the legacy `/api/v1/ws/matches/:matchId` websocket side door is not exposed.
10. Check frontend, backend, Caddy, and `cloudflared` logs for auth errors, proxy surprises, or accidental localhost leaks before sharing the link.

## Local-Tunnel Private Beta Setup

### Prerequisites

Before the first private-beta run:

1. Install Node.js 22 and npm on the operator machine.
2. Install and authenticate Cloudflare Tunnel tooling.
3. Ensure Neon and Upstash are provisioned and reachable from the local machine.
4. Keep a local reverse proxy available; the repo templates assume Caddy on `127.0.0.1:8080`.
5. Decide whether the first iteration uses manual process startup or a local process supervisor.

### Reverse Proxy and Tunnel Assets

Use the repo templates as the source of truth:

- `deploy/local-tunnel/Caddyfile`
- `deploy/local-tunnel/cloudflared-config.yml.example`
- `deploy/local-tunnel/README.md`

The local Caddy config preserves same-origin routing for:

- page and asset traffic to the frontend
- `/api/v1/*` to the backend
- `/ws` to the backend with WebSocket upgrade support

The Cloudflare Tunnel config should target the local Caddy listener, not the frontend directly. That keeps:

- auth redirects on one origin
- browser API calls on one origin
- WebSocket URLs on one origin

### Private-Beta Bootstrap

Use this flow for the first private-beta environment:

1. Create `backend/.env` with Neon, Upstash, JWT, webhook, and public tunnel values.
2. Create `frontend/.env` with loopback `API_URL`, public tunnel `NEXT_PUBLIC_*` values, and `AUTH_COOKIE_SECURE=true`.
3. Install dependencies:
   - `npm ci`
4. Start frontend and backend locally:
   - `npm run dev:frontend`
   - `npm run dev:backend`
5. Start local Caddy with the local-tunnel config.
6. Start Cloudflare Tunnel and confirm the public hostname resolves to the local Caddy listener.
7. Run migrations against the managed Postgres target:
   - `npm run db:migrate`
8. Load the default private-beta dataset:
   - `npm run seed:demo`
9. Run the private-beta verification checklist before inviting friends.

Why `seed:demo` is the default:

- it uses the deterministic demo dataset
- it does not require provider availability
- it gives private beta testers a rich environment immediately

## Seed Modes by Environment

Choose seed mode intentionally:

- `npm run seed:demo`
  - Default for local showcase and local-tunnel private beta
  - Seeds the deterministic, feature-rich dataset
- `npm --workspace=backend run seed:smoke`
  - For release verification and smoke automation
  - Prefer disposable data state, a separate Neon branch, or a clearly resettable beta database
- `npm run seed`
  - For provider-backed ingestion when `FOOTBALL_DATA_TOKEN` is configured
  - Uses `football-data.org` v4 `Worldcup` coverage for real 2026 teams and fixtures
  - Pair with `FOOTBALL_DATA_POLL_ENABLED=true` for automatic delayed sync, or with `npm run match:override -- ...` for manual contingency
  - If converting an existing hosted beta, run `npm run beta:reset -- --confirm` before provider seeding so demo social state does not mix with real fixtures

## Outright Resolution

Official outright results can be recorded with:

1. `npm --workspace=backend run outrights:resolve -- <MARKET_CODE> <OPTION_LABEL_OR_ID> [MORE_OPTIONS...]`

Examples:

1. `npm --workspace=backend run outrights:resolve -- CHAMPION Brasil`
2. `npm --workspace=backend run outrights:resolve -- FINALISTS Brasil Franca`

Notes:

- The resolver now matches by id or label and ignores accents for comparison, so `Brasil`, `Franca`, `França`, `Brazil`, or an option UUID can all be used depending on the seeded dataset.

Smoke helpers:

1. `npm --workspace=backend run smoke:lock-match -- <MATCH_ID>`
2. `npm --workspace=backend run smoke:lock-outrights`

## Private-Beta Verification Checklist

Run these checks after each private-beta boot or app update:

1. Open the public tunnel URL and confirm the home page loads over HTTPS.
2. Open a protected route such as `/matches` while logged out and confirm the redirect stays on `https://<public-tunnel-host>/login?...` instead of leaking `localhost` or loopback ports.
3. Register or log in and confirm authenticated navigation still reaches `/matches`, `/leagues`, and `/outrights`.
4. Confirm server-rendered match cards appear on `/matches`.
5. Call `https://<public-tunnel-host>/api/v1/matches` and confirm the backend responds with `200`.
6. Open a match detail page, submit a prediction, refresh, and confirm the persisted prediction still appears.
7. Open a league page and confirm ranking entries render, the social feed appears, and posting to the mural no longer crashes the page.
8. Confirm the browser establishes a WebSocket connection to `wss://<public-tunnel-host>/ws`.
9. Confirm Cloudflare Tunnel is healthy and still pointing to the local Caddy listener.
10. If using real fixtures, confirm either the football-data poller is logging healthy sync windows or the manual override command path is documented and ready.
11. Check frontend, backend, and Caddy logs for startup or proxy errors.
12. Open DevTools and confirm the final page URL and websocket URL do not expose JWTs through query parameters.

If you want deterministic smoke coverage, run the smoke flow against a disposable verification database or branch instead of the shared beta state.

## Launch Smoke Checklist

Run these scenarios against the release candidate:

1. Register a new user through `/register`, confirm the auth cookie is issued, and confirm authenticated access to `/matches`.
2. Browse the matches list and open a match detail page with team metadata rendered.
3. Submit a prediction, refresh the page, and confirm the persisted prediction is still shown.
4. Join a league and confirm the ranking page loads with total points.
5. Open `/outrights`, save selections including `Finalistas`, and confirm locked markets reject edits.
6. Trigger a match lock event and confirm the match detail page disables prediction input without reload.
7. Trigger a live score webhook and confirm the match detail page updates the score in place.
8. Resolve an outright market and confirm total score plus league ranking update for affected users.

## Automated Launch Smoke

The release gate smoke command is:

1. `npm run test:launch-smoke`

Last verified locally on `2026-05-01`.

This command runs the deterministic Chromium-only launch smoke coverage with one worker and validates:

1. register/login and authenticated access to `/matches`
2. match list + detail rendering with team metadata
3. prediction persistence after refresh
4. league creation, join flow, and ranking visibility
5. outright submission plus rejection after markets are locked
6. real match lock propagation to the open match detail page
7. live score webhook propagation to the open match detail page
8. outright resolution updating totals and league ranking

It re-runs `npm --workspace=backend run seed:smoke` before the browser suite, resolves the seeded smoke match UUID automatically, and passes that value into Playwright on every run.

## Backups and Rollback

Before each private-beta reset or notable app update:

1. Capture a logical Postgres backup using the direct Neon migration URL.
2. Keep copies of the frontend and backend environment files that drove the working beta session.
3. Preserve any local reverse-proxy or tunnel config changes that are known-good.

Recommended backup command pattern:

```bash
pg_dump "$DATABASE_MIGRATION_URL" > ./backups/pre-beta-$(date +%Y%m%d-%H%M%S).sql
```

Rollback flow:

1. Stop the frontend, backend, and tunnel processes.
2. Restore the last known-good `.env` files and local reverse-proxy/tunnel config.
3. Restart frontend, backend, local Caddy, and Cloudflare Tunnel.
4. Re-run the private-beta verification checklist.
5. If the failure is schema or data related, restore the pre-change Postgres dump before reopening the session.

Notes:

- Upstash Redis is operational state, not the primary system of record; the critical rollback artifact is the Postgres backup plus the working local runtime configuration.
- This environment is a private beta hosted from a personal machine. Sleep, reboot, or tunnel failure can temporarily take it offline.

## Previous Oracle VM Path

The earlier Oracle-based path remains a historical reference under `deploy/oracle/`, but it is no longer the recommended default for private beta. The local-tunnel path is safer and simpler for the current project stage because it removes the always-exposed public VM while preserving the same-origin reverse-proxy model.

## Current Verification Commands

1. `npm run typecheck`
2. `npm run test:launch-smoke`
3. `npm --workspace=backend run outrights:resolve -- --help` is not implemented; use the usage string in the CLI output when arguments are missing.
4. `npm run match:override -- <MATCH_ID_OR_PROVIDER_ID> <SCHEDULED|LIVE|FINISHED> [HOME] [AWAY]`

## Notes

- `npm run bootstrap` still provisions the deterministic local demo dataset with Docker-managed dependencies for local development.
- `npm run bootstrap:provider` preserves the local provider-backed bootstrap flow.
- The canonical private-beta bootstrap is now migrations plus `npm run seed:demo` with managed Neon and Upstash endpoints.
- `npm run test:launch-smoke` already re-runs `npm --workspace=backend run seed:smoke` and injects the resulting smoke match UUID automatically.
- WebSocket smoke depends on the backend, Redis, and frontend all running with valid auth tokens.
- The launch smoke command intentionally runs on Chromium with a single worker because the scenarios mutate shared backend state.
- The Playwright package is referenced by the repo test scripts but must be installed in the execution environment before browser automation can be run.
