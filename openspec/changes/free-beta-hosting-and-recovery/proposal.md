## Why

The product is ready for a private beta with friends, but the current local tunnel setup still depends on Gustavo's computer staying online and on a fragile quick-tunnel URL. At the same time, split-domain free hosting changes the auth and realtime constraints, so the app needs a zero-cost deployment path, a safer account recovery flow, and a mural experience that still feels alive without depending on authenticated cross-domain WebSockets.

## What Changes

- Define a zero-cost hosted beta path using Vercel for the frontend, Render free for the backend, and an external health pinger to reduce Render sleep events.
- Replace league mural realtime dependency on authenticated WebSockets with adaptive polling, optimistic local merge, and focus-driven refresh behavior so the feed still feels active in free hosting.
- Add email-based password recovery using Brevo as the transactional email provider for reset links and account recovery.
- Remove Google OAuth from the private beta path and standardize on email/password auth plus password reset for this phase.
- Define a lightweight PWA baseline for installability and mobile-friendly shell behavior, while explicitly deferring offline-first caching and service-worker-heavy behavior.

## Capabilities

### New Capabilities
- `zero-cost-beta-hosting`: Covers the supported Vercel + Render free + external pinger deployment model, environment contract, health endpoint, and operational runbook for a zero-cost beta.
- `league-feed-polling`: Covers adaptive polling and near-realtime behavior for the league mural without requiring authenticated WebSocket delivery.
- `email-password-recovery`: Covers password reset request, reset token lifecycle, Brevo delivery, and email-only private beta auth recovery.
- `pwa-installability-baseline`: Covers installability metadata, icons, and supported mobile app-shell behavior without promising offline mode.

### Modified Capabilities
- `hosted-beta-deployment`: The canonical hosted beta path changes from the previous hosted guidance to the zero-cost Vercel + Render free model.

## Impact

- Affected frontend areas: mural feed behavior, auth entrypoints, login UI, installability assets, and mobile shell metadata.
- Affected backend areas: password recovery endpoints and token persistence, Brevo integration, health endpoint, and hosted deployment configuration.
- Operational impact: move away from local tunnel as the default beta path, require external health pinging for Render free, and remove Google OAuth from the supported beta setup.
