## 1. Runtime Contract

- [x] 1.1 Define the canonical frontend and backend environment variables for the local-tunnel private beta path, including public tunnel URLs and local loopback addresses
- [x] 1.2 Add or update local reverse-proxy assets so one public tunnel origin routes frontend pages, backend APIs, and WebSocket traffic correctly

## 2. Documentation

- [x] 2.1 Update the launch runbook to add a local-tunnel private beta section using Cloudflare Tunnel, Neon, and Upstash
- [x] 2.2 Clarify in the runbook how the local-tunnel path differs from local-only development and from the previous public-VM deployment path

## 3. Bootstrap and Seed Guidance

- [x] 3.1 Document the private-beta bootstrap order: managed services ready, local services up, migrations, `seed:demo`, and public verification
- [x] 3.2 Update seed-mode guidance so operators know when to use demo seed, smoke seed, and provider-backed seed in the new deployment model

## 4. Verification

- [x] 4.1 Add or update verification guidance for tunnel URL reachability, auth redirects, API calls, and WebSocket connectivity through the single public origin
- [x] 4.2 Validate the documented local-tunnel beta path against the current repo scripts and environment examples so the change is apply-ready
