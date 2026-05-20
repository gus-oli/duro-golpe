## ADDED Requirements

### Requirement: System SHALL ingest World Cup 2026 teams and fixtures from `football-data.org`
The system SHALL support a provider-backed ingestion flow that loads the FIFA World Cup 2026 teams and fixtures from `football-data.org` v4 into the existing local team and match schema.

#### Scenario: Operator seeds the World Cup 2026 dataset
- **WHEN** an operator runs the provider-backed seed with valid `football-data.org` credentials
- **THEN** the system SHALL ingest the expected World Cup 2026 teams and fixtures into the local schema instead of relying on demo fixtures

#### Scenario: Critical provider credentials are missing
- **WHEN** the operator attempts to run the provider-backed seed without the required provider token
- **THEN** the command SHALL fail clearly and explain that `football-data.org` credentials are required for the real-fixture seed path

### Requirement: Provider-backed ingestion SHALL map provider data into the app's match model
The ingestion flow SHALL translate provider teams and fixtures into the app's existing team and match representation without requiring a schema fork for the free provider path.

#### Scenario: Team metadata is normalized for the local schema
- **WHEN** provider teams are ingested
- **THEN** the system SHALL map the provider's stable team identifier, display name, three-letter code where available, and crest/flag asset into the local team record shape

#### Scenario: Match metadata is normalized for the local schema
- **WHEN** provider fixtures are ingested
- **THEN** the system SHALL map provider fixture identifiers, kickoff time, stage/group labeling, and venue/context fields into the local match record shape

### Requirement: Provider-backed seed SHALL preserve local lock semantics
The provider-backed fixture seed SHALL leave match locking under local app control rather than requiring provider support for the app-specific `LOCKED` state.

#### Scenario: Seeded matches begin as schedulable local fixtures
- **WHEN** the operator loads real fixtures from the provider
- **THEN** those matches SHALL enter the local system in a state compatible with the app's kickoff-driven locking behavior
