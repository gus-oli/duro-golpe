## ADDED Requirements

### Requirement: League members SHALL be able to view each other's picks
The system SHALL allow an active member of a league to view match predictions and outright selections submitted by other active members of the same league before and after product lock times.

#### Scenario: Active member views match predictions for a league match
- **WHEN** an authenticated active league member opens friend picks for a match in that league context
- **THEN** the system SHALL show the predictions submitted by active members of that league

#### Scenario: Active member views outright selections
- **WHEN** an authenticated active league member opens friend picks for outright markets in that league context
- **THEN** the system SHALL show the selections submitted by active members of that league

#### Scenario: Pick is not submitted yet
- **WHEN** a league member has not submitted a pick for the requested match or outright market
- **THEN** the UI SHALL show an empty state for that member instead of hiding the member completely

### Requirement: Friend-pick views SHALL enforce league scope
Friend-pick APIs and surfaces SHALL only expose data for leagues where the current user is an active member.

#### Scenario: User requests picks for own league
- **WHEN** the current user is an active member of the requested league
- **THEN** the system SHALL allow the request and return member-scoped pick data

#### Scenario: User requests picks for another league
- **WHEN** the current user is not an active member of the requested league
- **THEN** the system SHALL deny the request without exposing pick data

### Requirement: Friend-pick views SHALL avoid redundant lock-state explanation
Friend-pick screens SHALL not render explanatory text telling users that a pick can still change or is locked.

#### Scenario: Friend pick is visible before lock
- **WHEN** a user views a friend's pick before the relevant lock time
- **THEN** the UI SHALL show the pick without copy explaining that it can still change

#### Scenario: Friend pick is visible after lock
- **WHEN** a user views a friend's pick after the relevant lock time
- **THEN** the UI SHALL show the pick without copy explaining that it is locked

### Requirement: Friend-pick entry points SHALL be discoverable from social surfaces
The frontend SHALL provide natural paths to friend picks from league ranking, match context, and outright markets.

#### Scenario: User compares league members
- **WHEN** a user is viewing the league ranking
- **THEN** the interface SHALL provide a way to inspect a member's match and outright picks

#### Scenario: User reviews one match
- **WHEN** a user is viewing a match detail or match workbench context
- **THEN** the interface SHALL provide a way to compare league predictions for that match

#### Scenario: User reviews outrights
- **WHEN** a user is viewing outright markets
- **THEN** the interface SHALL provide a way to compare league selections for those markets

### Requirement: Friend-pick APIs SHALL fail safely and preserve page usability
Friend-pick APIs and frontend surfaces SHALL avoid generic internal-server failures for expected missing-data, missing-pick, or schema-drift cases.

#### Scenario: Friend-pick data is empty
- **WHEN** a league has active members but no submitted picks for the requested context
- **THEN** the system SHALL return a valid empty-pick DTO instead of a server error

#### Scenario: Friend-pick lookup fails validation
- **WHEN** the requested match, market, league, or member scope is invalid
- **THEN** the backend SHALL return a typed client or authorization error without exposing unrelated data

#### Scenario: Frontend receives a recoverable friend-pick error
- **WHEN** a friend-pick panel cannot load comparison data
- **THEN** the page SHALL remain usable and show a scoped error state instead of crashing the route
