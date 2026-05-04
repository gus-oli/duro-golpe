## Context

The hosted beta environment now serves the Next.js frontend through Caddy on the public entrypoint while the app itself runs on an internal upstream port. The current middleware builds auth redirects from `request.url`, and in the hosted Oracle environment that request origin can resolve to the internal upstream host instead of the public host seen by the user.

This creates a concrete failure mode in production-like traffic: protected navigation such as `/matches` redirects users to `http://localhost:3000/login?...`, which is unreachable from the browser. The app therefore needs to treat proxy-forwarded host and protocol information as canonical when constructing absolute redirects.

Primary stakeholders:
- End users of the hosted beta, who need auth redirects to stay on the public origin
- Operators, who need the hosted Oracle deployment to behave correctly behind Caddy
- Engineering, who needs a fix that is narrow, testable, and resilient to future reverse-proxy deployments

## Goals / Non-Goals

**Goals:**
- Ensure protected-route redirects use the public request origin when the frontend is behind a reverse proxy.
- Keep login and auth-related redirects valid for public Oracle-hosted traffic.
- Preserve current behavior for local development where proxy headers may not be present.
- Add verification so proxy-aware redirect behavior does not regress silently.

**Non-Goals:**
- Replacing Caddy or redesigning the hosted network topology.
- Refactoring all frontend routing behavior outside the affected redirect paths.
- Introducing a custom backend-for-frontend layer just to normalize redirects.
- Changing the login flow semantics beyond fixing the incorrect redirect origin.

## Decisions

### 1. Make middleware redirects proxy-aware by preferring forwarded host and protocol headers

The middleware will derive redirect targets from `request.nextUrl` or a cloned URL object, then override host and protocol from forwarded headers when those headers are present.

Why:
- The problem is specifically about absolute redirect origin under reverse proxying.
- Forwarded headers are the most direct representation of the public request origin in the current deployment model.

Alternatives considered:
- Continue using `request.url` directly. Rejected because it reproduces the current bug in hosted traffic.
- Emit only relative redirect strings everywhere. Rejected because Next middleware redirect helpers still operate on URL objects and should remain explicit about origin correctness.

### 2. Keep local development compatibility by falling back cleanly when forwarded headers are absent

The redirect logic will only use forwarded host/protocol when provided; otherwise it will continue to behave correctly in local direct-access environments.

Why:
- Local development and smoke workflows should not require a proxy just to preserve redirect behavior.
- This keeps the fix production-aware without breaking the current local path.

Alternatives considered:
- Require forwarded headers in all environments. Rejected because it would make local behavior more brittle.

### 3. Treat hosted auth redirect correctness as part of deployment validation

The hosted deployment documentation and verification checklist should explicitly include protected-route navigation and login redirect correctness behind the public proxy.

Why:
- This bug surfaced only after the hosted stack came up, so future deployment checks should look for it intentionally.

Alternatives considered:
- Leave the fix undocumented and rely only on code changes. Rejected because it invites regression during future deploy work.

## Risks / Trade-offs

- [Proxy headers may differ across environments] -> Mitigation: prefer standard forwarded headers and keep local fallback behavior intact.
- [The fix may address middleware redirects but miss another absolute redirect path] -> Mitigation: include verification for auth-related redirect flows, not only `/matches`.
- [Hosted behavior can diverge again if the proxy config changes] -> Mitigation: keep proxy-aware redirect correctness in deployment validation and smoke/manual checks.

## Migration Plan

1. Update frontend redirect construction to honor forwarded host and protocol values when present.
2. Verify local behavior still works without proxy headers.
3. Rebuild and redeploy the frontend in the Oracle environment.
4. Re-run hosted navigation checks for protected routes and login redirects.

Rollback strategy:
- Restore the previous frontend build if the redirect fix introduces broader navigation regressions.
- Keep the Caddy configuration stable during rollback so only the frontend behavior changes.

## Open Questions

- Do we want to add an automated middleware-level regression test now, or treat this as a manual hosted verification fix first and automate in a follow-up?
- Are there any additional absolute redirect paths beyond middleware and auth callback routes that should be normalized in the same change?
