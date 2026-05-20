## ADDED Requirements

### Requirement: Smoke data SHALL NOT overwrite provider-backed national teams
Smoke/demo seed flows SHALL avoid replacing official national-team metadata that was loaded from a real provider, including display name, FIFA code, flag/crest, and provider identifier.

#### Scenario: Smoke seed runs after provider seed
- **WHEN** the provider-backed World Cup dataset already contains Brazil and France
- **THEN** running a smoke/demo seed SHALL NOT replace those teams with smoke placeholder flags, names, or provider identifiers

#### Scenario: Smoke fixtures need test participants
- **WHEN** a smoke/demo fixture requires test teams that conflict with official FIFA codes
- **THEN** the seed SHALL use isolated smoke-only identifiers or skip destructive metadata updates rather than mutating official team records

### Requirement: Team display names SHALL be localized for Brazilian users
The system SHALL display national-team names in Brazilian Portuguese when a local mapping exists, while preserving provider IDs and canonical FIFA codes for data integrity.

#### Scenario: Provider returns English team names
- **WHEN** provider data includes names such as `Brazil`, `France`, `Germany`, or `Morocco`
- **THEN** user-facing surfaces SHALL display localized names such as `Brasil`, `Franca`, `Alemanha`, or `Marrocos` where mappings exist

#### Scenario: A team has no local mapping yet
- **WHEN** provider data includes a team without a known localized label
- **THEN** the system SHALL fall back to the provider display name without failing ingestion or rendering

### Requirement: Knockout placeholders SHALL remain non-selectable bracket slots
Unresolved knockout participants SHALL be usable for match scheduling and display, but SHALL NOT be treated as real selectable teams in prediction or outright choice catalogs.

#### Scenario: Unresolved knockout fixture is displayed
- **WHEN** a future knockout match participant is not known yet
- **THEN** the match UI MAY show a placeholder such as `A definir`, but the placeholder SHALL remain marked or inferable as non-selectable

#### Scenario: Selectable team list is generated
- **WHEN** the backend builds any user-selectable list of national teams
- **THEN** unresolved knockout placeholders such as `R1603B` SHALL be excluded from the choices
