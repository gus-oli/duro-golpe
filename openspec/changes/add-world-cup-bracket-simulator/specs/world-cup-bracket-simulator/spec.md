## ADDED Requirements

### Requirement: Simulator SHALL keep tournament simulation separate from scoring predictions
The frontend SHALL provide a World Cup simulator surface that lets users build a non-scoring tournament scenario without creating or modifying match predictions, outright predictions, league ranking entries, lock states, or official results.

#### Scenario: User opens simulator without affecting the bolao
- **WHEN** an authenticated user opens `/simulador`
- **THEN** the page SHALL load the simulator experience without submitting any match prediction, outright prediction, or scoring mutation

#### Scenario: User changes simulated winners without changing official picks
- **WHEN** the user changes group rankings or knockout winners in the simulator
- **THEN** existing bolao predictions and league rankings SHALL remain unchanged

### Requirement: Simulator SHALL allow manual group ranking and third-place selection
The simulator SHALL let the user order the teams in each of the 12 World Cup 2026 groups and select exactly eight third-placed teams to advance to the knockout stage.

#### Scenario: User ranks all groups
- **WHEN** the user arranges teams from first to fourth in each group from A through L
- **THEN** the simulator SHALL identify each group winner, runner-up, third-place team, and eliminated fourth-place team

#### Scenario: User selects valid third-place qualifiers
- **WHEN** the user selects exactly eight third-place teams
- **THEN** the simulator SHALL allow the Round of 32 bracket to be generated

#### Scenario: User selects an invalid third-place set
- **WHEN** the user has selected fewer or more than eight third-place teams
- **THEN** the simulator SHALL prevent Round of 32 generation and indicate that exactly eight thirds must be selected

### Requirement: Simulator SHALL build the official FIFA Round of 32 bracket
The simulator SHALL populate Round of 32 matches 73 through 88 using the official FIFA World Cup 2026 slot structure and the Annex C mapping for the selected third-place groups.

#### Scenario: User generates bracket from valid qualifiers
- **WHEN** the user has ranked all groups and selected exactly eight third-place groups
- **THEN** the simulator SHALL populate the Round of 32 with group winners, runners-up, and third-place teams in their official FIFA slots

#### Scenario: Third-place qualifiers are allocated by Annex C
- **WHEN** the selected third-place groups correspond to one of the valid Annex C combinations
- **THEN** the simulator SHALL assign each third-place team to the matching official Round of 32 slot for that combination

#### Scenario: Fixed runner-up match remains stable
- **WHEN** the Round of 32 is generated
- **THEN** Match 73 SHALL be Group A runner-up versus Group B runner-up regardless of which third-place teams qualify

### Requirement: Simulator SHALL support winner selection through the complete knockout path
The simulator SHALL let the user choose winners in each knockout match and propagate winners through the official match tree through the final, while also deriving the third-place match participants from the semifinal losers.

#### Scenario: User chooses a Round of 32 winner
- **WHEN** the user selects a winner for a Round of 32 match
- **THEN** that winner SHALL appear in the appropriate Round of 16 match slot

#### Scenario: User changes an earlier winner
- **WHEN** the user changes the winner of a match that already feeds later rounds
- **THEN** the simulator SHALL clear or reconcile downstream selections that are no longer valid

#### Scenario: User completes semifinals
- **WHEN** both semifinal winners are selected
- **THEN** the final SHALL contain the semifinal winners and the third-place match SHALL contain the semifinal losers

#### Scenario: User selects final winner
- **WHEN** the user chooses the winner of Match 104
- **THEN** the simulator SHALL display that team as the simulated champion

### Requirement: Simulator SHALL present an interactive wallchart bracket
The simulator SHALL present the knockout stage as an interactive bracket with official match numbers, team badges or fallbacks, slot labels, winner and eliminated states, and a central champion treatment.

#### Scenario: Desktop user sees complete wallchart
- **WHEN** the simulator is viewed on a desktop-width viewport
- **THEN** the page SHALL render the bracket as a full wallchart-style layout with left and right branches leading toward the final

#### Scenario: User identifies official slots
- **WHEN** a team appears in a Round of 32 match
- **THEN** the bracket SHALL show enough slot context, such as `1A`, `2B`, or `3E`, for the user to understand why that team is placed there

#### Scenario: Mobile user can complete bracket
- **WHEN** the simulator is viewed on a mobile-width viewport
- **THEN** the user SHALL be able to complete every knockout round without relying on unreadably small full-bracket content

### Requirement: Simulator SHALL preserve and reset local draft state
The simulator SHALL preserve the user's in-progress simulation locally on the device and provide a reset action that clears the local simulation state.

#### Scenario: User returns to simulator
- **WHEN** the user has an in-progress simulation and reloads `/simulador` on the same device
- **THEN** the simulator SHALL restore the saved local draft when the saved state version is compatible

#### Scenario: User resets simulation
- **WHEN** the user activates the reset action
- **THEN** the simulator SHALL clear group rankings, third-place selections, knockout winners, champion state, and the local saved draft
