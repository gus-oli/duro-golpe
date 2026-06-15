## ADDED Requirements

### Requirement: League creators SHALL be able to delete their own leagues
The system SHALL allow the authenticated user who created a league to delete that league.

#### Scenario: Creator deletes league successfully
- **WHEN** an authenticated user requests deletion of a league whose `createdBy` value matches that user's id
- **THEN** the system SHALL delete the league and return a successful deletion response

#### Scenario: Deleting missing league returns not found
- **WHEN** an authenticated user requests deletion of a league that does not exist
- **THEN** the system SHALL return a not found response and SHALL NOT delete any other league data

### Requirement: League deletion SHALL enforce creator authorization
The system SHALL reject league deletion attempts from users who did not create the target league.

#### Scenario: Non-creator member cannot delete league
- **WHEN** an authenticated league member requests deletion of a league created by another user
- **THEN** the system SHALL reject the request with an access denied response and SHALL NOT delete the league

#### Scenario: Non-member cannot delete league
- **WHEN** an authenticated user who is not a member of the target league requests deletion of that league
- **THEN** the system SHALL reject the request with an access denied response and SHALL NOT delete the league

#### Scenario: Anonymous user cannot delete league
- **WHEN** an unauthenticated request attempts to delete a league
- **THEN** the system SHALL reject the request as unauthenticated and SHALL NOT delete the league

### Requirement: League deletion SHALL remove only league-owned data
The system SHALL remove league-owned records when deleting a league while preserving personal and tournament-scoped user data.

#### Scenario: League-owned data is removed
- **WHEN** a league is deleted by its creator
- **THEN** the system SHALL remove the league, its memberships, and its mural posts

#### Scenario: Personal scoring data is preserved
- **WHEN** a league is deleted by its creator
- **THEN** the system SHALL preserve user accounts, match predictions, match scores, outright selections, user totals, and user badges

### Requirement: Frontend SHALL expose deletion only as an explicit creator action
The frontend SHALL show league deletion as a destructive action only to the league creator and SHALL require explicit confirmation before sending the deletion request.

#### Scenario: Creator sees destructive delete control
- **WHEN** the league creator views the league management surface
- **THEN** the frontend SHALL show a destructive delete control for that league

#### Scenario: Non-creator does not see delete control
- **WHEN** a user who did not create the league views the league surface
- **THEN** the frontend SHALL NOT show the league delete control

#### Scenario: Delete confirmation prevents accidental deletion
- **WHEN** the creator activates the league delete control
- **THEN** the frontend SHALL require an explicit confirmation step before calling the deletion endpoint

#### Scenario: User is redirected after deletion
- **WHEN** the creator successfully deletes a league from the frontend
- **THEN** the frontend SHALL navigate the user away from the deleted league to the leagues list
