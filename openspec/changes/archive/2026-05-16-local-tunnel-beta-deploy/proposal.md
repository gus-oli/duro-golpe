## Why

The Oracle-hosted beta path proved too operationally heavy and too exposed for a simple private launch with friends. We need a safer, lower-maintenance deployment path that keeps the app reachable from a public URL while letting the frontend, backend, and realtime stack run from the developer's own machine.

## What Changes

- Define an official private-beta deployment topology where the app runs on a local machine behind a reverse proxy and Cloudflare Tunnel instead of a directly exposed public VM.
- Standardize the managed data dependencies for that topology: Neon for PostgreSQL and Upstash for Redis.
- Establish a single-origin runtime model where public browser traffic enters through one tunnel URL, then routes locally to frontend pages, backend APIs, and WebSocket traffic.
- Document the production-like local environment variables, cookie expectations, process layout, and operator workflow needed to run the beta from a personal machine.
- Define a bootstrap and verification flow for the local-tunnel beta, including migrations, demo seeding, and smoke checks before inviting friends.
- Clarify how this private-beta path differs from local-only development and from the previous public-VM deployment guidance.

## Capabilities

### New Capabilities
- `local-tunnel-beta-deployment`: defines the required topology, routing model, managed service usage, and operator workflow for serving the product from a local machine through a public tunnel

### Modified Capabilities
- `demo-environment-seeding`: clarify how the deterministic demo dataset is used to bootstrap the local-tunnel private beta, not only local showcase environments
- `seed-mode-separation`: clarify which seed modes belong to local development, private beta, and provider-backed ingestion in the new deployment path

## Impact

- Deployment and operations documentation, especially the launch runbook and any Oracle-specific instructions that now need a safer local-first alternative
- Frontend and backend environment configuration for tunnel URLs, managed Postgres, managed Redis, cookies, and WebSocket origins
- Local reverse-proxy routing for page traffic, backend APIs, and WebSocket traffic through a single public tunnel URL
- Bootstrap and release verification flow for private-beta sessions hosted from a personal machine
