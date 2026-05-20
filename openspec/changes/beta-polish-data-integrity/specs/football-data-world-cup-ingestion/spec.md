## MODIFIED Requirements

### Requirement: Provider-backed ingestion SHALL map provider data into the app's match model
The ingestion flow SHALL translate provider teams and fixtures into the app's existing team and match representation without requiring a schema fork for the free provider path. Team metadata loaded from the provider SHALL remain protected from destructive smoke/demo seed updates, and user-facing team names SHALL be localized to Brazilian Portuguese when a stable local mapping exists.

#### Scenario: Team metadata is normalized for the local schema
- **WHEN** provider teams are ingested
- **THEN** the system SHALL map the provider's stable team identifier, localized display name where available, three-letter code where available, and crest/flag asset into the local team record shape

#### Scenario: Provider-backed metadata is protected after ingestion
- **WHEN** smoke/demo seed logic runs after provider-backed teams have been ingested
- **THEN** the system SHALL preserve official provider-backed team identifiers, localized names, FIFA codes, and crest/flag assets instead of replacing them with smoke metadata

#### Scenario: Match metadata is normalized for the local schema
- **WHEN** provider fixtures are ingested
- **THEN** the system SHALL map provider fixture identifiers, kickoff time, stage/group labeling, and venue/context fields into the local match record shape
