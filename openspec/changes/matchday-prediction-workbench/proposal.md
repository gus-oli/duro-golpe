## Why

O produto já parece um bolao de verdade, mas o fluxo principal de palpites ainda exige profundidade demais: o usuario precisa abrir partida por partida para preencher a rodada. Na pratica, isso aumenta a friccao justamente no momento de maior frequencia de uso, especialmente durante a fase de grupos e na rotina de revisar varias apostas de uma vez.

## What Changes

- Transformar `/matches` em um workbench com abas `Agenda`, `Grupos` e `Resultados`.
- Permitir editar palpites inline nas visoes `Agenda` e `Grupos`, sem depender do match detail para o fluxo principal.
- Introduzir salvamento em lote de palpites com feedback por item e resumo global de sucesso/erro.
- Organizar a aba `Resultados` por agenda/data, focada em leitura de placares, status e comparacao com o palpite enviado.
- Reposicionar o match detail como superficie de contexto e acompanhamento, exibindo venue e outros metadados oficiais disponiveis no dataset/provider em vez de ser o unico caminho pratico para palpitar.

## Capabilities

### New Capabilities
- `match-prediction-workbench`: experiencia principal de partidas com visoes por agenda, por grupo e por resultados, incluindo edicao inline e estados de rascunho.
- `batch-match-predictions`: API e comportamento de produto para salvar varias previsoes em uma unica acao com resposta parcial por partida.

### Modified Capabilities
- `connected-matchday-surfaces`: o fluxo de matchday passa a usar `/matches` como superficie primaria de trabalho, enquanto o match detail vira uma superficie de aprofundamento e contexto.

## Impact

- Frontend das superficies de partidas, cards e detail pages.
- Backend de predictions, com novo endpoint/servico batch e regras de validacao por item.
- Estado de cliente para rascunhos, erros por partida e resumo de salvamento.
- Consumo do contexto de partida ja disponivel no dataset/provider, como venue e stage/group, no match detail.
