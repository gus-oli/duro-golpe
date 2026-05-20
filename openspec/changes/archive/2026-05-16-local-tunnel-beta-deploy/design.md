## Context

The project already runs as a two-process web application: Next.js serves pages and frontend API routes, while Fastify handles the main HTTP API, WebSocket sessions, schedulers, and Redis-backed background flows. The previous hosted-beta direction used a public Oracle VM with Caddy in front, but that path proved too exposed and too operationally heavy for a small private beta run by one developer.

The new target is a local-machine beta runtime:
- the application runs on the operator's own computer
- the app remains reachable through a public tunnel URL
- PostgreSQL and Redis stay managed in Neon and Upstash
- browser traffic still sees one public origin for pages, auth, API calls, and WebSockets

This is cross-cutting because it changes deployment shape, environment contracts, runbook guidance, bootstrap expectations, and release verification. It also intersects with existing seeding capabilities because the private beta still needs deterministic demo data on first load.

Primary stakeholders:
- Operator: wants a low-cost, low-risk way to let friends play without maintaining a public VM
- Engineering: wants a deployment shape that matches the current monolith-plus-realtime architecture
- Beta users: need auth, SSR pages, APIs, and WebSocket flows to behave as one coherent site

## Goals / Non-Goals

**Goals:**
- Define a canonical private-beta runtime that keeps frontend, backend, auth, and WebSocket traffic on one public origin.
- Reuse managed Neon and Upstash services so the operator's machine does not own persistent database infrastructure.
- Keep deployment simple enough for one developer to run from a personal machine without exposing raw inbound ports.
- Preserve deterministic first-load bootstrap through migrations plus demo seeding.
- Document the difference between local development, private beta, and previous public-VM deployment assumptions.

**Non-Goals:**
- Hardening a public VM deployment for this change.
- Full enterprise-grade uptime, HA, or unattended failover.
- Re-architecting the backend into separate web and worker services.
- Replacing Cloudflare Tunnel with multiple public app hosts or split frontend/backend domains.
- Eliminating the requirement that the operator's machine stay online during beta sessions.

## Decisions

### 1. Use the local machine as the only application host, with Cloudflare Tunnel as the public entrypoint

The private beta runtime will run the app locally and expose it through Cloudflare Tunnel instead of directly exposing a public VM.

Why:
- This removes the largest attack surface from the current path: a directly reachable VM with long-lived public services.
- It keeps the operator workflow simple: run app locally, let friends connect through a tunnel URL.

Alternatives considered:
- Continue with the Oracle VM. Rejected because it already proved operationally unsafe and too heavy for the target audience.
- Use a split frontend/backend hosting model. Rejected because it increases origin, cookie, and routing complexity.

### 2. Keep a single-origin public runtime through local Caddy

Public traffic will enter through one tunnel URL and hit a local reverse proxy:
- `/` and app routes -> frontend on `127.0.0.1:3000`
- `/api/v1/*` -> backend on `127.0.0.1:3001`
- `/ws` -> backend on `127.0.0.1:3001`

Why:
- The codebase already benefits from same-origin behavior for auth cookies, SSR fetches, redirects, and WebSocket URLs.
- Reusing the proxy pattern from the Oracle path preserves behavior while changing only the host.

Alternatives considered:
- Tunnel directly to the Next.js frontend. Rejected because browser API and WebSocket traffic would then need a second public origin or more proxy complexity.
- Expose frontend and backend through separate tunnel URLs. Rejected because it reintroduces cross-origin coordination and more failure modes.

### 3. Use Neon and Upstash as the canonical stateful dependencies for private beta

The private-beta path will standardize:
- Neon pooled runtime connection for `DATABASE_URL`
- Neon direct connection for `DATABASE_MIGRATION_URL`
- Upstash TLS Redis URL for `REDIS_URL`

Why:
- Persistent data stays outside the operator's machine, reducing the blast radius of host restarts or local OS issues.
- These services already fit the current codebase without architectural change.

Alternatives considered:
- Run Postgres and Redis locally under Docker. Rejected as the canonical beta path because it increases local state management and backup risk, though it remains valid for development.
- Run everything fully local without managed services. Rejected because the operator explicitly wants to keep Neon and Upstash.

### 4. Distinguish local development URLs from private-beta public URLs explicitly

The environment model will separate:
- server-to-server local addresses, such as frontend SSR calls to `127.0.0.1:3001`
- browser-facing public addresses, such as the Cloudflare Tunnel URL for APIs and WebSockets
- backend public origin awareness through `BASE_URL` and `FRONTEND_URL`

Why:
- The current app mixes browser fetches, SSR fetches, auth cookies, and WebSocket endpoints.
- Clear separation reduces the chance of repeating localhost-leak or insecure-cookie issues.

Alternatives considered:
- Point every variable to the public tunnel URL. Rejected because local server-side calls can remain internal and simpler.
- Keep everything at localhost semantics. Rejected because beta users need public URLs and secure cookies.

### 5. Use demo seed as the default private-beta bootstrap dataset

The initial private-beta boot flow will remain:
1. configure managed services
2. run migrations
3. run `seed:demo`
4. validate public tunnel behavior

Why:
- The demo seed already creates a rich, deterministic environment that is better suited for friend testing than the minimal smoke dataset.
- This avoids needing provider-backed data or manual content creation on first start.

Alternatives considered:
- Bootstrap with `seed:smoke`. Rejected because it is too minimal for exploratory playtesting.
- Bootstrap with provider-backed seed. Rejected because it adds an external dependency the beta does not need to start.

### 6. Treat the local machine as a supervised but not always-on host

The private-beta design will assume:
- app processes can be restarted locally in a predictable way
- the machine may sleep, reboot, or lose connectivity
- documentation must frame the environment as a private beta, not a durable public service

Why:
- This path optimizes for simplicity and safety, not guaranteed uptime.
- Expectations must match the host reality so operators and testers understand the trade-off.

Alternatives considered:
- Document the setup as production-like hosting. Rejected because it overpromises reliability that a personal machine does not provide.

## Risks / Trade-offs

- [Operator machine sleeps or reboots] -> Mitigation: document this as a private-beta host, not a durable service, and include simple restart steps.
- [Tunnel URL changes or tunnel process stops] -> Mitigation: treat the tunnel as first-class runtime dependency in the runbook and include public URL verification in the checklist.
- [Public/private URL variables drift apart] -> Mitigation: define explicit env contracts for local internal addresses versus public browser-facing addresses.
- [Managed data services remain internet dependencies] -> Mitigation: accept this for the beta, keep credentials externalized, and preserve local development as a separate fallback path.
- [Friends experience downtime when the operator is offline] -> Mitigation: position the environment as private beta sessions, not a 24/7 service.

## Migration Plan

1. Define the private-beta deployment contract around local frontend, local backend, local Caddy, Cloudflare Tunnel, Neon, and Upstash.
2. Update the launch runbook to separate:
   - local development
   - local-tunnel private beta
   - legacy Oracle/public-VM guidance if any remains for reference
3. Document the required frontend and backend environment values for a same-origin tunnel runtime.
4. Define the bootstrap order: managed services ready, local app services up, migrations, `seed:demo`, public verification.
5. Add verification guidance for tunnel URL, auth redirects, API calls, and WebSocket connectivity.

Rollback strategy:
- Fall back to the plain local-development path if the tunnel setup is unstable.
- Preserve the managed data state in Neon and Upstash while adjusting only the local runtime or tunnel layer.
- If the new path introduces documentation or config confusion, revert the runbook guidance to the last known stable local-only instructions while re-evaluating the tunnel flow.

## Open Questions

- Should the canonical public tunnel recommendation stay Cloudflare-specific, or should the design describe tunnels generically and document Cloudflare as the default example?
- Do we want the first iteration to assume manual process startup on the local machine, or should the runbook already recommend a local process supervisor?
- Should the runbook keep Oracle guidance as deprecated reference material, or fully pivot to the local-tunnel path for private beta?
