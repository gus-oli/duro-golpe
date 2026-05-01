# Feature Specification: Plataforma de Engajamento Social - Copa do Mundo 2026

**Feature Branch**: `001-copa-2026-platform`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "duro golpe é uma plataforma de engajamento social voltada para a Copa do Mundo de 2026. O sistema permite que usuários criem ligas privadas, realizem palpites em todos os 104 jogos do torneio e participem de apostas especiais (Outrights) antes do início da competição. O foco é em baixa latência, dados em tempo real e experiência mobile-first vibrante."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Palpites nos 104 Jogos (Priority: P1)

Um usuário cadastrado navega pela grade completa dos 104 jogos da Copa do Mundo 2026, seleciona um jogo que ainda não começou e registra seu palpite de placar (ex.: Brasil 2 × 1 Argentina). Ao final do jogo, o sistema calcula e credita os pontos automaticamente com base na precisão do palpite.

**Why this priority**: É a mecânica central da plataforma — sem palpites não existe engajamento, nem pontuação, nem competição em ligas. Toda funcionalidade restante depende deste fluxo.

**Independent Test**: Pode ser validado com um único usuário que cria conta, faz palpite em um jogo de fase de grupos e verifica se recebe pontos após o resultado ser registrado — sem necessidade de ligas ou outrights.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado abre a lista de jogos, **When** seleciona um jogo com status "Agendado" e submete um placar, **Then** o palpite é salvo e exibido no histórico do usuário com confirmação visual imediata.
2. **Given** o horário de início do jogo chegou, **When** o usuário tenta submeter ou editar um palpite, **Then** o sistema recusa a ação e exibe mensagem clara de que o prazo encerrou.
3. **Given** um jogo terminou com placar 2×1, **When** o usuário havia palpitado 2×1, **Then** recebe 3 pontos (exato); se palpitou 3×0, recebe 1 ponto (resultado correto); se palpitou 0×1, recebe 0 pontos.
4. **Given** o usuário acessa a plataforma via smartphone, **When** navega pelos jogos e registra um palpite, **Then** toda a interação é fluida em tela pequena, sem necessidade de zoom ou rolagem horizontal.

---

### User Story 2 - Ligas Privadas com Ranking (Priority: P2)

Um usuário cria uma liga privada, nomeia-a e compartilha o código de convite com amigos. Os convidados entram na liga e todos disputam um ranking baseado nos pontos acumulados ao longo do torneio.

**Why this priority**: A camada social é o principal motor de retenção e viralização — usuários voltam diariamente para checar sua posição no ranking em relação a pessoas que conhecem.

**Independent Test**: Pode ser testado com dois usuários: um cria a liga e convida o segundo; ambos fazem palpites no mesmo jogo e verificam que o ranking reflete corretamente a diferença de pontuação entre eles.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** cria uma liga com nome personalizado, **Then** um código de convite único é gerado e está disponível para compartilhamento.
2. **Given** um usuário com código de convite válido, **When** insere o código, **Then** entra na liga e aparece no ranking com 0 pontos.
3. **Given** membros de uma liga fizeram palpites em jogos já concluídos, **When** o usuário acessa o ranking da liga, **Then** vê todos os membros ordenados por pontuação total, com sua própria posição destacada.
4. **Given** um usuário participa de múltiplas ligas, **When** acessa a tela de ligas, **Then** visualiza ranking e pontuação de cada liga de forma separada e independente.

---

### User Story 3 - Apostas Especiais / Outrights (Priority: P3)

Antes do início da Copa do Mundo, o usuário acessa a seção de Outrights e registra palpites em mercados especiais como "Campeão do Torneio", "Artilheiro" e "Seleção com melhor ataque na fase de grupos". Após o encerramento do torneio, os pontos são creditados automaticamente.

**Why this priority**: Outrights criam engajamento antecipado antes da estreia do torneio. São complementares ao produto principal — elevam a experiência sem serem o núcleo.

**Independent Test**: Pode ser testado isoladamente: usuário acessa os Outrights antes do torneio, seleciona o campeão e, ao final, verifica se recebeu os pontos correspondentes.

**Acceptance Scenarios**:

1. **Given** o torneio ainda não começou, **When** o usuário acessa os Outrights, **Then** visualiza todos os mercados disponíveis com as opções de seleção/jogadores.
2. **Given** o usuário escolhe uma opção em um outright, **When** confirma o palpite, **Then** a seleção é registrada e o prazo de encerramento (horário do primeiro jogo) é exibido claramente.
3. **Given** o primeiro jogo da Copa iniciou, **When** qualquer usuário tenta alterar um outright, **Then** o sistema recusa com mensagem informando que os palpites estão bloqueados.
4. **Given** o torneio encerrou e o campeão foi determinado, **When** o sistema processa os resultados, **Then** usuários que acertaram o outright recebem os pontos correspondentes automaticamente.

---

### User Story 4 - Acompanhamento em Tempo Real (Priority: P4)

Durante um jogo em andamento, o usuário abre a tela da partida e acompanha o placar ao vivo. Ao final da partida, sua pontuação e posição no ranking da liga são atualizadas automaticamente — sem que precise recarregar a tela.

**Why this priority**: A experiência ao vivo é o pico de engajamento da plataforma. Sem atualizações em tempo real, o produto perde o fator "segunda tela" durante as partidas, que é quando o usuário está mais engajado.

**Independent Test**: Pode ser testado com um único usuário acompanhando um jogo ao vivo e verificando que o placar e a pontuação se atualizam sem nenhuma ação manual.

**Acceptance Scenarios**:

1. **Given** um jogo está em andamento, **When** o usuário abre a tela desse jogo, **Then** vê o placar atual atualizado em no máximo 60 segundos após qualquer gol.
2. **Given** um gol é marcado durante um jogo, **When** o sistema recebe o evento, **Then** o placar e os pontos parciais são atualizados na tela sem necessidade de recarregar.
3. **Given** o app está em segundo plano, **When** um gol é marcado em jogo em que o usuário fez palpite, **Then** o usuário recebe uma notificação push com o placar atualizado.
4. **Given** o jogo terminou, **When** o apito final é registrado, **Then** a pontuação definitiva é creditada e o ranking da liga é atualizado em até 60 segundos.

---

### Edge Cases

- Jogo adiado ou cancelado: o sistema sinaliza o novo status e cancela ou suspende palpites existentes, comunicando o usuário.
- Múltiplos jogos simultâneos (fase de grupos): o sistema suporta atualizações paralelas sem degradação ou inconsistências nos rankings.
- Empate de pontuação no ranking: o sistema aplica critério de desempate (número de palpites exatos) e o exibe claramente.
- Perda de conexão durante envio de palpite: o sistema não registra palpites parciais; ao reconectar, o estado correto é exibido.
- Palpite para jogo eliminatório antes das seleções classificadas serem definidas: disponibilizado apenas após confirmação dos classificados.
- Outright sem resultado definido até o fim do torneio (ex.: artilheiro): pontos creditados somente após resultado oficial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register and authenticate via email/password and at least one social login provider (Google or Apple).
- **FR-002**: System MUST display all 104 matches of the 2026 World Cup organized by date, phase, and group.
- **FR-003**: Users MUST be able to submit a score prediction (home goals × away goals) for any match that has not yet kicked off.
- **FR-004**: Users MUST be able to edit their prediction for a match up until the scheduled kickoff time.
- **FR-005**: System MUST lock all predictions for a match at the exact moment of scheduled kickoff.
- **FR-006**: System MUST automatically calculate and award points after a match concludes: 3 points for exact score, 1 point for correct result (win/draw/loss), 0 points otherwise.
- **FR-007**: Users MUST be able to create a private league with a custom name and receive a unique shareable invite code.
- **FR-008**: Users MUST be able to join an existing private league using a valid invite code.
- **FR-009**: System MUST display a ranked leaderboard for each league, automatically updated after every match result.
- **FR-010**: Users MUST be able to participate in multiple leagues simultaneously with independent rankings per league.
- **FR-011**: System MUST offer at least the following Outright markets before tournament start: Tournament Champion, Top Scorer, and Best Group Stage Attack.
- **FR-012**: System MUST lock all Outright predictions at the moment the first match of the tournament kicks off.
- **FR-013**: System MUST display live match scores during games, updated within 60 seconds of a goal event.
- **FR-014**: System MUST send push notifications to users when a goal is scored in a match they predicted.
- **FR-015**: System MUST update league rankings automatically after each match concludes without requiring user action.
- **FR-016**: System MUST be fully functional on mobile form factors (smartphone screens, touch interaction, portrait orientation).
- **FR-017**: System MUST handle multiple simultaneous live matches without score update delays or ranking inconsistencies.

### Key Entities

- **User**: Account holder with profile, total points across all activity, and league memberships.
- **Match**: One of the 104 scheduled games — includes competing teams, phase (group stage/knockout round), kickoff time, and final score.
- **Prediction**: A user's predicted score for a specific match; locked at kickoff; stores points earned post-result.
- **League**: A private competition group with a name, unique invite code, owner, member list, and aggregate leaderboard.
- **LeagueMembership**: Associates a User with a League, tracking their accumulated points within that league.
- **OutrightMarket**: A special prediction category (e.g., Tournament Champion) with a set of selectable options and a resolution date.
- **OutrightPrediction**: A user's selection within an OutrightMarket; locked at tournament start; points awarded on resolution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register, submit their first match prediction, and join a private league within 5 minutes of opening the app for the first time.
- **SC-002**: Leaderboards reflect the outcome of a finished match within 60 seconds of the official final whistle.
- **SC-003**: Live match scores are updated in the app within 60 seconds of a goal being scored.
- **SC-004**: The platform remains fully usable during simultaneous live matches (as in the group stage, where multiple games run in parallel).
- **SC-005**: 90% of users who open the predictions screen successfully submit at least one prediction without needing support.
- **SC-006**: Push notifications for goal events are delivered within 90 seconds of the event occurring.
- **SC-007**: All 104 matches are available for prediction at least 24 hours before their respective kickoff times.
- **SC-008**: The mobile experience requires no horizontal scrolling and renders all content readably on standard smartphone screens.

## Assumptions

- The 2026 FIFA World Cup consists of exactly 104 matches (72 group stage + 32 knockout).
- This is a social, points-based engagement game — no real money or gambling mechanics are involved.
- Match data (schedules, live scores, final results) is sourced from a third-party football data provider at the backend level.
- The scoring system is: 3 points for exact score, 1 point for correct match result (win/draw/loss), 0 points for incorrect result.
- Users may participate in an unlimited number of private leagues simultaneously.
- Outright markets at launch include at minimum: Tournament Champion, Top Scorer, and Best Group Stage Attack; additional markets may be defined before launch.
- Outright points are credited only after the relevant market has an official result (which may occur at tournament end).
- Push notifications require user permission; the platform degrades gracefully for users who deny permission.
- The platform targets Brazilian users primarily; the interface language is Portuguese (Brazil).
- Predictions for knockout stage matches become available only after the participating teams are confirmed following the group stage.
