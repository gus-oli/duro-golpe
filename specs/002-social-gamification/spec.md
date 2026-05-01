# Feature Specification: Gamificação Social e Mecânicas Detalhadas de Apostas

**Feature Branch**: `002-social-gamification`
**Created**: 2026-04-28
**Status**: Draft
**Input**: Requisitos funcionais detalhados cobrindo Match Cards (trava 15min), Outrights categorizados com pontuações, Mural de Resenha e sistema de Badges automáticos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Palpites via Match Cards com Trava de 15 Minutos (Priority: P1)

O usuário acessa a lista de partidas exibida como cards visuais responsivos. Cada card mostra as bandeiras das seleções, horário local da partida e campos de entrada grandes para o placar (Home × Away). O usuário submete seu palpite e o sistema confirma o registro. Palpites são bloqueados automaticamente 15 minutos antes do início de cada partida (horário UTC).

**Why this priority**: É o mecanismo central de jogo. A qualidade da interface (Match Cards) determina a taxa de engajamento — inputs grandes e claros reduzem fricção e aumentam a taxa de conclusão de palpites.

**Independent Test**: Pode ser validado com um único usuário que acessa os cards, submete um palpite e verifica que: (1) o palpite foi salvo; (2) o card fica bloqueado exatamente 15 min antes do kickoff UTC; (3) a interface funciona bem em smartphone.

**Acceptance Scenarios**:

1. **Given** o usuário abre a tela de partidas, **When** visualiza os cards, **Then** cada card exibe as bandeiras das duas seleções, os nomes das equipes, o horário local da partida e dois inputs numéricos grandes para o placar Home e Away.
2. **Given** faltam mais de 15 minutos para o kickoff (UTC), **When** o usuário insere um placar e confirma, **Then** o palpite é salvo e o card exibe a previsão registrada com confirmação visual imediata.
3. **Given** faltam 15 minutos ou menos para o kickoff (UTC), **When** o usuário tenta editar ou submeter um palpite, **Then** os inputs ficam desabilitados, o card exibe status "Bloqueado" e uma mensagem informa o encerramento do prazo.
4. **Given** o usuário ainda não fez palpite em uma partida disponível, **When** visualiza o card, **Then** o card destaca visualmente que o palpite está pendente (ex.: borda colorida ou indicador de "Palpite pendente").

---

### User Story 2 - Apostas Especiais com Outrights Categorizados (Priority: P2)

Antes do início do torneio, o usuário acessa a seção de Outrights e encontra 8 mercados categorizados, cada um com sua pontuação em destaque. Para cada mercado, o usuário seleciona uma opção (seleção, jogador ou resultado) e confirma. A janela de apostas fecha 1 hora antes do jogo de abertura; após esse horário, nenhuma seleção pode ser alterada.

**Why this priority**: Os Outrights criam comprometimento de longo prazo desde antes da estreia. As pontuações diferenciadas incentivam os usuários a apostarem em mercados mais difíceis por maior recompensa.

**Independent Test**: Pode ser validado com um usuário que acessa os Outrights antes do torneio, seleciona opções em todos os 8 mercados, e verifica que: (1) seleções foram salvas; (2) prazo é exibido; (3) após o horário de corte, as seleções ficam travadas.

**Acceptance Scenarios**:

1. **Given** a janela de Outrights está aberta, **When** o usuário acessa a seção, **Then** vê os 8 mercados com pontuações em destaque: Campeão (100pts), Artilheiro (80pts), Bola de Ouro (80pts), Finalistas (70pts), Zebra (60pts), Revelação (50pts), Ataque + Positivo (50pts) e Lanterna (40pts).
2. **Given** o usuário seleciona uma seleção para o mercado "Campeão", **When** confirma, **Then** o card do mercado exibe a opção escolhida e o contador regressivo até o encerramento da janela.
3. **Given** falta 1 hora ou menos para o jogo de abertura, **When** o usuário tenta alterar qualquer outright, **Then** todos os mercados ficam bloqueados e exibem o horário de encerramento da janela.
4. **Given** o torneio encerrou e o campeão foi definido, **When** o sistema processa o resultado do mercado "Campeão", **Then** os usuários que selecionaram a seleção correta recebem automaticamente 100 pontos.

---

### User Story 3 - Mural de Resenha por Partida e Liga (Priority: P3)

Durante e após cada partida, os membros de uma liga privada acessam o Mural de Resenha daquela partida e publicam comentários — trash talk, reações a gols, provocações ao rival que palpitou errado. O feed é isolado por liga: cada liga tem seu próprio Mural por partida, visível somente a seus membros.

**Why this priority**: O Mural é o diferencial social da plataforma — transforma apostas individuais em experiência de grupo, aumentando retenção e frequência de acesso durante as partidas.

**Independent Test**: Pode ser testado com dois membros da mesma liga abrindo o Mural da mesma partida, um publicando um comentário e o outro visualizando o feed atualizado — sem que um terceiro usuário de outra liga veja esses comentários.

**Acceptance Scenarios**:

1. **Given** um membro de uma liga acessa a tela de uma partida, **When** abre o Mural de Resenha, **Then** vê o feed de comentários exclusivo da sua liga para aquela partida (vazio se ninguém comentou ainda).
2. **Given** o usuário digita um comentário e publica, **When** a publicação é confirmada, **Then** o comentário aparece no feed com nome do usuário, avatar e horário da postagem.
3. **Given** um usuário que não é membro de uma liga, **When** tenta acessar o Mural dessa liga, **Then** o sistema nega o acesso e não exibe os comentários.
4. **Given** um usuário pertence a duas ligas diferentes, **When** acessa o Mural da mesma partida, **Then** vê feeds separados — um por liga — sem mistura de comentários entre elas.

---

### User Story 4 - Badges Automáticos de Gamificação (Priority: P4)

O sistema monitora o histórico de palpites de cada usuário e concede badges automaticamente quando critérios predefinidos são atingidos. Os badges aparecem no perfil do usuário e são visíveis aos membros das mesmas ligas, adicionando camadas de identidade e status ao jogo.

**Why this priority**: Badges criam narrativas pessoais ("Eu sou o Zebra Hunter da minha liga") e motivam comportamentos específicos — acertar mais palpites, explorar partidas de azarão, manter consistência.

**Independent Test**: Pode ser testado isoladamente: simular um usuário que acerta 5 palpites de resultado consecutivos e verificar se o badge "O Mestre" é atribuído automaticamente e exibido no perfil.

**Acceptance Scenarios**:

1. **Given** um usuário acerta 5 ou mais palpites de resultado (vitória/empate/derrota) consecutivos, **When** o sistema processa o último resultado, **Then** o badge "O Mestre" é automaticamente atribuído ao perfil do usuário.
2. **Given** um usuário erra 5 ou mais palpites de resultado consecutivos, **When** o sistema processa o último resultado, **Then** o badge "Pé Frio" é atribuído ao perfil.
3. **Given** um usuário palpita corretamente no resultado de uma partida classificada como zebra (favorito derrota para azarão), **When** o sistema confirma o resultado, **Then** o badge "Zebra Hunter" é atribuído (ou o contador de zebrafs acertadas no perfil é incrementado).
4. **Given** um usuário tem badges atribuídos, **When** membros de sua liga acessam o ranking, **Then** os badges são exibidos ao lado do nome do usuário no ranking da liga.

---

### Edge Cases

- Partida remarcada: o prazo de 15 minutos recalcula com base no novo horário UTC; palpites já registrados permanecem válidos para a nova data.
- Palpite submetido exatamente em T-15min: o sistema aplica o corte com base em UTC sem tolerância de segundos extras.
- Dois Outrights dependentes de resultado final do torneio (Campeão, Finalistas): ambos devem ser processados em sequência após a final — sem conflito de pontuação.
- Comentário no Mural enviado com perda de conexão: sem registro parcial ou duplicado; ao reconectar, o usuário vê o estado real do feed.
- Usuário removido de liga: seus comentários no Mural daquela liga são mantidos como registros históricos.
- Badge "Pé Frio" e "O Mestre" coexistem no mesmo perfil de momentos diferentes: ambos devem ser exibidos simultaneamente sem conflito.
- Partida cancelada com palpite registrado: o palpite não gera pontos nem é invalidado — aguarda resolução por data reprogramada ou anulação manual.
- Critério de "zebra" não determinável automaticamente: o sistema depende de fonte externa de odds ou ranking FIFA para classificar favorito vs. azarão de cada partida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to view all matches as Match Cards displaying team flags, team names, local kickoff time, and large score input fields for Home and Away goals.
- **FR-002**: Match Cards MUST provide touch-friendly, large numeric input controls optimized for one-handed mobile interaction.
- **FR-003**: System MUST accept score predictions for any match where kickoff is more than 15 minutes away (UTC reference).
- **FR-004**: System MUST automatically lock predictions for each match at exactly T-15 minutes before its scheduled kickoff (UTC), disabling inputs and displaying a visual lock state on the card.
- **FR-005**: Match Cards MUST visually distinguish between four states: prediction pending, prediction submitted, prediction locked, and match concluded.
- **FR-006**: System MUST offer exactly 8 Outright markets with the following point values: Campeão (100pts), Artilheiro (80pts), Bola de Ouro (80pts), Finalistas (70pts), Zebra (60pts), Revelação (50pts), Ataque + Positivo (50pts), and Lanterna (40pts).
- **FR-007**: System MUST lock all 8 Outright markets simultaneously, exactly 1 hour before the tournament's opening match kickoff time (UTC).
- **FR-008**: Each Outright market card MUST display a countdown to the lock deadline and the point value of the market.
- **FR-009**: System MUST award Outright points automatically after each market's result is officially confirmed.
- **FR-010**: Users MUST be able to post text comments in a Mural de Resenha that is scoped per-match and per-league (each league has its own Mural per match).
- **FR-011**: Mural de Resenha feeds MUST be isolated per league — members of one league MUST NOT be able to read another league's Mural.
- **FR-012**: Users belonging to multiple leagues MUST be able to access each league's Mural for the same match independently.
- **FR-013**: System MUST automatically award the "O Mestre" badge when a user correctly predicts the result (win/draw/loss) of 5 or more consecutive matches.
- **FR-014**: System MUST automatically award the "Pé Frio" badge when a user incorrectly predicts the result of 5 or more consecutive matches.
- **FR-015**: System MUST automatically award the "Zebra Hunter" badge when a user correctly predicts the result of a match where the lower-ranked or underdog team wins, based on a pre-defined classification source (FIFA ranking or pre-match odds).
- **FR-016**: Badges MUST be displayed on user profiles and visible to other members in shared league ranking views.
- **FR-017**: The badge system MUST be designed to support additional badge types in future releases without requiring changes to core badge awarding logic.

### Key Entities

- **MatchCard**: Visual and interactive representation of a Match, carrying its prediction state, lock status, and user's submitted score.
- **MatchPrediction**: A user's predicted Home × Away score for a specific match; immutable after lock; stores points earned post-result.
- **OutrightMarket**: One of 8 tournament-level prediction categories — has a name, point reward, list of selectable options, lock deadline, and resolution status.
- **OutrightPrediction**: A user's selection in an OutrightMarket; locked at T-1h before opening match.
- **MuralPost**: A text comment posted by a user in the Mural de Resenha of a specific match within a specific league.
- **Badge**: An achievement type with defined award criteria and point context (type: O Mestre, Pé Frio, Zebra Hunter, extensible).
- **UserBadge**: Record linking a User to a Badge, including the award date and triggering event.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view, select, and submit a score prediction on a Match Card within 20 seconds of opening the match list.
- **SC-002**: Predictions are locked with zero tolerance for late submissions — no prediction submitted at or after T-15min UTC is accepted.
- **SC-003**: All 8 Outright markets are available and selectable by all registered users at least 48 hours before the opening match.
- **SC-004**: All 8 Outright markets lock simultaneously for all users within a 5-second window of the 1-hour deadline.
- **SC-005**: Mural de Resenha comments appear for all league members within 5 seconds of submission.
- **SC-006**: Badges are awarded automatically within 60 seconds of the qualifying event being processed.
- **SC-007**: Match Card layout renders correctly on smartphones with screens 360px wide or wider, with no horizontal scrolling and no overlapping elements.
- **SC-008**: 85% of users who open the Outrights section complete at least 3 of the 8 available markets before the lock deadline.

## Assumptions

- The 15-minute lock is calculated exclusively in UTC; the UI displays kickoff times in the user's detected local timezone for readability, but all lock enforcement uses UTC.
- The Outright market "Zebra" is defined as: selecting a team classified as an underdog (lower FIFA ranking or marked as underdog in a pre-match odds feed) that advances further in the tournament than expected. The precise qualification threshold will be refined before launch.
- The Outright market "Lanterna" is defined as: the team eliminated in the group stage with the fewest points (using goal difference as tiebreaker if needed).
- The Outright market "Ataque + Positivo" is defined as: the team that scores the most goals across all matches in which it participates.
- The Outright market "Revelação" is defined as: predicting the individual player who will be recognized as the tournament's breakout/revelation player by the official FIFA award.
- For the "Finalistas" Outright (70pts): users must predict both finalists correctly to earn the full 70 points — all-or-nothing; partial credit for one correct finalist is not awarded in v1.
- The Mural de Resenha does not include automated content moderation in v1; a user-initiated reporting mechanism for offensive content may be added in a future release.
- Mural posts are text-only in v1; emoji characters are supported as text; images and GIFs are out of scope.
- Badge criteria are versioned at launch and awarded badges are never retroactively revoked.
- The "O Mestre" and "Pé Frio" badges are based on consecutive correct/incorrect result predictions (win/draw/loss), not on exact score accuracy.
- The badge catalog starts with 3 types and is architected to be extended without changes to the core badge-awarding mechanism.
- Users removed from a league retain their Mural posts as historical records in that league's feed.
