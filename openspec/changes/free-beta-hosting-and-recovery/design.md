## Context

The product has reached the point where the remaining blocker is not core gameplay, but stable zero-cost delivery for a private beta. The previous local tunnel model validated the product, but it still depends on a personal computer staying online and on a tunnel URL that can change across restarts. The chosen free-hosting direction introduces new constraints: Vercel is best suited for the Next.js frontend, Render free can host the backend but may sleep, and split frontend/backend origins make authenticated WebSocket delivery and backend-owned cookies less ergonomic than the local single-origin setup.

At the same time, the beta still needs basic account autonomy. Removing Google OAuth simplifies free hosting, but email/password auth then needs password recovery. The application already has good polling fallbacks for matches and ranking, so the remaining realtime-sensitive gap is the league mural.

## Goals / Non-Goals

**Goals:**
- Define a supported zero-cost beta deployment path with Vercel frontend, Render free backend, and an external health pinger.
- Preserve a lively league mural experience without depending on authenticated cross-domain WebSockets.
- Add password recovery using Brevo so private-beta users can recover access without operator intervention.
- Simplify auth for this phase by removing Google OAuth from the supported beta experience.
- Establish a minimal PWA baseline for installability and mobile-friendly shell behavior.

**Non-Goals:**
- True sub-second realtime across the app.
- Offline-first support, background sync, or service-worker-heavy caching.
- Solving cross-subdomain cookie sharing without a custom domain.
- Adding paid infrastructure, domains, or email providers.
- Building a full admin panel for account recovery or live operations.

## Decisions

### 1. Canonical hosted beta path becomes `Vercel frontend + Render free backend + external pinger`
This is the best zero-cost route that removes dependence on a personal computer while keeping public URLs stable. It accepts split origins and free-tier sleep risk in exchange for zero recurring cost.

Alternatives considered:
- Local tunnel: validated the app, but still depends on the operator's machine and unstable quick-tunnel URLs.
- Railway/Fly.io: operationally cleaner, but not acceptable under a strict zero-spend constraint.
- AWS free tier: more infrastructure complexity and not reliably always-free for the required app shape.

### 2. League mural shifts from WebSocket-primary to polling-primary
The mural will behave like a near-realtime feed instead of a hard realtime chat. The feed will load initially, merge optimistic local posts immediately, poll while visible, pause when hidden, and refetch on focus. This preserves the social feel without making cross-origin authenticated WebSockets a deployment blocker.

Alternatives considered:
- Keep WebSocket as the primary mural transport: better realtime feel, but brittle in split-origin free hosting.
- Introduce ticket-based WebSocket auth: technically cleaner than cookie-based auth, but too much complexity for this phase.
- Remove mural freshness altogether: operationally easy, but damages the social loop too much.

### 3. Password recovery uses Brevo-delivered email reset links
Brevo fits the zero-cost constraint better than domain-dependent developer-first providers. Password recovery will be email-link based, with short-lived single-use reset tokens stored server-side.

Alternatives considered:
- Manual reset only: operationally cheap, but not a real product-grade account experience.
- Gmail SMTP: viable as a last-resort workaround, but weaker operationally and less predictable for transactional delivery.
- Resend: attractive developer experience, but less practical without a custom domain.

### 4. Google OAuth is removed from the supported private-beta flow
Keeping Google OAuth in a split-origin zero-cost deployment creates more friction than value. Email/password plus reset-by-email is the simplest stable auth story for this phase.

Alternatives considered:
- Keep Google OAuth and accept split-domain fragility: too error-prone for a small beta.
- Rebuild OAuth with one-time code exchange now: viable long-term, but out of proportion for this hosting cutover.

### 5. PWA support is scoped to installability baseline, not offline capability
The app already has manifest metadata and mobile-friendly shell direction. This change will treat PWA as an installability baseline: manifest, icons, standalone shell expectations, and honest non-offline behavior. Offline capability is explicitly deferred.

Alternatives considered:
- Full offline-first PWA: too much scope for low immediate beta value.
- Ignore PWA entirely: misses an easy mobile-friendly improvement for friends using the app repeatedly during the tournament.

## Risks / Trade-offs

- **[Render free still sleeps or restarts]** → Mitigate with a lightweight `/health` endpoint, external ping every 5 minutes, and explicit cold-start expectations in the runbook.
- **[Polling feels less alive than WebSockets]** → Mitigate with adaptive cadence, focus-driven refresh, optimistic post insertion, deduped merge, and subtle “new messages” indicators.
- **[Brevo deliverability is weaker without a custom domain]** → Mitigate by verifying a sender address, documenting sender expectations, and treating this as good-enough for private beta rather than polished production mail.
- **[Removing Google OAuth increases signup friction]** → Mitigate by keeping the email/password flow simple and adding self-service password recovery.
- **[Split origins complicate future realtime ambitions]** → Mitigate by documenting the trade-off now and leaving room for a later custom-domain or ticket-based WebSocket design.

## Migration Plan

1. Prepare Vercel frontend and Render free backend environment contracts.
2. Add backend health endpoint and document external pinging cadence.
3. Remove Google login entrypoints from the supported beta UI and docs.
4. Implement Brevo-based password recovery flow and env configuration.
5. Convert league mural to polling-primary behavior with optimistic local merge.
6. Add/finish PWA installability metadata and assets without introducing offline claims.
7. Update hosted deployment documentation and release checklist for the zero-cost stack.

Rollback strategy:
- Hosting rollback: fall back to the existing local deployment model if hosted setup is not ready.
- Auth rollback: keep plain email/password login even if reset email needs to be temporarily disabled.
- Mural rollback: keep initial load plus manual refresh if adaptive polling regresses unexpectedly.

## Open Questions

- Which external pinger service will be the documented default for keeping Render warm?
- Should the first beta hide Google auth completely or leave it visible but explicitly disabled?
- Is a subtle “new messages” indicator enough for the mural, or does the feed also need soft auto-insert at the top when the user is already near the top of the list?
