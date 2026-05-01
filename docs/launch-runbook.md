# Launch Runbook

## Environment

### Backend

Copy `backend/.env.example` and provide:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `API_FOOTBALL_KEY`
- `WEBHOOK_SECRET`
- `BASE_URL`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` when Google OAuth is enabled

### Frontend

Copy `frontend/.env.example` and provide:

- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

## Deterministic Bootstrap

From the repository root:

1. `npm run infra:up`
2. `npm run db:migrate`
3. `npm run seed`
4. `npm run typecheck`

Or run the combined bootstrap flow:

1. `npm run bootstrap`

## Outright Resolution

Official outright results can be recorded with:

1. `npm --workspace=backend run outrights:resolve -- <MARKET_CODE> <OPTION_LABEL_OR_ID> [MORE_OPTIONS...]`

Examples:

1. `npm --workspace=backend run outrights:resolve -- CHAMPION Brazil`
2. `npm --workspace=backend run outrights:resolve -- FINALISTS Brazil France`

## Launch Smoke Checklist

Run these scenarios against the release candidate:

1. Register a new user through `/register` and confirm redirect to `/matches`.
2. Browse the matches list and open a match detail page with team metadata rendered.
3. Submit a prediction, refresh the page, and confirm the persisted prediction is still shown.
4. Join a league and confirm the ranking page loads with total points.
5. Open `/outrights`, save selections including `Finalistas`, and confirm locked markets reject edits.
6. Trigger a match lock event and confirm the match detail page disables prediction input without reload.
7. Trigger a live score webhook and confirm the match detail page updates the score in place.
8. Resolve an outright market and confirm total score plus league ranking update for affected users.

## Current Verification Commands

1. `npm run typecheck`
2. `npm --workspace=backend run outrights:resolve -- --help` is not implemented; use the usage string in the CLI output when arguments are missing.

## Notes

- WebSocket smoke depends on the backend, Redis, and frontend all running with valid auth tokens.
- The Playwright package is referenced by the repo test scripts but must be installed in the execution environment before browser automation can be run.
