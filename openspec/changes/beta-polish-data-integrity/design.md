## Context

O beta hospedado ja esta proximo de ser liberado para amigos, mas a navegacao real expôs problemas de confianca: dados de smoke sobrescreveram selecoes reais, slots indefinidos de mata-mata apareceram como escolhas de outright, nomes vieram em ingles do provider, catalogos individuais ficaram pequenos, copy brasileira perdeu acentos e o reset de senha depende de uma migration/operacao Brevo facil de esquecer.

Essas correcoes atravessam backend, seeds, catalogos, frontend e runbook de deploy. O objetivo nao e trocar a arquitetura do produto, e sim blindar o caminho beta para que dados reais, escolhas de usuario e operacao hospedada parecam consistentes.

## Goals / Non-Goals

**Goals:**

- Proteger metadados de times reais contra sobrescrita por seeds de smoke/demo.
- Separar times reais de placeholders de chaveamento para que mercados `TEAM` mostrem apenas selecoes.
- Localizar nomes de selecoes para PT-BR sem depender do idioma entregue pelo provider.
- Expandir catalogos individuais de outrights com nomes relevantes e acentuados.
- Corrigir copy visivel para portugues brasileiro natural.
- Dar mais presenca ao wordmark `Duro Golpe` no shell autenticado.
- Documentar o caminho operacional de reset de senha em Neon/Render/Brevo.

**Non-Goals:**

- Criar um sistema completo de internacionalizacao.
- Alterar regras de pontuacao, mercados existentes ou fluxo de aposta.
- Adicionar provider pago de atletas ou estatisticas individuais.
- Resolver email transacional com dominio proprio ou sender reputation avancada.
- Substituir a stack Render free + Vercel + Neon + Brevo.

## Decisions

### 1. Usar localizacao por codigo FIFA

O app deve manter os identificadores do provider e do banco, mas exibir nomes localizados quando existir um mapeamento por codigo FIFA. Isso evita criar uma dependencia fragil no idioma do `football-data.org` e preserva estabilidade de IDs.

Alternativa considerada: gravar sempre o nome cru do provider e traduzir apenas no frontend. Rejeitada porque outrights, emails, APIs e telas diferentes podem acabar divergindo.

### 2. Tratar placeholders como slots de chave, nao como times apostaveis

Os placeholders de mata-mata continuam necessarios para renderizar partidas futuras, mas precisam ser marcados ou inferidos como nao selecionaveis em mercados de times. O seed de outrights deve filtrar esses registros e, quando necessario, limpar opcoes antigas criadas com placeholders.

Alternativa considerada: nao criar placeholders no banco ate os classificados existirem. Rejeitada porque isso dificulta montar agenda completa e poller automatico das fases.

### 3. Smoke seed nao deve sobrescrever selecoes oficiais

O seed de smoke deve ser seguro em ambiente compartilhado: ou usa times isolados de teste, ou faz no-op para metadados de times oficiais ja existentes. Conflitos por `fifaCode` nao podem trocar bandeira/nome real por fixture de teste.

Alternativa considerada: orientar operador a nunca rodar smoke em producao. Rejeitada porque o erro ja aconteceu e seed defensivo e mais confiavel que memoria operacional.

### 4. Catalogos individuais continuam estaticos e curados

Sem provider gratuito confiavel para jogadores e awards, os mercados individuais devem usar catalogos curados maiores. Isso entrega qualidade agora sem amarrar o beta a dados pagos.

Alternativa considerada: buscar elencos em outra API gratuita. Rejeitada para esta change porque aumentaria risco de limite, licenca e inconsistencia perto da liberacao.

### 5. Polish visual em HTML/CSS, sem asset externo

O wordmark deve ser implementado no shell com markup/CSS existente, evitando imagem externa ou pipeline novo. O resultado precisa ser mais reconhecivel, mas ainda leve e responsivo.

Alternativa considerada: gerar logo bitmap. Rejeitada porque o app ja usa UI code-native e um bitmap criaria custo de manutencao sem necessidade.

### 6. Reset de senha precisa de runbook operacional

O erro `password_reset_tokens` inexistente indica que a migration precisa estar clara no deploy real. O erro Brevo de IP mostra que Render free pode trocar IP, entao o runbook deve orientar desabilitar allowlist de API ou aceitar a manutencao manual dos IPs.

Alternativa considerada: manter allowlist Brevo e atualizar IP sob demanda. Aceitavel como contingencia, mas nao como recomendacao para beta free porque o IP do Render pode mudar.

## Risks / Trade-offs

- Mudanca de nomes de times pode alterar labels em telas ja populadas -> preservar IDs e atualizar apenas metadados exibidos.
- Limpar placeholders de outrights pode afetar predicoes feitas antes da correcao -> remover somente opcoes invalidas nao selecionaveis por usuarios reais, ou migrar com cuidado se houver dados.
- Catalogos individuais maiores podem deixar a tela pesada -> manter lista compacta e reutilizar busca/filtro existente quando houver.
- Localizacao parcial pode deixar alguns nomes em ingles -> mapear todas as 48 selecoes conhecidas e manter fallback seguro.
- Brevo com IP allowlist desativada reduz uma camada de restricao -> compensar mantendo API key somente no backend, secrets em Render e rotacao se houver suspeita.

## Migration Plan

1. Aplicar mudancas de seed/localizacao em desenvolvimento e validar que Brasil/Franca mantem bandeira/nome real apos smoke.
2. Regerar ou corrigir opcoes de outrights para remover placeholders e ampliar catalogos individuais.
3. Aplicar migration/runbook do reset de senha em Neon antes de retestar o fluxo Brevo.
4. Fazer deploy backend no Render e frontend no Vercel.
5. Rodar smoke manual: login, matches, batch predictions, outrights, reset de senha e visual mobile.

Rollback: reverter deploy de frontend/backend para o commit anterior. As correcoes de metadata e options devem ser idempotentes; se uma limpeza de option afetar dados reais, restaurar backup/snapshot Neon antes de reexecutar seeds.

## Open Questions

- O catalogo individual deve ser separado por mercado com pesos editoriais diferentes ou uma lista ampla compartilhada entre premios?
- A UI de outrights precisa de busca imediatamente apos expandir catalogos, ou a lista compacta atual aguenta o beta?
