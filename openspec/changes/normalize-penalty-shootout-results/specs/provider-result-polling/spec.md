## MODIFIED Requirements

### Requirement: Polling SHALL reconcile provider states into the app's local match lifecycle
The polling system SHALL translate provider match status and score updates into the app's local match/result model and downstream realtime/scoring pipeline. For football-data.org matches decided by penalty shootout, the reconciled match result SHALL use the playable score through 120 minutes and MUST exclude penalty-shootout goals.

#### Scenario: Provider in-play update marks a match as live
- **WHEN** a polled provider match enters an in-play state with score data
- **THEN** the local system SHALL update the match into the app's live lifecycle and publish the corresponding realtime score/status updates without prematurely confirming a final result

#### Scenario: Provider finished update confirms a result once
- **WHEN** a polled provider match reaches a terminal finished state with final score data
- **THEN** the local system SHALL confirm the result through the existing scoring/realtime pipeline exactly once for that terminal outcome

#### Scenario: Provider penalty-shootout result excludes penalties
- **WHEN** a polled football-data.org match reaches `FINISHED` with `score.duration` equal to `PENALTY_SHOOTOUT`
- **THEN** the local system SHALL confirm and score the match using regular-time plus extra-time goals, excluding penalty-shootout goals from the match result
