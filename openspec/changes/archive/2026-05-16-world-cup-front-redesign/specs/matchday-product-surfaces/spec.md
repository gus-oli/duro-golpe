## ADDED Requirements

### Requirement: Landing page SHALL communicate the product as a World Cup prediction experience
The landing page SHALL introduce the product with a strong hero, clear calls to action, and immediate cues about live matches, league competition, or outright predictions.

#### Scenario: First-time visitor understands the product quickly
- **WHEN** an unauthenticated user opens the landing page
- **THEN** the page SHALL explain the product purpose and present a clear primary action to start participating

#### Scenario: Landing page reflects the tournament atmosphere
- **WHEN** a user views the landing page
- **THEN** the page SHALL feel visually distinct from a default application shell and align with the tournament-themed visual system

### Requirement: Matches surfaces SHALL prioritize scanability and matchday decision-making
The matches list and match detail pages SHALL present teams, kickoff context, live state, prediction inputs, and lock state in layouts optimized for fast scanning on mobile and desktop.

#### Scenario: Match list supports quick browsing
- **WHEN** a user opens the matches page
- **THEN** each match entry SHALL present the most important information in a scannable card or row structure with clear separation between fixtures

#### Scenario: Match detail centers the prediction journey
- **WHEN** a user opens a match detail page
- **THEN** the score context, teams, prediction interaction, and relevant status indicators SHALL appear as the primary visual focus

#### Scenario: Locked or live states are visually explicit
- **WHEN** a match is live or locked for editing
- **THEN** the page SHALL display a prominent state treatment that reduces ambiguity about whether predictions can still be changed

### Requirement: League and outrights pages SHALL feel like first-class product surfaces
League ranking and outright prediction pages SHALL use the same premium layout quality as match pages, including strong hierarchy, themed surfaces, and clear action states.

#### Scenario: League ranking feels competitive and readable
- **WHEN** a user opens a league page
- **THEN** the ranking presentation SHALL emphasize placement, point totals, and recent movement in a layout that feels competitive rather than tabular-only

#### Scenario: Outright prediction page clarifies market actions
- **WHEN** a user opens the outrights page
- **THEN** each market SHALL clearly communicate its status, available choices, and submit or lock state without relying on low-contrast generic form layout

### Requirement: Core launch surfaces SHALL remain responsive and functionally stable after redesign
The redesign SHALL preserve existing launch-critical functionality while adapting layouts for mobile and desktop breakpoints.

#### Scenario: Mobile layout remains usable
- **WHEN** a user accesses a redesigned launch surface on a narrow viewport
- **THEN** content SHALL remain readable, interactive controls SHALL remain accessible, and no core action SHALL depend on desktop-only layout

#### Scenario: Existing flows remain available after redesign
- **WHEN** a user performs register, browse, predict, join league, or outright actions on the redesigned frontend
- **THEN** the underlying functional flow SHALL remain available without requiring backend contract changes
