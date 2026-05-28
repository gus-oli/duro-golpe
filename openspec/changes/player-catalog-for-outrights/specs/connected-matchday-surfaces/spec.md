## MODIFIED Requirements

### Requirement: League and outright surfaces SHALL feel first-class inside the core journey
The frontend SHALL present league competition and outright prediction as discoverable, recurring parts of the main product loop rather than hidden specialist routes. Player-based outright markets SHALL feel complete enough for beta play by using a broad catalog-backed search experience instead of a small static list.

#### Scenario: League competition is discoverable from primary routes
- **WHEN** an authenticated user navigates the main product shell
- **THEN** the user SHALL be able to reach league competition without needing a deep-link or manual route knowledge

#### Scenario: Outrights are reachable before they lock
- **WHEN** outright markets are still available
- **THEN** the user SHALL be able to discover and open those markets from the main product journey before relying on a manually known URL

#### Scenario: User searches a broad player catalog in an individual market
- **WHEN** an authenticated user opens a player-based outright market and searches for a plausible player candidate
- **THEN** the interface SHALL search the catalog-backed candidate set for that market rather than only the default featured options

#### Scenario: User selected an inactive catalog player
- **WHEN** a user's prior selection becomes inactive after a catalog refresh
- **THEN** the outright surface SHALL keep that selected player visible with inactive state treatment instead of hiding or deleting the selection

#### Scenario: Player media is unavailable
- **WHEN** a catalog-backed player candidate has no provider photo
- **THEN** the outright surface SHALL still render the candidate with a stable fallback avatar and source/team context
