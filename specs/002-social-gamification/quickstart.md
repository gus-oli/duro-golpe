# Quickstart: Gamificação Social e Mecânicas Detalhadas de Apostas

**Branch**: `002-social-gamification` | **Date**: 2026-04-28

---

## What This Feature Delivers

Match Cards with 15-minute lock UI; 8 Outright markets with specific point values; Mural de Resenha (per-league, per-match comment feed); automatic badge awarding (O Mestre, Pé Frio, Zebra Hunter).

---

## Critical Scenarios (TDD Order)

### Scenario 1: Match Card Lock at T-15min

```
Given: match.kickoff_time = 2026-06-15T21:00:00Z (UTC)
At 20:44:59Z: GET /matches/:id → status = SCHEDULED, card inputs enabled
At 20:45:00Z: WebSocket match:status:changed { status: "LOCKED" }
Expected: Card inputs become disabled. Submit button hidden. Lock indicator visible.
No page reload required.
```

### Scenario 2: Mural de Resenha — Isolation Between Leagues

```
User A and User B: both members of League 1 AND League 2
User A posts in League 1's mural for match #1: "Vai Brasil!"
User B opens League 1's mural for match #1 → sees "Vai Brasil!"
User B opens League 2's mural for match #1 → feed is empty
User C (not in League 1) GET /leagues/league1-id/matches/match1-id/mural → 403
```

### Scenario 3: Mural Real-Time Push

```
User A and User B: both in League 1, both viewing match #1 mural
User A: POST /leagues/league1/matches/match1/mural { content: "Goool!" }
Expected: User B receives WebSocket mural:post:new event within 5 seconds
          Feed updates without manual refresh
```

### Scenario 4: Badge — O Mestre

```
User correctly predicts match results for matches 1, 2, 3, 4, 5 in sequence
After match 5 result is processed:
  - scoring engine credits points
  - badge.evaluate event published
  - BadgeEvaluator: consecutiveCorrect = 5 → award O_MESTRE
  - INSERT user_badges (user_id, O_MESTRE) ON CONFLICT DO NOTHING
  - WebSocket badge:awarded event sent to user
  - GET /users/:id/badges → includes O_MESTRE
```

### Scenario 5: Badge — Idempotency

```
User already has O_MESTRE badge
User correctly predicts match #6 (6th consecutive correct result)
BadgeEvaluator re-evaluates → tries INSERT user_badges (O_MESTRE)
ON CONFLICT DO NOTHING → no duplicate, no error
Expected: Only one O_MESTRE badge in the user's badge list
```

### Scenario 6: Badge — Zebra Hunter

```
Match: lower-ranked team wins (zebra classification = true)
User correctly predicted the lower-ranked team to win
After scoring:
  - isZebraMatch = true in badge.evaluate event
  - BadgeEvaluator: award ZEBRA_HUNTER (first time) or increment zebra_count
  - GET /users/:id/badges → ZEBRA_HUNTER with zebraCount: 1 (or incremented)
```

### Scenario 7: Outright — All 8 Markets Available Pre-Tournament

```
At T-2h before opening match: GET /outrights
  → 8 markets, all status = OPEN
  → Points visible per market: Campeão 100, Artilheiro 80, Bola de Ouro 80,
    Finalistas 70, Zebra 60, Revelação 50, Ataque+Positivo 50, Lanterna 40

At T-59min: GET /outrights → all status = LOCKED
At T-59min: POST /outrights/CHAMPION/predictions → 403
```

---

## Key Invariants to Verify

- Mural posts are scoped to (league_id, match_id): no cross-league leakage.
- Only active league members can POST to the Mural (403 for non-members).
- Badges are awarded at most once per badge type per user (unique constraint).
- Zebra Hunter's `zebra_count` increments on each qualifying event; never resets.
- O Mestre requires exactly 5+ consecutive correct RESULTS (not exact scores) — WINNER_OR_DRAW, WINNER_AND_GOAL_DIFF, or EXACT_SCORE all count.
- Pé Frio requires 5+ consecutive TOTAL_MISS results — any other tier breaks the streak.
- Badge evaluation always runs AFTER scoring engine commits — never before.
