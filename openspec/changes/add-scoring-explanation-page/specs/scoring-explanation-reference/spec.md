## ADDED Requirements

### Requirement: Authenticated users SHALL have a canonical scoring reference page
The product SHALL provide an authenticated page that explains the active scoring model in user-facing language, covering match tiers, outright markets, theoretical maximum score, and league tiebreakers.

#### Scenario: User opens the scoring reference from the authenticated product
- **WHEN** an authenticated user navigates to the scoring reference page
- **THEN** the page MUST present the current match scoring tiers, the current outright market point values, the 3200-point theoretical ceiling, and the ranking tiebreaker order without requiring the user to infer rules from other surfaces

### Requirement: Match scoring tiers SHALL be explained with concrete outcomes
The scoring reference SHALL explain how points are awarded for match predictions using the live tier model and examples that distinguish similar outcomes.

#### Scenario: User compares nearby scoring tiers
- **WHEN** an authenticated user reads the match scoring section
- **THEN** the page MUST explain the five active tiers of 25, 15, 10, 5, and 0 points and include at least one concrete example that helps distinguish exact score, winner plus goal difference, correct outcome, and one-team-goals cases

### Requirement: Outright scoring SHALL reflect the approved launch catalog
The scoring reference SHALL describe the current launch outright markets and their point values using the approved seven-market catalog.

#### Scenario: User checks how specials affect the standings
- **WHEN** an authenticated user reads the outright scoring section
- **THEN** the page MUST list the seven active outright markets with their current point values and explain that they contribute 600 points toward the 3200-point maximum

### Requirement: Tiebreakers SHALL be explained in ranking order
The scoring reference SHALL explain how league ties are broken in the same order used by the product ranking.

#### Scenario: User wants to understand why one player is above another
- **WHEN** an authenticated user reads the ranking explanation section
- **THEN** the page MUST explain that league ranking is ordered by total points first, then exact-score count, then winner-plus-goal-difference count
