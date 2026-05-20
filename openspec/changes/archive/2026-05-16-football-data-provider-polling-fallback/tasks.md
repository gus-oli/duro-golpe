## 1. Football-Data Provider Ingestion

- [x] 1.1 Add `football-data.org` configuration support and adapter code for World Cup 2026 teams and fixtures
- [x] 1.2 Implement a provider-backed seed path that imports `WC` season `2026` into the existing team/match schema and preserves local kickoff-driven lock behavior
- [x] 1.3 Update cutover docs and environment examples so the hosted beta reset flow uses the new provider token and seed path instead of API-Football

## 2. Polling-Based Match Synchronization

- [x] 2.1 Implement a quota-safe polling sync path that reads relevant World Cup match updates from `football-data.org` on an adaptive cadence
- [x] 2.2 Map provider statuses and score payloads into the app's local `SCHEDULED`/`LIVE`/`FINISHED` lifecycle and existing result-confirmation pipeline
- [x] 2.3 Ensure polling errors, delayed updates, and duplicate terminal events are handled safely without corrupting scoring or match state

## 3. Manual Contingency Flow

- [x] 3.1 Add CLI tooling for manual match status/score overrides using local match ids or provider ids
- [x] 3.2 Reuse the same downstream realtime and scoring effects for manual final-result confirmation that automated sync would trigger
- [x] 3.3 Document the operator fallback path for delayed or missing provider updates during the beta

## 4. Verification and Beta Cutover

- [x] 4.1 Validate provider-backed seed against the reset database and confirm it loads the expected 48 teams and 104 fixtures without reintroducing demo social state
- [x] 4.2 Verify the polling path updates live/final match state correctly under a controlled scenario and stays within the free-tier quota model
- [x] 4.3 Verify the manual contingency path can resolve a match and update the visible beta surfaces when provider data is delayed
- [x] 4.4 Re-run the hosted beta cutover with the new provider path and update the runbook status once the real-fixture workflow is confirmed
