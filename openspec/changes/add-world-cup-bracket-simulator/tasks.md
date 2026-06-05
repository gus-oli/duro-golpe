## 1. Tournament Rules Module

- [x] 1.1 Define simulator domain types for teams, group rankings, third-place selections, knockout matches, and saved simulator state
- [x] 1.2 Encode the official FIFA Round of 32 slots for matches 73 through 88
- [x] 1.3 Encode the official knockout tree from matches 73 through 104, including semifinal loser flow into Match 103
- [x] 1.4 Encode the FIFA Annex C third-place allocation lookup for all valid eight-group combinations
- [x] 1.5 Implement pure helpers to build Round of 32 fixtures from group rankings and selected third-place groups
- [x] 1.6 Implement pure helpers to advance winners, clear invalid downstream picks, derive finalists, derive third-place match participants, and derive champion

## 2. Simulator Data Source

- [x] 2.1 Add a frontend-safe data loader for World Cup teams grouped A through L using existing team/group metadata
- [x] 2.2 Handle missing or incomplete group data with an empty state that does not render a broken bracket
- [x] 2.3 Add deterministic fallback display data for teams without flag assets
- [x] 2.4 Ensure placeholder knockout teams such as `A definir R32...` are excluded from simulator group choices

## 3. Simulator Route And State

- [x] 3.1 Create the `/simulador` route inside the authenticated product experience
- [x] 3.2 Add client state for group rankings, selected thirds, knockout winners, current step, and validation status
- [x] 3.3 Add localStorage persistence with a versioned simulator state shape
- [x] 3.4 Add reset behavior that clears in-memory and local persisted simulator state
- [x] 3.5 Prevent bracket generation until all groups are ranked and exactly eight third-place teams are selected

## 4. Group And Third-Place UI

- [x] 4.1 Build a group ordering view for the 12 groups with accessible move/select controls
- [x] 4.2 Display first, second, third, and fourth-place status for each group after ordering
- [x] 4.3 Build a third-place selection view with exactly-eight validation and clear selected/count state
- [x] 4.4 Provide forward/back navigation between group ranking, third-place selection, and bracket steps

## 5. Wallchart Bracket UI

- [x] 5.1 Build the desktop wallchart bracket layout with left/right branches, official match numbers, slot labels, and central champion treatment
- [x] 5.2 Render team badges with flags or fallback initials and stable dimensions for empty, active, winner, and eliminated states
- [x] 5.3 Implement winner selection interactions for every knockout match
- [x] 5.4 Implement downstream clearing/reconciliation when an earlier winner changes
- [x] 5.5 Build the mobile round-by-round bracket view so the full simulation is usable without tiny content
- [x] 5.6 Add copy that describes the simulator as using the official Copa 2026 chaveamento without implying FIFA affiliation

## 6. Navigation Integration

- [x] 6.1 Add `Simulador` to the authenticated shell/drawer once `/simulador` exists
- [x] 6.2 Add a home or hub entry point for the simulator without duplicating heavy navigation cards inside internal pages
- [x] 6.3 Confirm protected route and shell behavior stay consistent with the updated authenticated-product-shell spec

## 7. Validation

- [x] 7.1 Add unit tests for fixed Round of 32 slots and knockout tree propagation
- [x] 7.2 Add unit tests confirming the Annex C lookup contains all 495 valid combinations
- [x] 7.3 Add unit tests for representative Annex C combinations, including stable fixed slots such as Match 73
- [x] 7.4 Add unit tests for winner changes clearing invalid downstream selections
- [x] 7.5 Add frontend tests for group ranking, third-place validation, bracket generation, winner selection, local restore, and reset
- [x] 7.6 Run frontend typecheck and the relevant UI/test suite for the simulator route
