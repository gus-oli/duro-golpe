## 1. Data Model And Odds Aggregation

- [x] 1.1 Add focused backend tests for mapping score predictions into `HOME_WIN`, `DRAW`, and `AWAY_WIN` social-odds outcomes.
- [x] 1.2 Add a `match_social_odds_snapshots` schema and migration with one canonical row per match, outcome counts, total count, percentage/basis-point shares, captured time, minimum sample, and underdog threshold.
- [x] 1.3 Implement a social odds service that computes current odds from `match_predictions` and returns an unavailable state when no prediction sample exists.
- [x] 1.4 Implement idempotent snapshot creation/upsert for a match using the social odds service.
- [x] 1.5 Wire match lock processing to create the frozen snapshot when a scheduled match transitions to locked.
- [x] 1.6 Add a recovery/backfill command or service function that creates missing snapshots for already locked or finished matches.

## 2. Match API Exposure

- [x] 2.1 Add backend route/service tests for social odds on match list and match detail responses.
- [x] 2.2 Extend match DTOs with a social odds payload containing availability, counts, percentages, total predictions, sample threshold, and frozen/current status.
- [x] 2.3 Return current social odds for open matches only when the authenticated user has already submitted a prediction for that match.
- [x] 2.4 Return frozen social odds for locked and finished matches when a canonical snapshot exists.
- [x] 2.5 Return low-sample or unavailable metadata instead of reliable consensus percentages when the total prediction count is below the configured minimum sample.

## 3. Zebra Hunter Qualification

- [x] 3.1 Add unit tests for `ZEBRA_HUNTER` requiring correct-result tiers and rejecting `ONE_TEAM_GOALS` and `TOTAL_MISS`.
- [x] 3.2 Add backend tests for underdog qualification using frozen social odds with the default available-sample minimum and 30 percent threshold.
- [x] 3.3 Extend badge evaluation context creation so scoring/badge evaluation can determine whether the user's predicted outcome was a social underdog in the frozen snapshot.
- [x] 3.4 Update `shouldAwardZebraHunter` to use the existing correct-result tier helper rather than `tier !== 'TOTAL_MISS'`.
- [x] 3.5 Preserve existing first-award and `zebra_count` increment behavior when the social-underdog criteria are met.
- [x] 3.6 Ensure missing snapshots or below-threshold samples publish/evaluate as non-zebra outcomes.

## 4. Frontend Match Surfaces

- [x] 4.1 Add frontend types and a compact reusable social odds display component with low-sample and unavailable states.
- [x] 4.2 Render social odds in match cards/workbench rows without crowding the existing score, status, and prediction controls.
- [x] 4.3 Render richer social odds context on the match detail page using the same DTO fields.
- [x] 4.4 Hide social odds on open matches when the current user has not predicted yet, while keeping the normal prediction call-to-action clear.
- [x] 4.5 Use non-betting product copy such as "Consenso do bolao" or "Tendencia da galera" instead of bookmaker-style wording.

## 5. Seeds, Fixtures, And Regression Coverage

- [x] 5.1 Update demo/smoke seed data or add test fixtures so social odds can be exercised with home-win, draw, away-win, low-sample, and frozen states.
- [x] 5.2 Add frontend/component tests or route smoke coverage for visible odds, hidden pre-prediction odds, and low-sample messaging.
- [x] 5.3 Add integration coverage proving a low-share correct outcome increments `ZEBRA_HUNTER` and a popular correct outcome does not.
- [x] 5.4 Verify snapshot creation remains idempotent when lock processing or recovery runs repeatedly.

## 6. Documentation And Validation

- [x] 6.1 Document the social odds rule, sample minimum, underdog threshold, and `ZEBRA_HUNTER` behavior in the scoring/badge reference copy or runbook.
- [x] 6.2 Run backend typecheck and relevant backend tests for matches, scoring, badges, and social odds.
- [x] 6.3 Run frontend typecheck and relevant frontend tests for match cards/detail rendering.
- [x] 6.4 Validate the OpenSpec change and update any tasks or specs if validation reports gaps.
