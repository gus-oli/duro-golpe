## Why

The project is close to a playable beta, but it still lacks a deployment path that is stable, low-cost, and realistic for a small private launch. Local-only infrastructure and fully self-hosted Postgres/Redis on the VM add too much operational burden for the first release, so we need a hosted deployment target that keeps the app online without requiring paid platform services from day one.

## What Changes

- Define an official hosted deployment topology based on a single Oracle VM running the frontend, backend, reverse proxy, and app process supervision.
- Move the production data dependencies to managed services: Neon for PostgreSQL and Upstash for Redis.
- Establish a single-domain runtime model where the reverse proxy routes frontend traffic, backend HTTP APIs, and WebSocket traffic without requiring cross-origin browser configuration.
- Document the required production environment variables, secret handling, bootstrap order, and service start/stop behavior for the hosted environment.
- Define the production bootstrap flow for a fresh environment, including database migrations, seed strategy selection, and first-release data loading.
- Add operational guidance for release verification, rollback, backups, and core observability checks appropriate for a low-cost beta deployment.
- Clarify which parts of the existing local runbook remain local-only and which are the canonical path for the hosted beta environment.

## Capabilities

### New Capabilities
- `hosted-beta-deployment`: defines the required hosted runtime topology, routing model, managed service dependencies, and operator workflow for running the product in a stable beta environment

### Modified Capabilities
- `demo-environment-seeding`: extends demo seeding requirements so operators can bootstrap a hosted beta environment with the deterministic demo dataset, not only a local showcase environment
- `seed-mode-separation`: clarifies operator-facing documentation and command usage so hosted environments can intentionally choose between smoke, demo, and provider-backed seed modes

## Impact

- Deployment and operations documentation, especially the launch runbook and production environment guidance
- Backend environment configuration for managed Postgres and managed Redis endpoints
- Frontend/backend URL wiring and reverse proxy routing for HTTP and WebSocket traffic
- Release bootstrap flow, including migrations, seed commands, and first-deploy verification
- VM-level process management, TLS/domain setup, rollback procedure, and backup/monitoring expectations
