## Why

Os mercados especiais individuais ainda dependem de listas estaticas em codigo, entao sempre faltam jogadores e cada ajuste exige editar seed/catalogo manualmente. Com o beta ganhando usuarios reais, jogadores precisam virar dado de produto: pesquisavel, atualizavel, enriquecido por provider e seguro contra mudancas de convocacao.

## What Changes

- Criar uma base persistida de jogadores, separada das opcoes de outright.
- Criar uma camada de candidatos por mercado, ligando jogadores a mercados como Artilheiro, Bola de Ouro e Revelacao.
- Manter `outright_options` como a entidade usada por palpites existentes, mas alimentada/sincronizada a partir da base de jogadores.
- Suportar fontes e confianca por jogador/candidato: `OFFICIAL`, `PRELIMINARY`, `LIKELY`, `PROVIDER` e `INACTIVE`.
- Adicionar import inicial curado para craques e nomes obvios, sem depender de API paga ou temporada 2026 bloqueada.
- Usar API-Football como enriquecimento controlado para foto, aliases e provider id, nunca como fonte unica de verdade.
- Preservar escolhas existentes quando um jogador sai da lista ativa ou uma convocacao muda.
- Manter a UI dos mercados leve: cinco destaques por mercado, busca para o catalogo completo e selecionado sempre visivel.

## Capabilities

### New Capabilities

- `outright-player-catalog`: base persistida de jogadores, candidatos por mercado, import/refresh controlado e sincronizacao segura para opcoes de especiais.

### Modified Capabilities

- `connected-matchday-surfaces`: a tela de especiais deve consumir mercados individuais alimentados por catalogo persistido, com busca ampla e estados de fonte/confianca sem quebrar o fluxo principal de palpites.

## Impact

- Banco de dados: novas tabelas para jogadores, aliases/provider ids e candidatos de mercados individuais.
- Backend: seed/import de jogadores, sincronizacao para `outright_options`, enriquecimento opcional via API-Football e ajustes no servico de outrights.
- Frontend: `/outrights` e `OutrightCard` continuam com UX de destaques + busca, mas passam a refletir fonte/confianca e catalogo mais amplo.
- Operacao: runbook para atualizar catalogo conforme listas oficiais/pre-listas forem publicadas.
- Testes: cobertura de import, sincronizacao nao destrutiva, busca, fallback de foto e preservacao de palpites.
