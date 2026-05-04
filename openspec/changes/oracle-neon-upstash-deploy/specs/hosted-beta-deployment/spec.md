## ADDED Requirements

### Requirement: Hosted beta environment SHALL support a single-domain runtime topology
The system SHALL support a hosted beta deployment where the public application origin serves the frontend while routing backend HTTP APIs and backend WebSocket traffic through the same domain.

#### Scenario: Backend HTTP APIs are routed behind the public origin
- **WHEN** an operator configures the hosted beta reverse proxy
- **THEN** requests to `/api/v1/*` SHALL be forwarded to the backend service while application page routes remain served by the frontend service

#### Scenario: WebSocket upgrades remain available through the public origin
- **WHEN** an authenticated client connects to `/ws` on the public beta domain
- **THEN** the reverse proxy SHALL preserve the upgrade request and the backend SHALL remain reachable for realtime events without requiring a separate browser origin

### Requirement: Hosted beta environment SHALL use managed PostgreSQL and managed Redis services
The system SHALL allow the hosted beta runtime to depend on managed PostgreSQL and managed Redis endpoints provided through environment configuration instead of requiring local database daemons on the Oracle VM.

#### Scenario: Backend starts against managed data services
- **WHEN** an operator provides valid managed PostgreSQL and managed Redis connection strings in the hosted environment
- **THEN** the backend SHALL start successfully and the application SHALL use those remote services for persistence, pub/sub, and realtime processing

### Requirement: Hosted beta environment SHALL keep the backend continuously supervised
The hosted beta deployment SHALL run the backend as a continuously supervised process so that HTTP APIs, WebSocket delivery, schedulers, and Redis subscribers remain available after restart events.

#### Scenario: Backend returns after VM reboot
- **WHEN** the Oracle VM is rebooted
- **THEN** the hosted beta environment SHALL restore the backend process automatically without requiring an operator to start it from an interactive shell

### Requirement: Hosted beta environment SHALL provide a documented bootstrap and verification flow
The system SHALL document how operators provision a fresh hosted beta environment, run migrations, choose the correct seed mode, and verify that the public application is functioning.

#### Scenario: Fresh hosted beta environment is bootstrapped
- **WHEN** an operator follows the documented hosted beta bootstrap procedure
- **THEN** the operator SHALL be able to configure the environment, apply migrations, load the selected seed dataset, and reach the public application without undocumented manual steps
