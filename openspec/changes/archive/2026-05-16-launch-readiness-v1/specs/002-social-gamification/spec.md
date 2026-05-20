## ADDED Requirements

### Requirement: Finalistas accepts exactly two team selections
The system MUST require exactly two team selections for the `Finalistas` outright market, and it MUST award 90 points only when both official finalists are predicted correctly regardless of order.

#### Scenario: Both finalists correct yields full score
- **WHEN** a user predicts exactly two teams for `Finalistas` and both teams match the official finalists
- **THEN** the user MUST receive 90 points for the market

#### Scenario: Partial finalists match yields zero
- **WHEN** a user predicts `Finalistas` and only one or none of the predicted teams matches the official finalists
- **THEN** the user MUST receive 0 points for the market

### Requirement: Official sources resolve award and standings-based outrights
The system MUST resolve `Bola de Ouro` and `Revelação` using official FIFA award outcomes, and it MUST resolve `Melhor Ataque` using total goals scored with official final FIFA tournament standing as the tiebreaker.

#### Scenario: Melhor Ataque uses official standing as tiebreaker
- **WHEN** two or more teams finish tied on total goals scored for `Melhor Ataque`
- **THEN** the market winner MUST be the tied team with the best official final FIFA tournament standing

## MODIFIED Requirements

### Requirement: Launch outright catalog contains seven markets totaling 600 points
The system MUST offer exactly seven launch outright markets with the following labels and point values: `Campeão` 120, `Artilheiro` 90, `Bola de Ouro` 90, `Finalistas` 90, `Revelação` 70, `Melhor Ataque` 80, and `Lanterna` 60.

#### Scenario: Launch outright catalog is visible with approved values
- **WHEN** a user opens the outright section during the prediction window
- **THEN** the system MUST display exactly the seven approved launch markets with their configured point values totaling 600 points

## REMOVED Requirements

### Requirement: Zebra is offered as a launch outright market
**Reason**: The Zebra market remains too ambiguous and contestable for a day-one launch catalog.
**Migration**: Reintroduce only in a future change that defines an objective and auditable resolution rule.

#### Scenario: Launch catalog excludes Zebra
- **WHEN** a user accesses the launch outright catalog
- **THEN** the system MUST NOT display a `Zebra` outright market
