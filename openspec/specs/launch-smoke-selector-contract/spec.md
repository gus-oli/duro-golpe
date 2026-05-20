# launch-smoke-selector-contract Specification

## Purpose
TBD - created by archiving change harden-launch-smoke-gate. Update Purpose after archive.
## Requirements
### Requirement: Launch-critical frontend surfaces SHALL expose durable automation hooks
The frontend SHALL expose stable semantic selectors or explicit automation anchors on launch-critical surfaces used by the launch smoke gate.

#### Scenario: Match detail surface remains addressable after redesign
- **WHEN** the launch smoke suite opens the seeded match detail page
- **THEN** it SHALL be able to identify the fixture header, prediction controls, and lock state through durable selectors that do not depend on ambiguous text matches

#### Scenario: League and outrights surfaces remain addressable after redesign
- **WHEN** the launch smoke suite interacts with league invite information, ranking output, and outright market cards
- **THEN** those interactions SHALL rely on stable semantic selectors or explicit automation anchors instead of incidental DOM order or styling classes

### Requirement: Launch smoke assertions SHALL validate behavior rather than incidental presentation
The launch smoke suite SHALL assert critical user-visible outcomes without coupling success criteria to specific CSS classes, generic text collisions, or fragile markup patterns.

#### Scenario: Selected outright state is not inferred from styling classes alone
- **WHEN** the launch smoke suite verifies a saved outright selection
- **THEN** it SHALL use a stable behavioral or structural signal rather than checking a particular color utility class

#### Scenario: Ranking update is asserted through a durable outcome
- **WHEN** an outright resolution updates league standings
- **THEN** the launch smoke suite SHALL verify the expected ranking or points outcome without depending on brittle spacing or formatting details

### Requirement: Launch smoke selector hardening SHALL preserve accessibility pressure
The hardened smoke contract SHALL continue to prefer accessible roles and labels where they remain semantically meaningful.

#### Scenario: Accessible selectors remain first-class
- **WHEN** a launch-critical control already has a meaningful accessible role or label
- **THEN** the smoke suite SHALL prefer that selector over adding a redundant purely test-only hook

