## MODIFIED Requirements

### Requirement: Documentation SHALL explain when to use each seed mode
The repository documentation SHALL describe the purpose, prerequisites, and expected output of each seed mode across local development, local-tunnel private beta, and provider-backed ingestion paths.

#### Scenario: Local operator chooses the correct seed command
- **WHEN** a developer reads the local setup or runbook documentation
- **THEN** the documentation SHALL explain which command to use for smoke validation, which to use for full local demo, and which depends on provider data

#### Scenario: Private-beta operator chooses the correct seed command
- **WHEN** an operator prepares the local-tunnel private beta environment
- **THEN** the documentation SHALL explain that the demo seed is the canonical first-load dataset, smoke seed remains verification-oriented, and provider seed remains optional and credential-dependent
