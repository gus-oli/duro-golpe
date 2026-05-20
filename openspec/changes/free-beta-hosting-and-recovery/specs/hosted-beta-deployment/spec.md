## MODIFIED Requirements

### Requirement: Hosted beta environment SHALL support a single-domain runtime topology
The system SHALL support a hosted beta deployment where the public application origin serves the frontend while routing backend HTTP APIs and backend WebSocket traffic through the same domain, OR a zero-cost hosted beta deployment where the frontend and backend are intentionally split across different public origins with a documented compatibility model for auth, polling, and degraded realtime.

#### Scenario: Backend HTTP APIs are routed behind the public origin
- **WHEN** an operator configures the hosted beta reverse proxy
- **THEN** requests to `/api/v1/*` SHALL be forwarded to the backend service while application page routes remain served by the frontend service

#### Scenario: WebSocket upgrades remain available through the public origin
- **WHEN** an authenticated client connects to `/ws` on the public beta domain
- **THEN** the reverse proxy SHALL preserve the upgrade request and the backend SHALL remain reachable for realtime events without requiring a separate browser origin

#### Scenario: Zero-cost split hosting is configured
- **WHEN** an operator configures the frontend on Vercel and the backend on Render free with the documented environment contract
- **THEN** the hosted beta SHALL support the core product flows even if some realtime surfaces degrade to polling-based freshness

### Requirement: Hosted beta environment SHALL keep the backend continuously supervised
The hosted beta deployment SHALL run the backend as a continuously supervised process so that HTTP APIs, WebSocket delivery, schedulers, and Redis subscribers remain available after restart events, OR SHALL document a free-tier compatibility mode where an external health pinger is used to reduce backend sleep events and cold starts.

#### Scenario: Backend returns after VM reboot
- **WHEN** the Oracle VM is rebooted
- **THEN** the hosted beta environment SHALL restore the backend process automatically without requiring an operator to start it from an interactive shell

#### Scenario: Free-tier keepalive is configured
- **WHEN** an operator deploys the backend to Render free and configures the documented health pinger cadence
- **THEN** the hosted beta environment SHALL remain compatible with that keepalive strategy while preserving backend schedulers and subscribers whenever the process is awake

### Requirement: Hosted beta environment SHALL provide a documented bootstrap and verification flow
The system SHALL document how operators provision a fresh hosted beta environment, run migrations, choose the correct seed mode, and verify that the public application is functioning for each supported hosted topology.

#### Scenario: Fresh hosted beta environment is bootstrapped
- **WHEN** an operator follows the documented hosted beta bootstrap procedure
- **THEN** the operator SHALL be able to configure the environment, apply migrations, load the selected seed dataset, and reach the public application without undocumented manual steps

#### Scenario: Zero-cost hosted beta environment is bootstrapped
- **WHEN** an operator follows the documented Vercel + Render free bootstrap procedure
- **THEN** the operator SHALL be able to configure the split frontend/backend origins, health pinging, and hosted verification flow without relying on the local tunnel path
