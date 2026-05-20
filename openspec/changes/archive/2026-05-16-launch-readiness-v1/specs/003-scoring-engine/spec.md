## ADDED Requirements

### Requirement: Resolved outright points update totals and rankings
The system MUST calculate resolved outright points, persist the resulting outright contribution, and reflect the updated totals in user score responses, league rankings, and score-related real-time updates.

#### Scenario: Outright resolution updates score totals
- **WHEN** an outright market is officially resolved and user predictions are scored
- **THEN** the affected users' outright points, total points, and ranking-visible totals MUST be updated consistently

## MODIFIED Requirements

### Requirement: The theoretical maximum score is 3200 points
The system MUST treat the theoretical maximum score as 3200 points, composed of 2600 possible points from 104 match predictions and 600 possible points from the seven launch outright markets.

#### Scenario: Progress indicators use the 3200-point ceiling
- **WHEN** the system returns score summaries or renders progress against the maximum possible score
- **THEN** the ceiling used for those calculations MUST be 3200 points

### Requirement: Running totals include both match and outright scoring
The system MUST maintain `matchPoints`, `outrightPoints`, and `totalPoints` as a consistent aggregate where `totalPoints` equals the sum of resolved match and outright points.

#### Scenario: Total points equal match plus outright points
- **WHEN** a user has both match scores and resolved outright scores
- **THEN** the system MUST return a `totalPoints` value equal to `matchPoints + outrightPoints`
