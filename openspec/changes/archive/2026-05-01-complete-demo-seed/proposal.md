## Why

The current local setup is easy to confuse with the smoke environment, which leaves developers and stakeholders staring at a single Brazil vs France fixture instead of the full product. We need a dedicated demo seed that showcases the complete experience offline and makes local validation look like the real app, not just a release gate harness.

## What Changes

- Add a new deterministic `seed:demo` flow that populates the local database with a rich World Cup-style dataset covering the major product features.
- Seed multiple teams, multiple matches in different lifecycle states, multiple users, multiple leagues, standings, predictions, outright selections, mural activity, badges, and aggregated scores.
- Separate demo seeding from smoke seeding and provider-driven seeding so each environment has a clear purpose and expected output.
- Add documentation and scripts that make it obvious when to use `seed`, `seed:smoke`, and `seed:demo`.
- Support optional API-Football-backed enrichment only as a non-required enhancement path, using `API_FOOTBALL_KEY` from environment configuration rather than hardcoding secrets.

## Capabilities

### New Capabilities
- `demo-environment-seeding`: Defines the deterministic full-featured local demo dataset and the command that provisions it.
- `seed-mode-separation`: Defines the behavior and documentation boundaries between provider seed, smoke seed, and demo seed modes.

### Modified Capabilities

## Impact

- Affected code: `backend/src/dev/**`, `backend/src/data-providers/**`, seed helpers, score/bootstrap utilities, and root/backend package scripts.
- Affected docs: local bootstrap and launch/demo setup documentation.
- No frontend API contract changes are required.
- No production feature behavior changes are intended; this change is about local data provisioning and developer/operator clarity.
