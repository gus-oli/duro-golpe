## Why

O beta ja validou o nucleo do bolao, mas os feedbacks mostram que a experiencia social ainda pode ficar mais leve, mais viva e mais facil de comparar. Hoje o mural denuncia detalhes tecnicos de polling, a ordem das mensagens nao parece chat, a classificacao ocupa muito espaco, os outrights ainda parecem crus sem bandeiras/fotos, e os usuarios nao conseguem ver os palpites dos amigos para gerar a zoeira que faz o produto girar.

Depois da primeira rodada de implementacao, novos testes reais expuseram um segundo pacote de release blockers e friccoes de uso: friend picks pode retornar erro interno, `/outrights` pode ficar vazio, a navegacao por cards grandes esta pesando nas paginas internas, a home ainda tem atalhos redundantes, e a conta nao permite editar dados basicos nem trocar senha. Esses pontos pertencem a mesma frente porque determinam se a experiencia social polida vira um produto navegavel e confiavel no beta.

## What Changes

- Suavizar a UI com uma paleta menos cinza/branco duro, mantendo o produto leve e esportivo.
- Transformar o mural em uma conversa com mensagens novas embaixo, autoscroll quando apropriado, polling adaptativo e sem label tecnico de intervalo.
- Compactar a classificacao da liga em uma unica superficie subdividida por jogadores.
- Permitir que membros ativos de uma liga vejam palpites de partidas e outrights dos amigos antes e depois do lock, sem textos explicando se ainda pode mudar ou se esta travado.
- Enriquecer os outrights de times com bandeiras e os individuais com fotos de jogadores, usando cache/enriquecimento backend.
- Corrigir qualidade do catalogo de jogadores com uma rede de seguranca de craques provaveis, incluindo Lionel Messi.
- Reduzir fadiga da tela de partidas com controles de densidade, priorizando colapsar secoes de agenda/grupos.
- Corrigir bugs de release em friend picks e `/outrights`, incluindo migracoes/schema esperados, fallback de erro melhor e estados vazios reais.
- Transformar a navegacao autenticada em menu sanduiche/drawer nas paginas internas, mantendo cards grandes apenas no Inicio.
- Remover cards redundantes de Partidas, Ligas, Especiais e Conta das paginas internas.
- Home: remover a secao de Atalhos e expandir Proxima acao com todos os jogos da proxima data.
- `/matches`: trocar os cards de Agenda, Grupos e Resultados por um segmented control compacto em linha unica.
- `/leagues/[leagueId]`: ordenar a composicao como Pontuacao, Classificacao e Mural.
- `/profile`: permitir editar apelido, editar e-mail e trocar senha com validacao de senha atual.

## Capabilities

### New Capabilities
- `league-mural-near-realtime`: mural com comportamento de chat, polling quase realtime e sem exposicao de detalhes tecnicos.
- `league-friend-picks`: visualizacao escopada por liga dos palpites e outrights dos amigos.
- `outright-option-media`: bandeiras, fotos e qualidade de catalogo para opcoes de outrights.
- `league-ranking-density`: classificacao da liga em superficie unica e compacta.
- `match-workbench-density-controls`: controles para reduzir listas longas na tela de partidas.
- `account-profile-management`: endpoints e UI autenticados para dados basicos de conta e troca de senha.

### Modified Capabilities
- `sports-companion-visual-language`: reforca a direcao leve com cores mais amenas e menos contraste cansativo em cards/celulas repetidas.
- `authenticated-product-shell`: substitui navegacao pesada por drawer/menu compacto em paginas internas e preserva cards grandes apenas no hub.
- `connected-matchday-surfaces`: reorganiza home, matches, leagues e outrights para reduzir redundancia e priorizar proxima acao.

## Impact

- Frontend de mural, ligas, ranking, matches e outrights.
- Backend de predictions/outrights para endpoints de leitura social por liga.
- Backend de catalogo/media para fotos de jogadores e bandeiras em opcoes de times.
- Backend de conta para `GET/PATCH /me` e `POST /me/password`.
- Banco de dados para metadados de media/cache, caso a implementacao escolha persistir fotos de jogadores em vez de resolver tudo por catalogo estatico.
- Banco de dados/migracoes para garantir que friend picks, outrights e conta tenham schema consistente em Neon/Render.
- Testes de autorizacao, regressao visual/comportamental e fluxo mobile.
