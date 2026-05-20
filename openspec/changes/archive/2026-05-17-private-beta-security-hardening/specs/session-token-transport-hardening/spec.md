## ADDED Requirements

### Requirement: Session tokens SHALL not be exposed in browser-visible URL query strings for supported auth flows
The system SHALL avoid transporting durable session JWTs through redirect query strings in supported private-beta auth flows.

#### Scenario: Supported auth completion finishes without URL token leakage
- **WHEN** a user completes a supported login or OAuth handoff
- **THEN** the final browser-visible URL SHALL not contain the session JWT as a query parameter

### Requirement: Supported websocket auth SHALL avoid URL-query JWT transport
The system SHALL use a safer transport than a websocket URL query parameter for the authenticated session token in the supported private-beta realtime path.

#### Scenario: Client opens realtime connection
- **WHEN** the product opens its supported authenticated realtime connection
- **THEN** the session token SHALL not be placed in the browser-visible websocket URL query string
