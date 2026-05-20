# local-tunnel-beta-deployment Specification

## Purpose
TBD - created by archiving change local-tunnel-beta-deploy. Update Purpose after archive.
## Requirements
### Requirement: Private beta deployment SHALL expose one public origin through a local reverse proxy
The system SHALL define a private-beta deployment topology where a public tunnel URL routes to a local reverse proxy, and that proxy routes frontend page traffic, backend HTTP APIs, and backend WebSocket traffic through one public origin.

#### Scenario: Browser enters through one tunnel URL
- **WHEN** a beta user opens the public tunnel URL
- **THEN** the request SHALL resolve through the local reverse proxy rather than requiring separate public frontend and backend hosts

#### Scenario: API and WebSocket traffic stay same-origin
- **WHEN** the beta user loads pages that call backend APIs or establish realtime sessions
- **THEN** the deployment SHALL expose those flows on the same public origin as the frontend page traffic

### Requirement: Private beta deployment SHALL use managed PostgreSQL and Redis services
The system SHALL define Neon as the canonical PostgreSQL dependency and Upstash as the canonical Redis dependency for the local-tunnel private beta path.

#### Scenario: Operator configures private beta data services
- **WHEN** an operator prepares a local-tunnel beta environment
- **THEN** the documented environment contract SHALL require managed PostgreSQL and managed Redis connection settings instead of local database ownership

### Requirement: Private beta deployment SHALL distinguish public browser URLs from local service addresses
The system SHALL document and preserve the difference between public tunnel-facing URLs used by browsers and local loopback addresses used for internal service-to-service calls on the operator machine.

#### Scenario: Frontend server calls backend locally
- **WHEN** the frontend process performs internal server-side calls on the operator machine
- **THEN** the deployment contract SHALL allow those calls to use local service addresses without changing the public browser origin

#### Scenario: Browser uses public tunnel URL
- **WHEN** browser-side code performs API calls or WebSocket connections
- **THEN** those calls SHALL target the public tunnel origin rather than localhost addresses

### Requirement: Private beta deployment SHALL document host limitations and restart expectations
The system SHALL describe the local-tunnel environment as a private-beta host whose availability depends on the operator machine and tunnel process remaining online.

#### Scenario: Operator reviews runtime expectations
- **WHEN** the operator reads the deployment runbook
- **THEN** the runbook SHALL explain that machine sleep, reboot, or tunnel failure can make the beta temporarily unavailable

