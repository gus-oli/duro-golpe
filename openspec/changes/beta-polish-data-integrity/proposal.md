## Why

O beta hospedado ja esta jogavel, mas alguns detalhes quebram a confianca de produto: dados smoke vazando para times reais, placeholders aparecendo em mercados de selecao, copy sem acentuacao, catalogos individuais magros e reset de senha dependendo de passos operacionais pouco claros. Esses problemas aparecem justamente antes de liberar para amigos, entao vale matar o pacote agora.

## What Changes

- Corrigir a integridade dos times reais para que smoke seed nao sobrescreva selecoes oficiais como Brasil e Franca.
- Impedir que placeholders de mata-mata sejam usados como opcoes de mercados `TEAM`.
- Localizar nomes de selecoes para PT-BR quando o provider entregar nomes em ingles.
- Expandir os mercados individuais de outrights com mais opcoes relevantes e nomes com acentuacao correta.
- Fazer um pass de copy PT-BR nas superficies principais, erros e mensagens transacionais.
- Melhorar o wordmark do header para que `Duro Golpe` tenha mais presenca visual sem abandonar a linguagem sports companion.
- Documentar/ajustar o caminho operacional do reset de senha hospedado: migration `password_reset_tokens` e Brevo sem IP allowlist fragil no Render free.

## Capabilities

### New Capabilities
- `beta-data-integrity-polish`: protecao contra vazamento de dados smoke, filtragem de placeholders e localizacao PT-BR dos dados exibidos ao usuario.
- `outright-option-quality`: qualidade dos mercados especiais, incluindo opcoes de selecao reais e catalogos individuais mais completos.
- `brazilian-product-polish`: acentuacao, copy brasileira e wordmark/header com mais identidade.

### Modified Capabilities
- `football-data-world-cup-ingestion`: provider-backed ingestion deve preservar metadados oficiais sem ser sobrescrita por seeds de smoke e deve localizar nomes exibidos quando apropriado.
- `sports-companion-visual-language`: a identidade visual deve incluir um wordmark mais reconhecivel no shell autenticado.
- `hosted-beta-deployment`: o runbook do beta hospedado deve cobrir migration de reset de senha e restricoes praticas do Brevo com Render free.

## Impact

- Seeds de provider, smoke e catálogos.
- Outrights backend e opções exibidas no frontend.
- Copy de frontend/backend e email transacional.
- Header/shell visual.
- Runbook de deploy hospedado e operação Brevo/Neon.
