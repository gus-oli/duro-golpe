## 1. Zero-cost hosting

- [x] 1.1 Add a lightweight backend `/health` endpoint for external keepalive pinging.
- [x] 1.2 Update backend and frontend environment contracts for the supported `Vercel + Render free` split-origin deployment.
- [x] 1.3 Update the hosted deployment runbook with Vercel setup, Render free setup, and external ping cadence guidance.

## 2. Email-only auth and password recovery

- [x] 2.1 Remove Google OAuth from the supported private-beta login surface and documentation.
- [x] 2.2 Add backend password reset request and reset confirmation endpoints with single-use expiring reset tokens.
- [x] 2.3 Integrate Brevo delivery configuration for password reset emails.
- [x] 2.4 Add frontend `forgot password` and `reset password` flows for the email-only auth experience.
- [x] 2.5 Add automated coverage for password reset and for the absence of Google OAuth in the hosted beta path.

## 3. League mural polling

- [x] 3.1 Replace league mural WebSocket-primary freshness with adaptive polling, pause-on-hidden behavior, and refetch-on-focus behavior.
- [x] 3.2 Preserve optimistic local post insertion and deduplicated merge for posts returned by polling.
- [x] 3.3 Add subtle freshness affordances for new mural messages without forcing disruptive full-list reloads.

## 4. PWA baseline

- [x] 4.1 Add installability assets and metadata required by the supported PWA baseline, including manifest icons.
- [x] 4.2 Review the installed-app shell behavior and ensure the product does not claim offline capability for beta gameplay.

## 5. Hosted beta validation

- [ ] 5.1 Validate the full hosted flow on Vercel + Render free, including auth, mural posting, matches, leagues, and outrights.
- [ ] 5.2 Validate password reset delivery through Brevo in the hosted environment.
- [ ] 5.3 Validate the external `/health` pinger setup and document expected cold-start behavior if keepalive fails.
