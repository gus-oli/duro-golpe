dg ADDED Requirements

### Requirement: Frontend SHALL present a cohesive World Cup visual identity
The frontend SHALL provide a consistent visual identity across primary user-facing routes using shared color tokens, typography, surface styling, and motion patterns that evoke a premium World Cup matchday atmosphere.

#### Scenario: Shared identity across core routes
- **WHEN** a user navigates between the landing page, matches, match detail, leagues, and outrights
- **THEN** the routes SHALL use the same visual language for typography, spacing, backgrounds, and surface treatment

#### Scenario: Visual direction feels thematic rather than generic
- **WHEN** a user loads a primary route
- **THEN** the route SHALL include thematic styling cues inspired by tournament presentation, such as layered backgrounds, score-oriented modules, or stadium/broadcast-style emphasis

### Requirement: Frontend SHALL expose reusable visual primitives for launch surfaces
The frontend SHALL implement reusable presentational primitives for hero sections, cards, buttons, chips, forms, and empty states so that repeated UI patterns do not require route-specific restyling.

#### Scenario: Shared components preserve visual consistency
- **WHEN** the same interaction pattern appears on more than one route
- **THEN** the frontend SHALL render it using a shared visual primitive or shared styling contract

#### Scenario: Status treatments remain recognizable
- **WHEN** live, locked, success, warning, or ranking states are displayed
- **THEN** the frontend SHALL render them with visually distinct but system-consistent treatments

### Requirement: Frontend SHALL maintain accessibility while increasing visual ambition
The frontend SHALL preserve readable contrast, touch-friendly interactions, and keyboard-discernible focus states throughout the redesigned experience.

#### Scenario: Touch targets remain usable on mobile
- **WHEN** a user interacts with buttons, links, or form controls on mobile
- **THEN** the redesigned UI SHALL preserve touch-friendly target sizes and spacing

#### Scenario: Focus states remain visible
- **WHEN** a keyboard user tabs through interactive elements
- **THEN** the frontend SHALL expose visible focus styling that remains legible against the new themed surfaces
