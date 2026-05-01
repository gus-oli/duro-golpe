# Feature Specification: Motor de Pontuação (The Engine)

**Feature Branch**: `003-scoring-engine`
**Created**: 2026-04-28
**Status**: Draft
**Input**: Sistema de pontuação por partida não-cumulativo com 5 níveis de recompensa. Pontuação máxima teórica de 3.130 pontos (104 partidas × 25 + 530 de Outrights).

## Scoring Tiers Reference

The scoring formula awards the single highest tier achieved per match (non-cumulative):

| Tier | Points | Condition |
|------|--------|-----------|
| Placar Exato | 25 | Exact home AND away goals predicted correctly |
| Vencedor + Saldo de Gols | 15 | Correct winner AND correct goal difference (wins only) |
| Vencedor ou Empate | 10 | Correct match outcome (win or draw), wrong goal difference |
| Acerto de Gols de um time | 5 | Exact goal count for one team, but wrong match outcome |
| Erro Total | 0 | No tier condition met |

**Theoretical Maximum**: 3,130 pts (104 matches × 25 + Outrights: 100+80+80+70+60+50+50+40 = 530)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cálculo Automático de Pontuação por Partida (Priority: P1)

Quando uma partida termina e o placar final é confirmado, o sistema avalia automaticamente o palpite de cada usuário contra o resultado real, aplica a fórmula de 5 níveis e credita os pontos correspondentes ao maior tier atingido. Nenhuma ação do usuário é necessária.

**Why this priority**: O cálculo correto e automático de pontuação é a base de toda a confiança na plataforma. Se os pontos estiverem errados ou atrasados, o produto perde credibilidade e os rankings perdem valor.

**Independent Test**: Pode ser validado com um conjunto fixo de palpites simulados contra resultados conhecidos, verificando que cada palpite recebe exatamente o tier e os pontos corretos — sem interface de usuário ou liga.

**Acceptance Scenarios**:

1. **Given** um usuário palpitou 2-1 (Vitória do Time A) e o resultado foi 2-1, **When** o sistema processa o resultado final, **Then** o usuário recebe 25 pontos (Placar Exato).
2. **Given** um usuário palpitou 3-1 (Vitória do Time A por 2 gols) e o resultado foi 2-0 (Vitória do Time A por 2 gols), **When** o sistema processa o resultado, **Then** o usuário recebe 15 pontos (Vencedor + Saldo de Gols correto, mas placar diferente).
3. **Given** um usuário palpitou 2-1 (Vitória do Time A) e o resultado foi 3-1 (Vitória do Time A, saldo diferente), **When** o sistema processa o resultado, **Then** o usuário recebe 10 pontos (Vencedor correto, saldo errado).
4. **Given** um usuário palpitou 2-1 (Vitória do Time A) e o resultado foi 2-3 (Vitória do Time B), **When** o sistema processa o resultado, **Then** o usuário recebe 5 pontos (Time A marcou 2 gols: acerto de gols de um dos times, mas vencedor errado).
5. **Given** um usuário palpitou 1-0 e o resultado foi 3-2, **When** o sistema processa o resultado, **Then** o usuário recebe 0 pontos (nenhum tier atingido).
6. **Given** um usuário palpitou 1-1 (Empate) e o resultado foi 0-0 (Empate), **When** o sistema processa o resultado, **Then** o usuário recebe 10 pontos (Empate correto, placar diferente — não Placar Exato).

---

### User Story 2 - Transparência: Exibição do Tier e Pontuação por Partida (Priority: P2)

Após o encerramento de uma partida, o usuário visualiza no card da partida o tier que atingiu, a pontuação recebida, seu palpite e o placar real — lado a lado. O usuário entende imediatamente por que recebeu aquela pontuação.

**Why this priority**: Transparência gera confiança. O usuário precisa entender o motivo da pontuação para sentir que o jogo é justo. É também o motivador emocional central — ver "Placar Exato 🎯" vs "Erro Total 💀" cria engajamento.

**Independent Test**: Pode ser testado isoladamente com um usuário visualizando o card de uma partida já encerrada, verificando que o tier label, os pontos, o palpite e o placar real estão todos exibidos corretamente.

**Acceptance Scenarios**:

1. **Given** uma partida encerrou com resultado processado, **When** o usuário abre o card da partida, **Then** vê: seu palpite (ex.: 2-1), o placar real (ex.: 2-0), o nome do tier atingido (ex.: "Vencedor + Saldo de Gols") e os pontos recebidos (ex.: 15 pts).
2. **Given** o usuário atingiu Placar Exato em uma partida, **When** visualiza o card, **Then** o tier é destacado visualmente de forma celebratória (diferenciada dos demais tiers).
3. **Given** o usuário recebeu 0 pontos em uma partida, **When** visualiza o card, **Then** o tier "Erro Total" é exibido claramente, sem pontos creditados, mas sem mensagem punitiva.
4. **Given** o usuário acessa o histórico de todas as partidas já encerradas, **When** rola a lista, **Then** cada card encerrado exibe o tier e a pontuação daquela partida, possibilitando revisão do histórico de palpites.

---

### User Story 3 - Pontuação Total, Progresso e Máximo Teórico (Priority: P3)

A qualquer momento durante o torneio, o usuário acessa seu painel pessoal e visualiza: sua pontuação acumulada (palpites + outrights), sua posição nos rankings das suas ligas e quanto falta para atingir a pontuação máxima teórica de 3.130 pontos.

**Why this priority**: A pontuação acumulada é o norte do usuário ao longo do torneio — define sua ambição, sua posição nas ligas e sua motivação para continuar fazendo palpites.

**Independent Test**: Pode ser testado com um único usuário que fez palpites em múltiplas partidas já encerradas, verificando que o total exibido no painel é a soma exata dos pontos individuais de cada partida mais os outrights processados.

**Acceptance Scenarios**:

1. **Given** o usuário fez palpites em 10 partidas já encerradas e recebeu pontos variados, **When** acessa seu painel, **Then** vê a soma exata dos pontos de todas as partidas encerradas mais quaisquer outrights já processados.
2. **Given** o resultado de uma nova partida é processado, **When** o usuário está com o painel aberto, **Then** a pontuação total é atualizada automaticamente sem recarregar a tela.
3. **Given** o usuário visualiza seu painel, **When** examina a seção de progresso, **Then** vê a porcentagem da pontuação máxima teórica (3.130 pts) que já atingiu.
4. **Given** dois usuários na mesma liga têm a mesma pontuação total, **When** o ranking é exibido, **Then** o desempate é feito pelo número de Placares Exatos (25pts) acertados; em caso de novo empate, pelo número de acertos no tier Vencedor + Saldo (15pts).

---

### Edge Cases

- **Tier ambíguo em empates**: O tier "Vencedor + Saldo de Gols" (15pts) aplica-se exclusivamente a partidas com vencedor. Para empates, apenas Placar Exato (25pts) ou Vencedor ou Empate (10pts) são aplicáveis — o saldo de gols em um empate é sempre 0, mas o tier 15pts não é elegível.
- **Acerto de um time + vencedor correto**: Se o usuário acertou o gols de um time E o vencedor, mas errou o saldo, recebe 10pts (Vencedor correto), não 5pts — o tier mais alto sempre prevalece.
- **Partida encerrada com placar corrigido oficialmente**: Se o resultado oficial for alterado após o processamento inicial, o sistema deve recalcular os pontos e ajustar o total acumulado do usuário.
- **Partida cancelada após processamento**: Pontos concedidos por resultado de partida posteriormente cancelada devem ser revertidos.
- **Partida sem resultado (adiada para além do torneio)**: Nenhum ponto é creditado; o palpite fica suspenso indefinidamente.
- **Empate com mesmo placar exato**: Predicted 0-0, actual 0-0 → Placar Exato (25pts), não confundir com "empate correto" (10pts).
- **Pontuação total negativa**: Impossível pelo design — o mínimo por partida é 0 pts; não há pontuação negativa.
- **Múltiplas partidas processadas simultaneamente** (fase de grupos — jogos paralelos): O sistema deve garantir que os totais acumulados permanecem consistentes mesmo com processamentos concorrentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST evaluate each match prediction against the final official score using the 5-tier non-cumulative formula, awarding the single highest tier achieved.
- **FR-002**: Tier evaluation order MUST be: (1) Placar Exato → (2) Vencedor + Saldo de Gols → (3) Vencedor ou Empate → (4) Acerto de Gols de um dos times → (5) Erro Total.
- **FR-003**: "Placar Exato" (25pts) MUST be awarded when and only when the predicted home goals AND predicted away goals both exactly match the final score.
- **FR-004**: "Vencedor + Saldo de Gols" (15pts) MUST be awarded when: the predicted match winner matches the actual winner (win only, not draw) AND the predicted goal difference equals the actual goal difference, but the exact score was not predicted correctly.
- **FR-005**: "Vencedor ou Empate" (10pts) MUST be awarded when: the predicted match outcome (home win, away win, or draw) matches the actual outcome, but the exact score and goal difference were not predicted correctly.
- **FR-006**: "Acerto de Gols de um dos times" (5pts) MUST be awarded when: the predicted goal count for exactly one of the two teams matches that team's actual goal count, but the match outcome was predicted incorrectly.
- **FR-007**: "Erro Total" (0pts) MUST be assigned when no higher tier condition is satisfied.
- **FR-008**: The scoring system MUST be non-cumulative: each match awards exactly one tier value — no stacking of multiple tier points.
- **FR-009**: System MUST display on each concluded match card: the user's prediction, the final score, the tier label achieved, and the points awarded.
- **FR-010**: System MUST maintain a running total for each user that is the sum of all match prediction points plus all resolved outright points.
- **FR-011**: Running totals MUST update automatically within 60 seconds of a match result being processed, without user-initiated refresh.
- **FR-012**: System MUST display a progress indicator showing the user's accumulated score as a percentage of the theoretical maximum of 3,130 points.
- **FR-013**: League rankings MUST use the scoring engine totals as the primary sort key, descending.
- **FR-014**: Ranking tiebreaker MUST be resolved first by number of Placar Exato (25-pt) results, then by number of Vencedor + Saldo de Gols (15-pt) results, then by alphabetical display name if still tied.
- **FR-015**: System MUST recalculate and correct a user's points if an official match result is subsequently amended.

### Key Entities

- **MatchResult**: The official final score of a match (home goals, away goals, status: confirmed/amended/cancelled) — the input to the scoring engine.
- **ScoringTier**: An enumerated level in the scoring hierarchy (Placar Exato, Vencedor + Saldo, Vencedor ou Empate, Acerto de Gols, Erro Total) with its associated point value.
- **MatchScore**: The record linking a MatchPrediction to a MatchResult — stores the ScoringTier awarded and points earned for that match.
- **UserTotal**: The user's cumulative score at any point in time — sum of all MatchScores plus resolved OutrightPoints.
- **LeagueRanking**: Ordered list of UserTotals within a league, applying the defined tiebreaker hierarchy.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Points for a concluded match are visible to all users within 60 seconds of the official result being confirmed.
- **SC-002**: The scoring formula produces zero incorrect tier assignments across all combinations of predicted score vs. actual score (verified by exhaustive automated test suite covering all tier boundaries).
- **SC-003**: Running total updates are reflected in the user's panel within 60 seconds of any result being processed, without requiring manual refresh.
- **SC-004**: The theoretical maximum of 3,130 points is achievable: 104 × 25 = 2,600 from match predictions plus 530 from all 8 outrights.
- **SC-005**: 95% of users who view a concluded match card can correctly identify which tier they achieved without needing to consult help documentation.
- **SC-006**: Simultaneous processing of multiple match results (group stage parallel games) produces consistent, correct totals with zero duplicate or missing point awards.
- **SC-007**: When an official match result is corrected, affected user totals are recalculated and updated within 5 minutes of the amendment being registered.

## Assumptions

- "Saldo de Gols" (goal difference) is defined as: (predicted home goals − predicted away goals) equals (actual home goals − actual away goals). The sign matters — a 2-goal home win difference is different from a 2-goal away win difference.
- The "Vencedor + Saldo de Gols" (15pts) tier does NOT apply to draws. A draw always has a goal difference of 0, but the tier is reserved for matches with a declared winner. Correctly predicting a draw earns at most 10pts (or 25pts for exact score).
- Points are non-negative; there is no penalty tier below 0pts.
- The theoretical maximum of 3,130 points is: 104 match predictions × 25pts max = 2,600pts plus all 8 outrights at maximum (100+80+80+70+60+50+50+40 = 530pts).
- Outright points contribute to the user's total in the same running sum as match prediction points.
- Point recalculation on official result amendment applies retroactively to all affected MatchScores and UserTotals.
- The scoring engine processes results idempotently — processing the same result twice does not double-credit points.
- Cancelled matches with no rescheduled date award 0 points; the prediction record is preserved but marked as unresolved.
- Badge triggers (defined in feature 002) are evaluated after the scoring engine assigns points for a match, not before.
