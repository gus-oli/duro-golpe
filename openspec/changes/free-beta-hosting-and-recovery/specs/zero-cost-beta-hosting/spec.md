## ADDED Requirements

### Requirement: Zero-cost hosted beta SHALL support a split-origin deployment topology
The system SHALL support a hosted beta deployment where the public frontend is served from Vercel and the backend HTTP and WebSocket origin is served from Render free, with environment configuration that keeps the core product flows functional across the split.

#### Scenario: Frontend routes operate against the hosted backend
- **WHEN** an operator configures the frontend with the hosted backend API and WebSocket origins
- **THEN** login, registration, matches, leagues, outrights, and mural posting SHALL remain available in the hosted beta

### Requirement: Zero-cost hosted beta SHALL expose a lightweight health endpoint
The backend SHALL expose an unauthenticated lightweight health endpoint that can be called by an external keepalive service without triggering expensive application work.

#### Scenario: Health endpoint reports service availability
- **WHEN** an external service sends a request to the health endpoint
- **THEN** the backend SHALL return a successful response indicating that the application process is reachable

### Requirement: Zero-cost hosted beta SHALL support external keepalive pinging
The hosted beta deployment SHALL document and support an external pinger calling the backend health endpoint on a cadence intended to reduce Render free sleep events.

#### Scenario: External pinger is configured
- **WHEN** an operator configures the documented keepalive service to call the backend health endpoint every five minutes
- **THEN** the hosted beta deployment SHALL remain compatible with that traffic pattern without requiring backend code changes per environment
