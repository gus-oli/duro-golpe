## ADDED Requirements

### Requirement: Team outright options SHALL represent real teams with flags
Outright markets whose choices are teams SHALL only present concrete teams and SHALL include flag media when available.

#### Scenario: Team outright option has a local team
- **WHEN** the API returns a team outright option linked to a known team
- **THEN** the frontend SHALL render the team name with its flag when a flag URL is available

#### Scenario: Team market contains knockout placeholders
- **WHEN** an outright market contains unresolved knockout placeholders such as bracket-side labels or "A definir"
- **THEN** those placeholders SHALL NOT be shown as selectable team options

#### Scenario: Team flag is missing
- **WHEN** a real team option has no flag URL
- **THEN** the frontend SHALL render a stable fallback that does not look like a smoke-test placeholder

### Requirement: Player outright options SHALL support cached player photos
Individual player outright markets SHALL render player photos when cached media is available and SHALL avoid client-side calls to external football APIs.

#### Scenario: Player photo exists
- **WHEN** a player outright option includes a cached photo URL
- **THEN** the frontend SHALL render the player photo alongside the player name and team context

#### Scenario: Player photo is missing
- **WHEN** a player outright option has no cached photo URL
- **THEN** the frontend SHALL render a consistent fallback avatar using player/team context

#### Scenario: Frontend renders player markets
- **WHEN** the outright page loads
- **THEN** the frontend SHALL NOT call API-Football or expose provider credentials

### Requirement: Player photo enrichment SHALL run through backend-controlled provider access
The system SHALL provide a backend-controlled enrichment path for player photos using API-Football or a compatible provider without requiring page-load provider calls.

#### Scenario: Operator runs player media enrichment
- **WHEN** an operator runs the enrichment job with provider credentials configured
- **THEN** the job SHALL resolve available player photo URLs and persist or cache them for app API consumption

#### Scenario: Provider lookup fails for a player
- **WHEN** the provider does not return a usable photo for a player
- **THEN** the job SHALL keep the player option available and leave the frontend fallback path intact

### Requirement: Player outright catalog SHALL include obvious star safety-net options
The individual outright catalog SHALL include high-signal likely contenders even before final squads are fully available, with source confidence metadata that distinguishes likely/curated entries from official squad entries.

#### Scenario: Lionel Messi is searched
- **WHEN** a user searches player outright markets for Lionel Messi
- **THEN** Messi SHALL be available in relevant individual markets unless explicitly marked inactive by a later catalog update

#### Scenario: Star option comes from curated safety net
- **WHEN** a player option is included before an official or preliminary squad source is available
- **THEN** the option SHALL be marked with likely/curated source confidence metadata
