# authenticated-product-shell Specification

## Purpose
TBD - created by archiving change sports-companion-product-shell. Update Purpose after archive.
## Requirements
### Requirement: Authenticated users SHALL have persistent access to the product's main pillars
The frontend SHALL provide a persistent authenticated shell that exposes navigation to Partidas, Ligas, Especiais, and an account-level destination or equivalent stable user entry point.

#### Scenario: User can navigate core destinations without guessing routes
- **WHEN** an authenticated user is on a primary product surface
- **THEN** the interface SHALL expose direct navigation to the core product destinations without requiring the user to manually edit the URL

#### Scenario: Shell remains consistent across primary authenticated routes
- **WHEN** an authenticated user moves between matches, leagues, and outrights surfaces
- **THEN** the navigation framing SHALL remain recognizable and consistent enough that the app feels like one product shell rather than isolated pages

### Requirement: Post-login entry SHALL orient the user around active tasks
After authentication, the user SHALL land in an experience that surfaces the next useful actions in the product, including access to matches, league competition, and outright predictions.

#### Scenario: Newly authenticated user gets an actionable entry point
- **WHEN** a user finishes login or registration
- **THEN** the frontend SHALL direct that user to an entry experience that highlights current product actions instead of leaving the user with only a raw route redirect and no product guidance

#### Scenario: Authenticated home surfaces more than matches
- **WHEN** an authenticated user opens the main entry surface
- **THEN** that surface SHALL include clear access to league and outright journeys in addition to the match flow

### Requirement: Shell navigation SHALL not expose phantom destinations
Any destination presented by the authenticated shell or protected as a first-class route SHALL resolve to a real, navigable surface or be removed from the surfaced product contract.

#### Scenario: Account link resolves coherently
- **WHEN** the authenticated shell presents an account or profile destination
- **THEN** that destination SHALL open a real user-facing surface rather than a missing route

#### Scenario: Protected routes match product reality
- **WHEN** the application protects or highlights a top-level authenticated route
- **THEN** the user-facing shell and route structure SHALL stay consistent with that promise

