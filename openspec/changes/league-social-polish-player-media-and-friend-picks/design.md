## Overview

Esta change junta polimento visual e social porque eles se reforcam: a tela precisa ficar menos cansativa para uso diario e o loop social precisa ser facil de acessar. O foco e beta privada, entao a solucao privilegia simplicidade operacional, pouca dependencia externa em tempo de pagina e regras de privacidade por liga.

O segundo pacote desta change trata o feedback de uso real como estabilizacao do produto, nao como nova feature solta. A prioridade e remover quebras de confianca antes de ampliar escopo: friend picks nao pode virar erro interno, `/outrights` nao pode parecer um produto vazio por falha de schema/dados, e as paginas internas precisam parar de repetir navegacao pesada quando o usuario ja esta dentro do app.

## Decisions

### Bugs de release entram antes do polimento visual

Friend picks e `/outrights` devem ser tratados como bloqueadores da experiencia social. Antes de recompor a UI, a implementacao deve confirmar migracoes, contratos de DTO e queries dos endpoints que estao falhando em producao. O comportamento esperado para erro nao e uma pagina quebrada: APIs autenticadas devem retornar erros escopados e logs acionaveis, enquanto o frontend mostra estados vazios somente quando nao ha dados reais para exibir.

Para `/outrights`, mercados configurados devem continuar visiveis ate suas regras de lock fecharem a interacao. Uma falha de media, foto, bandeira ou opcao invalida nao deve derrubar o mercado inteiro. Se uma migration adicionou campos opcionais de media, o rollout precisa garantir que Neon/Render estejam alinhados antes do frontend depender desses campos.

### Friend picks ficam visiveis antes do lock

Membros ativos de uma mesma liga poderao ver palpites de partidas e escolhas de outrights uns dos outros antes e depois do lock. Isso e intencional para estimular brincadeira, provocacao e comparacao. A tela nao deve exibir texto explicando "ainda pode mudar" ou "esta travado"; essa regra ja pertence ao produto e nao precisa ser repetida no componente social.

O backend deve validar escopo por liga antes de retornar qualquer palpite social. O usuario so ve dados de membros ativos da liga em que ele tambem esta ativo. Usuarios fora da liga recebem erro de autorizacao ou resposta vazia apropriada.

### Mural usa polling adaptativo com cara de realtime

Como a stack gratuita nao garante websocket estavel, o mural deve funcionar bem por polling:

- Mensagens ordenadas do mais antigo para o mais novo, com novas mensagens entrando embaixo.
- Autoscroll somente quando o usuario ja esta perto do fim da conversa.
- Se o usuario estiver lendo mensagens antigas, novas mensagens devem acumular em um affordance discreto para "ver novas mensagens".
- Polling rapido enquanto a aba esta ativa e o usuario esta no fim da conversa.
- Boost temporario depois que o usuario posta.
- Intervalo maior ou pausa quando a aba esta oculta ou o usuario esta longe do fim.
- Busca incremental por cursor/createdAt/id quando viavel, evitando recarregar o feed completo em todo tick.
- Nenhum texto tecnico como "polling 15s" deve aparecer na UI.

### Outright media vem de cache backend

O frontend nao deve chamar API-Football diretamente nem expor token. Fotos de jogadores devem ser enriquecidas por job/script backend, persistidas ou geradas em catalogo cacheado, e servidas pela API do proprio app. A tela usa fallback visual quando nao houver foto.

Para times, opcoes de outrights devem usar dados locais de time para exibir bandeira. Mercados de times nao devem listar placeholders de mata-mata como `R1603B` ou "A definir"; esse tipo de valor nao e time real.

### Catalogo individual tem rede de seguranca

Enquanto convocacoes finais ainda mudam, o catalogo individual deve combinar fontes oficiais/pre-listas com uma curated shortlist de craques provaveis. Jogadores obvios de mercados como bola de ouro e artilheiro, como Lionel Messi, devem estar pesquisaveis mesmo antes de uma lista final, com metadado de confianca/source para evitar confundir com convocacao oficial.

### Ranking vira superficie unica

A classificacao da liga deve trocar uma card por usuario por uma unica superficie com linhas subdivididas. Em desktop, a linha pode parecer tabela compacta. Em mobile, precisa continuar escaneavel com hierarquia clara: posicao, usuario, pontos e pequenos indicadores.

### Matches usa densidade controlada

A tela de partidas ja virou workbench. Para nao virar parede de jogos na fase de grupos, a primeira solucao deve ser colapsar secoes de agenda e grupos. Um seletor de quantidade por pagina pode ficar como melhoria opcional se o collapse nao resolver bem em mobile.

### Navegacao autenticada vira drawer nas paginas internas

Cards grandes de Partidas, Ligas, Especiais e Conta ajudam no Inicio, mas atrapalham quando repetidos dentro de Partidas, Liga, Especiais e Conta. A regra nova e simples: o hub pode usar cards grandes para orientar; paginas internas usam menu sanduiche/drawer ou uma navegacao compacta equivalente.

O drawer deve ser acessivel por teclado, fechar ao navegar, indicar a rota ativa e incluir as rotas principais: Inicio, Partidas, Ligas, Especiais e Conta. Em desktop, ele pode conviver com um header compacto; em mobile, ele substitui qualquer grade de cards recorrente.

### Home prioriza proxima data, nao atalhos redundantes

A secao de Atalhos perde valor quando os cards principais ja levam para os mesmos lugares. A home deve usar esse espaco para a Proxima acao: todos os jogos da proxima data relevante, com status, horario e caminho direto para palpitar ou revisar.

Isso melhora o comportamento do usuario que entra no app para resolver "o que eu preciso fazer agora" sem precisar abrir partida por partida ou adivinhar onde existe pendencia.

### Paginas internas seguem hierarquia por tarefa

`/matches` deve trocar abas grandes por um segmented control em linha unica: Agenda, Grupos e Resultados. A tela de resultados continua agenda-first.

`/leagues/[leagueId]` deve priorizar Pontuacao, depois Classificacao, depois Mural. Partidas, Especiais e Conta saem dali como cards porque passam a estar no drawer.

`/outrights` tambem remove cards redundantes de navegacao, mantendo foco em mercados, busca e comparacao social.

### Conta vira mini-capability propria

`/profile` deixa de ser apenas destino de shell e passa a resolver necessidades basicas de usuario:

- editar apelido/nome exibido
- editar e-mail, com erro claro para e-mail duplicado
- trocar senha exigindo senha atual

O backend deve expor endpoints autenticados `GET /me`, `PATCH /me` e `POST /me/password`. A troca de senha usa hash atual, invalida entradas invalidas sem vazar detalhes sensiveis, e nao exige servico externo de e-mail.

## Risks

- Fotos externas podem quebrar ou mudar URL; por isso precisa de fallback e cache.
- API-Football tem limite/custo; enriquecimento deve ser offline/manual ou job controlado, nunca por renderizacao de pagina.
- Ver palpites antes do lock aumenta o fator social, mas tambem muda a estrategia do bolao; aqui isso e uma escolha explicita do produto.
- Polling rapido demais pode bater no backend gratuito. O design precisa equilibrar sensacao de realtime com degradacao inteligente.
- Drawer ruim pode esconder demais a navegacao; por isso o Inicio continua com cards grandes e paginas internas precisam indicar rota ativa.
- Editar e-mail sem verificacao por e-mail e aceitavel para beta privada, mas exige validacao de duplicidade e mensagens claras para nao quebrar login.
