## ADDED Requirements

### Requirement: Sensitive league social mutations SHALL enforce actor authorization
The system SHALL prevent authenticated users from mutating league social content unless the actor is explicitly allowed to perform that mutation for the specific post and league context.

#### Scenario: User tries to hide another member's post without authority
- **WHEN** an authenticated user requests a hide operation for a mural post they do not own and are not allowed to moderate
- **THEN** the system SHALL deny the request without changing that post's visibility

#### Scenario: Hide operation validates league context
- **WHEN** a hide operation is requested with a `leagueId` and `postId`
- **THEN** the system SHALL verify that the target post actually belongs to that league before applying any mutation

### Requirement: User-scoped score and badge endpoints SHALL enforce a declared visibility policy
The system SHALL enforce an explicit policy for routes that expose another user's scores, score breakdowns, or badges instead of relying on "authenticated means allowed."

#### Scenario: Unauthorized user requests protected user-scoped stats
- **WHEN** an authenticated user requests another user's protected score or badge data without meeting the declared visibility rule
- **THEN** the system SHALL deny the request

#### Scenario: Authorized viewer requests user-scoped stats
- **WHEN** a request satisfies the declared visibility rule for score or badge data
- **THEN** the system SHALL return the requested data normally
