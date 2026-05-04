# Launch Runbook

## Environment

### Backend

Copy `backend/.env.example` and provide:

- `DATABASE_URL`
- `DATABASE_MIGRATION_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `API_FOOTBALL_KEY` only when using the provider-backed `npm run seed`
- `WEBHOOK_SECRET`
- `BASE_URL`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` when Google OAuth is enabled
- `PORT`
- `NODE_ENV`

Hosted beta recommendations:

```dotenv
DATABASE_URL=postgresql://<neon-pooled-runtime-url>?sslmode=require
DATABASE_MIGRATION_URL=postgresql://<neon-direct-migration-url>?sslmode=require
REDIS_URL=rediss://default:<upstash-password>@<upstash-host>:6379
JWT_SECRET=<32-plus-char-secret>
WEBHOOK_SECRET=<16-plus-char-secret>
BASE_URL=https://duro-golpe.example.com
FRONTEND_URL=https://duro-golpe.example.com
PORT=3001
NODE_ENV=production
```

Guidance:

- Use the pooled Neon URL for `DATABASE_URL` when Neon provides one for runtime traffic.
- Use the direct Neon URL for `DATABASE_MIGRATION_URL` so `drizzle-kit migrate` does not rely on a pooled connection.
- Use the TLS Upstash URL for `REDIS_URL`.
- Leave Google OAuth unset until the public domain is stable if email/password auth is enough for the first beta.

### Frontend

Copy `frontend/.env.example` and provide:

- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

Hosted beta recommendations:

```dotenv
API_URL=https://duro-golpe.example.com
NEXT_PUBLIC_API_URL=https://duro-golpe.example.com
NEXT_PUBLIC_WS_URL=wss://duro-golpe.example.com
```

The hosted beta intentionally uses one public origin so page requests, SSR fetches, auth redirects, API calls, and WebSocket traffic all resolve through the same domain.

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

Use the provider-backed seed only when you want live tournament ingestion:

1. Set `API_FOOTBALL_KEY` in `backend/.env`
2. `npm run seed`

If you want the full local showcase dataset after that, run `npm run seed:demo`.

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
- `NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001`

## Hosted Beta Topology

Canonical hosted beta shape:

```text
Internet
  -> 80/443
  -> Caddy
     -> "/" and Next.js routes -> 127.0.0.1:3000
     -> "/api/v1/*" -> 127.0.0.1:3001
     -> "/ws" -> 127.0.0.1:3001

Oracle VM
  -> one frontend process
  -> one backend process
  -> no local Postgres
  -> no local Redis

Managed services
  -> Neon PostgreSQL
  -> Upstash Redis
```

Operational rules:

- Run exactly one backend instance in the hosted beta environment.
- Keep ports `3000` and `3001` bound to localhost only.
- Expose only `22`, `80`, and `443` publicly.
- Use the deployment templates in `deploy/oracle/`.

## Oracle VM Setup

### Prerequisites

Before the first hosted deploy:

1. Provision an Oracle VM with enough free-tier headroom for one Next.js process and one Fastify process.
2. Install Node.js 22 and npm system-wide so `systemd` can start both apps without relying on an interactive shell profile.
3. Create a `duro-golpe` Linux user and `/srv/duro-golpe` directory structure.
4. Point your public domain to the VM.
5. Open inbound ports `22`, `80`, and `443`.
6. Provision Neon and Upstash in the nearest practical region to the VM.

### Release Layout

The canonical release layout is:

```text
/srv/duro-golpe/
  current -> /srv/duro-golpe/releases/<release-id>
  releases/
    <release-id>/
  shared/
    backend.env
    frontend.env
```

Notes:

- `current` is a symlink to the active release.
- `shared/backend.env` and `shared/frontend.env` persist across releases.
- `deploy/oracle/duro-golpe-backend.service` and `deploy/oracle/duro-golpe-frontend.service` assume that layout.

### Reverse Proxy and Services

Use the repo templates as the source of truth:

- `deploy/oracle/Caddyfile`
- `deploy/oracle/duro-golpe-backend.service`
- `deploy/oracle/duro-golpe-frontend.service`
- `deploy/oracle/README.md`

The `Caddyfile` preserves same-origin routing for:

- page and asset traffic to the frontend
- `/api/v1/*` to the backend
- `/ws` to the backend with WebSocket upgrade support

## Hosted Bootstrap

Use this flow for the first public beta environment:

1. Create `shared/backend.env` with Neon, Upstash, JWT, webhook, and domain values.
2. Create `shared/frontend.env` with the single-origin HTTPS and WSS values.
3. Upload the application into a new `releases/<release-id>` directory.
4. In that release directory, run `npm ci`.
5. Build both apps:
   - `npm --workspace=backend run build`
   - `npm --workspace=frontend run build`
6. Repoint `current` to the new release.
7. Run migrations with the hosted environment loaded:
   - `npm run db:migrate`
8. Load the default hosted beta dataset:
   - `npm run bootstrap:hosted`
9. Install the `systemd` units and enable them:
   - `sudo systemctl enable duro-golpe-backend duro-golpe-frontend`
10. Start or restart both services.
11. Place the Caddy config and reload Caddy.
12. Run the hosted verification checklist before inviting users.

Why `bootstrap:hosted` is the default:

- it uses the deterministic demo dataset
- it does not rely on Docker-managed infrastructure
- it gives the public beta a rich, explorable starting point

## Seed Modes in Hosted Environments

Choose seed mode intentionally:

- `npm run bootstrap:hosted`
  - Default for the first hosted beta database
  - Runs migrations and loads the deterministic demo dataset
- `npm --workspace=backend run seed:smoke`
  - For release verification or isolated smoke environments
  - Prefer a disposable database or a separate Neon branch
  - Do not run this against the shared public beta database unless you intend to replace its state
- `npm run bootstrap:hosted:provider`
  - For provider-backed ingestion when `API_FOOTBALL_KEY` is configured
  - Use only when you explicitly want live provider data instead of the demo-first beta dataset

## Outright Resolution

Official outright results can be recorded with:

1. `npm --workspace=backend run outrights:resolve -- <MARKET_CODE> <OPTION_LABEL_OR_ID> [MORE_OPTIONS...]`

Examples:

1. `npm --workspace=backend run outrights:resolve -- CHAMPION Brazil`
2. `npm --workspace=backend run outrights:resolve -- FINALISTS Brazil France`

Smoke helpers:

1. `npm --workspace=backend run smoke:lock-match -- <MATCH_ID>`
2. `npm --workspace=backend run smoke:lock-outrights`

## Hosted Verification Checklist

Run these checks after each hosted release:

1. Open the public home page and confirm it loads over HTTPS.
2. Open a protected route such as `/matches` while logged out and confirm the redirect stays on `https://<domain>/login?...` instead of leaking `localhost` or another upstream host.
3. Register or log in and confirm authenticated navigation still reaches `/matches`, `/leagues`, and `/outrights`.
4. Confirm server-rendered match cards appear on `/matches`.
5. Call `https://<domain>/api/v1/matches` and confirm the backend responds with `200`.
6. Open a match detail page, submit a prediction, refresh, and confirm the persisted prediction still appears.
7. Open a league page and confirm ranking entries render.
8. Confirm the browser establishes a WebSocket connection to `wss://<domain>/ws`.
9. Check `systemctl status duro-golpe-backend duro-golpe-frontend` and confirm both services are healthy.
10. Check Caddy logs and backend logs for startup or proxy errors.

If you want deterministic smoke coverage, run the smoke flow against a disposable verification environment instead of the shared public beta database.

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

Before each hosted release:

1. Capture a logical Postgres backup using the direct Neon migration URL.
2. Keep the current release directory available until the new release is verified.
3. Preserve `shared/backend.env` and `shared/frontend.env` outside the release artifact.

Recommended backup command pattern:

```bash
pg_dump "$DATABASE_MIGRATION_URL" > /srv/duro-golpe/backups/pre-release-$(date +%Y%m%d-%H%M%S).sql
```

Rollback flow:

1. Repoint `/srv/duro-golpe/current` to the previous release directory.
2. Restart `duro-golpe-backend` and `duro-golpe-frontend`.
3. Re-run the hosted verification checklist.
4. If the failure is schema or data related, restore the pre-release dump before reopening the environment.

Notes:

- Upstash Redis is operational state, not the primary system of record; the critical rollback artifact is the Postgres backup plus the previous app release.
- If the release changed the shared public beta data in a destructive way, restore the database before inviting users back in.

## Current Verification Commands

1. `npm run typecheck`
2. `npm run test:launch-smoke`
3. `npm --workspace=backend run outrights:resolve -- --help` is not implemented; use the usage string in the CLI output when arguments are missing.

## Notes

- `npm run bootstrap` still provisions the deterministic local demo dataset with Docker-managed dependencies.
- `npm run bootstrap:provider` preserves the old local provider-backed bootstrap flow.
- `npm run bootstrap:hosted` is the canonical first-load path for the Oracle VM hosted beta.
- `npm run bootstrap:hosted:provider` exists for the hosted case where you explicitly want provider-backed ingestion.
- `npm run test:launch-smoke` already re-runs `npm --workspace=backend run seed:smoke` and injects the resulting smoke match UUID automatically.
- WebSocket smoke depends on the backend, Redis, and frontend all running with valid auth tokens.
- The launch smoke command intentionally runs on Chromium with a single worker because the scenarios mutate shared backend state.
- The Playwright package is referenced by the repo test scripts but must be installed in the execution environment before browser automation can be run.
