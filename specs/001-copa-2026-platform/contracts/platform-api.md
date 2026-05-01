# Contracts: Plataforma Copa 2026 — REST API

**Branch**: `001-copa-2026-platform` | **Date**: 2026-04-28
Base path: `/api/v1` | Auth: Bearer JWT in `Authorization` header (or httpOnly cookie)

---

## Authentication

### POST /auth/register
Register a new user with email and password.

**Request**:
```json
{ "email": "user@email.com", "password": "min8chars", "displayName": "Gustavo" }
```
**Response 201**: `{ "userId": "uuid", "token": "jwt" }`
**Error 409**: Email already registered.

---

### POST /auth/login
**Request**: `{ "email": "...", "password": "..." }`
**Response 200**: `{ "userId": "uuid", "token": "jwt", "displayName": "..." }`
**Error 401**: Invalid credentials.

---

### GET /auth/google
Redirect to Google OAuth consent screen. Returns redirect to `/auth/google/callback`.

### GET /auth/google/callback
**Response 302**: Redirect to frontend with JWT set in httpOnly cookie.

---

## Matches

### GET /matches
List all 104 matches, optionally filtered.

**Query params**: `phase` (enum), `status` (enum), `date` (YYYY-MM-DD)

**Response 200**:
```json
{
  "items": [{
    "id": "uuid",
    "matchNumber": 1,
    "phase": "GROUP",
    "groupLetter": "A",
    "kickoffTime": "2026-06-11T18:00:00Z",
    "status": "SCHEDULED",
    "homeTeam": { "id": "uuid", "name": "México", "fifaCode": "MEX", "flagUrl": "..." },
    "awayTeam": { "id": "uuid", "name": "Canadá", "fifaCode": "CAN", "flagUrl": "..." },
    "userPrediction": { "home": 2, "away": 1 }
  }]
}
```

`userPrediction` is `null` if the user has not yet predicted. Requires auth.

---

### GET /matches/:matchId
Single match detail including current score if LIVE or FINISHED.

**Response 200**:
```json
{
  "id": "uuid", "status": "LIVE",
  "homeTeam": { ... }, "awayTeam": { ... },
  "kickoffTime": "...", "currentScore": { "home": 1, "away": 0 },
  "userPrediction": { "home": 2, "away": 1 },
  "userScore": null
}
```
`userScore` is populated after FINISHED: `{ "tier": "WINNER_OR_DRAW", "points": 10 }`.

---

## Predictions

### POST /matches/:matchId/predictions
Submit a score prediction. Returns 403 if match is LOCKED/LIVE/FINISHED.

**Request**: `{ "home": 2, "away": 1 }`
**Response 201**: `{ "predictionId": "uuid", "home": 2, "away": 1, "submittedAt": "..." }`
**Error 403**: Match is locked for predictions.
**Error 409**: Prediction already exists (use PUT to update).

---

### PUT /matches/:matchId/predictions
Update an existing prediction. Returns 403 if match is locked.

**Request**: `{ "home": 1, "away": 0 }`
**Response 200**: `{ "predictionId": "uuid", "home": 1, "away": 0, "submittedAt": "..." }`

---

## Leagues

### POST /leagues
Create a new private league.

**Request**: `{ "name": "Galera do Trabalho" }`
**Response 201**: `{ "leagueId": "uuid", "name": "...", "inviteCode": "BRZA2026" }`

---

### POST /leagues/join
Join a league via invite code.

**Request**: `{ "inviteCode": "BRZA2026" }`
**Response 200**: `{ "leagueId": "uuid", "name": "...", "memberCount": 8 }`
**Error 404**: Invite code not found.
**Error 409**: Already a member.

---

### GET /leagues
List all leagues the authenticated user belongs to.

**Response 200**:
```json
{
  "items": [{ "leagueId": "uuid", "name": "...", "memberCount": 12, "userRank": 3, "userPoints": 840 }]
}
```

---

### GET /leagues/:leagueId/ranking
See `003-scoring-engine/contracts/scoring-api.md` — same endpoint.

---

## Outrights

### GET /outrights
List all 8 outright markets with their options and lock status.

**Response 200**:
```json
{
  "lockDeadline": "2026-06-11T17:00:00Z",
  "markets": [{
    "id": "uuid",
    "type": "CHAMPION",
    "labelPt": "Campeão",
    "points": 100,
    "status": "OPEN",
    "userSelection": null,
    "options": [
      { "id": "uuid", "optionType": "TEAM", "displayLabel": "Brasil", "flagUrl": "..." }
    ]
  }]
}
```
`userSelection` is the user's current pick (`{ "optionId": "uuid", "displayLabel": "Brasil" }`) or null.

---

### POST /outrights/:marketId/predictions
Submit or update an outright prediction. Returns 403 if market is LOCKED.

**Request**: `{ "optionId": "uuid" }`
**Response 200**: `{ "marketId": "uuid", "optionId": "uuid", "submittedAt": "..." }`
**Error 403**: Market is locked.

---

## WebSocket Events (cross-feature)

See `003-scoring-engine/contracts/scoring-api.md` for `score:match:updated`, `score:total:updated`, and `ranking:updated` event schemas.

### Server → Client: `match:status:changed`
Emitted when a match transitions status (e.g., SCHEDULED → LOCKED → LIVE → FINISHED).

```json
{ "type": "match:status:changed", "matchId": "uuid", "status": "LOCKED" }
```

### Server → Client: `match:score:live`
Emitted during a LIVE match when the current score changes (goal scored).

```json
{ "type": "match:score:live", "matchId": "uuid", "homeGoals": 1, "awayGoals": 0, "minute": 34 }
```
