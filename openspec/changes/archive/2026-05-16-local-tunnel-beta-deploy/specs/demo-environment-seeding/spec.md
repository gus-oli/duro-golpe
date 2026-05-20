## MODIFIED Requirements

### Requirement: System SHALL provide a deterministic full-featured demo seed
The system SHALL provide a dedicated demo seed command that provisions a deterministic dataset representing the major user-facing features of the product without requiring external provider access, and that dataset SHALL be suitable for both local showcase use and the local-tunnel private beta bootstrap.

#### Scenario: Demo seed provisions a local showcase environment
- **WHEN** an operator runs the demo seed command in a configured local environment
- **THEN** the database SHALL be populated with a stable, repeatable dataset suitable for exploring the complete product

#### Scenario: Demo seed provisions a private-beta environment
- **WHEN** an operator runs the demo seed command after configuring the local-tunnel beta runtime
- **THEN** the database SHALL be populated with the same stable, repeatable dataset suitable for inviting beta users without manual content creation

#### Scenario: Demo seed does not require provider availability
- **WHEN** API-Football is unavailable or the operator does not use provider-backed enrichment
- **THEN** the demo seed SHALL still complete successfully with its curated local dataset
