## MODIFIED Requirements

### Requirement: Authenticated users SHALL have persistent access to the product's main pillars
The frontend SHALL provide a persistent authenticated shell that exposes navigation to Inicio, Partidas, Ligas, Especiais, Pontuacao, and an account-level destination or equivalent stable user entry point.

#### Scenario: User can navigate core destinations without guessing routes
- **WHEN** an authenticated user is on a primary product surface
- **THEN** the interface SHALL expose direct navigation to the core product destinations, including Pontuacao, without requiring the user to manually edit the URL

#### Scenario: Shell remains consistent across primary authenticated routes
- **WHEN** an authenticated user moves between home, matches, leagues, outrights, pontuacao, and account surfaces
- **THEN** the navigation framing SHALL remain recognizable and consistent enough that the app feels like one product shell rather than isolated pages
