# seed-mode-separation Specification

## Purpose
TBD - created by archiving change complete-demo-seed. Update Purpose after archive.
## Requirements
### Requirement: System SHALL maintain distinct seed modes with clear purposes
The system SHALL preserve separate commands and documentation for provider-backed seed, smoke seed, and demo seed modes.

#### Scenario: Smoke seed remains minimal
- **WHEN** an operator runs the smoke seed
- **THEN** the system SHALL provision the intentionally minimal release-gate dataset rather than the full demo dataset

#### Scenario: Demo seed remains feature-rich
- **WHEN** an operator runs the demo seed
- **THEN** the system SHALL provision the full local showcase dataset rather than the minimal smoke dataset

#### Scenario: Provider seed remains ingestion-oriented
- **WHEN** an operator runs the provider-backed seed
- **THEN** the system SHALL retain its provider-ingestion purpose instead of silently behaving like smoke or demo mode

### Requirement: Documentation SHALL explain when to use each seed mode
The repository documentation SHALL describe the purpose, prerequisites, and expected output of each seed mode across local development, local-tunnel private beta, and provider-backed ingestion paths.

#### Scenario: Local operator chooses the correct seed command
- **WHEN** a developer reads the local setup or runbook documentation
- **THEN** the documentation SHALL explain which command to use for smoke validation, which to use for full local demo, and which depends on provider data

#### Scenario: Private-beta operator chooses the correct seed command
- **WHEN** an operator prepares the local-tunnel private beta environment
- **THEN** the documentation SHALL explain that the demo seed is the canonical first-load dataset, smoke seed remains verification-oriented, and provider seed remains optional and credential-dependent

### Requirement: System SHALL keep secrets environment-scoped
The system SHALL rely on environment configuration for provider credentials and SHALL NOT require hardcoded secrets in source-controlled demo seed assets.

#### Scenario: Provider credentials are not committed into demo artifacts
- **WHEN** the demo and seed-mode implementation is reviewed
- **THEN** API keys and similar secrets SHALL be referenced through environment configuration rather than embedded in repo files

### Requirement: Documentation SHALL distinguish hosted and local seed workflows
The repository documentation SHALL explain which seed mode is appropriate for hosted beta bootstrap, release smoke verification, and provider-backed ingestion.

#### Scenario: Hosted operator chooses the correct seed mode
- **WHEN** an operator follows the hosted deployment runbook
- **THEN** the documentation SHALL identify the demo seed as the default hosted beta bootstrap dataset, the smoke seed as a verification-focused dataset, and the provider-backed seed as an optional credential-dependent ingestion path

