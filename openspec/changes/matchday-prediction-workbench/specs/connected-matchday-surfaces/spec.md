## MODIFIED Requirements

### Requirement: Main product surfaces SHALL form a connected matchday journey
The authenticated home, matches, match detail, leagues, and outrights surfaces SHALL guide the user through a coherent journey instead of acting as disconnected endpoints. The matches surface SHALL now serve as a multi-view workbench for prediction work rather than only a click-through agenda.

#### Scenario: Home or entry surface routes into multiple product loops
- **WHEN** an authenticated user enters the product
- **THEN** the entry surface SHALL provide clear pathways into matches, leagues, and outright predictions

#### Scenario: Matches surface acts as a hub and workbench, not a dead end
- **WHEN** an authenticated user browses the matches list
- **THEN** the interface SHALL provide access to related product loops such as competition or specials while also supporting primary prediction work from the matches surface itself

### Requirement: Match detail SHALL expose next-step navigation after prediction work
After a user reaches or completes prediction work, the match detail surface SHALL behave as a contextual companion page that exposes official context and relevant next actions instead of acting as the only practical place to submit predictions.

#### Scenario: Prediction submission leads somewhere useful
- **WHEN** a user submits or updates a prediction on a match detail page
- **THEN** the page SHALL expose at least one clear next-step path beyond staying on the same isolated surface

#### Scenario: Match context links into league or social follow-up
- **WHEN** a user finishes reviewing match context on a primary match surface
- **THEN** the interface SHALL make related league competition or mural context discoverable from that flow

#### Scenario: Match detail complements workbench with official context
- **WHEN** a user opens a match detail page from the workbench
- **THEN** the detail surface SHALL show contextual metadata such as venue or grouping information when those fields are available in the local match model
