## Why

Knockout matches decided by penalty shootout can arrive from football-data.org with `score.fullTime` including shootout goals. The betting game should score match predictions by the playable match score through 120 minutes, excluding the penalty shootout.

## What Changes

- Normalize football-data.org scores before applying provider snapshots so `PENALTY_SHOOTOUT` matches use the score after regular time plus extra time.
- Preserve existing behavior for regular and extra-time finishes where `fullTime` already represents the playable match score.
- Apply the same normalization to provider-backed fixture ingestion so locally stored match scores do not display shootout goals as match goals.
- Add regression coverage for a finished penalty-shootout provider payload where `fullTime` contains shootout goals but the stored/scored result remains a draw after 120 minutes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `provider-result-polling`: terminal provider updates must exclude penalty-shootout goals from the match result used by realtime and scoring.
- `football-data-world-cup-ingestion`: provider-backed fixture score mapping must store the playable match score, excluding penalty-shootout goals.

## Impact

- Backend football-data.org adapter types and score normalization.
- Backend provider sync and provider-backed seed mapping.
- Unit coverage for football-data sync score normalization.
