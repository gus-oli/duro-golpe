## Context

The app is now running through the intended private-beta topology:

- frontend on the operator machine
- backend on the operator machine
- local Caddy reverse proxy
- Cloudflare Tunnel as the public entrypoint
- managed Neon and Upstash services

This topology is good for keeping raw operator infrastructure off the public internet, but it still depends on the app enforcing its own authorization boundaries correctly. The current code review found a handful of concrete weak points in product-facing authorization and session transport. Those are more relevant to the immediate beta risk than broader infrastructure concerns like container escape, filesystem access, or arbitrary command execution, none of which were found in the current route surface.

Constraints:

- Keep the current local-tunnel topology.
- Do not introduce a large auth framework migration.
- Do not add a full admin UI just for security hardening.
- Preserve the current product flow as much as possible while tightening access control.
- Favor changes that are practical for a one-operator private beta rather than enterprise-style controls.

## Goals / Non-Goals

**Goals:**

- Prevent users from mutating league social content outside their allowed scope.
- Prevent users from subscribing to realtime channels they should not be able to observe.
- Remove or reduce session token leakage through URL query strings.
- Align backend listener exposure with the documented loopback-only local beta model.
- Enforce an explicit visibility rule for user-scoped score and badge endpoints before the beta opens to friends.
- Ship a concise operator hardening checklist that can be rerun before invites.

**Non-Goals:**

- Building a role hierarchy or full moderation console.
- Replacing JWT-based auth entirely.
- Adding a complete CSP/helmet/rate-limit platform in one change, though targeted headers and throttling can be included if they directly support the identified risks.
- Solving every theoretical web security concern before the private beta starts.

## Decisions

### 1. Treat identified authorization gaps as beta blockers

The following findings are considered blockers for opening the beta:

- mural hide operations without post ownership or moderation checks
- realtime subscription paths that do not validate whether the caller can observe the requested league or match
- the unauthenticated legacy match websocket route
- ambiguous "logged in means allowed" handling for user-scoped score and badge endpoints

Why:

- These are not cosmetic concerns. They change what one player can observe or mutate about another player's experience.
- They are likely to be discovered organically by curious friends.

### 2. Reuse existing membership knowledge as the primary authorization primitive

League membership is already the strongest and most relevant access-control concept in the app. The hardening pass should reuse that concept rather than inventing a parallel authorization model.

Practical direction:

- league mural operations must prove active league membership
- league-linked realtime subscriptions must prove active league membership
- match subscriptions should either be public-by-design or require league context if the messages include league-specific effects

Why:

- Membership already maps closely to the product's social trust boundaries.
- It reduces policy ambiguity compared to a more generic ACL system.

### 3. Remove or quarantine legacy websocket access paths

The legacy match websocket route exists for backward compatibility, but an unauthenticated route is not acceptable for a beta that now has authenticated same-origin realtime available.

Direction:

- either remove the legacy route entirely
- or require the same auth and scope checks as the primary `/ws` path

Why:

- Keeping an unauthenticated side door defeats the point of hardening the main realtime path.

### 4. Stop sending session tokens through URL query strings where the app controls the flow

There are two current token-in-URL cases:

- frontend websocket connection query parameter
- Google OAuth callback completion path

Direction:

- move websocket auth to a safer transport such as same-origin cookies or a short-lived server-mediated handoff that does not expose the JWT in the URL
- move Google OAuth completion so the backend or frontend sets the cookie without leaving the JWT in a redirect query

Why:

- URL tokens leak into browser history, copied links, proxy logs, screenshots, and analytics/debug tooling more easily than cookies or headers.

### 5. Make listener exposure match the local-tunnel mental model

The documented private-beta architecture assumes:

```text
Cloudflare Tunnel
  -> local Caddy
     -> frontend/backend on loopback
```

The backend should default to loopback-oriented exposure, not `0.0.0.0`, unless there is a specific local-only operational reason not to.

Why:

- This reduces accidental LAN exposure.
- It aligns implementation with the documented deployment model.

### 6. Declare a visibility policy for score and badge endpoints instead of leaving it accidental

Routes like `/api/v1/users/:userId/score` and `/api/v1/users/:userId/badges` need an explicit policy:

- self-only
- same-league-visible
- or intentionally public to any authenticated user

For the beta, the implementation should pick one and enforce it consistently.

Why:

- Authorization ambiguity is itself a bug.
- The current route shape implies user-specific data, but the guard only checks "logged in".

## Risks / Trade-offs

- [Stricter auth may break existing frontend flows] -> Mitigation: document the intended policy first, then update frontend callers and smoke tests together.
- [Removing URL-token flows may take more coordination than expected] -> Mitigation: prioritize the highest-risk exposure first and keep a narrow fallback plan.
- [Changing match subscription scope could affect live match UX] -> Mitigation: clarify whether match events are public tournament data or league-scoped social data, then enforce the minimal viable rule.
- [Binding to loopback may surprise current operator scripts] -> Mitigation: update the runbook and local startup commands in the same change.

## Migration Plan

1. Define the target access policy for mural mutations, realtime subscriptions, and user-scoped score/badge routes.
2. Implement server-side enforcement for mural hide and realtime subscription scope.
3. Remove or harden the unauthenticated websocket route.
4. Replace or reduce query-string token transport for websocket and OAuth completion flows.
5. Move the backend listener and related local-beta docs toward loopback-only assumptions.
6. Add operator-facing verification steps that explicitly test:
   - a user cannot mutate another user's mural content
   - a user cannot subscribe to another league's realtime feed
   - no raw backend port is reachable from outside the intended local boundary
7. Re-run smoke and a focused manual security checklist before inviting friends.

Rollback strategy:

- If a stricter auth check breaks a product flow unexpectedly, prefer temporarily disabling the newly affected frontend surface rather than re-opening the insecure route.
- If loopback binding breaks the operator bootstrap unexpectedly, restore the old listener only long enough to fix the proxy wiring, not as the permanent beta posture.

## Open Questions

- Should match realtime be treated as public tournament data or only as part of an authenticated product session?
- For score and badge endpoints, is the intended product rule self-only or visible to league peers?
- Is Google OAuth required for the first friend-facing beta, or can it remain disabled until the token-transport hardening is complete?
