## ADDED Requirements

### Requirement: The application SHALL provide an installability baseline
The frontend SHALL provide manifest metadata, icons, and standalone-display metadata sufficient for a mobile-friendly installable shell.

#### Scenario: Browser evaluates installability metadata
- **WHEN** a supported browser requests the application's manifest and related metadata
- **THEN** the application SHALL provide the installability assets required by the documented beta baseline

### Requirement: The beta PWA baseline SHALL not promise offline capability
The application SHALL present its installability baseline without implying offline-first behavior or resilient offline interaction for authenticated gameplay.

#### Scenario: User installs the app shell
- **WHEN** a user installs the application from a supported browser
- **THEN** the product SHALL behave as an installed web shell while continuing to require network access for live data, auth, and social interactions
