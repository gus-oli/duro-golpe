## ADDED Requirements

### Requirement: System SHALL support batch submission of match predictions
The backend SHALL expose a batch prediction endpoint that accepts multiple match predictions for the authenticated user in a single request.

#### Scenario: Mixed create and update predictions are saved together
- **WHEN** an authenticated user submits a batch containing some matches with no previous prediction and some matches with an existing prediction
- **THEN** the system SHALL create or update each item using upsert semantics keyed by that user and match

#### Scenario: Batch payload is validated before processing
- **WHEN** a client submits a batch prediction payload
- **THEN** the system SHALL validate the request shape, match identifiers, and score bounds for each item before attempting to persist changes

### Requirement: Batch submission SHALL return per-item results
The batch prediction flow SHALL report success or failure for each requested fixture instead of collapsing every outcome into a single opaque status.

#### Scenario: Locked match does not block unrelated open matches
- **WHEN** a user submits a batch where one fixture has already moved out of the schedulable state but others are still open
- **THEN** the system SHALL save the valid open fixtures and return the locked fixture as a failed item with a clear reason

#### Scenario: Client can reconcile saved and failed items
- **WHEN** the batch endpoint completes
- **THEN** the response SHALL distinguish saved items from failed items so the UI can clear successful drafts and keep problematic fixtures editable

### Requirement: Individual prediction endpoints SHALL remain supported
The existing single-match prediction APIs SHALL remain available for match detail and compatibility flows.

#### Scenario: Match detail still submits one prediction
- **WHEN** a client submits a single prediction through the existing per-match endpoint
- **THEN** the system SHALL continue to save that prediction without requiring the batch contract
