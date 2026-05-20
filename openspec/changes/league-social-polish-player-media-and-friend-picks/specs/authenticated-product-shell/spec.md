## MODIFIED Requirements

### Requirement: Authenticated users SHALL have persistent access to the product's main pillars
The frontend SHALL provide a persistent authenticated shell that exposes navigation to Partidas, Ligas, Especiais, and an account-level destination or equivalent stable user entry point. Internal authenticated pages SHALL use compact navigation such as a hamburger/drawer instead of repeating large destination cards.

#### Scenario: User can navigate core destinations without guessing routes
- **WHEN** an authenticated user is on a primary product surface
- **THEN** the interface SHALL expose direct navigation to the core product destinations without requiring the user to manually edit the URL

#### Scenario: Shell remains consistent across primary authenticated routes
- **WHEN** an authenticated user moves between matches, leagues, and outrights surfaces
- **THEN** the navigation framing SHALL remain recognizable and consistent enough that the app feels like one product shell rather than isolated pages

#### Scenario: Internal page uses compact navigation
- **WHEN** an authenticated user opens Partidas, Ligas, Especiais, Conta, or a league detail page
- **THEN** the page SHALL expose the main destinations through compact shell navigation instead of rendering large redundant destination cards

#### Scenario: Home keeps orientation cards
- **WHEN** an authenticated user opens Inicio
- **THEN** the page MAY use larger destination cards because it is the product hub rather than a focused internal surface

### Requirement: Shell navigation SHALL not expose phantom destinations
Any destination presented by the authenticated shell or protected as a first-class route SHALL resolve to a real, navigable surface or be removed from the surfaced product contract.

#### Scenario: Account link resolves coherently
- **WHEN** the authenticated shell presents an account or profile destination
- **THEN** that destination SHALL open a real user-facing surface rather than a missing route

#### Scenario: Protected routes match product reality
- **WHEN** the application protects or highlights a top-level authenticated route
- **THEN** the user-facing shell and route structure SHALL stay consistent with that promise

#### Scenario: Drawer route is active
- **WHEN** a user opens compact navigation on an authenticated route
- **THEN** the drawer SHALL indicate the active destination and close predictably after navigation

#### Scenario: Drawer is accessible
- **WHEN** a user operates the navigation by keyboard or on a mobile viewport
- **THEN** focus, dismissal, and route activation SHALL remain usable without relying on pointer-only behavior
