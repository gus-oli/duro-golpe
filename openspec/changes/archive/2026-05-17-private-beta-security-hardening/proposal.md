## Why

The product is now close enough to the intended beta experience that the remaining launch blocker is no longer feature breadth. It is trust: before inviting real friends, the app needs a focused hardening pass over authorization boundaries, realtime subscriptions, local-machine exposure, and token transport.

The current review surfaced a small set of concrete risks:

- mural hide endpoints can mutate posts without proving the caller owns or moderates that post
- realtime subscriptions do not clearly enforce league or match visibility scope
- a legacy match websocket route is exposed without authentication
- session tokens still travel in URL query strings for Google OAuth callback completion and websocket connection setup
- the backend currently binds to `0.0.0.0` even though the canonical local beta topology expects loopback-only app services behind Caddy and Cloudflare Tunnel
- several user-scoped score/badge endpoints currently rely on "logged in" rather than an explicit visibility policy

None of these issues look like "remote shell on the operator machine" vulnerabilities, but they are exactly the kind of authorization and boundary mistakes that create uncomfortable beta incidents once real users start poking around.

## What Changes

- Harden write authorization for league social operations so users cannot mutate mural posts outside their allowed scope.
- Require authenticated, scope-checked websocket subscriptions for match and league realtime channels, and retire or harden the unauthenticated legacy websocket path.
- Replace URL-query token transport where practical so session tokens stop leaking into logs, browser history, and copied links.
- Restrict the backend's local beta runtime to loopback-oriented boundaries that match the documented tunnel topology instead of relying on `0.0.0.0`.
- Define and enforce an explicit product policy for user-scoped score and badge endpoints: either self-only, same-league-only, or intentionally public.
- Update the beta runbook with a final "before inviting friends" hardening checklist.

## Capabilities

### New Capabilities
- `private-beta-access-control`: Defines explicit authorization rules for sensitive beta mutations and per-user data access.
- `realtime-subscription-hardening`: Defines authenticated, scope-aware realtime subscriptions and removal of unauthenticated fallback channels.
- `local-beta-boundary-hardening`: Defines loopback-only operator service exposure and operator-facing hardening checks for the local-tunnel topology.

### Modified Capabilities
- `proxy-aware-auth-redirects`: The auth and session handoff model now needs to avoid URL-query session token leakage while preserving proxy-aware redirects.
- `local-tunnel-beta-deployment`: The canonical local beta deployment docs need a stricter security posture for app listeners, firewall expectations, and final operator checks.

## Impact

- Affected backend code: auth middleware, mural routes/services, websocket plugin/subscriber wiring, scoring/badges routes, and backend boot/listen configuration.
- Affected frontend code: websocket connection setup, Google OAuth callback completion, and any route handlers that currently depend on query-string session tokens.
- Affected docs and operator flow: `docs/launch-runbook.md`, local-tunnel guidance, and the final release checklist before inviting real players.
- The goal is not a full "security platform" rewrite. This is a targeted private-beta hardening pass over the risks already identified in the current codebase.
