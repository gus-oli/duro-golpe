## Why

Os cards de partidas ja concentram o principal ritual do produto, mas ainda nao mostram o pulso social da rodada: como a liga esta enxergando cada jogo. Transformar palpites agregados em odds sociais cria contexto competitivo sem depender de casas de aposta e tambem resolve o criterio de `Zebra Hunter` com uma regra interna, auditavel e divertida.

## What Changes

- Calcular odds sociais por partida a partir dos palpites de resultado: mandante, empate e visitante.
- Congelar um snapshot das odds sociais no lock da partida para evitar que mudancas tardias alterem a narrativa ou a premiacao.
- Exibir odds sociais de forma compacta nos cards/listas de partidas e com mais contexto no detalhe da partida.
- Usar o snapshot congelado para classificar uma previsao correta como zebra quando o desfecho escolhido tinha baixa adesao social.
- Refinar `Zebra Hunter` para premiar apenas usuarios que acertarem o desfecho da zebra, nao apenas pontuarem por gol parcial.
- Nao integrar odds reais, casas de aposta, provedores pagos, apostas financeiras ou qualquer fluxo externo de betting.

## Capabilities

### New Capabilities
- `social-match-odds`: Define calculo, congelamento, exposicao e uso das odds sociais de partidas, incluindo a qualificacao de zebras para badges.

### Modified Capabilities
- None.

## Impact

- Backend: agregacao de palpites por partida, persistencia ou materializacao de snapshots congelados, DTOs de partidas, avaliacao de badges e testes de scoring/badges.
- Banco de dados: nova estrutura provavel para snapshots de odds sociais por partida e desfecho, com contagem total e porcentagens congeladas.
- Frontend: cards de partidas, mesa de trabalho de partidas e detalhe da partida passam a renderizar odds sociais em estados seguros.
- Realtime: pode reutilizar o refresh/polling existente para partida; atualizacao em tempo real das odds antes do lock e opcional, nao requisito inicial.
- Operacao: nenhum provider externo novo; a regra deve funcionar com os palpites ja armazenados no sistema.
