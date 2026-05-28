## 1. Data Model

- [ ] 1.1 Add player catalog schema tables for players, aliases/provider ids if needed, and player-market candidates.
- [ ] 1.2 Add source/status types needed for curated, official, preliminary, provider-enriched, active, and inactive states.
- [ ] 1.3 Add migration indexes and uniqueness constraints for normalized player identity, provider ids, and market candidate uniqueness.
- [ ] 1.4 Backfill catalog players and candidates from existing player-type `outright_options`.

## 2. Catalog Import And Sync

- [ ] 2.1 Move the current static player market list into a curated import data structure.
- [ ] 2.2 Add broader curated candidate data for current player markets, including obvious stars missing today.
- [ ] 2.3 Implement idempotent player import/upsert with alias/provider duplicate prevention.
- [ ] 2.4 Implement player-market candidate import/upsert with featured, sort order, source tier, confidence, and active state.
- [ ] 2.5 Implement non-destructive sync from player-market candidates into `outright_options`.
- [ ] 2.6 Ensure removed catalog candidates mark options inactive instead of deleting prediction-facing options.

## 3. Provider Enrichment

- [ ] 3.1 Update API-Football enrichment to target player catalog rows first.
- [ ] 3.2 Store provider photo URL/source/update timestamp and provider ids on the catalog or alias layer.
- [ ] 3.3 Project enriched photo metadata from catalog players into existing outright option DTOs.
- [ ] 3.4 Keep provider failures non-blocking and preserve fallback avatars in the UI.

## 4. Outright API And UI

- [ ] 4.1 Update the outright service to expose catalog-backed player candidate metadata through existing market option DTOs.
- [ ] 4.2 Preserve current featured-first player UI with five defaults and full search.
- [ ] 4.3 Keep selected inactive player options visible after catalog refresh.
- [ ] 4.4 Ensure source/confidence labels remain visible but do not imply provider data is official squad truth.
- [ ] 4.5 Verify `/outrights` payload size and rendering behavior with a broader catalog.

## 5. Operations And Rollout

- [ ] 5.1 Add operator script or npm command for importing and syncing the player catalog.
- [ ] 5.2 Document Neon/Render rollout order: migrate, import catalog, enrich photos, sync options, deploy frontend.
- [ ] 5.3 Document API-Football as optional enrichment, including free-plan limitations for 2026 data.
- [ ] 5.4 Add recovery notes for rerunning imports without deleting predictions.

## 6. Tests And Verification

- [ ] 6.1 Add unit tests for player normalization and duplicate prevention.
- [ ] 6.2 Add tests for candidate import/upsert and inactive marking.
- [ ] 6.3 Add tests proving catalog sync does not delete existing predicted options.
- [ ] 6.4 Add frontend tests for featured defaults, search, inactive selected visibility, and fallback media.
- [ ] 6.5 Run backend build/tests and frontend build/tests.
- [ ] 6.6 Smoke test `/outrights` with a broader catalog in desktop and mobile viewports.
