## Context

O frontend ja mostra sinais da pontuacao em varios lugares: breakdown de partida encerrada, total acumulado na liga, ranking com desempates e tela de especiais com pontos por mercado. Mesmo assim, nao existe hoje uma superficie unica que conecte essas informacoes em linguagem de produto. O usuario precisa inferir a regra a partir de fragmentos da UI ou de comportamento do sistema.

A mudanca e predominantemente frontend, mas ela atravessa o shell autenticado, uma nova rota App Router e textos derivados de constantes de scoring e outrights. O principal cuidado e evitar que a nova pagina repita regras antigas que ainda aparecem em documentos historicos, como o teto de 3130 pontos ou um catalogo de 8 especiais.

## Goals / Non-Goals

**Goals:**
- Criar uma referencia autenticada de pontuacao que explique tiers por partida, especiais, teto teorico e desempates com linguagem consistente com o produto.
- Tornar a referencia acessivel de forma estavel no shell autenticado e tambem por links contextuais em superficies de alta duvida.
- Tratar a regra viva do codigo como fonte de verdade para os numeros exibidos na pagina, reduzindo divergencia entre UI e implementacao.

**Non-Goals:**
- Alterar a logica de calculo de pontos, desempates ou resolucao de especiais.
- Mudar contratos de API backend ou introduzir armazenamento novo apenas para a pagina.
- Corrigir toda a documentacao historica do repositorio fora do necessario para a UX do produto.

## Decisions

### 1. Implementar a referencia como rota autenticada de primeira classe
A pagina sera uma nova rota em `frontend/src/app` dentro do shell existente, em vez de um modal ou tooltip espalhado. Isso a torna compartilhavel internamente no produto, navegavel pelo drawer e reutilizavel como destino para links contextuais.

Alternativas consideradas:
- Modal global: rapido, mas ruim para conteudo mais denso e profundo.
- Texto inline em cada tela: reduziria contexto local, mas manteria a regra fragmentada.

### 2. Usar o codigo atual como fonte canonica dos numeros exibidos
Os tiers por partida, o catalogo de especiais e o teto teorico devem ser derivados das constantes de scoring e outrights ja vigentes no produto sempre que a fronteira do frontend permitir isso sem acoplamento ruim. Se alguma constante precisar ser espelhada no frontend, o design prioriza uma forma unica e deliberada de definir esses valores em vez de duplicacao solta em varias telas.

Alternativas consideradas:
- Copiar os numeros manualmente para a pagina: simples para hoje, mas aumenta o risco de drift.
- Buscar tudo de uma API dedicada: excessivo para uma pagina estatica e sem ganho claro no momento.

### 3. Ancorar os links contextuais onde a pergunta sobre pontuacao nasce
Os pontos de entrada secundarios devem aparecer em superficies como liga, partida encerrada e especiais, onde o usuario naturalmente quer entender pontos, criterios e impacto no ranking. O objetivo nao e pulverizar links por toda a aplicacao, e sim inserir chamadas discretas onde elas destravam compreensao.

Alternativas consideradas:
- Link apenas no menu: facil de implementar, mas pouco pedagógico.
- Link em toda card/lista: aumenta ruido visual e banaliza a ajuda.

### 4. Explicar ranking e desempate como parte da jornada competitiva
A pagina deve incluir nao so os tiers e especiais, mas tambem o criterio de desempate visivel nas ligas: total de pontos, depois placares exatos, depois vencedor + saldo. Isso conecta a regra ao principal lugar onde o usuario sente impacto competitivo.

Alternativas consideradas:
- Manter desempate apenas implícito no ranking: economiza espaco, mas preserva a principal fonte de confusao de tabela.

## Risks / Trade-offs

- [Risco] Duplicar numeros entre frontend e backend pode reintroduzir divergencia no futuro. → Mitigacao: centralizar valores em constantes compartilhadas do frontend ou derivar do conjunto ja exposto pelo produto, evitando literais espalhados.
- [Risco] A pagina virar texto demais e quebrar o fluxo esportivo do app. → Mitigacao: usar exemplos curtos, blocos escaneaveis e links contextuais em vez de texto corrido longo.
- [Risco] Links contextuais em excesso poluirem telas principais. → Mitigacao: limitar a presenca aos estados e superficies em que a duvida de pontuacao aparece com maior frequencia.
- [Trade-off] A change nao resolve toda a documentacao historica inconsistente do repositorio. → Mitigacao: a nova pagina passa a ser a referencia oficial de UX, enquanto a limpeza ampla pode entrar em uma frente separada se necessario.
