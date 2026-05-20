## ADDED Requirements

### Requirement: Matches workbench SHALL provide density controls for long fixture lists
The matches workbench SHALL reduce long-list fatigue during the group stage by allowing users to collapse agenda or group sections.

#### Scenario: Agenda contains many dates
- **WHEN** a user views the agenda tab with many date sections
- **THEN** the interface SHALL allow date sections to be collapsed or expanded

#### Scenario: Group view contains many groups
- **WHEN** a user views the group tab with many groups
- **THEN** the interface SHALL allow group sections to be collapsed or expanded

#### Scenario: User changes section visibility
- **WHEN** a user collapses or expands a section
- **THEN** the current workbench session SHALL preserve that state while the user remains on the matches surface

#### Scenario: User opens results
- **WHEN** a user views the results tab
- **THEN** the surface SHALL remain agenda-first and optimized for score/status review rather than prediction editing
