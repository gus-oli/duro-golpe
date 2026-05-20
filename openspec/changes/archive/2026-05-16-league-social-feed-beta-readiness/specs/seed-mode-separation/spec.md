## MODIFIED Requirements

### Requirement: Documentation SHALL explain when to use each seed mode
The repository documentation SHALL describe the purpose, prerequisites, expected output, and cutover guidance for each seed mode, including how to reset a shared but intentionally resettable beta database before moving from demo-oriented data to provider-backed tournament ingestion.

#### Scenario: Local operator chooses the correct seed command
- **WHEN** a developer reads the local setup or runbook documentation
- **THEN** the documentation SHALL explain which command to use for smoke validation, which to use for full local demo, and which depends on provider data

#### Scenario: Operator understands provider cutover on a resettable beta database
- **WHEN** an operator wants to replace demo-oriented beta data with provider-backed tournament data on the existing hosted database
- **THEN** the documentation SHALL explain the required reset, migration, provider-seed order, and the expected loss of seeded fake social state
