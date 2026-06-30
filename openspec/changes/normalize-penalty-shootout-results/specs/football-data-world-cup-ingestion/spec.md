## MODIFIED Requirements

### Requirement: Provider-backed ingestion SHALL map provider data into the app's match model
The ingestion flow SHALL translate provider teams and fixtures into the app's existing team and match representation without requiring a schema fork for the free provider path. When provider fixtures include score data, the ingestion flow SHALL store the playable match score through 120 minutes and MUST exclude penalty-shootout goals.

#### Scenario: Team metadata is normalized for the local schema
- **WHEN** provider teams are ingested
- **THEN** the system SHALL map the provider's stable team identifier, display name, three-letter code where available, and crest/flag asset into the local team record shape

#### Scenario: Match metadata is normalized for the local schema
- **WHEN** provider fixtures are ingested
- **THEN** the system SHALL map provider fixture identifiers, kickoff time, stage/group labeling, and venue/context fields into the local match record shape

#### Scenario: Finished shootout fixture stores playable score
- **WHEN** provider-backed ingestion receives a finished football-data.org fixture with `score.duration` equal to `PENALTY_SHOOTOUT`
- **THEN** the local match score SHALL use regular-time plus extra-time goals and MUST NOT include penalty-shootout goals
