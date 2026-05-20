## ADDED Requirements

### Requirement: Tournament data aligns to the 2026 World Cup format
The system MUST treat the 2026 World Cup as a 48-team tournament with 104 matches, and tournament seed/import flows MUST NOT assume a 32-team format.

#### Scenario: Tournament seed uses 48-team assumptions
- **WHEN** tournament teams and matches are seeded or refreshed
- **THEN** the system MUST accept and preserve the 48-team, 104-match tournament structure without relying on 32-team shortcuts

### Requirement: Match APIs expose enriched team metadata for web clients
The system MUST return match list and match detail payloads with the team metadata required by the launch web UI, including team identifiers, display names, FIFA codes, flag assets, status, and score state.

#### Scenario: Match list renders from a single API contract
- **WHEN** the web client requests the match list or a match detail page
- **THEN** the response MUST contain all team metadata needed to render the launch UI without follow-up team lookup requests

## MODIFIED Requirements

### Requirement: Users can submit and edit predictions before the lock deadline
The system MUST allow authenticated users to create and update match predictions through the launch web UI until 15 minutes before scheduled kickoff, and the UI MUST only show a successful submission state after the backend persists the prediction.

#### Scenario: Persisted prediction shows success
- **WHEN** an authenticated user submits or updates a valid prediction before the lock deadline
- **THEN** the backend MUST persist the prediction and the UI MUST only show success after the persisted response is received

#### Scenario: Locked match rejects prediction changes
- **WHEN** a user attempts to create or edit a prediction for a match that is at or inside the 15-minute lock window
- **THEN** the system MUST reject the change and the launch UI MUST show that predictions are closed for that match

## REMOVED Requirements

### Requirement: Goal push notifications are required for v1 launch
**Reason**: Push notifications are not needed to ship a stable web v1 today and remain unimplemented and unverified for production launch.
**Migration**: Reintroduce this requirement in a future notifications-focused change once browser permission flow, delivery infrastructure, and production verification are ready.

#### Scenario: Launch acceptance does not depend on push delivery
- **WHEN** the v1 launch candidate is evaluated for release
- **THEN** successful push notification delivery MUST NOT be required for launch approval
