## ADDED Requirements

### Requirement: Demo seed SHALL support hosted beta bootstrap
The demo seed SHALL remain valid for initializing a hosted beta environment that uses managed PostgreSQL and managed Redis services, not only a local showcase environment.

#### Scenario: Hosted operator loads the demo dataset
- **WHEN** an operator runs the demo seed against a freshly migrated hosted beta database
- **THEN** the system SHALL populate the deterministic demo dataset without requiring provider-backed ingestion or local Docker-managed infrastructure
