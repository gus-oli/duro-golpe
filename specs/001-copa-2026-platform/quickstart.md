# Quickstart: Plataforma de Engajamento Social - Copa do Mundo 2026

**Branch**: `001-copa-2026-platform` | **Date**: 2026-04-28

---

## What This Feature Delivers

The foundational platform: user registration, 104-match prediction grid, private leagues with invite codes, 8 outright markets, and real-time live score feed during matches.

---

## Critical Integration Scenarios (TDD Order)

All tests MUST be written and RED before implementation begins.

### Scenario 1: User Registration and First Prediction (MVP path)

```
1. POST /auth/register { email, password, displayName }
   → 201 { userId, token }

2. GET /matches?status=SCHEDULED
   → list of upcoming matches with userPrediction: null

3. POST /matches/:matchId/predictions { home: 2, away: 1 }
   → 201 { predictionId, home: 2, away: 1 }

4. GET /matches/:matchId
   → userPrediction: { home: 2, away: 1 }
```

**Validation**: Complete in under 5 minutes on first use (SC-001).

---

### Scenario 2: Prediction Lock Enforcement

```
Match kickoff_time = T
At T − 16min: POST /matches/:id/predictions → 201 (accepted)
At T − 14min: POST /matches/:id/predictions → 403 (locked)
At T − 14min: PUT  /matches/:id/predictions → 403 (locked)
```

**Key**: Lock fires at exactly T − 15 minutes UTC. The cron job sets match.status = 'LOCKED'.

---

### Scenario 3: Private League Full Flow

```
User A: POST /leagues { name: "Galera do Bar" }
   → { leagueId, inviteCode: "BRZA2026" }

User B: POST /leagues/join { inviteCode: "BRZA2026" }
   → { leagueId, name: "Galera do Bar" }

Both users make predictions on match #1
Match #1 finishes → scoring engine processes results

GET /leagues/:leagueId/ranking
   → [{ rank: 1, displayName: "User A", totalPoints: 25 },
      { rank: 2, displayName: "User B", totalPoints: 10 }]
```

---

### Scenario 4: Outright Market Window

```
At T−90min before opening match: GET /outrights → status: OPEN for all 8
At T−90min: POST /outrights/CHAMPION/predictions { optionId: "Brazil" } → 200
At T−59min: GET /outrights → status: LOCKED for all 8
At T−59min: POST /outrights/CHAMPION/predictions → 403 (locked)
```

---

### Scenario 5: Real-Time Live Score Update

```
Match kicks off → match.status = LIVE (WebSocket: match:status:changed)
Goal scored → API-Football webhook received
   → WebSocket match:score:live { matchId, homeGoals: 1, awayGoals: 0 }
   → Client updates live score display without reload
Match ends → scoring engine processes
   → WebSocket score:match:updated { userScore: { tier, points } }
   → WebSocket ranking:updated { leagueId }
```

---

## Key Invariants to Verify

- A user can have at most ONE prediction per match (unique constraint).
- A user can have at most ONE prediction per outright market (unique constraint).
- Invite codes are always 8 chars, alphanumeric, unique across all leagues.
- Match predictions accepted only when `match.status = 'SCHEDULED'`.
- Outright predictions accepted only when `market.status = 'OPEN'`.
- A user may belong to multiple leagues — rankings are per-league, not global.
