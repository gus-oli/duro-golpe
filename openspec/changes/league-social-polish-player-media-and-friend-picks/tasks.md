## 1. League friend picks

- [x] 1.1 Add backend read endpoints for league-scoped match predictions from all active league members.
- [x] 1.2 Add backend read endpoints for league-scoped outright selections from all active league members.
- [x] 1.3 Reuse active league membership authorization for every social picks endpoint.
- [x] 1.4 Return stable DTOs with member identity, pick values, submitted/updated timestamp, and empty states for missing picks.
- [x] 1.5 Add frontend entry points from league ranking, match detail, and outrights to view friend picks.
- [x] 1.6 Ensure friend-pick views do not render explanatory copy about whether picks can still change or are locked.
- [x] 1.7 Add tests for own league access, outside league denial, and before-lock visibility.

## 2. Mural near realtime polling

- [x] 2.1 Change mural ordering so older messages stay above and newest messages render at the bottom.
- [x] 2.2 Add bottom-aware autoscroll and a "new messages" affordance when the user is reading older content.
- [x] 2.3 Remove visible polling interval/debug text from the mural UI.
- [x] 2.4 Implement adaptive polling intervals for active, boosted-after-post, idle, and hidden-tab states.
- [x] 2.5 Prefer incremental fetch by cursor/timestamp/id where the backend supports it.
- [x] 2.6 Add regression tests for message ordering and duplicate prevention.

## 3. Softer UI and denser league/match surfaces

- [x] 3.1 Soften global color tokens and repeated surface treatments to reduce gray/white contrast fatigue.
- [x] 3.2 Convert league ranking from one card per player into one compact subdivided surface.
- [x] 3.3 Keep ranking readable on mobile with accessible row targets and clear point hierarchy.
- [x] 3.4 Add collapse controls for agenda date sections and group sections on the matches workbench.
- [x] 3.5 Preserve the results view as agenda-first reading of official scores.

## 4. Outright flags, photos, and catalog quality

- [x] 4.1 Exclude undefined knockout placeholders from team outright options.
- [x] 4.2 Include local team flag data in team outright option DTOs and render flags in the frontend.
- [x] 4.3 Add player media fields or cache table for photo URL/source/update timestamp.
- [x] 4.4 Add an API-Football-backed enrichment job/script for player photos without exposing the token to the frontend.
- [x] 4.5 Render player photos in individual outright options with safe fallback avatars.
- [x] 4.6 Add Lionel Messi and other obvious star safety-net players to searchable individual markets with source confidence metadata.
- [x] 4.7 Add tests for placeholder exclusion, flag rendering DTOs, and player photo fallback.

## 5. QA and rollout

- [ ] 5.1 Run backend tests covering social visibility and authorization.
- [x] 5.2 Run frontend build/lint after UI changes.
- [ ] 5.3 Smoke test mobile flows for matches, outrights, league ranking, friend picks, and mural.
- [x] 5.4 Document any required deploy/env action for player photo enrichment.
