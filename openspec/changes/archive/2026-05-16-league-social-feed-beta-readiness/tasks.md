## 1. League Social Feed Model and API

- [x] 1.1 Replace the current match-scoped mural data contract with a league-scoped feed model that supports optional match context on posts
- [x] 1.2 Update mural list, create, and realtime delivery paths so they share one render-safe serialized post shape
- [x] 1.3 Add compatibility handling or redirects from the old match-scoped mural route to the new league-centered social surface

## 2. Frontend Social Surface Integration

- [x] 2.1 Move the primary mural experience onto the league page or league-centered flow so social activity becomes visible without deep route guessing
- [x] 2.2 Update match-detail follow-up actions to route users into league conversation instead of a dedicated per-match mural page
- [x] 2.3 Fix the mural post flow so submitting a comment no longer crashes the feed on immediate render

## 3. Authenticated Performance Pass

- [x] 3.1 Remove or consolidate avoidable ranking-page fan-out fetches, especially badge loading per ranking entry
- [x] 3.2 Rework realtime fallback refresh behavior on ranking and match-detail surfaces so polling is bounded and less aggressive
- [x] 3.3 Verify the main authenticated hot paths feel materially lighter after the data-loading changes

## 4. Provider-Backed Beta Cutover

- [x] 4.1 Add an explicit in-place reset workflow for clearing resettable beta application state on the existing hosted database
- [x] 4.2 Update the runbook and seed-mode guidance so operators can reset, migrate, and reseed the same database with provider-backed fixtures in the correct order
- [ ] 4.3 Validate that provider-backed seed can repopulate the cleaned database without reintroducing demo social state

## 5. Verification

- [ ] 5.1 Verify league social feed behavior manually for member access, posting, and match-context navigation
- [x] 5.2 Run frontend validation and smoke checks needed to confirm mural, performance, and authenticated shell flows still hold after the change
- [ ] 5.3 Perform the real-data beta reset on the existing hosted database only after the workflow and post-reset expectations are documented clearly
