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
The repository documentation SHALL describe the purpose, prerequisites, and expected output of each seed mode.

#### Scenario: Local operator chooses the correct seed command
- **WHEN** a developer reads the local setup or runbook documentation
- **THEN** the documentation SHALL explain which command to use for smoke validation, which to use for full local demo, and which depends on provider data

### Requirement: System SHALL keep secrets environment-scoped
The system SHALL rely on environment configuration for provider credentials and SHALL NOT require hardcoded secrets in source-controlled demo seed assets.

#### Scenario: Provider credentials are not committed into demo artifacts
- **WHEN** the demo and seed-mode implementation is reviewed
- **THEN** API keys and similar secrets SHALL be referenced through environment configuration rather than embedded in repo files

