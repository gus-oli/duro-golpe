## ADDED Requirements

### Requirement: Social odds SHALL be derived from submitted match predictions
The system SHALL compute social odds for a match by grouping submitted score predictions into home win, draw, and away win outcomes, including counts, total prediction count, and percentage share for each outcome.

#### Scenario: Predictions are aggregated into outcome shares
- **WHEN** a match has submitted predictions for home win, draw, and away win outcomes
- **THEN** the system SHALL expose social odds containing the count and percentage share for each of the three outcomes

#### Scenario: A match has no prediction sample
- **WHEN** a match has no submitted predictions
- **THEN** the system SHALL expose social odds as unavailable rather than returning misleading zero-percent outcome shares

### Requirement: Social odds SHALL freeze when a match locks
The system SHALL persist a canonical social odds snapshot when a match transitions to locked, and that snapshot SHALL remain the source of truth for locked/finished match display and badge qualification.

#### Scenario: Match locks with predictions
- **WHEN** a scheduled match transitions to locked and predictions exist for that match
- **THEN** the system SHALL persist a snapshot containing outcome counts, total prediction count, outcome percentages, capture time, minimum sample setting, and underdog threshold setting

#### Scenario: Lock processing runs more than once
- **WHEN** lock processing or recovery attempts to create the same match's social odds snapshot more than once
- **THEN** the system SHALL keep snapshot creation idempotent and SHALL NOT create duplicate canonical snapshots for that match

#### Scenario: Locked match is read after prediction maintenance
- **WHEN** a locked or finished match is read after predictions were repaired, backfilled, or otherwise changed
- **THEN** the system SHALL use the frozen lock snapshot for social odds display and badge qualification instead of recalculating from mutable prediction rows

### Requirement: Match surfaces SHALL display social odds with prediction-safe visibility
The frontend SHALL render social odds as compact match context while avoiding pre-lock herd influence for users who have not yet submitted a prediction.

#### Scenario: Authenticated user has predicted an open match
- **WHEN** an authenticated user views an open match after submitting their prediction
- **THEN** the match card or detail surface SHALL be allowed to display current social odds for that match

#### Scenario: Authenticated user has not predicted an open match
- **WHEN** an authenticated user views an open match without having submitted a prediction
- **THEN** the match card or detail surface SHALL hide social odds and instead preserve the normal prediction call-to-action

#### Scenario: Match is locked or finished
- **WHEN** a user views a locked or finished match with a frozen social odds snapshot
- **THEN** the match card or detail surface SHALL display the frozen social odds regardless of whether the user has already submitted a prediction for that match

#### Scenario: Social odds sample is below the minimum
- **WHEN** social odds exist but the total prediction count is below the configured minimum sample
- **THEN** the frontend SHALL show a low-sample or unavailable state rather than presenting the odds as a reliable consensus

### Requirement: Zebra Hunter SHALL use frozen social odds for underdog qualification
The system SHALL qualify `ZEBRA_HUNTER` from the frozen social odds snapshot when a user correctly predicts a final match outcome that had low social support at lock time.

#### Scenario: User correctly predicts a low-share outcome
- **WHEN** a match result is confirmed and a user's predicted outcome matches the final outcome
- **THEN** the system SHALL award or increment `ZEBRA_HUNTER` if the frozen snapshot has at least one prediction and the user's predicted outcome had at most 30 percent social share

#### Scenario: User predicts a popular winning outcome
- **WHEN** a match result is confirmed and a user's predicted outcome matches the final outcome but that outcome had more than 30 percent social share in the frozen snapshot
- **THEN** the system SHALL NOT award or increment `ZEBRA_HUNTER` for that match

#### Scenario: User scores without calling the outcome
- **WHEN** a match result is confirmed and the user's scoring tier is `ONE_TEAM_GOALS` or `TOTAL_MISS`
- **THEN** the system SHALL NOT award or increment `ZEBRA_HUNTER` even if the final outcome was a social underdog

#### Scenario: Snapshot is missing or sample is too small
- **WHEN** a match result is confirmed but no frozen snapshot exists or the snapshot has no predictions
- **THEN** the system SHALL NOT award or increment `ZEBRA_HUNTER` from social odds for that match
