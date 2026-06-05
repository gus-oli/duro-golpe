## Context

O app ja tem superficies de partidas, especiais, ligas e palpites, mas nao tem uma ferramenta livre para montar a historia completa da Copa. O simulador deve parecer um wallchart interativo: o usuario ordena grupos, escolhe terceiros, ve o Round of 32 montado no chaveamento oficial e clica vencedores ate campeao.

A Copa 2026 aumenta a complexidade porque tem 12 grupos de quatro, 24 classificados automaticos e oito melhores terceiros. O Round of 32 tem slots oficiais publicados pela FIFA, e os terceiros precisam ser alocados pela matriz Annex C de 495 combinacoes. Essa regra deve viver em um modulo de torneio testavel, nao espalhada no componente visual.

## Goals / Non-Goals

**Goals:**
- Criar `/simulador` como superficie propria, sem impacto em palpites oficiais, rankings, locks ou outrights.
- Permitir selecao manual de classificacao dos grupos e dos oito terceiros que avancam.
- Preencher o Round of 32 com os slots oficiais da FIFA, incluindo alocacao de terceiros por Annex C.
- Renderizar um bracket estilo poster/wallchart no desktop e uma experiencia por rodada no mobile.
- Persistir rascunho localmente para o usuario poder sair e voltar sem perder a simulacao.
- Incluir o Simulador na navegacao autenticada quando a rota existir.

**Non-Goals:**
- Calcular classificados por placares, estatisticas ou probabilidades.
- Transformar a simulacao em palpite pontuado do bolao.
- Salvar, publicar ou comparar simulacoes entre membros de liga nesta primeira entrega.
- Declarar o produto como oficial da FIFA; a UI deve comunicar que usa chaveamento oficial da Copa 2026.
- Sincronizar simulacoes entre dispositivos ou usuarios.

## Decisions

### 1. O simulador sera livre e separado do bolao
O estado do simulador ficara separado de `match_predictions`, `outright_predictions`, ranking e locks. O usuario pode montar cenarios impossiveis, trocar classificados e reiniciar sem afetar a competicao principal.

Alternativas consideradas:
- Reaproveitar palpites de partidas para gerar a tabela: mais integrado ao bolao, mas torna a feature dependente de placares e regras de desempate que o usuario nao pediu.
- Criar um mercado especial de campeao por bracket: mais competitivo, mas mudaria regras de pontuacao e lock.

### 2. Grupos serao ordenados manualmente, e terceiros serao escolhidos manualmente
Sem placares, o app nao tem criterio oficial suficiente para descobrir os oito melhores terceiros. A UI deve permitir ordenar cada grupo de 1 a 4 e selecionar exatamente oito terceiros. O app valida a quantidade e so monta o Round of 32 quando houver combinacao valida.

Alternativas consideradas:
- Exigir placares dos 72 jogos de grupos: oficial para tabelas, mas trabalhoso demais para uma experiencia ludica.
- Sempre classificar os oito primeiros terceiros por ordem alfabetica ou ranking FIFA: simples, mas deixaria o simulador fingindo criterio que o usuario nao escolheu.

### 3. A regra FIFA sera um modulo estatico e testado
O bracket devera ter duas camadas de dados:
- slots fixos do Round of 32 e arvore dos jogos 73 a 104;
- lookup Annex C que mapeia cada conjunto valido de oito grupos terceiros para os slots `3A/...`.

O modulo deve expor funcoes puras como `buildRoundOf32(groupRanking, thirdPlaceGroups)` e `advanceWinner(bracketState, matchNumber, teamId)`. Isso deixa a UI focada em interacao e permite cobrir as 495 combinacoes por testes.

Alternativas consideradas:
- Resolver terceiros por heuristica no frontend: rapido para prototipo, mas arriscado e dificil de auditar.
- Buscar a regra dinamicamente em API externa: dependencia desnecessaria, fragil e sem valor em runtime.

### 4. O layout desktop sera um wallchart, mobile sera por rodada
No desktop, a experiencia principal deve ser o poster completo: lados esquerdo/direito, linhas finas, badges circulares com bandeiras, slots pequenos e taca no centro. No mobile, o bracket completo vira uma superficie de scroll horizontal ou uma visualizacao por rodada com controle `Round of 32`, `Oitavas`, `Quartas`, `Semis`, `Final`.

Alternativas consideradas:
- Usar tabela/card por confronto em todos os tamanhos: mais simples, mas perde o encantamento do wallchart.
- Forcar o poster inteiro no mobile sem alternativa: visualmente fiel, mas ruim para toque e leitura.

### 5. Persistencia inicial sera local
O primeiro corte deve salvar o estado em `localStorage` com opcao de reset. Isso entrega utilidade sem nova tabela, migracao ou contrato de compartilhamento. O formato de estado deve ser versionado para permitir evolucao futura para backend.

Alternativas consideradas:
- Persistir no backend desde o inicio: melhor para compartilhamento, mas amplia escopo com autenticacao, CRUD e privacidade.
- Nao persistir nada: simples, mas frustrante em uma simulacao longa.

## Risks / Trade-offs

- **Annex C codificada incorretamente** -> Mitigar com fonte oficial registrada no modulo, testes de contagem das 495 combinacoes e casos conhecidos dos slots FIFA.
- **Usuario nao entende por que precisa escolher terceiros** -> Mitigar com passo dedicado "Terceiros" e bloqueio claro ate selecionar exatamente oito.
- **Bracket fica bonito mas dificil de usar no mobile** -> Mitigar com experiencia por rodada e alvos de toque grandes, mantendo o poster completo como modo alternativo.
- **Dados de grupos incompletos no ambiente demo/provider** -> Mitigar com fallback para `teams.groupLetter` e estado vazio que explica quando a Copa ainda nao tem selecoes/grupos suficientes.
- **Rota nova vira navegacao fantasma** -> Mitigar adicionando `Simulador` ao shell somente junto com a superficie real.

## Migration Plan

1. Adicionar modulo de torneio com grupos, slots do Round of 32, arvore de mata-mata e lookup Annex C.
2. Criar rota `/simulador` com carregamento dos times/grupos e estado local versionado.
3. Implementar etapas de grupos, terceiros e bracket, com validacoes antes de avancar.
4. Integrar a rota ao shell autenticado e a qualquer home/drawer de destinos principais.
5. Cobrir regras do modulo com testes unitarios e o fluxo principal com testes de UI.

Rollback: a feature e isolada. Remover o link do shell desativa a descoberta sem afetar partidas, especiais, ligas ou rankings.

## Open Questions

- O simulador deve ficar acessivel tambem para usuarios deslogados ou apenas dentro do app autenticado?
- O poster completo no mobile deve ser uma visualizacao alternativa sempre disponivel ou apenas desktop/tablet?
- O primeiro corte deve incluir export/share de imagem, ou isso fica para uma change social posterior?
