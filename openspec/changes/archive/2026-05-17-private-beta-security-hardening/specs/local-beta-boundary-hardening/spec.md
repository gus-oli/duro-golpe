## ADDED Requirements

### Requirement: Operator-hosted beta services SHALL align with loopback-oriented local-tunnel boundaries
The system SHALL default its operator-hosted app services to the intended local-tunnel exposure model instead of unnecessarily broad listener exposure.

#### Scenario: Backend starts in local-tunnel beta mode
- **WHEN** the backend is started for the canonical local-tunnel beta topology
- **THEN** its listener exposure SHALL align with the documented loopback-oriented boundary unless an explicit operator override is required

### Requirement: The operator runbook SHALL include a pre-invite hardening checklist
The system documentation SHALL provide a concise final checklist for secrets, listener exposure, auth flows, and realtime boundaries before the operator invites friends.

#### Scenario: Operator prepares to invite players
- **WHEN** the operator reaches the final beta readiness pass
- **THEN** the runbook SHALL enumerate the security checks needed to confirm the app is not relying on accidental exposure or insecure session handling
