## MODIFIED Requirements

### Requirement: Post-login entry SHALL orient the user around active tasks
After authentication, the user SHALL land in an experience that surfaces the next useful actions in the product, including access to matches, league competition, and outright predictions. The entry experience SHALL prioritize the next relevant matchday over redundant shortcut sections.

#### Scenario: Newly authenticated user gets an actionable entry point
- **WHEN** a user finishes login or registration
- **THEN** the frontend SHALL direct that user to an entry experience that highlights current product actions instead of leaving the user with only a raw route redirect and no product guidance

#### Scenario: Authenticated home surfaces more than matches
- **WHEN** an authenticated user opens the main entry surface
- **THEN** that surface SHALL include clear access to league and outright journeys in addition to the match flow

#### Scenario: Home shows every match from the next relevant date
- **WHEN** the authenticated home has upcoming, live, or recently relevant match data
- **THEN** the Proxima acao area SHALL show all matches from the next relevant date with direct paths to predict, review, or inspect status

#### Scenario: Home does not duplicate shortcut cards
- **WHEN** the authenticated home already has primary destination cards
- **THEN** it SHALL NOT also render a redundant Atalhos section pointing to the same destinations

### Requirement: Main product surfaces SHALL form a connected matchday journey
The authenticated home, matches, match detail, leagues, and outrights surfaces SHALL guide the user through a coherent journey instead of acting as disconnected endpoints. Internal surfaces SHALL prioritize their task content over repeated top-level navigation cards.

#### Scenario: Home or entry surface routes into multiple product loops
- **WHEN** an authenticated user enters the product
- **THEN** the entry surface SHALL provide clear pathways into matches, leagues, and outright predictions

#### Scenario: Matches surface acts as a hub, not a dead end
- **WHEN** an authenticated user browses the matches list
- **THEN** the interface SHALL provide access to related product loops through the shell/navigation system without forcing the user to backtrack to the public landing page

#### Scenario: Matches uses compact view switching
- **WHEN** a user opens the matches workbench
- **THEN** Agenda, Grupos, and Resultados SHALL be presented as a compact one-line control rather than oversized tab cards

#### Scenario: Results remain agenda-first
- **WHEN** a user opens the Resultados view
- **THEN** the interface SHALL preserve agenda-first official score browsing

### Requirement: League and outright surfaces SHALL feel first-class inside the core journey
The frontend SHALL present league competition and outright prediction as discoverable, recurring parts of the main product loop rather than hidden specialist routes, while keeping internal page hierarchy focused.

#### Scenario: League competition is discoverable from primary routes
- **WHEN** an authenticated user navigates the main product shell
- **THEN** the user SHALL be able to reach league competition without needing a deep-link or manual route knowledge

#### Scenario: League detail prioritizes competition flow
- **WHEN** a user opens a league detail page
- **THEN** the page SHALL present Pontuacao first, Classificacao second, and Mural third

#### Scenario: League detail avoids redundant destination cards
- **WHEN** a user is already inside a league page
- **THEN** Partidas, Especiais, and Conta SHALL be reachable through compact navigation instead of repeated large cards

#### Scenario: Outrights are reachable before they lock
- **WHEN** outright markets are still available
- **THEN** the user SHALL be able to discover and open those markets from the main product journey before relying on a manually known URL

#### Scenario: Outrights page focuses on markets
- **WHEN** a user opens the outrights page
- **THEN** the page SHALL prioritize markets, search, selections, media, and friend-pick comparison instead of repeating top-level navigation cards
