## Context

Today the repository has two seed personalities:
- `seed`, which depends on API-Football and the 2026 tournament counts being available and correct
- `seed:smoke`, which is intentionally tiny and only exists to support deterministic launch smoke tests

That leaves a gap for local product validation. The frontend can look polished and the backend flows can be stable, but a developer or stakeholder still lands in an anemic environment that does not demonstrate leagues, rankings, mural, outrights, badges, scoring, or match lifecycle variety in a convincing way.

The demo seed needs to be rich enough to exercise the complete product while remaining deterministic, fast, repeatable, and independent from third-party availability. The user has an API key available, but that should remain an environment concern and not become a hard dependency for the demo experience.

## Goals / Non-Goals

**Goals:**
- Add a dedicated `seed:demo` command that provisions a full-featured local dataset.
- Make demo data deterministic and idempotent so repeated runs do not create junk or require manual cleanup.
- Cover the product's major features in seeded data: auth personas, matches across statuses, predictions, leagues, rankings, mural activity, outrights, scores, totals, and badges.
- Keep `seed:smoke` minimal and isolated, and keep provider-backed `seed` distinct from demo mode.
- Print a clear post-seed summary with demo accounts, key league codes, and notable match ids.

**Non-Goals:**
- Replacing the provider-backed `seed` flow used for real tournament ingestion.
- Adding a production admin back office for managing demo data.
- Hardcoding API secrets or requiring external API availability for the demo path.
- Simulating every possible edge case in a single seed run.

## Decisions

### 1. Introduce a third explicit seed mode: `seed:demo`

We will keep three separate seed commands with distinct purposes:
- `seed`: provider-backed ingestion
- `seed:smoke`: minimal release-gate dataset
- `seed:demo`: deterministic full local showcase dataset

Why:
- The current ambiguity is operational, not just technical.
- Distinct commands give developers the right mental model and reduce accidental misuse.

Alternatives considered:
- Expand `seed:smoke` until it becomes demo-worthy. Rejected because smoke must stay tiny, fast, and tightly controlled for tests.
- Overload `seed` with flags for every mode. Rejected because it hides intent and increases accidental misuse.

### 2. Make the demo dataset deterministic and self-contained by default

The demo seed will define a curated local tournament slice with explicit teams, fixtures, users, leagues, predictions, mural posts, and scoring artifacts. It must succeed without calling API-Football.

Why:
- A demo environment should work on a plane, in CI-like local conditions, and during provider outages.
- Determinism makes debugging and screenshots reproducible.

Alternatives considered:
- Build demo data from live provider results. Rejected because it is brittle and changes over time.
- Mix live provider data with generated records by default. Rejected because it blurs expectations and complicates repeatability.

### 3. Seed personas and relational activity, not just base tables

The demo dataset will include seeded users with known credentials, active league memberships, predictions, outright selections, mural posts, scores, totals, and badges. The goal is to make the app feel already inhabited.

Why:
- Seeding only teams and matches still leaves most screens empty.
- The product's value comes from competition context, not just fixtures.

Alternatives considered:
- Seed only entities and leave activity to manual interaction. Rejected because it still forces setup work before the product becomes legible.

### 4. Represent feature coverage through match and market lifecycle variety

The demo seed will intentionally include:
- scheduled matches open for prediction
- locked upcoming matches
- live matches with in-progress score
- finished matches with final scores and stored scoring results
- outright markets spanning open, locked, and resolved states

Why:
- Many UX states only appear when lifecycle data varies.
- A "complete demo" requires state diversity, not just more rows.

Alternatives considered:
- Keep all matches scheduled and all markets open. Rejected because it hides large parts of the product.

### 5. Recompute or seed derived score tables as part of the demo flow

The demo seed must populate or refresh derived tables needed by rankings and totals, including match scores, outright scores, and user totals, instead of leaving them empty and relying on later organic updates.

Why:
- League ranking and score screens need immediate signal.
- The environment should be useful the moment the seed finishes.

Alternatives considered:
- Seed only source-of-truth tables and wait for background recomputation. Rejected because it makes the first-run experience inconsistent and harder to trust.

### 6. Keep API-Football usage optional and environment-driven

If we add a provider enrichment path later, it should read `API_FOOTBALL_KEY` from environment configuration and remain optional, clearly separate from the default demo seed.

Why:
- The user can provide a valid key, but demo usability should not hinge on it.
- Secrets belong in env files, not code or specs.

Alternatives considered:
- Hardcode the provided API key into scripts or docs. Rejected for obvious security and maintainability reasons.

## Risks / Trade-offs

- [A full demo seed can become large and slow] -> Mitigation: curate a representative dataset rather than mirroring the entire tournament.
- [Seeded derived scoring may drift from runtime calculation rules] -> Mitigation: route score generation through existing scoring services where practical instead of hand-authoring incompatible rows.
- [Idempotent upserts across many related tables can get tricky] -> Mitigation: use stable fixture/user identifiers and a seed namespace for demo records.
- [Mixing open, live, locked, and resolved states can confuse automation] -> Mitigation: keep smoke data separate and never reuse demo data for release-gate tests.
- [Provider-backed seed and demo seed may diverge in visual realism] -> Mitigation: curate believable teams, venues, and league activity, and optionally allow later provider enrichment without changing the deterministic core.

## Migration Plan

1. Define the demo dataset contract: personas, teams, matches, leagues, predictions, outrights, mural posts, scores, badges.
2. Implement a new `seed:demo` script and supporting seed helpers.
3. Add package scripts and documentation that clearly separate `seed`, `seed:smoke`, and `seed:demo`.
4. Verify the seeded environment by logging in as demo users and checking matches, leagues, outrights, ranking, scoring, mural, and badges.

Rollback strategy:
- Remove or stop using the `seed:demo` command if the implementation proves unstable.
- Because this is local/demo provisioning work, rollback is a code rollback plus reseeding, not a production migration concern.

## Open Questions

- Do we want a single shared demo password for all seeded users, or unique passwords per persona?
- Should demo outrights include some markets already resolved, or should resolved outrights live in a second optional variant?
- Do we want the demo seed to create a small tournament slice, or a larger bracket-style calendar that better matches the intended World Cup scale?
