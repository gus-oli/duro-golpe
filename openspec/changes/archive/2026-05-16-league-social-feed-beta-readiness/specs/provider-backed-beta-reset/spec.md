## ADDED Requirements

### Requirement: System SHALL support an in-place beta reset before provider seeding
The system SHALL provide an operator workflow for clearing resettable beta application state on the existing database before loading provider-backed tournament data.

#### Scenario: Operator resets existing beta state in place
- **WHEN** an operator decides to replace demo-oriented beta data with provider-backed tournament data on the current hosted database
- **THEN** the system SHALL support clearing the existing resettable application state without requiring a new database branch or second hosted environment

### Requirement: In-place beta reset SHALL leave the database ready for provider-backed seed
The reset workflow SHALL leave schema and operator configuration intact while removing the application data that would otherwise conflict with a provider-backed tournament cutover.

#### Scenario: Database is ready for migrations and provider seed after reset
- **WHEN** the reset workflow completes successfully
- **THEN** the operator SHALL be able to run migrations and the provider-backed seed on the same database without inheriting stale demo social or fixture state

### Requirement: Cutover documentation SHALL define post-reset expectations
The system documentation SHALL explain what state is intentionally lost during the in-place reset and what state is recreated by provider-backed seeding versus organic beta play.

#### Scenario: Operator understands what survives the cutover
- **WHEN** an operator follows the hosted beta cutover documentation
- **THEN** the documentation SHALL clearly state that demo users, demo leagues, demo mural posts, and other seeded fake social activity are removed and that real social activity must be rebuilt by actual players
