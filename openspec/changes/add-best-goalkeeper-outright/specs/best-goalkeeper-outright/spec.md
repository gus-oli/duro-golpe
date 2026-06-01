## ADDED Requirements

### Requirement: Best goalkeeper outright market SHALL be available
The system SHALL include `Melhor Goleiro` as an active player-based outright market for the official FIFA/adidas Golden Glove winner.

#### Scenario: User views outright markets
- **WHEN** an authenticated user opens the outrights surface
- **THEN** the system SHALL include a `Melhor Goleiro` market with code `BEST_GOALKEEPER`, option type `PLAYER`, one required selection, and a 70-point value

#### Scenario: Market order is displayed
- **WHEN** outright markets are rendered in catalog order
- **THEN** `Melhor Goleiro` SHALL appear with the individual award markets after `Bola de Ouro` and before `Finalistas`

### Requirement: Best goalkeeper market SHALL use player option search behavior
The system SHALL expose goalkeeper candidates through the same player option metadata, featured defaults, search, selected pinning, and inactive-state behavior used by existing player outright markets.

#### Scenario: User opens the market without searching
- **WHEN** the `Melhor Goleiro` card renders with no search query
- **THEN** the card SHALL show no more than five featured goalkeeper options plus any currently selected option that is not already visible

#### Scenario: User searches goalkeeper candidates
- **WHEN** the user types a player name or team label in the `Melhor Goleiro` search field
- **THEN** the card SHALL filter the active goalkeeper catalog and cap visible results using the existing player search limit

#### Scenario: Selected goalkeeper becomes inactive
- **WHEN** a previously selected goalkeeper is no longer active after a catalog refresh
- **THEN** the card SHALL keep that selected goalkeeper visible with an inactive state instead of hiding the user's pick

### Requirement: Best goalkeeper prediction SHALL be scored from the official award result
The system SHALL score `Melhor Goleiro` predictions by comparing the user's selected option with the officially resolved Golden Glove winner.

#### Scenario: User predicts the official winner
- **WHEN** the `Melhor Goleiro` market is resolved to the option selected by a user
- **THEN** the system SHALL award that user 70 outright points for the market

#### Scenario: User predicts a different goalkeeper
- **WHEN** the `Melhor Goleiro` market is resolved to a different option than the one selected by a user
- **THEN** the system SHALL award that user 0 points for the market

#### Scenario: Operator resolves the market
- **WHEN** the official FIFA/adidas Golden Glove winner is known
- **THEN** an operator SHALL be able to resolve `BEST_GOALKEEPER` through the existing outright resolution flow using the winning option

### Requirement: Scoring references SHALL include the new market
The system SHALL treat the new market as part of the active scoring model and update user-facing scoring references accordingly.

#### Scenario: Theoretical maximum is calculated
- **WHEN** scoring constants or scoring reference data are loaded
- **THEN** the system SHALL treat outright markets as totaling 670 points and the full theoretical maximum as 3270 points

#### Scenario: User reads the scoring page
- **WHEN** an authenticated user opens the scoring reference page
- **THEN** the page SHALL list `Melhor Goleiro` with 70 points and explain that it is resolved by the official Golden Glove winner

### Requirement: Seeding SHALL add the market without deleting existing predictions
The system SHALL add and refresh `Melhor Goleiro` through the existing idempotent seed path without removing existing outright predictions.

#### Scenario: Hosted data already has existing outright predictions
- **WHEN** the operator runs the seed command after this change is deployed
- **THEN** the system SHALL add or update the `Melhor Goleiro` market and goalkeeper options without deleting predictions for existing markets

#### Scenario: Goalkeeper option list changes later
- **WHEN** a later seed refresh removes a goalkeeper from the active input list
- **THEN** the system SHALL mark that goalkeeper option inactive rather than deleting prediction-facing option records
