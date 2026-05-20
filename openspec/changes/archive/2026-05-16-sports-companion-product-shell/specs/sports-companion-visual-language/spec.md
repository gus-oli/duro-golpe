## ADDED Requirements

### Requirement: Frontend SHALL present a lightweight sports companion visual identity
The frontend SHALL use a lighter, scan-first visual identity across the main product surfaces instead of the current heavy broadcast-style atmosphere. The visual system SHALL prioritize information density, clarity, and frequent-return usability while preserving a recognizable football context.

#### Scenario: Core surfaces feel lighter and faster to scan
- **WHEN** a user navigates between the authenticated home, matches, match detail, leagues, and outrights surfaces
- **THEN** those routes SHALL share a neutral, compact, sports-utility presentation with controlled accent colors and reduced scenic visual weight

#### Scenario: Football identity survives the lighter direction
- **WHEN** a user views scores, fixtures, or league competition
- **THEN** the frontend SHALL communicate football identity through score modules, status chips, teams, flags, group labels, and competition language rather than relying on large decorative backgrounds

### Requirement: Frontend SHALL favor compact scanability over oversized hero composition
The frontend SHALL present key data and actions higher in the viewport and SHALL avoid hero or atmospheric treatments that push routine matchday information too far below the fold.

#### Scenario: Important information appears earlier
- **WHEN** a user loads a primary route on desktop or mobile
- **THEN** the most relevant information and action for that route SHALL appear without requiring the user to scroll past oversized introductory framing

#### Scenario: Density remains usable rather than cluttered
- **WHEN** the frontend increases information density on lists or dashboards
- **THEN** spacing, grouping, and typography SHALL still preserve readable scanning and clear action targets

### Requirement: Frontend SHALL use status-driven emphasis instead of global visual noise
The frontend SHALL reserve strong accent treatment for meaningful states such as live, locked, success, ranking movement, and primary actions, rather than applying equally strong emphasis to every surface.

#### Scenario: Live and locked states stand out quickly
- **WHEN** a match is live or a prediction is locked
- **THEN** the page SHALL make that state immediately recognizable through a consistent status treatment

#### Scenario: Repeated navigation remains visually comfortable
- **WHEN** a user browses several primary screens during one session
- **THEN** the frontend SHALL avoid constant heavy gradients, oversized shadows, or decorative effects that reduce long-session comfort
