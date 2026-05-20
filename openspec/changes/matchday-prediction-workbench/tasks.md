## 1. Backend Batch Prediction API

- [x] 1.1 Add a batch prediction request schema and route for authenticated users
- [x] 1.2 Implement batch upsert service logic that reuses existing prediction validation and lock rules
- [x] 1.3 Return structured per-item `saved` and `failed` results for partial success handling
- [x] 1.4 Add backend tests for mixed create/update batches, locked-match partial failures, and single-endpoint compatibility

## 2. Matches Workbench Surface

- [x] 2.1 Refactor `/matches` into a tabbed workbench with `Agenda`, `Grupos`, and `Resultados` views
- [x] 2.2 Add local draft state, pending-change counting, and sticky global save/discard affordances
- [x] 2.3 Render inline prediction controls for `SCHEDULED` matches in `Agenda` and `Grupos`
- [x] 2.4 Wire the global save flow to the new batch endpoint and reconcile per-card success/error states
- [x] 2.5 Adjust authenticated freshness/caching for `/matches` so the workbench does not rely on long-lived stale data

## 3. Results And Detail Context

- [x] 3.1 Build the `Resultados` view as a date-grouped reading surface for live/finalized fixtures
- [x] 3.2 Enrich match detail with venue and provider-backed context already present in the local match model
- [x] 3.3 Preserve deep links from the workbench into match detail without making detail the primary prediction path

## 4. Validation

- [x] 4.1 Add frontend coverage for workbench draft behavior, batch save success, and partial failure handling
- [ ] 4.2 Verify mobile usability for inline prediction editing and sticky save UI across the three match views
- [ ] 4.3 Run the relevant smoke/manual checks to confirm agenda, group, results, and detail flows remain coherent
