## Context

Hoje a superficie `/matches` funciona bem como agenda e descoberta, mas o fluxo principal de palpites continua preso ao match detail. Isso cria atrito quando o usuario quer fechar varias apostas da rodada ou revisar a fase de grupos inteira. Ao mesmo tempo, o backend ja possui contratos individuais maduros de prediction, o provider ja entrega metadados como stage/group/venue, e o produto ja tem um shell autenticado forte para sustentar uma superficie de trabalho mais densa.

Essa change cruza frontend de partidas, rotas de prediction e o contrato de match detail. Ela tambem toca performance e hosted-beta behavior, porque a pagina de partidas deixa de ser apenas leitura cacheada e passa a ser uma superficie de interacao frequente com estado local.

## Goals / Non-Goals

**Goals:**
- Transformar `/matches` em uma superficie primaria de trabalho com abas `Agenda`, `Grupos` e `Resultados`.
- Permitir editar varios palpites sem sair da lista, com salvamento em lote e feedback claro por partida.
- Reposicionar o match detail como superficie de contexto e acompanhamento, mostrando venue e outros metadados oficiais disponiveis.
- Preservar compatibilidade com o fluxo atual de prediction individual para detail e chamadas existentes.

**Non-Goals:**
- Criar palpites de classificacao final por grupo.
- Introduzir timeline rica de eventos da partida se o provider/plano atual nao entregar esses dados.
- Remover os endpoints individuais de prediction.
- Refatorar ligas, especiais ou ranking fora do necessario para integrar o novo workbench.

## Decisions

### 1. `/matches` vira um workbench de tres visoes sobre o mesmo dataset
Usaremos tabs `Agenda`, `Grupos` e `Resultados` em uma unica rota, em vez de novas paginas irmas. Isso preserva discoverability, mantem o usuario no loop principal e reduz navegacao desnecessaria.

Alternativas consideradas:
- Criar rotas separadas (`/matches`, `/groups`, `/results`): melhora isolamento, mas fragmenta demais a descoberta.
- Manter so a agenda e empurrar o resto para filtros secundarios: mais simples, mas deixa a visao por grupo e resultados escondida.

### 2. O salvamento em lote sera nativo no backend
Vamos adicionar um endpoint batch dedicado para predictions, com semantica de upsert por `(userId, matchId)`. Isso modela melhor a intencao do usuario de "fechar uma leva de palpites" e evita transformar o frontend em um orquestrador fragil de dezenas de requests isoladas.

Alternativas consideradas:
- `Promise.allSettled` no frontend com endpoints individuais: mais rapido de hackear, mas pior para observabilidade, retriable errors e semantica de produto.
- Endpoint batch atomico tudo-ou-nada: mais simples de raciocinar, mas pior para UX quando uma partida trava e bloqueia o resto.

### 3. O endpoint batch retorna sucesso parcial por item
Uma acao de salvar em lote nao deve falhar inteira porque uma partida passou para `LOCKED` ou porque um item esta invalido. A resposta devera separar itens salvos e itens falhos, permitindo que a UI mantenha apenas os cards problematicos em estado de erro/pending.

Alternativas consideradas:
- Falha global da requisicao ao primeiro erro: simples, mas frustra o usuario.
- Ignorar silenciosamente itens invalidos: perigoso e confuso.

### 4. O frontend mantera um draft map local e um CTA global sticky
O estado de alteracao sera gerenciado em nivel de pagina, com comparacao entre prediction existente e valor editado. Isso permite mostrar contador de mudancas pendentes, resumo de salvamento e estados por card (`editado`, `salvando`, `salvo`, `erro`) sem precisar de um formulario gigante ou submit por jogo.

Alternativas consideradas:
- Botao de salvar em cada card: simples, mas reintroduz a friccao jogo a jogo.
- Autosave agressivo: parece fluido, mas cria mais risco operacional e ambiguidade de lock.

### 5. `Resultados` sera uma visao por agenda e `Grupos` sera uma visao de trabalho da fase de grupos
A aba `Resultados` continuara agrupada por data, porque o consumo de resultados e temporal. A aba `Grupos` usara o mesmo conjunto de partidas, mas organizada por `stage/group` para facilitar o fechamento da fase de grupos sem exigir navegacao por detalhe.

### 6. O match detail vira contexto, nao gargalo
O match detail continuara suportando prediction individual, mas seu papel principal passa a ser exibir contexto oficial e acompanhamento: venue, stage/group, score/status e links sociais. Quando houver metadado oficial no provider/schema atual, ele deve ser mostrado ali.

### 7. A superficie autenticada de trabalho deve priorizar frescor sobre cache longo
Como `/matches` vira uma pagina de acao, o design assume que a experiencia autenticada nao pode depender de um `revalidate` longo. A implementacao pode seguir por `no-store` ou por uma politica diferenciada para usuarios autenticados, mas o comportamento esperado e evitar stale status/predictions durante a edicao.

## Risks / Trade-offs

- **Mais densidade na tela de partidas** → Mitigacao: inputs inline so para jogos `SCHEDULED`, cards finalizados/lives permanecem mais leves.
- **Erros parciais no batch podem confundir** → Mitigacao: resposta estruturada por item e resumo visivel de sucesso/falha.
- **Risco de stale data na pagina principal** → Mitigacao: reduzir/remover cache longo da experiencia autenticada e refrescar apos save.
- **A complexidade de estado local aumenta** → Mitigacao: centralizar draft map e status por match em um unico controller/cliente da pagina.
- **Provider pode nao expor eventos ricos** → Mitigacao: detail usa venue/contexto garantidos hoje e trata eventos granulares como enhancement opcional.

## Migration Plan

1. Introduzir o endpoint batch e testes de compatibilidade com predictions individuais.
2. Refatorar `/matches` para um container cliente com tabs, agrupamentos e draft state.
3. Migrar os cards de jogos `SCHEDULED` para inline editing com CTA global sticky.
4. Ajustar a aba `Resultados` e enriquecer o match detail com venue/contexto provider-backed.
5. Validar a experiencia em mobile e hosted free beta antes de trocar o fluxo principal.

Rollback: manter os endpoints individuais ativos permite desabilitar a UI batch sem quebrar o restante do produto, caso a experiencia nova apresente regressao.

## Open Questions

- A barra sticky de salvar deve operar sobre "todas as alteracoes da pagina" ou apenas sobre a secao/aba atual?
- A aba `Grupos` deve esconder fases de mata-mata ou mostrar apenas os cards de grupos quando esse modo estiver ativo?
- Vale exibir um pequeno resumo do palpite salvo na aba `Resultados` para comparacao rapida com o placar oficial?
