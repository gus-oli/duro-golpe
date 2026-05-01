## ADDED Requirements

### Requirement: Launch release candidate passes a mandatory release gate
The system MUST not be considered launch-ready unless the backend and frontend typecheck/build checks pass and the defined launch smoke scenarios are green.

#### Scenario: Failing build blocks launch
- **WHEN** any required typecheck, build, or launch smoke check fails
- **THEN** the release candidate MUST be rejected as not ready for launch

### Requirement: Launch-critical work follows TDD-first verification
The system MUST treat TDD as a central delivery rule for this change: critical launch behaviors MUST have automated failing checks defined or refreshed before implementation work is considered complete.

#### Scenario: Critical flow is implemented under TDD
- **WHEN** a broken or missing launch-critical behavior is addressed in this change
- **THEN** the work MUST include an automated test or smoke check that fails before the implementation is accepted and passes afterward

### Requirement: Launch environment and bootstrap flow are deterministic
The system MUST document and validate all required runtime variables and MUST provide a deterministic bootstrap flow for infrastructure, database migrations, and seed data.

#### Scenario: Fresh environment bootstrap
- **WHEN** operators provision a fresh launch environment with the documented variables
- **THEN** they MUST be able to start dependencies, run migrations, seed required data, and start the application without undocumented manual steps

### Requirement: Launch smoke coverage validates the core journey
The system MUST define a smoke suite that verifies the launch-critical user journey: register or log in, browse matches, submit a prediction, join a league, view ranking, and access outrights.

#### Scenario: Launch smoke suite covers the core slice
- **WHEN** the launch smoke suite is executed against a release candidate
- **THEN** it MUST validate each core user journey step needed for day-one launch acceptance
