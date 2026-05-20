## ADDED Requirements

### Requirement: Authenticated league surfaces SHALL avoid unbounded ranking fan-out
The system SHALL load league ranking surfaces with a bounded request shape so one league page load does not require one additional badge or enrichment request per ranking entry.

#### Scenario: League ranking loads without per-entry badge fetches
- **WHEN** a league page is rendered for an authenticated member
- **THEN** the system SHALL provide the ranking and its required badge or enrichment data without triggering one independent request per visible ranking entry

### Requirement: Realtime resilience SHALL avoid aggressive unconditional polling
The system SHALL preserve match and ranking freshness without relying on short-interval unconditional polling on every active page.

#### Scenario: Ranking fallback refresh is bounded
- **WHEN** realtime ranking updates are unavailable or missed
- **THEN** the fallback refresh behavior SHALL use a bounded strategy that does not continuously poll the backend at an aggressive fixed interval for the full page lifetime

#### Scenario: Match detail fallback refresh is bounded
- **WHEN** realtime match updates are unavailable or missed
- **THEN** the match detail fallback SHALL refresh state with a bounded strategy appropriate to the match lifecycle instead of unconditional short-interval polling

### Requirement: Authenticated navigation SHALL remain responsive under repeated use
The system SHALL keep the main authenticated journey responsive enough for repeated beta use by avoiding avoidable request duplication on high-traffic pages.

#### Scenario: Returning to hot-path authenticated pages remains responsive
- **WHEN** a signed-in beta user repeatedly navigates among home, matches, leagues, and match detail
- **THEN** the product SHALL avoid avoidable duplicate data work that makes those pages feel materially slower than their information density requires
