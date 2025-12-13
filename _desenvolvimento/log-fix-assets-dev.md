# Log de Correção - Assets 404 em Dev
Data: 09/12/2025

## Problema
- Imagens (`header-animation.svg`, `icon-light.svg`) retornando 404 no servidor de desenvolvimento.
- Causa: A configuração `base: '/app/'` no `vite.config.ts` forçava os caminhos a serem servidos sob `/app/`, mas o servidor de dev e o HTML estavam acessando na raiz `/`.

## Solução
- `vite.config.ts` ajustado para usar `base: '/'` durante o comando `serve` (dev) e `/app/` apenas durante `build`.

## Validação
- Reload da página deve exibir as imagens corretamente.
