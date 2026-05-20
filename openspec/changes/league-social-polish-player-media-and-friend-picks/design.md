## Overview

Esta change junta polimento visual e social porque eles se reforcam: a tela precisa ficar menos cansativa para uso diario e o loop social precisa ser facil de acessar. O foco e beta privada, entao a solucao privilegia simplicidade operacional, pouca dependencia externa em tempo de pagina e regras de privacidade por liga.

## Decisions

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

## Risks

- Fotos externas podem quebrar ou mudar URL; por isso precisa de fallback e cache.
- API-Football tem limite/custo; enriquecimento deve ser offline/manual ou job controlado, nunca por renderizacao de pagina.
- Ver palpites antes do lock aumenta o fator social, mas tambem muda a estrategia do bolao; aqui isso e uma escolha explicita do produto.
- Polling rapido demais pode bater no backend gratuito. O design precisa equilibrar sensacao de realtime com degradacao inteligente.
