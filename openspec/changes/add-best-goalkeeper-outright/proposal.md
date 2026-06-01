## Why

A Copa do Mundo tem um premio oficial para melhor goleiro, o adidas Golden Glove, e ele combina bem com o loop atual de palpites especiais. Adicionar esse mercado deixa as outrights mais completas sem abrir ainda o trabalho maior de live odds ou catalogo persistido de jogadores.

## What Changes

- Adicionar o mercado `Melhor Goleiro` como uma nova outright de jogador.
- Usar codigo estavel `BEST_GOALKEEPER`, selecao unica e resolucao pelo vencedor oficial do adidas Golden Glove/FIFA Golden Glove.
- Atribuir 70 pontos ao mercado, no mesmo peso de `Revelacao`, elevando os pontos de outrights de 600 para 670 e o teto teorico total de 3200 para 3270.
- Incluir opcoes iniciais de goleiros no catalogo/seeding atual, com os mesmos metadados de fonte, destaque, busca, foto e estado ativo ja usados por mercados individuais.
- Atualizar API, UI, textos de pontuacao, testes e runbook operacional para refletirem o oitavo mercado ativo.
- Nao incluir live odds, integracao nova de odds, nem a migracao ampla para catalogo persistido de jogadores nesta mudanca.

## Capabilities

### New Capabilities

- `best-goalkeeper-outright`: mercado especial de melhor goleiro, incluindo catalogo inicial, selecao do usuario, pontuacao, resolucao oficial e exposicao nas superficies de outrights/pontuacao.

### Modified Capabilities

- None.

## Impact

- Backend: catalogo de mercados, seeding de opcoes, calculo do teto teorico, resolucao de mercado e testes de outrights/scoring.
- Banco de dados: nenhum novo tipo estrutural esperado; o mercado e suas opcoes devem usar `outright_markets` e `outright_options` existentes.
- Frontend: `/outrights`, componentes de card de outright e referencia de pontuacao passam a exibir o novo mercado e o novo teto.
- Operacao: runbook de resolucao de outrights deve documentar como registrar o vencedor oficial do Golden Glove.
