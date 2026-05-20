# manual-match-override Specification

## Purpose
TBD - created by archiving change football-data-provider-polling-fallback. Update Purpose after archive.
## Requirements
### Requirement: Operators SHALL have a manual contingency path for match updates
The system SHALL provide CLI tooling that lets an operator manually apply match status and score changes when provider polling is delayed, incomplete, or unavailable.

#### Scenario: Operator manually updates a live match snapshot
- **WHEN** the provider has not updated a relevant match quickly enough
- **THEN** the operator SHALL be able to apply a manual status/score update for that match without editing the database directly

#### Scenario: Operator manually confirms a final result
- **WHEN** the provider has not yet delivered a trustworthy finished score
- **THEN** the operator SHALL be able to confirm the final result for that match through a documented CLI workflow

### Requirement: Manual overrides SHALL reuse the same downstream product effects as automated updates
Manual contingency updates SHALL feed the same downstream match, realtime, and scoring effects that the automated provider sync uses for equivalent states.

#### Scenario: Manual final confirmation updates scoring and realtime
- **WHEN** an operator manually confirms a final score
- **THEN** the system SHALL update local match state, trigger result/scoring propagation, and publish the corresponding realtime events rather than creating a disconnected one-off path

#### Scenario: Manual updates remain compatible with future provider sync
- **WHEN** provider polling later observes the same terminal state that was already applied manually
- **THEN** the system SHALL treat the later provider snapshot safely rather than duplicating result confirmation side effects

