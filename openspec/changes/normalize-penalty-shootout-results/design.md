## Context

The provider-backed beta path uses football-data.org v4 for World Cup fixtures and result polling. The current adapter only models `score.fullTime`, and both the seed path and polling path pass that value into the local match model. football-data.org can fold penalty-shootout goals into `fullTime` when `score.duration` is `PENALTY_SHOOTOUT`, while also exposing `regularTime`, `extraTime`, and `penalties`.

The product rule is that match predictions are scored on the playable match score through 120 minutes. Penalty-shootout goals decide advancement, but they are not match goals for prediction scoring.

## Goals / Non-Goals

**Goals:**
- Normalize football-data.org match scores before they reach local match storage, realtime events, or scoring events.
- Treat regular and extra-time finishes as unchanged.
- Treat penalty-shootout finishes as `regularTime + extraTime`, excluding `penalties`.
- Keep the behavior local to the provider adapter path without changing the scoring engine tier rules.

**Non-Goals:**
- Change the match scoring tier model.
- Store penalty-shootout details in a new schema field.
- Change manual override semantics; operators must continue to enter the score that should be treated as the official prediction result.
- Replace the legacy API-Football webhook path.

## Decisions

### 1. Normalize at the football-data adapter boundary

The football-data.org payload should be converted into the product's match-score semantics before calling `applyProviderMatchSnapshot` or seed match mapping. This keeps `match-reconciliation`, realtime publishing, and scoring processor code focused on local product concepts.

Alternative considered: adjust `scoring/processor` to reinterpret provider events. Rejected because match display, score summaries, and stored match results would still carry the wrong score.

### 2. Use a shared helper for provider score selection

Add a small helper near the football-data types that returns `{ home, away }` from a provider match score. Both `sync-football-data` and `seed-matches` should call it, avoiding two slightly different interpretations of `duration`.

Alternative considered: inline the logic in sync only. Rejected because provider-backed seed can also ingest already-finished fixtures and should not display shootout goals as match goals.

### 3. Prefer explicit provider period nodes for shootouts

For `PENALTY_SHOOTOUT`, use `regularTime + extraTime` when both sides are available. If those nodes are missing, derive the playable score from `fullTime - penalties` only when all needed values are present. If neither path is complete, fall back to `fullTime` so polling remains tolerant of incomplete provider payloads.

Alternative considered: require `regularTime` for shootouts and ignore the snapshot otherwise. Rejected because it could leave a finished match unconfirmed when the provider has enough data via `penalties`.

## Risks / Trade-offs

- [Risk] Provider payload keys can appear as `home`/`away`; older documentation examples also show `homeTeam`/`awayTeam`. -> Mitigation: keep the existing `home`/`away` contract used by the current code and tests; add fallback handling only if real payloads require it later.
- [Risk] A provider shootout payload missing period breakdowns may still be wrong if fallback to `fullTime` is used. -> Mitigation: derive from `fullTime - penalties` when possible and cover the normal v4 shape with tests.
- [Trade-off] The legacy API-Football webhook can still submit an already-folded shootout score. -> Mitigation: leave it out of this primary football-data fix because the current real-fixture path is football-data.org; operators can use manual override for trusted scores.
