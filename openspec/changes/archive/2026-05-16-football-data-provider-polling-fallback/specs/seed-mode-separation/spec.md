## MODIFIED Requirements

### Requirement: Documentation SHALL explain when to use each seed mode
The repository documentation SHALL describe the purpose, prerequisites, and expected output of each seed mode across local development, local-tunnel private beta, and provider-backed ingestion paths.

#### Scenario: Local operator chooses the correct seed command
- **WHEN** a developer reads the local setup or runbook documentation
- **THEN** the documentation SHALL explain which command to use for smoke validation, which to use for full local demo, and which provider-backed mode depends on `football-data.org` credentials

#### Scenario: Private-beta operator understands the real-fixture operating model
- **WHEN** an operator prepares the local-tunnel private beta environment with real tournament fixtures
- **THEN** the documentation SHALL explain that the `football-data.org` path provides real fixtures on the free tier, match updates may be delayed, and manual override remains the fallback when automated updates lag
