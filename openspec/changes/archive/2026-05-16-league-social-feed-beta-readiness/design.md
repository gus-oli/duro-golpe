## Context

The current beta has reached the point where seeded fake activity is more useful as a developer showcase than as a friend-facing play environment. The next beta step is to cut over to real tournament fixtures on the existing hosted database and let actual players create the social layer organically.

Three issues make that cutover awkward today:

1. The mural crashes on local post creation because the HTTP create route returns a partial payload while the frontend immediately renders the new post.
2. The mural is modeled as `league + match`, which pushes conversation into a deep route and fragments social activity across individual fixtures.
3. The authenticated frontend still does too much expensive work on hot paths, especially around ranking hydration and polling-based resilience.

Constraints:
- Keep using the current hosted Neon and Upstash setup; no new branch or second environment is desired.
- Preserve the current beta topology and product shell introduced by `sports-companion-product-shell`.
- Avoid introducing a new third-party performance or state-management dependency.
- Treat the current hosted database as resettable application state, not as permanent production history.

## Goals / Non-Goals

**Goals:**
- Move the primary mural experience from match-scoped conversation to a league-scoped social feed.
- Ensure newly created mural posts are immediately render-safe without relying on delayed websocket reconciliation.
- Improve responsiveness on the authenticated journey by reducing avoidable request fan-out and making realtime fallback behavior less aggressive.
- Provide an explicit in-place beta reset and provider-seed cutover path so the same database can be cleaned and repopulated with real fixtures.
- Keep football context in the social experience by allowing league feed posts to carry optional match context when useful.

**Non-Goals:**
- Preserving demo users, demo leagues, or demo social history after cutover.
- Reworking scoring logic, auth rules, or the local-tunnel deployment topology.
- Building a fully generalized social platform with reactions, threading, or moderation workflows beyond the current hide capability.
- Introducing caching infrastructure or background job systems beyond the existing app and Redis footprint.

## Decisions

### 1. Make the league the primary social container

The mural will be redefined as a league-level feed. The league page becomes the canonical entry point for social activity, and match detail may link into the league feed rather than owning a dedicated mural surface.

Why:
- Social activity is more valuable when it accumulates in one visible place.
- A league-level feed aligns with the new authenticated shell and makes the product feel alive without seeded fake traffic.

Alternatives considered:
- Keep one mural per match and only add better navigation. Rejected because it still fragments conversation and hides the feature behind deep routing.
- Remove football context entirely and make the feed fully generic. Rejected because match context is still useful for rival banter and live-event discussion.

### 2. Keep optional match context, but remove match scope from feed identity

The mural data model should treat `leagueId` as the feed key and `matchId` as optional contextual metadata on a post. This preserves football semantics while avoiding a separate feed per fixture.

Why:
- Users can still post "about" a match without splitting the social surface.
- Match detail can continue to point players into relevant league conversation.

Alternatives considered:
- Delete `matchId` from mural posts completely. Rejected because it throws away useful context that can enrich league conversation.
- Keep `matchId` required and aggregate multiple feeds in the UI. Rejected because the complexity stays high and the database contract stays mismatched to the intended product.

### 3. Unify mural serialization across HTTP and realtime

The create-post route, list route, and websocket broadcaster should all use the same serialized mural-post shape. The frontend should never have to guess whether author fields exist after creation.

Why:
- The current crash comes from shape drift, not from rendering complexity.
- A shared serializer is the simplest way to keep feed rendering safe and consistent.

Alternatives considered:
- Only harden the frontend with defensive null checks. Rejected because it hides a contract bug and leaves different transport paths inconsistent.
- Wait for websocket echo before showing the new post. Rejected because it worsens UX and still leaves the HTTP contract underspecified.

### 4. Treat performance as data-shape cleanup, not a cosmetic tuning pass

The performance pass will focus on the most expensive authenticated surfaces:
- eliminate per-ranking-entry badge fan-out
- reduce unconditional short-interval polling
- keep SSR data loads bounded on league and match surfaces

Why:
- The app already feels slower under real usage patterns, and the current cost centers are visible in code.
- Data-shape cleanup produces more durable wins than isolated loading spinners.

Alternatives considered:
- Only tweak CSS and animations. Rejected because the reported slowness is driven by fetch patterns as much as by visual weight.
- Add a new client cache library. Rejected because the current scope can be addressed with better route contracts and simpler refresh rules.

### 5. Implement beta cutover as an in-place reset workflow

The provider-backed transition should use a dedicated reset workflow that clears resettable application state in a foreign-key-safe order, preserves schema and environment configuration, then runs migrations and provider seed on the same database.

Why:
- The operator explicitly does not want a new branch or a second hosted environment.
- The existing provider seed is ingestion-oriented and uses upserts; it does not replace demo social/application state by itself.

Alternatives considered:
- Create a new Neon branch for the cutover. Rejected because it adds infra churn the operator wants to avoid.
- Run provider seed on top of demo data. Rejected because it leaves fake social state mixed with real fixtures and produces an incoherent beta.

## Risks / Trade-offs

- [League-level feed could lose some immediate matchday specificity] -> Mitigation: retain optional match context on posts and link into the league feed from match detail when relevant.
- [Changing mural schema and routes may create compatibility gaps with existing deep links] -> Mitigation: keep a redirect or compatibility layer from old match-scoped mural routes during migration.
- [Performance work can sprawl if every page is treated as a hotspot] -> Mitigation: scope the pass to league ranking hydration, match detail refresh, and other measured authenticated bottlenecks first.
- [In-place reset is destructive to current beta accounts and history] -> Mitigation: document that the database is intentionally resettable and perform the cutover before broader friend adoption.
- [Provider availability can still fail at seed time] -> Mitigation: keep the operator workflow explicit about `API_FOOTBALL_KEY`, reset ordering, and expected post-reset validation.

## Migration Plan

1. Introduce the new league-feed contract and compatibility redirects from the old match-scoped mural surface.
2. Update the mural persistence model and routes so league feed listing and creation work with optional match context.
3. Fix mural serialization so create/list/realtime payloads share the same render-safe shape.
4. Apply the performance pass to league ranking hydration and match-detail refresh behavior.
5. Add a documented reset workflow that clears existing beta application state in place.
6. Run `db:migrate`, execute the reset workflow on the existing hosted database, and then run the provider-backed seed.
7. Validate the post-cutover beta with real fixtures and fresh social activity.

Rollback strategy:
- If the mural or performance changes regress the beta, restore the previous app build and keep the old match-scoped mural behavior temporarily.
- If the provider cutover itself misfires after reset, rerun migrations and reseed only after verifying credentials and reset ordering; because the reset is destructive, rollback depends on database backup/restore rather than a simple app redeploy.

## Open Questions

- Should the first league-feed version show one unified timeline only, or also provide optional per-match filters inside the league page?
- Should match detail deep-link into the league feed with a highlighted match context or simply send the user to the top of the feed?
- Does the beta reset workflow need a dedicated repo command, or is a documented script invocation sufficient as long as it is deterministic?
