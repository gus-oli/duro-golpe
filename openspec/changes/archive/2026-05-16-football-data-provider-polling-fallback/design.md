## Context

The beta is already using:

- local operator machine + tunnel
- hosted Neon and Upstash
- a resettable application database
- a local match-lock scheduler based on kickoff time
- realtime publishing and scoring that react to match status and confirmed results

What is missing is a provider path that can actually supply World Cup 2026 fixtures on a free plan. `football-data.org` covers `Worldcup` on the free tier, but the free plan offers delayed scores and limited request throughput. That means the design should treat the provider as a practical fixtures-and-results source, not as a high-fidelity live-event stream.

Constraints:

- Keep the current hosted database and local-tunnel beta topology.
- Do not require a paid provider to leave the demo dataset.
- Do not add a new queue system, cache layer, or third-party state library.
- Preserve the existing local lock scheduler and downstream scoring/realtime pipeline where possible.

## Goals / Non-Goals

**Goals:**

- Seed the real World Cup 2026 teams and fixtures from `football-data.org` v4 into the existing schema.
- Poll provider-backed match data on a quota-safe cadence and reconcile live/final states into the app's existing pipeline.
- Preserve local `LOCKED` behavior as an app-owned state driven by kickoff time.
- Provide a manual operator fallback when provider delays or quota issues make automated updates insufficient.
- Update the cutover/runbook path so the operator can complete the reset and real-fixture beta transition without paid API-Football access.

**Non-Goals:**

- Achieving perfect low-latency live-score behavior on the free provider tier.
- Replacing the local match lock scheduler with provider status alone.
- Building an admin UI for overrides; CLI tooling is sufficient for this beta stage.
- Reworking unrelated auth, social, or frontend-shell features.
- Guaranteeing official standings ingestion for the World Cup, which is not required for the core bolao experience.

## Decisions

### 1. Adopt `football-data.org` v4 as the free provider-backed source of truth for real fixtures

The real-fixture beta path will use `football-data.org` instead of API-Football. The adapter will authenticate with `X-Auth-Token` and target the `WC` competition for season `2026`.

Why:

- The free `football-data.org` plan includes `Worldcup`, while the free API-Football plan blocks 2026 access.
- The repo needs real fixtures now more than it needs premium live infrastructure.

Alternatives considered:

- Keep fighting the free API-Football plan. Rejected because the provider explicitly blocks 2026 coverage on free.
- Move immediately to a paid provider such as Sportmonks. Rejected for now because the operator wants the real-fixture path without new spending pressure.
- Hardcode the full 2026 tournament as a static dataset first. Rejected as the first move because `football-data.org` appears viable and reduces manual dataset maintenance.

### 2. Separate provider responsibilities into seed and sync

The new provider integration will have two distinct responsibilities:

- **Seed:** ingest all World Cup 2026 teams and fixtures into the local schema
- **Sync:** periodically reconcile relevant match status/score changes after the seed

Why:

- The initial seed and ongoing synchronization have different data-shape and operational needs.
- Keeping them separate makes it easier to retry, debug, and eventually replace the sync strategy without rewriting the seed path.

Alternatives considered:

- One monolithic command that seeds and continuously syncs. Rejected because it blurs one-time ingestion and long-running operations.

### 3. Keep `LOCKED` as a local app state

Provider statuses will map only to the external lifecycle states the provider actually knows about, such as scheduled, in-play, and finished. The app will continue to own `LOCKED` based on kickoff time and the existing scheduler.

Why:

- `LOCKED` is product behavior, not provider truth.
- The app already has working logic for this, and it keeps prediction locking deterministic even when provider data is delayed.

Mapping direction:

```text
provider timed/scheduled -> local SCHEDULED
local kickoff scheduler  -> local LOCKED
provider in-play states  -> local LIVE
provider finished states -> local FINISHED
```

### 4. Use adaptive competition polling rather than per-match fan-out

The sync path will poll the World Cup competition feed, not one match endpoint per active game. Cadence will be adaptive:

- when no relevant match is in or near play, poll slowly, such as every 60 seconds
- when at least one relevant match is live or inside an active window, tighten to at most one poll every 10 seconds

The sync query should be bounded to relevant tournament windows, such as today's and nearby dates, instead of re-fetching the entire tournament blindly on every cycle.

Why:

- The free plan allows only 10 calls per minute.
- A single bounded competition query preserves quota and keeps the sync model simple.
- The operator explicitly wants polling, but the design should avoid burning the entire budget continuously when nothing is happening.

Alternatives considered:

- Poll every 10 seconds all the time. Rejected because it wastes quota during quiet periods and leaves no slack for troubleshooting or future provider calls.
- Poll each active match separately. Rejected because it scales poorly against the same quota.

### 5. Make manual operator updates a first-class contingency path

The app will expose CLI commands that let the operator manually apply match status and score changes, including final result confirmation, when provider data is delayed or unavailable.

Manual updates must feed the same downstream effects as automated sync:

- update local match state
- create or confirm result records where appropriate
- publish realtime events
- trigger scoring recalculation

Why:

- Free delayed data is "good enough" for a small beta only if the operator can override it when needed.
- Manual fallback is operationally simpler than a full admin UI and fits the current project stage.

Alternatives considered:

- Rely on provider polling alone. Rejected because delayed free data can be too slow for friend-facing match resolution moments.
- Build an admin page first. Rejected because the repo already relies on CLI/admin scripts for operational workflows.

### 6. Preserve the existing in-place reset flow and retarget the provider path

The existing `beta:reset` and hosted cutover workflow stay in place. The change updates what happens after reset:

- before: provider seed assumed API-Football
- after: provider seed and sync assume `football-data.org`, with manual contingency documented

Why:

- The resettable hosted database model is already aligned with the operator's preference.
- The failure point was provider access, not the reset workflow itself.

## Risks / Trade-offs

- [Delayed free scores may make "live" feel sluggish] -> Mitigation: keep expectations explicit, use adaptive polling, and provide manual operator overrides.
- [Provider schema differences could produce weak mappings for stage, crest, or team codes] -> Mitigation: isolate mapping logic in a dedicated adapter and fail clearly when critical fields are missing.
- [Polling the wrong window could waste quota or miss relevant transitions] -> Mitigation: bound sync queries to active tournament windows and reuse local kickoff knowledge.
- [Manual overrides could diverge from later provider data] -> Mitigation: route both automated and manual updates through the same reconciliation rules and define idempotent/no-op behavior where practical.
- [The old API-Football webhook code may confuse operators if left undocumented] -> Mitigation: update the runbook to mark `football-data.org` as the primary free beta path.

## Migration Plan

1. Add `football-data.org` configuration, adapter, and provider-backed seed command support for `WC` season `2026`.
2. Validate that the seed loads the expected 48 teams and 104 fixtures after an in-place reset.
3. Introduce a polling sync job that maps provider statuses and scores into the local match/result pipeline.
4. Add CLI manual override commands for contingency match updates.
5. Update runbooks and env examples so operators know how to run reset, seed, polling, and manual fallback in the hosted beta.
6. Cut over the beta again on the same hosted database using the new provider path.

Rollback strategy:

- If the adapter or polling path is unstable, preserve the resettable database state and fall back to a deterministic seed while the provider path is fixed.
- If manual override behavior regresses scoring or realtime, disable the new operator command and continue using the existing app pipeline plus direct DB restore from backup if needed.

## Open Questions

- Should the first sync implementation run as part of the main backend process on a scheduler, or as a separate operator command that is manually launched during matchdays?
- Do we want manual CLI coverage only for final results first, or also for live-score/status updates on day one?
- Should the old API-Football webhook route remain temporarily for compatibility, or be explicitly marked as dormant in the docs right away?
