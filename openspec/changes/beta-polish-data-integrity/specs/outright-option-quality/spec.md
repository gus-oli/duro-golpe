## ADDED Requirements

### Requirement: Team outright markets SHALL include only real national teams
Outright markets whose option type is `TEAM` SHALL expose only real national teams and SHALL exclude bracket placeholders, smoke-only teams, and unresolved knockout slots.

#### Scenario: Team market options are seeded
- **WHEN** the system seeds champion, finalist, group winner, or other team-based outright options
- **THEN** every generated option SHALL reference a real selectable national team

#### Scenario: Placeholder teams already exist in the database
- **WHEN** unresolved knockout placeholders exist in the `teams` table
- **THEN** those records SHALL NOT appear as options in any team-based outright market

### Requirement: Individual outright markets SHALL provide broad curated catalogs
Individual markets such as top scorer, best player, and revelation SHALL provide enough curated options for a credible beta experience instead of only a tiny demo list.

#### Scenario: User opens an individual outright market
- **WHEN** the user opens a player-based outright such as artilheiro, bola de ouro, or revelacao
- **THEN** the market SHALL show a broader curated list of relevant candidates with natural PT-BR labels where applicable

#### Scenario: Catalogs are regenerated
- **WHEN** the operator reruns the outright seed
- **THEN** the system SHALL upsert the curated options idempotently without creating duplicate labels for the same market

### Requirement: Outright options SHALL preserve existing prediction stability
Changes to labels, localization, and option catalogs SHALL preserve existing prediction references whenever the underlying option still represents the same choice.

#### Scenario: Existing user selected a real team option
- **WHEN** team option labels are localized or refreshed
- **THEN** the existing prediction SHALL continue pointing to the same team-backed option

#### Scenario: Existing invalid placeholder option is removed
- **WHEN** an old outright option references a non-selectable placeholder
- **THEN** the system SHALL remove or hide that option in a way that prevents new selections and does not corrupt valid predictions
