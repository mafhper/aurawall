# Scripts Operacionais (scripts/ops/)

## Propósito

Este diretório contém scripts responsáveis por operações diversas, incluindo geração de assets, otimização, pré-renderização e diagnóstico. Eles automatizam tarefas que suportam o processo de build e manutenção do projeto.

## Conteúdo

### Arquivos
- `diagnose-latest.cjs`: Script de diagnóstico que analisa o último relatório Lighthouse em um dado diretório, extraindo informações críticas sobre CLS e TBT.
- `distribute-icons.cjs`: Orquestra a distribuição de ícones da fonte (`_desenvolvimento/img/icon-forge-assets`) para as pastas públicas e realiza otimizações como conversão para WebP.
- `fetch-changelog.js`: Busca dados de commits do repositório GitHub para gerar o `changelog.json` para o site promocional.
- `generate-bgs.cjs`: Gera os arquivos SVG de backgrounds animados para a aplicação, utilizando a lógica dos engines de geração.
- `optimize-images.cjs`: Realiza a otimização de imagens (compressão, redimensionamento) em diversos formatos (`png`, `jpg`, `webp`) utilizando a biblioteca Sharp.
- `prerender-promo.js`: Script de pré-renderização para o site promocional, que gera páginas HTML estáticas a partir de rotas React para melhor SEO e performance (SSG).
