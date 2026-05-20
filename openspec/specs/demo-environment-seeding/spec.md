# demo-environment-seeding Specification

## Purpose
TBD - created by archiving change complete-demo-seed. Update Purpose after archive.
## Requirements
### Requirement: System SHALL provide a deterministic full-featured demo seed
The system SHALL provide a dedicated demo seed command that provisions a deterministic dataset representing the major user-facing features of the product without requiring external provider access, and that dataset SHALL be suitable for both local showcase use and the local-tunnel private beta bootstrap.

#### Scenario: Demo seed provisions a local showcase environment
- **WHEN** an operator runs the demo seed command in a configured local environment
- **THEN** the database SHALL be populated with a stable, repeatable dataset suitable for exploring the complete product

#### Scenario: Demo seed provisions a private-beta environment
- **WHEN** an operator runs the demo seed command after configuring the local-tunnel beta runtime
- **THEN** the database SHALL be populated with the same stable, repeatable dataset suitable for inviting beta users without manual content creation

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

### Requirement: Demo seed SHALL support hosted beta bootstrap
The demo seed SHALL remain valid for initializing a hosted beta environment that uses managed PostgreSQL and managed Redis services, not only a local showcase environment.

#### Scenario: Hosted operator loads the demo dataset
- **WHEN** an operator runs the demo seed against a freshly migrated hosted beta database
- **THEN** the system SHALL populate the deterministic demo dataset without requiring provider-backed ingestion or local Docker-managed infrastructure

