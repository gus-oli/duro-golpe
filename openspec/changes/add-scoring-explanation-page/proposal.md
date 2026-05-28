## Why

O bolao ja tem uma regra de pontuacao mais rica do que o padrao de 3/1/0, mas hoje essa logica aparece fragmentada entre cards de partida, ranking, especiais e constantes internas. Falta uma superficie canonica onde o usuario entenda rapidamente como marcar pontos, como funcionam os especiais e como a liga desempata.

## What Changes

- Adicionar uma pagina autenticada de referencia de pontuacao com explicacao clara dos tiers por partida, mercados especiais, teto teorico e regras de desempate.
- Tornar essa pagina alcancavel a partir da navegacao principal do shell autenticado, sem depender de rota manual.
- Expor links contextuais para a explicacao de pontuacao em superficies onde a duvida aparece com mais frequencia, como liga, partida encerrada e especiais.
- Consolidar o texto da UI em torno da regra viva do produto: 25/15/10/5/0 por partida, 7 mercados especiais totalizando 600 pontos e teto teorico de 3200 pontos.
- Eliminar ambiguidade entre regras historicas e regras atuais ao tratar a nova pagina como a referencia oficial do produto para pontuacao.

## Capabilities

### New Capabilities
- `scoring-explanation-reference`: pagina e conteudo canonico para explicar tiers de pontuacao, especiais, teto teorico e desempates do bolao

### Modified Capabilities
- `authenticated-product-shell`: a navegacao autenticada passa a expor a referencia de pontuacao como destino de primeira classe
- `connected-matchday-surfaces`: superficies centrais do produto passam a apontar para a referencia de pontuacao quando isso ajuda o usuario a entender o placar e seguir a jornada

## Impact

- Frontend App Router para a nova rota autenticada de pontuacao
- Shell autenticado e navegacao principal
- Superficies de liga, partida e especiais onde links contextuais podem reduzir confusao sobre pontos e desempates
- Conteudo de produto derivado das regras atuais de scoring e outrights, incluindo o teto de 3200 pontos e os 7 mercados especiais
