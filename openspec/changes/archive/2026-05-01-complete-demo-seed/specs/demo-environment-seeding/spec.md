## ADDED Requirements

### Requirement: System SHALL provide a deterministic full-featured demo seed
The system SHALL provide a dedicated demo seed command that provisions a deterministic local dataset representing the major user-facing features of the product without requiring external provider access.

#### Scenario: Demo seed provisions a local showcase environment
- **WHEN** an operator runs the demo seed command in a configured local environment
- **THEN** the database SHALL be populated with a stable, repeatable dataset suitable for exploring the complete product

#### Scenario: Demo seed does not require provider availability
- **WHEN** API-Football is unavailable or the operator does not use provider-backed enrichment
- **THEN** the demo seed SHALL still complete successfully with its curated local dataset

### Requirement: Demo seed SHALL cover the product's core feature surfaces
The demo dataset SHALL include enough data to exercise matches, predictions, leagues, rankings, outrights, mural, scoring totals, and badges in the UI.

#### Scenario: Demo users can log in and see non-empty product surfaces
- **WHEN** a seeded demo user authenticates in the local environment
- **THEN** the user SHALL be able to browse populated matches, leagues, rankings, outrights, and other core surfaces without having to create all data manually

#### Scenario: League views reflect active competition
- **WHEN** a seeded demo user opens a seeded league
- **THEN** the league SHALL include multiple members, ranking entries, and score totals

#### Scenario: Matchday views reflect seeded interaction history
- **WHEN** a seeded demo user opens seeded match detail and list views
- **THEN** the environment SHALL include visible predictions and a mixture of match lifecycle states

### Requirement: Demo seed SHALL include lifecycle variety
The demo dataset SHALL include multiple matches and markets spanning the major statuses needed by the product experience.

#### Scenario: Match statuses are represented
- **WHEN** the demo dataset is inspected
- **THEN** it SHALL include scheduled, locked, live, and finished matches

#### Scenario: Outright statuses are represented
- **WHEN** the demo dataset is inspected
- **THEN** it SHALL include open, locked, and resolved outright markets or otherwise expose those states through seeded records

### Requirement: Demo seed SHALL publish clear operator output
The demo seed command SHALL print the key information needed to use the seeded environment immediately.

#### Scenario: Operator receives demo access summary
- **WHEN** the demo seed finishes
- **THEN** it SHALL print seeded demo accounts, notable match identifiers, and seeded league or invite information needed for local exploration
