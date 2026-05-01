# Contracts: Motor de Pontuação — API & Events

**Branch**: `003-scoring-engine` | **Date**: 2026-04-28

---

## Internal Events (Event Bus)

These events flow between backend services over the Redis pub/sub channel.

### Event: `match.result.confirmed`

Published by the external data ingestion service when a match result is officially confirmed.
Consumed by: `ScoringProcessor`.

```json
{
  "event": "match.result.confirmed",
  "matchResultId": "uuid",
  "matchId": "uuid",
  "homeGoals": 2,
  "awayGoals": 1,
  "confirmedAt": "2026-06-15T21:05:00Z",
  "source": "api-football-v3"
}
```

**Guarantees**:
- Published at most once per `matchResultId`.
- `ScoringProcessor` handles duplicates idempotently via the `(prediction_id, match_result_id)` unique constraint.

---

### Event: `match.result.amended`

Published when an official result is corrected after initial confirmation.
Consumed by: `ScoringProcessor` (reversal + recalculation path).

```json
{
  "event": "match.result.amended",
  "newMatchResultId": "uuid",
  "previousMatchResultId": "uuid",
  "matchId": "uuid",
  "homeGoals": 2,
  "awayGoals": 2,
  "amendedAt": "2026-06-15T22:00:00Z",
  "reason": "Official correction by FIFA"
}
```

---

### Event: `match.result.cancelled`

Published when a match is cancelled with no rescheduled date.

```json
{
  "event": "match.result.cancelled",
  "matchResultId": "uuid",
  "matchId": "uuid",
  "cancelledAt": "2026-06-15T18:00:00Z"
}
```

---

### Event: `scores.updated`

Published by `ScoringProcessor` after all MatchScores are written for a match.
Consumed by: WebSocket broadcast layer.

```json
{
  "event": "scores.updated",
  "matchId": "uuid",
  "processedAt": "2026-06-15T21:05:12Z",
  "affectedUserCount": 12500,
  "tierBreakdown": {
    "EXACT_SCORE": 42,
    "WINNER_AND_GOAL_DIFF": 318,
    "WINNER_OR_DRAW": 4200,
    "ONE_TEAM_GOALS": 1890,
    "TOTAL_MISS": 6050
  }
}
```

---

## REST API Endpoints

Base path: `/api/v1`

---

### GET /users/{userId}/score

Returns a user's current total score and progress toward the theoretical maximum.

**Response 200**:

```json
{
  "userId": "uuid",
  "totalPoints": 1240,
  "matchPoints": 980,
  "outrightPoints": 260,
  "maxTheoreticalPoints": 3130,
  "progressPercent": 39.6,
  "exactScoreCount": 18,
  "winnerGoalDiffCount": 42,
  "lastUpdatedAt": "2026-06-15T21:05:20Z"
}
```

**Error 404**: User not found.

---

### GET /users/{userId}/scores/matches

Returns a paginated list of a user's match scores, showing tier and points per match.

**Query params**:
- `page` (integer, default 1)
- `limit` (integer, default 20, max 50)
- `status` (enum: `scored` | `pending` | `cancelled`, default `scored`)

**Response 200**:

```json
{
  "page": 1,
  "limit": 20,
  "total": 48,
  "items": [
    {
      "matchId": "uuid",
      "matchDate": "2026-06-15T21:00:00Z",
      "homeTeam": "Brazil",
      "awayTeam": "Argentina",
      "prediction": { "home": 2, "away": 1 },
      "result": { "home": 2, "away": 1 },
      "tier": "EXACT_SCORE",
      "tierLabel": "Placar Exato",
      "points": 25,
      "isSuperseded": false,
      "calculatedAt": "2026-06-15T21:05:20Z"
    }
  ]
}
```

---

### GET /leagues/{leagueId}/ranking

Returns the ranked leaderboard for a league.

**Query params**:
- `limit` (integer, default 50, max 200)
- `offset` (integer, default 0)

**Response 200**:

```json
{
  "leagueId": "uuid",
  "totalMembers": 12,
  "updatedAt": "2026-06-15T21:05:25Z",
  "ranking": [
    {
      "rank": 1,
      "userId": "uuid",
      "displayName": "Gustavo",
      "avatarUrl": "https://...",
      "totalPoints": 1240,
      "matchPoints": 980,
      "outrightPoints": 260,
      "exactScoreCount": 18,
      "winnerGoalDiffCount": 42
    }
  ]
}
```

**Cache**: Response is cached in Redis for 10 seconds. Header `X-Cache-Age: {seconds}` indicates staleness.

---

### GET /matches/{matchId}/score-summary

Returns aggregate scoring statistics for a concluded match (visible to all users).

**Response 200**:

```json
{
  "matchId": "uuid",
  "result": { "home": 2, "away": 1 },
  "totalPredictions": 12500,
  "tierBreakdown": {
    "EXACT_SCORE":          { "count": 42,   "percent": 0.3 },
    "WINNER_AND_GOAL_DIFF": { "count": 318,  "percent": 2.5 },
    "WINNER_OR_DRAW":       { "count": 4200, "percent": 33.6 },
    "ONE_TEAM_GOALS":       { "count": 1890, "percent": 15.1 },
    "TOTAL_MISS":           { "count": 6050, "percent": 48.4 }
  }
}
```

---

## WebSocket Events

Connection: `wss://{host}/ws`
Authentication: Bearer token in handshake `Authorization` header.

---

### Server → Client: `score:match:updated`

Emitted to all connected clients after a match result is processed. Clients receiving this event MUST update the match card state without full page reload.

```json
{
  "type": "score:match:updated",
  "matchId": "uuid",
  "result": { "home": 2, "away": 1 },
  "userScore": {
    "tier": "EXACT_SCORE",
    "tierLabel": "Placar Exato",
    "points": 25,
    "totalPoints": 1240
  }
}
```

**Note**: `userScore` is personalized — the server sends each user their own score, not a broadcast with all users' data.

---

### Server → Client: `score:total:updated`

Emitted when a user's running total changes (after each scored match or outright resolution).

```json
{
  "type": "score:total:updated",
  "totalPoints": 1240,
  "matchPoints": 980,
  "outrightPoints": 260,
  "progressPercent": 39.6,
  "exactScoreCount": 18
}
```

---

### Server → Client: `ranking:updated`

Emitted to all members of a league when any member's score changes, triggering a ranking refresh.

```json
{
  "type": "ranking:updated",
  "leagueId": "uuid",
  "triggerMatchId": "uuid"
}
```

**Note**: This is a lightweight notification — clients MUST fetch the updated ranking via `GET /leagues/{leagueId}/ranking` rather than expecting the full ranking in this payload.
