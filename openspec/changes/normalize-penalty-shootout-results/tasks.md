## 1. Provider Score Normalization

- [x] 1.1 Extend football-data score typing to include duration, regular-time, extra-time, and penalty-shootout score nodes.
- [x] 1.2 Add a shared football-data score normalization helper that returns the playable match score through 120 minutes, excluding shootout goals.

## 2. Integration Points

- [x] 2.1 Use the normalization helper in the football-data polling sync before applying provider snapshots.
- [x] 2.2 Use the normalization helper in provider-backed fixture ingestion before storing match scores.

## 3. Verification

- [x] 3.1 Add regression coverage for a penalty-shootout provider payload where the local result remains tied after 120 minutes.
- [x] 3.2 Add an idempotent provider-sync repair command that reconciles confirmed match scores and user totals without requiring Redis subscribers.
- [x] 3.3 Run focused backend tests and relevant type checks.
