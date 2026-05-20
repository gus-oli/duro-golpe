## Context

The repository already has a functional application split across a Next.js frontend and a Fastify backend, with live behavior implemented through WebSockets, Redis pub/sub, cron-based lock schedulers, and score-processing subscribers. Today, the documented run path is still local-first: Docker Compose brings up Postgres and Redis, and the launch runbook is oriented around developer or smoke environments rather than a stable hosted beta.

The desired deployment target has changed in two important ways:
- the runtime should stay online continuously, which rules out scale-to-zero app hosts for the backend process
- the first hosted release should avoid self-managing Postgres on the Oracle VM, while still keeping the overall system low-cost and operationally simple

This change is cross-cutting because it affects environment contracts, process layout, routing, runbooks, seed strategy, and release operations. It also touches existing seeding capabilities because the deterministic demo dataset is now expected to bootstrap a hosted beta, not only a local showcase environment.

Primary stakeholders:
- Product/operator: wants a stable beta that friends can actually use
- Engineering: wants a deployment model that fits the current architecture without a deep refactor
- Operations: needs a clear bootstrap, restart, backup, and rollback story

## Goals / Non-Goals

**Goals:**
- Define a stable hosted beta deployment based on one Oracle VM that keeps the frontend and backend continuously available.
- Use managed PostgreSQL and Redis services so the VM does not need to operate local database infrastructure for the first hosted release.
- Keep the app on a single public origin so browser auth, SSR fetches, and WebSocket traffic stay simple.
- Establish a production environment contract, bootstrap order, and operator runbook that are realistic for a solo maintainer.
- Reuse the existing demo/smoke/provider seed modes intentionally in hosted environments instead of inventing a separate bootstrap path.

**Non-Goals:**
- Multi-instance backend scaling for the beta environment.
- Kubernetes, container orchestration, or autoscaled process fleets.
- Full high-availability or multi-region disaster recovery.
- Rewriting the application around serverless functions or managed realtime infrastructure.
- Replacing local developer workflows; this change only adds a canonical hosted beta path.

## Decisions

### 1. Use a single Oracle VM as the canonical hosted runtime

The hosted beta environment will run on one Oracle VM that owns:
- reverse proxy / TLS termination
- frontend process
- backend process
- process supervision

Why:
- The backend currently includes schedulers and Redis subscribers in the main process, so it benefits from being long-lived and continuously available.
- A single host is the simplest stable shape for a small private beta.

Alternatives considered:
- Split frontend and backend across separate hosts. Rejected because it adds DNS, TLS, CORS, and environment coordination complexity without solving a current bottleneck.
- Use a scale-to-zero app platform for the backend. Rejected because sleeping app processes would interrupt cron-style locks, subscriber ownership, and WebSocket continuity.

### 2. Keep one backend instance in the hosted beta environment

The hosted beta design will assume exactly one backend process handles:
- HTTP APIs
- WebSocket sessions
- lock schedulers
- Redis subscriptions for match, mural, badge, and scoring flows

Why:
- The current runtime model keeps scheduling and subscription ownership in-process.
- Multiple backend instances would duplicate cron work and message processing unless the architecture is refactored to introduce leader election or dedicated worker roles.

Alternatives considered:
- Multiple identical backend replicas. Rejected because it risks double-processing and inconsistent operational behavior.
- Separate web and worker services. Rejected for the beta scope because it adds deployment complexity before it solves a proven problem.

### 3. Use Neon for PostgreSQL and Upstash for Redis

The hosted beta will externalize stateful infrastructure:
- Neon will provide PostgreSQL
- Upstash will provide Redis over secure managed endpoints

Why:
- This removes the highest-maintenance parts of a single-VM deployment while preserving the current application architecture.
- The backend already depends on standard Postgres and Redis connection URLs, so the managed services fit the codebase with minimal architectural change.

Alternatives considered:
- Local Postgres and Redis on the Oracle VM. Rejected because the operator explicitly wants to avoid that operational load for the initial deployment.
- All-in-one free host for app plus data. Rejected because the backend requires a continuously running process and realtime-friendly behavior that is hard to guarantee on free app platforms.

### 4. Use a single public origin with reverse-proxy routing for frontend, API, and WebSocket traffic

The public deployment will route traffic through one domain:
- `/` and app routes -> Next.js frontend
- `/api/v1/*` -> Fastify backend
- `/ws` -> Fastify WebSocket endpoint with upgrade support

Why:
- The frontend currently uses a mix of SSR fetches, browser API calls, auth cookies, and direct WebSocket connections.
- A same-origin deployment keeps auth and browser networking simpler and reduces operator mistakes around cross-origin configuration.

Alternatives considered:
- Separate public domains for frontend and backend. Rejected because it introduces extra CORS and cookie coordination work for little benefit at beta scale.
- Expose backend directly without a proxy. Rejected because TLS, routing, and public surface management become harder to control cleanly.

### 5. Separate hosted runtime configuration from local infrastructure assumptions

The hosted beta environment will have an explicit environment contract that does not rely on `docker compose up` or local-only addresses. Documentation and scripts should distinguish:
- local developer infrastructure
- hosted beta runtime
- smoke verification environment

Expected environment split:
- backend runtime URL variables point to the public domain and managed data endpoints
- frontend public/runtime URLs point to the single hosted domain
- hosted runbooks do not rely on `infra:up`

Why:
- The current runbook is correct for local work but too easy to misapply to a VM-backed hosted environment.
- Hosted environments need a different source of truth for addresses, secrets, and dependency ownership.

Alternatives considered:
- Reuse the local runbook verbatim. Rejected because it hides the operational differences that matter in production-like environments.

### 6. Keep demo seed as the first hosted bootstrap dataset, and reserve smoke seed for release verification

The canonical first hosted bootstrap for the beta environment will be:
1. provision managed services
2. configure VM runtime
3. run migrations
4. run `seed:demo`
5. verify the public release candidate behavior

`seed:smoke` remains a smaller verification dataset for smoke automation and targeted release checks. Provider-backed seed remains optional and credential-dependent.

Why:
- The beta environment needs a rich dataset immediately so users can explore the full product.
- The existing demo seed is deterministic and already aligned with the product's user-facing surfaces.

Alternatives considered:
- Bootstrap the hosted beta with the smoke seed. Rejected because it is intentionally too minimal for an exploratory beta environment.
- Bootstrap directly from provider-backed seed. Rejected because it increases operational dependency on external provider credentials and data availability.

### 7. Use simple process supervision and artifact-based rollback on the VM

The hosted beta design assumes:
- frontend and backend run under service supervision
- deploys are versioned per release directory or artifact
- rollback restores the previous app version and, if needed, the pre-migration database state

Why:
- This provides stable restart behavior without introducing heavy orchestration.
- A single-operator beta benefits from explicit and reversible release mechanics.

Alternatives considered:
- Manual terminal sessions or ad hoc process managers only. Rejected because they are fragile after reboot or crash.
- Complex blue/green orchestration. Rejected because it is disproportionate to the beta scope.

## Risks / Trade-offs

- [Neon free-tier compute can scale to zero during inactivity] -> Mitigation: accept cold-start latency for an early beta, keep release expectations explicit, and document that the database is managed externally and may wake on first query after idle periods.
- [Upstash free-tier command limits may be consumed faster than expected because Redis is used for pub/sub, scoring, mural, and ranking events] -> Mitigation: monitor command usage early, keep the beta audience small at first, and preserve the option to upgrade Redis separately from the VM.
- [Single backend instance is a deliberate reliability trade-off] -> Mitigation: document that one instance is required for the beta architecture and defer multi-instance scaling until worker/web roles are separated.
- [A single Oracle VM remains a single point of failure] -> Mitigation: keep backups, maintain simple restart procedures, and optimize for recoverability instead of HA at this stage.
- [Misconfigured domain or proxy routing could break login, SSR fetches, or WebSocket upgrades] -> Mitigation: define same-origin routing as a formal requirement and include post-deploy verification steps for `/matches`, `/api/v1/*`, and `/ws`.

## Migration Plan

1. Define the hosted beta environment contract, including required variables for Oracle VM runtime, Neon PostgreSQL, Upstash Redis, and single-domain URL wiring.
2. Expand the launch runbook with a hosted beta section that clearly separates local bootstrap from remote bootstrap.
3. Introduce any deployment-specific script or documentation changes needed to run migrations against the managed Postgres target.
4. Define service management and reverse-proxy setup for the Oracle VM runtime.
5. Bootstrap a fresh hosted environment using migrations plus `seed:demo`.
6. Run verification for core public routes, API reachability, WebSocket connectivity, and seed-dependent product flows.
7. Preserve rollback guidance: previous application artifact plus database backup/restore path before destructive changes.

Rollback strategy:
- Re-point services to the previous application artifact if the app release is faulty but the schema remains compatible.
- Restore the managed Postgres state from the pre-release backup or dump path if the failure requires data rollback.
- Re-run bootstrap verification after rollback before reopening the environment.

## Open Questions

- Do we want Google OAuth enabled in the first hosted beta, or should the initial deployment rely only on email/password auth until the domain is stable?
- Should hosted release verification reuse the existing launch smoke flow directly, or should the beta start with a lighter manual verification checklist and add remote smoke afterward?
- Do we want a dedicated migration-only connection string for Neon in addition to the runtime database URL, or is one documented direct connection sufficient for the first iteration?
- What backup cadence is acceptable for the beta: pre-release only, daily logical dumps, or a more automated export schedule?
