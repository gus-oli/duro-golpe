## ADDED Requirements

### Requirement: Player outright catalogs SHALL support source confidence metadata
The system SHALL distinguish player options sourced from official final squads, preliminary squads, and curated likely shortlists.

#### Scenario: Official squad player is displayed
- **WHEN** a player option comes from a published official squad list
- **THEN** the option SHALL be available with source confidence indicating an official squad source

#### Scenario: Preliminary squad player is displayed
- **WHEN** a player option comes from a published preliminary squad list
- **THEN** the option SHALL be available with source confidence indicating a preliminary squad source

#### Scenario: Likely player is displayed before a squad is published
- **WHEN** a team has no published squad list and the catalog includes a curated likely player
- **THEN** the option SHALL be available with source confidence indicating a likely shortlist source

### Requirement: Player outright refreshes SHALL preserve existing predictions
The system SHALL update player options without deleting predictions that users have already submitted.

#### Scenario: Player disappears from refreshed catalog
- **WHEN** a player option is no longer present in the latest catalog refresh
- **THEN** the system SHALL keep the option record available for existing predictions and mark it inactive instead of deleting it

#### Scenario: User has selected an inactive player
- **WHEN** a user opens an outright market containing a previously selected inactive player
- **THEN** the frontend SHALL show the selected player with an inactive or outside-list state instead of hiding the selection

### Requirement: Player markets SHALL present featured choices plus search
The frontend SHALL keep player outright cards lightweight by showing a featured subset first and letting users search the full catalog.

#### Scenario: User opens a player market with no search term
- **WHEN** a player outright market is rendered and the user has not typed a search term
- **THEN** the card SHALL show no more than five featured player options plus any currently selected option that is not already visible

#### Scenario: User searches player options
- **WHEN** the user types into a player market search field
- **THEN** the card SHALL filter the market's player options by the entered text and render a capped result set

#### Scenario: User clears player search
- **WHEN** the user clears the player search field
- **THEN** the card SHALL return to the featured player view while preserving any local selection state

### Requirement: Player market search SHALL remain usable on small screens
The player search experience SHALL be optimized for private beta mobile use and avoid rendering very large option lists by default.

#### Scenario: Full catalog is large
- **WHEN** a player market contains more options than the default featured view
- **THEN** the frontend SHALL avoid rendering every option until the user searches

#### Scenario: Search has many matches
- **WHEN** a search term matches more players than the configured visible result limit
- **THEN** the frontend SHALL cap the rendered result count and communicate that the user can refine the search
