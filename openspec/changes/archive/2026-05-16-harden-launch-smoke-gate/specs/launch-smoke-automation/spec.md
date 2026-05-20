## ADDED Requirements

### Requirement: Launch smoke command SHALL self-provision the seeded match context
The system SHALL provide a launch smoke command that resolves and passes the deterministic smoke match identifier to the browser suite automatically after running the smoke seed.

#### Scenario: Seeded match id is handed off automatically
- **WHEN** an operator runs the launch smoke command in a supported local environment
- **THEN** the command SHALL run the deterministic smoke seed and pass the seeded match UUID to Playwright without requiring a manual `E2E_MATCH_ID` export step

#### Scenario: Smoke fixture remains deterministic
- **WHEN** the launch smoke command provisions its seeded match context
- **THEN** it SHALL continue to target the dedicated smoke fixture rather than switching to demo or provider-backed data

### Requirement: Launch smoke execution SHALL keep secrets environment-scoped
The system SHALL continue to source launch smoke secrets from environment configuration rather than hardcoded repo values.

#### Scenario: Webhook secret remains external configuration
- **WHEN** the live-score smoke scenario executes
- **THEN** the launch smoke flow SHALL read the webhook secret from environment configuration instead of embedding it in test source or scripts

#### Scenario: Missing secret failure remains explicit
- **WHEN** a required smoke secret is missing from the environment
- **THEN** the smoke run SHALL fail with a clear message identifying the missing prerequisite

### Requirement: Launch smoke workflow SHALL document operator prerequisites clearly
The repository SHALL document which parts of the smoke run are automated by the command and which supporting services still need to be available externally.

#### Scenario: Operator understands what the command handles
- **WHEN** a developer reads the local launch smoke instructions
- **THEN** the documentation SHALL explain that the command resolves the smoke match context automatically

#### Scenario: Operator understands what must already be running
- **WHEN** a developer reads the local launch smoke instructions
- **THEN** the documentation SHALL state which backend services or environment variables still need to exist before running the smoke gate
