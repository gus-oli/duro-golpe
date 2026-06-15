## ADDED Requirements

### Requirement: System SHALL provide the scoring badge expansion catalog
The system SHALL seed and expose the expanded scoring badge catalog with the badge types `PRIMEIRA_CRAVADA`, `HAT_TRICK_EXATO`, `REI_DO_SALDO`, `GOL_DE_HONRA`, `REGULARIDADE`, and `VOLTA_POR_CIMA`.

#### Scenario: Expanded badge catalog is seeded
- **WHEN** the badge seed or launch bootstrap flow runs
- **THEN** the badge catalog SHALL contain all expanded scoring badge types with Portuguese labels, Portuguese descriptions, and frontend icon keys

#### Scenario: Expanded badges use one-time award semantics
- **WHEN** a user qualifies for an expanded scoring badge more than once
- **THEN** the system SHALL keep a single `user_badges` row for that user and badge type

### Requirement: System SHALL award exact-score and goal-difference milestone badges
The system SHALL automatically award milestone badges based on the user's non-superseded match scoring totals after a match result is processed.

#### Scenario: First exact score awards PRIMEIRA_CRAVADA
- **WHEN** a scoring update causes a user to have at least one non-superseded `EXACT_SCORE`
- **THEN** the system SHALL award `PRIMEIRA_CRAVADA` to that user

#### Scenario: Three exact scores awards HAT_TRICK_EXATO
- **WHEN** a scoring update causes a user to have at least three non-superseded `EXACT_SCORE` results
- **THEN** the system SHALL award `HAT_TRICK_EXATO` to that user

#### Scenario: Five winner-and-goal-difference scores awards REI_DO_SALDO
- **WHEN** a scoring update causes a user to have at least five non-superseded `WINNER_AND_GOAL_DIFF` results
- **THEN** the system SHALL award `REI_DO_SALDO` to that user

### Requirement: System SHALL award positive scoring milestone badges
The system SHALL automatically award badges that recognize first scoring and repeated positive match scoring.

#### Scenario: First positive match score awards GOL_DE_HONRA
- **WHEN** a scoring update causes a user to have positive total match points for the first time
- **THEN** the system SHALL award `GOL_DE_HONRA` to that user

#### Scenario: Ten positive match scores awards REGULARIDADE
- **WHEN** a scoring update causes a user to have positive points in at least ten distinct non-superseded matches
- **THEN** the system SHALL award `REGULARIDADE` to that user

### Requirement: System SHALL award recovery from cold streaks
The system SHALL award `VOLTA_POR_CIMA` when a user recovers from a cold streak by achieving a correct result immediately after at least three consecutive total misses.

#### Scenario: Correct result after three misses awards VOLTA_POR_CIMA
- **WHEN** the current scored match is a correct result and the user's immediately previous non-superseded scored matches before the current match contain at least three consecutive `TOTAL_MISS` results by kickoff order
- **THEN** the system SHALL award `VOLTA_POR_CIMA` to that user

#### Scenario: Recovery badge is not awarded without a cold streak
- **WHEN** the current scored match is a correct result but the user has fewer than three immediately previous consecutive `TOTAL_MISS` results
- **THEN** the system SHALL NOT award `VOLTA_POR_CIMA`

#### Scenario: Recovery badge is not awarded on another miss
- **WHEN** the current scored match is `TOTAL_MISS`
- **THEN** the system SHALL NOT award `VOLTA_POR_CIMA`

### Requirement: Expanded badge awards SHALL reuse existing notification and display behavior
Expanded scoring badges SHALL appear in the same user badge responses, league ranking badge payloads, badge grid, and `badge:awarded` toast flow as existing badges.

#### Scenario: Newly awarded expanded badge notifies the user
- **WHEN** an expanded scoring badge is newly awarded to a connected user
- **THEN** the system SHALL send a `badge:awarded` WebSocket event containing the badge type, label, description, icon key, and awarded timestamp

#### Scenario: Expanded badges appear in league ranking
- **WHEN** league members view a ranking that includes a user with expanded scoring badges
- **THEN** the ranking SHALL include those badges with the same shape used for existing badges
