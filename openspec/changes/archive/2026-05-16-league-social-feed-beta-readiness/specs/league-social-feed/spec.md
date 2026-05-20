## ADDED Requirements

### Requirement: System SHALL provide a league-scoped social feed
The system SHALL expose mural activity as a league-level feed so members can browse and contribute to one primary social surface for the league without navigating into a separate feed per match.

#### Scenario: League member opens the social feed
- **WHEN** an authenticated member opens a league social surface
- **THEN** the system SHALL render recent posts for that league from a single league-scoped feed

#### Scenario: Non-member cannot access league social feed
- **WHEN** an authenticated user who is not an active member requests a league social feed
- **THEN** the system SHALL deny access or redirect the user back to an authorized league surface

### Requirement: League social feed SHALL support optional match context
The system SHALL allow league feed posts to include optional match context so conversation can stay football-specific without creating separate feed identities per fixture.

#### Scenario: Post references a match
- **WHEN** a user creates a league feed post with match context
- **THEN** the stored and rendered post SHALL preserve that match reference as contextual metadata

#### Scenario: General league post omits match context
- **WHEN** a user creates a league feed post without match context
- **THEN** the system SHALL accept and render the post as a league-level message without requiring a match identifier

### Requirement: New mural posts SHALL return a render-safe payload
The system SHALL return the same render-safe mural-post shape for create, list, and realtime delivery paths so the frontend can append a new post immediately without crashing or guessing missing author fields.

#### Scenario: Post creation returns complete author fields
- **WHEN** a user successfully submits a new league feed post
- **THEN** the create response SHALL include the post identifier, author identity fields, content, and created timestamp needed for immediate rendering

#### Scenario: Realtime update matches create response shape
- **WHEN** the same post is later delivered over realtime or fetched in a feed refresh
- **THEN** the payload SHALL use the same logical mural-post shape as the create response

### Requirement: Product surfaces SHALL expose league social entry points
The system SHALL surface league social access from primary authenticated product flow so the mural is discoverable without manual route guessing.

#### Scenario: League page exposes the feed
- **WHEN** a member opens a league page
- **THEN** the league page SHALL expose the league social feed as a first-class surface or entry point

#### Scenario: Match detail can lead into league conversation
- **WHEN** a member finishes or reviews a prediction on match detail
- **THEN** the product SHALL provide a route into the relevant league conversation instead of relying on a deep match-scoped mural URL
