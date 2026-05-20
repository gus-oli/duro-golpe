## Why

The private beta is close to the intended product shape, but three issues now block the jump from demo showcase to friend-facing play: the mural crashes on post, the current per-match mural model hides social activity too deeply, and the authenticated frontend still feels slower and heavier than it should during repeated use. At the same time, the beta is ready to stop depending on seeded fake social activity and move onto real tournament fixtures plus real player interaction on the same hosted database.

## What Changes

- Replace the current match-scoped mural experience with a league-scoped social feed that lives on the league surface, remains visible during regular use, and still supports football-specific conversation without forcing users into a deep match route.
- Fix the mural posting contract so newly created posts return a render-safe payload and do not crash the frontend when the local feed updates immediately after submission.
- Reduce perceived frontend slowness across the authenticated journey by removing avoidable fan-out fetch patterns, toning down aggressive polling, and tightening the most expensive high-traffic surfaces.
- Add an explicit beta cutover path for cleaning an existing resettable database in place and reseeding it with provider-backed tournament data, without requiring a new infrastructure branch or a second hosted environment.
- Reconcile demo-oriented assumptions in social and launch documentation so the product can operate with real fixtures and organic player activity rather than relying on seeded fake competition.

## Capabilities

### New Capabilities
- `league-social-feed`: Defines a league-level social feed, resilient post creation behavior, and the primary social entry points inside league-driven product flow.
- `frontend-performance-pass`: Defines responsiveness and data-loading expectations for the authenticated shell, ranking surfaces, and high-frequency match interactions.
- `provider-backed-beta-reset`: Defines the operator workflow for clearing a resettable beta dataset in place and repopulating it with provider-backed tournament data.

### Modified Capabilities
- `seed-mode-separation`: Seed-mode guidance now needs to cover the explicit in-place reset and provider cutover workflow for a shared but resettable beta database.

## Impact

- Affected frontend code: `frontend/src/app/**`, `frontend/src/components/Mural/**`, league pages, match detail next-step surfaces, and data-loading patterns in authenticated routes.
- Affected backend code: mural routes/services, realtime mural subscriptions, and any schema or API contracts needed to move from match-scoped to league-scoped social feed behavior.
- Affected data model: mural persistence and indexing are likely to change, and the provider cutover workflow will need a safe deletion/reset path for beta data.
- Affected docs and operator flow: `docs/launch-runbook.md`, seed scripts, and hosted-beta reset instructions.
