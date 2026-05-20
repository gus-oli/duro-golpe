## ADDED Requirements

### Requirement: Matches surface SHALL provide agenda, group, and results workbench views
The authenticated matches surface SHALL expose three first-class views over the same tournament data: `Agenda`, `Grupos`, and `Resultados`.

#### Scenario: Agenda view supports round-by-round work
- **WHEN** an authenticated user opens the `Agenda` view on `/matches`
- **THEN** the interface SHALL group matches by date and present open matches as editable prediction rows inside the list

#### Scenario: Group view supports group-stage work
- **WHEN** an authenticated user opens the `Grupos` view on `/matches`
- **THEN** the interface SHALL group relevant fixtures by tournament group and expose the same inline prediction workflow without requiring navigation to match detail

#### Scenario: Results view is organized for reading, not primary editing
- **WHEN** an authenticated user opens the `Resultados` view on `/matches`
- **THEN** the interface SHALL organize fixtures by date and prioritize official score/status review over inline prediction editing

### Requirement: Matches workbench SHALL track unsaved draft predictions
The matches workbench SHALL preserve local edits across multiple fixtures until the user explicitly saves or discards them.

#### Scenario: Edited fixtures become pending changes
- **WHEN** a user changes one or more inline prediction fields
- **THEN** the interface SHALL mark those fixtures as having unsaved changes and expose a global count of pending predictions

#### Scenario: Save affordance stays available while edits are pending
- **WHEN** the user has at least one unsaved inline prediction
- **THEN** the interface SHALL expose a prominent action that allows saving all pending changes from the current workbench

### Requirement: Match detail SHALL complement the workbench with richer context
The match detail surface SHALL remain available as a contextual follow-up page rather than the only practical prediction entry point.

#### Scenario: Detail shows official venue and match metadata when available
- **WHEN** a user opens a match detail page for a fixture whose provider-backed metadata includes venue or grouping context
- **THEN** the detail surface SHALL display that venue/context alongside the score and status experience

#### Scenario: Workbench links still allow deep dive into a fixture
- **WHEN** a user wants more context than the inline workbench provides
- **THEN** the product SHALL still provide a path from the list/workbench into the match detail page for that fixture
