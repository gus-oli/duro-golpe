## 1. Authorization Boundaries

- [x] 1.1 Restrict mural hide operations so only an allowed actor can hide a post, and always validate the post against the claimed league context
- [x] 1.2 Define and enforce a clear visibility policy for `/api/v1/users/:userId/score`, `/api/v1/users/:userId/scores/matches`, and `/api/v1/users/:userId/badges`
- [x] 1.3 Add focused tests for cross-user and cross-league access attempts on sensitive routes

## 2. Realtime Hardening

- [x] 2.1 Remove or harden the unauthenticated legacy match websocket route
- [x] 2.2 Enforce scope checks for `subscribe:mural` and `subscribe:match` so clients cannot observe leagues or matches outside the intended visibility policy
- [x] 2.3 Add focused tests for unauthorized websocket connection and subscription attempts

## 3. Session and Transport Hardening

- [x] 3.1 Replace websocket URL-query token usage with a safer session transport
- [x] 3.2 Remove JWT-in-query handling from the Google OAuth completion flow or keep Google OAuth disabled until that handoff is hardened
- [x] 3.3 Review proxy-aware redirect handling so forwarded headers cannot produce unsafe or surprising auth redirects

## 4. Local Beta Boundary Hardening

- [x] 4.1 Bind backend service exposure to the intended local boundary for the tunnel topology and update any startup assumptions that depend on `0.0.0.0`
- [x] 4.2 Update the local-tunnel runbook with an operator checklist for secrets, listener exposure, firewall expectations, and final pre-invite verification

## 5. Verification

- [x] 5.1 Re-run typecheck and affected automated tests after the hardening changes
- [x] 5.2 Perform a focused manual security pass that verifies:
  - a logged-in user cannot hide another user's mural post without authorization
  - a logged-in user cannot subscribe to another league's mural feed
  - the legacy websocket side door is gone or equivalently protected
  - no JWT is exposed in the final browser URL during the supported auth flows
