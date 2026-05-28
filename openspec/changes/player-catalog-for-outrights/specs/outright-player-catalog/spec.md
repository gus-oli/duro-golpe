## ADDED Requirements

### Requirement: Players SHALL be stored as first-class catalog records
The system SHALL persist player identity independently from outright market options so one player can be reused across multiple individual markets.

#### Scenario: Player exists once across markets
- **WHEN** the same player is eligible for multiple individual outright markets
- **THEN** the system SHALL store one canonical player record and link that player to each relevant market candidate

#### Scenario: Player has provider and display metadata
- **WHEN** a player record is available through the catalog
- **THEN** the system SHALL expose display name, normalized identity, team or country context, active status, source metadata, and optional provider/photo metadata

#### Scenario: Player name has aliases
- **WHEN** provider data or curated data includes alternate names for an existing player
- **THEN** the system SHALL associate aliases or provider ids with the existing player instead of creating duplicate visible players

### Requirement: Individual outright markets SHALL use player-market candidates
The system SHALL map players to individual outright markets through explicit candidate records that control eligibility, source tier, featured status, sort order, confidence, and active state.

#### Scenario: Player belongs to one market
- **WHEN** a player is relevant to Artilheiro but not Revelacao
- **THEN** the system SHALL expose that player as a candidate only for the relevant market

#### Scenario: Candidate is featured
- **WHEN** a player-market candidate is marked featured
- **THEN** that player SHALL be eligible for the default five-option view for that market

#### Scenario: Candidate is inactive
- **WHEN** a player-market candidate becomes inactive after a catalog refresh
- **THEN** the player SHALL no longer appear in default active search results unless already selected by the user

### Requirement: Player catalog sync SHALL preserve existing predictions
Catalog refreshes SHALL update player and candidate data without deleting prediction-facing outright options that may already be referenced by user predictions.

#### Scenario: Existing selected player disappears from latest source
- **WHEN** a player selected by a user is missing from a later catalog import
- **THEN** the system SHALL mark the related candidate or option inactive instead of deleting the prediction-facing option

#### Scenario: New player candidate is imported
- **WHEN** an import adds a new player candidate for an individual market
- **THEN** the system SHALL create or update the player, candidate, and prediction-facing outright option needed for users to select that player

#### Scenario: Existing player metadata changes
- **WHEN** a player's source tier, featured state, team label, photo, or sort order changes
- **THEN** the system SHALL update the projected outright option metadata without changing existing prediction ids

### Requirement: API-Football SHALL enrich players without becoming source of truth
Provider-backed player data SHALL be used only through backend-controlled enrichment flows and SHALL NOT be treated as authoritative 2026 squad membership on its own.

#### Scenario: Provider returns a player photo
- **WHEN** the enrichment job resolves a player photo from API-Football
- **THEN** the system SHALL store the photo metadata in the player catalog and make it available to outright options

#### Scenario: Provider lookup fails
- **WHEN** API-Football does not return a usable match for a player
- **THEN** the player SHALL remain available with fallback UI metadata

#### Scenario: Provider returns players outside curated candidates
- **WHEN** API-Football returns additional player search results
- **THEN** the system SHALL NOT expose those players in an individual market unless a catalog import or operator action links them as candidates

### Requirement: Player catalog imports SHALL support curated and squad-source tiers
The system SHALL support repeatable imports from curated lists, preliminary lists, official squad lists, and provider enrichment while preserving source tier semantics.

#### Scenario: Curated likely player is imported
- **WHEN** an operator imports a curated likely player before final squads are complete
- **THEN** the player-market candidate SHALL be marked with a likely or curated source tier

#### Scenario: Official squad later confirms a player
- **WHEN** a later import marks an existing player as official
- **THEN** the system SHALL update the source tier without creating a duplicate player or losing existing selections

#### Scenario: Player falls out of active list
- **WHEN** a later import excludes a previously active player candidate
- **THEN** the system SHALL mark the candidate inactive while preserving history and selected-state visibility
