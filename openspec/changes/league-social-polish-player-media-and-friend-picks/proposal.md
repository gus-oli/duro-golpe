## Why

O beta ja validou o nucleo do bolao, mas os feedbacks mostram que a experiencia social ainda pode ficar mais leve, mais viva e mais facil de comparar. Hoje o mural denuncia detalhes tecnicos de polling, a ordem das mensagens nao parece chat, a classificacao ocupa muito espaco, os outrights ainda parecem crus sem bandeiras/fotos, e os usuarios nao conseguem ver os palpites dos amigos para gerar a zoeira que faz o produto girar.

## What Changes

- Suavizar a UI com uma paleta menos cinza/branco duro, mantendo o produto leve e esportivo.
- Transformar o mural em uma conversa com mensagens novas embaixo, autoscroll quando apropriado, polling adaptativo e sem label tecnico de intervalo.
- Compactar a classificacao da liga em uma unica superficie subdividida por jogadores.
- Permitir que membros ativos de uma liga vejam palpites de partidas e outrights dos amigos antes e depois do lock, sem textos explicando se ainda pode mudar ou se esta travado.
- Enriquecer os outrights de times com bandeiras e os individuais com fotos de jogadores, usando cache/enriquecimento backend.
- Corrigir qualidade do catalogo de jogadores com uma rede de seguranca de craques provaveis, incluindo Lionel Messi.
- Reduzir fadiga da tela de partidas com controles de densidade, priorizando colapsar secoes de agenda/grupos.

## Capabilities

### New Capabilities
- `league-mural-near-realtime`: mural com comportamento de chat, polling quase realtime e sem exposicao de detalhes tecnicos.
- `league-friend-picks`: visualizacao escopada por liga dos palpites e outrights dos amigos.
- `outright-option-media`: bandeiras, fotos e qualidade de catalogo para opcoes de outrights.
- `league-ranking-density`: classificacao da liga em superficie unica e compacta.
- `match-workbench-density-controls`: controles para reduzir listas longas na tela de partidas.

### Modified Capabilities
- `sports-companion-visual-language`: reforca a direcao leve com cores mais amenas e menos contraste cansativo em cards/celulas repetidas.

## Impact

- Frontend de mural, ligas, ranking, matches e outrights.
- Backend de predictions/outrights para endpoints de leitura social por liga.
- Backend de catalogo/media para fotos de jogadores e bandeiras em opcoes de times.
- Banco de dados para metadados de media/cache, caso a implementacao escolha persistir fotos de jogadores em vez de resolver tudo por catalogo estatico.
- Testes de autorizacao, regressao visual/comportamental e fluxo mobile.
