# Contracts: Gamificação Social — API & Events

**Branch**: `002-social-gamification` | **Date**: 2026-04-28
Base path: `/api/v1` | Auth: Bearer JWT required on all endpoints.

This contract extends `001-copa-2026-platform/contracts/platform-api.md`.

---

## Mural de Resenha

### GET /leagues/:leagueId/matches/:matchId/mural

Retrieve the comment feed for a specific match within a league. Requires the authenticated user to be an active member of the league.

**Query params**:
- `limit` (integer, default 50, max 100)
- `before` (timestamptz ISO string — cursor for older posts)

**Response 200**:
```json
{
  "leagueId": "uuid",
  "matchId": "uuid",
  "posts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "displayName": "Gustavo",
      "avatarUrl": "https://...",
      "content": "Vai Brasil! 🦅",
      "createdAt": "2026-06-15T21:03:00Z"
    }
  ],
  "hasMore": false
}
```

**Error 403**: Authenticated user is not an active member of this league.

---

### POST /leagues/:leagueId/matches/:matchId/mural

Post a new comment. Requires active league membership.

**Request**:
```json
{ "content": "Que zebra foi essa! 🤣" }
```

**Response 201**:
```json
{
  "id": "uuid",
  "content": "Que zebra foi essa! 🤣",
  "createdAt": "2026-06-15T22:10:00Z"
}
```

**Error 400**: Content is empty or exceeds 500 characters.
**Error 403**: Not an active member of this league.

---

## Badges

### GET /users/:userId/badges

Retrieve all badges earned by a user. Visible to any authenticated user (for display in league rankings).

**Response 200**:
```json
{
  "userId": "uuid",
  "displayName": "Gustavo",
  "badges": [
    {
      "type": "O_MESTRE",
      "labelPt": "O Mestre",
      "descriptionPt": "Acertou o resultado de 5 partidas consecutivas",
      "iconKey": "badge-mestre",
      "awardedAt": "2026-06-20T18:05:00Z",
      "zebraCount": null
    },
    {
      "type": "ZEBRA_HUNTER",
      "labelPt": "Zebra Hunter",
      "descriptionPt": "Acertou o resultado de uma partida zebra",
      "iconKey": "badge-zebra",
      "awardedAt": "2026-06-18T22:01:00Z",
      "zebraCount": 3
    }
  ]
}
```

`zebraCount` is non-null only for `ZEBRA_HUNTER`; null for all other badge types.

---

## WebSocket Events (additions to 001/003 events)

Connection and auth same as `001-copa-2026-platform/contracts/platform-api.md`.

---

### Server → Client: `mural:post:new`

Emitted to all active league members who are currently connected and viewing (or subscribed to) the mural for a specific match.

```json
{
  "type": "mural:post:new",
  "leagueId": "uuid",
  "matchId": "uuid",
  "post": {
    "id": "uuid",
    "userId": "uuid",
    "displayName": "Gustavo",
    "avatarUrl": "https://...",
    "content": "Já era! 😂",
    "createdAt": "2026-06-15T21:30:00Z"
  }
}
```

**Subscription**: Clients subscribe to mural updates when they open a match's mural view. The backend tracks active mural subscriptions per `(leagueId, matchId)` using the WebSocket session context.

---

### Server → Client: `badge:awarded`

Emitted to the specific user who just earned a badge, immediately after the `BadgeEvaluator` awards it.

```json
{
  "type": "badge:awarded",
  "badge": {
    "type": "O_MESTRE",
    "labelPt": "O Mestre",
    "descriptionPt": "Acertou o resultado de 5 partidas consecutivas",
    "iconKey": "badge-mestre",
    "awardedAt": "2026-06-20T18:05:00Z"
  }
}
```

The frontend MUST display a celebratory notification on receiving this event.

---

## Internal Event (Redis pub/sub)

### Event: `badge.evaluate`

Published by the scoring processor (003) after each MatchScore is written, triggering the BadgeEvaluator.

```json
{
  "event": "badge.evaluate",
  "userId": "uuid",
  "matchId": "uuid",
  "tier": "EXACT_SCORE",
  "isZebraMatch": false
}
```

**Consumed by**: `BadgeEvaluator` service in `backend/src/badges/evaluator.ts`.
