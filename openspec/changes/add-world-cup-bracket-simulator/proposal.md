## Why

O bolao resolve a competicao por pontos, mas a Copa tambem pede uma superficie livre para imaginar caminhos, zebras e campeoes sem afetar palpites oficiais. Um simulador proprio cria esse brinquedo de parede da Copa dentro do produto, com liberdade de escolha para o usuario e chaveamento oficial por baixo.

## What Changes

- Criar uma pagina `/simulador` separada de partidas, especiais e ligas.
- Permitir que o usuario ordene os 12 grupos da Copa 2026 e escolha quais oito terceiros classificados avancam.
- Montar o Round of 32 usando os slots oficiais da FIFA e a matriz Annex C para alocar terceiros classificados.
- Permitir escolher vencedores em cada confronto do mata-mata ate campeao, incluindo terceiro lugar quando a arvore chegar as semifinais.
- Apresentar o mata-mata como um bracket visual estilo wallchart/poster, com times, bandeiras, slots oficiais e estados de vencedor/eliminado.
- Manter a simulacao como estado livre e nao pontuado, sem interferir em match predictions, outrights, rankings ou locks do bolao.
- Persistir inicialmente no cliente para rascunho local, deixando salvamento/compartilhamento autenticado como evolucao posterior.
- Expor o Simulador como destino navegavel no shell autenticado.

## Capabilities

### New Capabilities
- `world-cup-bracket-simulator`: simulador livre da Copa 2026 com selecao de classificados, chaveamento oficial FIFA/Annex C e bracket interativo ate campeao.

### Modified Capabilities
- `authenticated-product-shell`: o shell autenticado passa a tratar o Simulador como destino de primeira classe quando a rota existir.

## Impact

- Frontend de nova rota `/simulador`, componentes de grupos, selecao de terceiros e bracket/wallchart responsivo.
- Dataset/DTO de times e grupos para alimentar o simulador com selecoes, bandeiras e letras de grupo.
- Modulo de regras de torneio no frontend ou compartilhado para slots oficiais do Round of 32, arvore de mata-mata e matriz Annex C.
- Navegacao autenticada e home/drawer para incluir o novo destino sem criar rota fantasma.
- Testes unitarios para regras de bracket/Annex C e testes de UI para fluxo principal do simulador.
