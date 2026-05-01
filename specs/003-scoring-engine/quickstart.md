# Quickstart: Motor de Pontuação (The Engine)

**Branch**: `003-scoring-engine` | **Date**: 2026-04-28

---

## What This Feature Does

The scoring engine evaluates each user's match prediction against the official result and awards the highest tier achieved using the 5-tier non-cumulative formula. It maintains running totals and pushes real-time score updates to connected clients via WebSocket.

---

## Key Scenarios to Validate (Integration Tests)

These are the critical scenarios that MUST be covered before the feature is considered complete.

### Scenario 1: Exact Score (Placar Exato — 25pts)

```
Prediction: 2-1 (Brazil wins)
Result:     2-1 (Brazil wins)
Expected:   tier = EXACT_SCORE, points = 25
```

### Scenario 2: Winner + Goal Difference (15pts)

```
Prediction: 3-1 (Brazil wins by 2)
Result:     2-0 (Brazil wins by 2)
Expected:   tier = WINNER_AND_GOAL_DIFF, points = 15
```

### Scenario 3: Correct Winner, Wrong Goal Difference (10pts)

```
Prediction: 2-1 (Brazil wins by 1)
Result:     3-1 (Brazil wins by 2)
Expected:   tier = WINNER_OR_DRAW, points = 10
```

### Scenario 4: Correct Draw (10pts)

```
Prediction: 1-1 (draw)
Result:     0-0 (draw)
Expected:   tier = WINNER_OR_DRAW, points = 10
           (NOT WINNER_AND_GOAL_DIFF — draws are ineligible for 15pts tier)
```

### Scenario 5: One Team's Goals Correct, Wrong Outcome (5pts)

```
Prediction: 2-1 (Brazil wins — Brazil scores 2)
Result:     2-3 (Argentina wins — Brazil scored 2 correctly, but wrong winner)
Expected:   tier = ONE_TEAM_GOALS, points = 5
```

### Scenario 6: Total Miss (0pts)

```
Prediction: 1-0
Result:     3-2
Expected:   tier = TOTAL_MISS, points = 0
```

### Scenario 7: Tier Priority — Correct Winner Also Got One Team's Goals

```
Prediction: 1-2 (Argentina wins — Argentina scores 2)
Result:     0-2 (Argentina wins — Argentina scored 2 correctly)
Expected:   tier = WINNER_OR_DRAW, points = 10
           (NOT ONE_TEAM_GOALS — highest tier wins: correct winner = 10pts)
```

### Scenario 8: Result Amendment

```
Step 1: Result confirmed as 2-1 → User who predicted 2-1 gets 25pts
Step 2: Result amended to 2-2 → User's MatchScore is superseded
        New MatchScore: tier = TOTAL_MISS, points = 0
        UserTotal adjusted: -25pts
Expected: UserTotal reflects the corrected score, not the original
```

### Scenario 9: Idempotent Processing

```
Process same match.result.confirmed event twice.
Expected: MatchScore inserted once (unique constraint prevents duplicate).
          UserTotal updated once. No double-credit.
```

### Scenario 10: Concurrent Match Processing (Group Stage)

```
Two matches finish simultaneously.
Both events processed concurrently by the ScoringProcessor.
Expected: Both users' totals updated correctly.
          No lost updates, no negative totals, no race conditions.
```

---

## TDD Test Matrix for the Pure Scoring Function

Before writing any implementation code, these unit tests MUST exist and FAIL:

```
engine.test.ts

describe("calculateTier")
  ├── Exact Score (EXACT_SCORE = 25)
  │   ├── home win exact: predicted(2,1) vs actual(2,1) → 25
  │   ├── away win exact: predicted(1,3) vs actual(1,3) → 25
  │   ├── draw exact:     predicted(0,0) vs actual(0,0) → 25
  │   └── draw exact:     predicted(2,2) vs actual(2,2) → 25
  │
  ├── Winner + Goal Diff (WINNER_AND_GOAL_DIFF = 15)
  │   ├── home win, diff=2: predicted(3,1) vs actual(2,0) → 15
  │   ├── home win, diff=1: predicted(2,1) vs actual(3,2) → 15
  │   ├── away win, diff=1: predicted(1,2) vs actual(0,1) → 15
  │   └── draw is NEVER eligible: predicted(1,1) vs actual(0,0) → 10, not 15
  │
  ├── Winner or Draw (WINNER_OR_DRAW = 10)
  │   ├── correct winner, wrong diff: predicted(2,1) vs actual(3,1) → 10
  │   ├── correct draw, any scores:   predicted(1,1) vs actual(2,2) → 10
  │   ├── correct draw, any scores:   predicted(2,2) vs actual(0,0) → 10
  │   └── correct away win, wrong diff: predicted(0,2) vs actual(1,3) → 10
  │
  ├── One Team Goals (ONE_TEAM_GOALS = 5)
  │   ├── home goals correct, wrong result: predicted(2,1) vs actual(2,3) → 5
  │   ├── away goals correct, wrong result: predicted(1,2) vs actual(0,2) ... 
  │   │   BUT correct winner (away) → WINNER_OR_DRAW = 10, not 5
  │   ├── away goals correct, wrong winner: predicted(0,2) vs actual(3,2) → 5
  │   └── one team correct, wrong draw:     predicted(2,1) vs actual(2,2) → 5
  │
  └── Total Miss (TOTAL_MISS = 0)
      ├── both teams wrong, wrong result: predicted(1,0) vs actual(3,2) → 0
      └── both teams wrong, wrong draw:   predicted(0,0) vs actual(1,2) → 0
```

---

## Theoretical Maximum Validation

```
Verify: 104 × 25 + 530 = 3130
  104 matches × 25 pts max = 2600 pts
  Outrights: 100+80+80+70+60+50+50+40 = 530 pts
  Total: 3130 pts ✓
```

---

## Real-Time Update Flow

After a match result is confirmed by the external data provider:

```
1. Data provider → POST /internal/results  (match.result.confirmed event published)
2. ScoringProcessor picks up event from Redis pub/sub
3. For each MatchPrediction in that match:
   a. calculateTier(prediction, result) → tier + points
   b. INSERT INTO match_scores ... ON CONFLICT DO NOTHING  (idempotency)
   c. UPDATE user_totals SET total_points += delta ... WHERE user_id = X
4. PUBLISH scores.updated → Redis
5. WebSocket layer receives scores.updated, emits score:match:updated to each connected user
6. Client updates match card without full reload

Target: steps 1-6 complete within 60 seconds of official result confirmation.
```
