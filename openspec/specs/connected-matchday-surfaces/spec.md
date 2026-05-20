# connected-matchday-surfaces Specification

## Purpose
TBD - created by archiving change sports-companion-product-shell. Update Purpose after archive.
## Requirements
### Requirement: Main product surfaces SHALL form a connected matchday journey
The authenticated home, matches, match detail, leagues, and outrights surfaces SHALL guide the user through a coherent journey instead of acting as disconnected endpoints.

#### Scenario: Home or entry surface routes into multiple product loops
- **WHEN** an authenticated user enters the product
- **THEN** the entry surface SHALL provide clear pathways into matches, leagues, and outright predictions

#### Scenario: Matches surface acts as a hub, not a dead end
- **WHEN** an authenticated user browses the matches list
- **THEN** the interface SHALL provide access to related product loops such as competition or specials without forcing the user to backtrack to the public landing page

### Requirement: Match detail SHALL expose next-step navigation after prediction work
After a user reaches or completes the prediction interaction on a match detail surface, the frontend SHALL expose relevant next actions such as returning to competition, opening related social context, or continuing to the next prediction opportunity.

#### Scenario: Prediction submission leads somewhere useful
- **WHEN** a user submits or updates a prediction on a match detail page
- **THEN** the page SHALL expose at least one clear next-step path beyond staying on the same isolated surface

#### Scenario: Match context links into league or social follow-up
- **WHEN** a user finishes reviewing match context on a primary match surface
- **THEN** the interface SHALL make related league competition or mural context discoverable from that flow

### Requirement: League and outright surfaces SHALL feel first-class inside the core journey
The frontend SHALL present league competition and outright prediction as discoverable, recurring parts of the main product loop rather than hidden specialist routes.

#### Scenario: League competition is discoverable from primary routes
- **WHEN** an authenticated user navigates the main product shell
- **THEN** the user SHALL be able to reach league competition without needing a deep-link or manual route knowledge

#### Scenario: Outrights are reachable before they lock
- **WHEN** outright markets are still available
- **THEN** the user SHALL be able to discover and open those markets from the main product journey before relying on a manually known URL

