## ADDED Requirements

### Requirement: League ranking SHALL render as a compact subdivided surface
The league ranking SHALL use a single compact ranking surface with subdivided rows instead of rendering one large card per player.

#### Scenario: User opens league ranking on desktop
- **WHEN** a user views the league ranking on a desktop viewport
- **THEN** the ranking SHALL present members as rows inside one coherent surface with clear subdivisions for position, identity, score, and supporting stats

#### Scenario: User opens league ranking on mobile
- **WHEN** a user views the league ranking on a mobile viewport
- **THEN** the ranking SHALL preserve row readability and tappable member targets without reverting to oversized per-player cards

#### Scenario: User wants to inspect a player
- **WHEN** a ranking row is interactive
- **THEN** the row SHALL provide a clear path to that member's social/pick details without making the whole ranking visually noisy
