# Launch Runbook

## Environment

### Backend

Copy `backend/.env.example` and provide:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `API_FOOTBALL_KEY` only when using the provider-backed `npm run seed`
- `WEBHOOK_SECRET`
- `BASE_URL`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` when Google OAuth is enabled

### Frontend

Copy `frontend/.env.example` and provide:

- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

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

For launch smoke validation, use the dedicated smoke seed and export the generated match id:

1. `npm run infra:up`
2. `npm run db:migrate`
3. `npm --workspace=backend run seed:smoke`
4. Copy the printed `Match ID` into `E2E_MATCH_ID`
5. Ensure `WEBHOOK_SECRET` matches the value configured for the backend
6. Start the backend with the configured environment
7. Run `npm run dev:frontend` or let Playwright boot the frontend automatically

Recommended local environment values:

- `E2E_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:3001`
- `NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001`

## Outright Resolution

Official outright results can be recorded with:

1. `npm --workspace=backend run outrights:resolve -- <MARKET_CODE> <OPTION_LABEL_OR_ID> [MORE_OPTIONS...]`

Examples:

1. `npm --workspace=backend run outrights:resolve -- CHAMPION Brazil`
2. `npm --workspace=backend run outrights:resolve -- FINALISTS Brazil France`

Smoke helpers:

1. `npm --workspace=backend run smoke:lock-match -- <MATCH_ID>`
2. `npm --workspace=backend run smoke:lock-outrights`

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

It also re-runs `npm --workspace=backend run seed:smoke` before the browser suite so the dedicated smoke match and outright markets start from a clean state on every pass.

## Current Verification Commands

1. `npm run typecheck`
2. `npm run test:launch-smoke`
3. `npm --workspace=backend run outrights:resolve -- --help` is not implemented; use the usage string in the CLI output when arguments are missing.

## Notes

- `npm run bootstrap` now provisions the deterministic local demo dataset.
- `npm run bootstrap:provider` preserves the old provider-backed bootstrap flow.
- `npm run test:launch-smoke` already re-runs `npm --workspace=backend run seed:smoke` before the browser suite.
- WebSocket smoke depends on the backend, Redis, and frontend all running with valid auth tokens.
- The launch smoke command intentionally runs on Chromium with a single worker because the scenarios mutate shared backend state.
- The Playwright package is referenced by the repo test scripts but must be installed in the execution environment before browser automation can be run.
