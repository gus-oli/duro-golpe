## ADDED Requirements

### Requirement: Documentation SHALL distinguish hosted and local seed workflows
The repository documentation SHALL explain which seed mode is appropriate for hosted beta bootstrap, release smoke verification, and provider-backed ingestion.

#### Scenario: Hosted operator chooses the correct seed mode
- **WHEN** an operator follows the hosted deployment runbook
- **THEN** the documentation SHALL identify the demo seed as the default hosted beta bootstrap dataset, the smoke seed as a verification-focused dataset, and the provider-backed seed as an optional credential-dependent ingestion path
