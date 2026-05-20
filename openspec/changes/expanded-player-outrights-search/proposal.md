## Why

The individual outright markets need to feel complete enough for friends to play before every World Cup squad is final. Today the player options are too small, and adding every possible player directly to the card would make the UI noisy and slow.

## What Changes

- Expand player-based outright markets with a broader player catalog sourced from published FIFA squad articles, official/preliminary lists, and curated likely-player shortlists when no official list exists yet.
- Track each player option's confidence/source tier: official squad, preliminary squad, or likely shortlist.
- Show only the top 5 featured player options by default for each individual market, then let users search the full catalog.
- Keep a user's selected player visible even when it is not part of the default featured set or no longer active after squad updates.
- Prevent catalog refreshes from deleting existing player predictions when squad lists change.
- Add copy/state treatment for players who are provisional, likely, or later marked outside the final squad.

## Capabilities

### New Capabilities
- `expanded-player-outright-options`: player outright option catalog, source confidence, search UX, and safe update behavior.

### Modified Capabilities

## Impact

- Backend outright option catalog and seed/update behavior.
- Optional database shape for player option metadata, ordering, active state, and source tier.
- Outright API response shape if metadata is exposed to the frontend.
- Frontend outright cards for player markets, including search and selected-option pinning.
- Tests around catalog refresh safety, featured options, search behavior, and stale selections.
