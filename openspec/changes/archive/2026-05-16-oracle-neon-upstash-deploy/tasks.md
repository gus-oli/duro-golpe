## 1. Environment Contract

- [x] 1.1 Define the hosted beta environment variables for Oracle VM runtime, public URLs, Neon PostgreSQL, and Upstash Redis
- [x] 1.2 Update backend configuration and migration guidance so managed Postgres connectivity is documented correctly for runtime and schema changes
- [x] 1.3 Update frontend runtime guidance so hosted API and WebSocket URLs resolve through the single public origin

## 2. Oracle Runtime Setup

- [x] 2.1 Add the canonical Oracle VM deployment layout, including reverse proxy routing for frontend pages, `/api/v1/*`, and `/ws`
- [x] 2.2 Define the supervised process model for the single frontend and single backend runtime on VM boot and restart
- [x] 2.3 Document the release artifact layout and the minimal rollback mechanism for reverting to the previous deployed version

## 3. Hosted Bootstrap and Seed Flow

- [x] 3.1 Update the launch runbook to separate local-only infrastructure steps from hosted beta bootstrap steps
- [x] 3.2 Define the hosted bootstrap sequence for fresh environments, including migrations and `seed:demo` as the default first-load dataset
- [x] 3.3 Clarify when operators should use `seed:demo`, `seed:smoke`, and provider-backed `seed` in hosted environments

## 4. Verification and Operations

- [x] 4.1 Define the hosted post-deploy verification checklist for public app access, backend API reachability, auth flow, and WebSocket connectivity
- [x] 4.2 Document backup expectations and rollback steps for application releases and database-affecting changes
- [x] 4.3 Verify the hosted deployment guidance against the current beta architecture and resolve any gaps before implementation starts
