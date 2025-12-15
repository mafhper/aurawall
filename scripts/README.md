# Scripts de Automação e Manutenção

Este diretório contém todos os scripts utilitários para build, teste, auditoria e operações do projeto AuraWall.

## Estrutura de Diretórios

### `audit/`
Ferramentas de auditoria de qualidade e performance.
- `runner.cjs`: Executor universal de auditorias (Lighthouse).
- `links.cjs`: Verificador de links quebrados.
- `legacy/`: Scripts antigos mantidos para compatibilidade (serão removidos futuramente).

### `test/`
Testes estáticos e de integridade do código.
- `lint.cjs`: Wrapper para o ESLint.
- `structure.cjs`: Verifica se arquivos e pastas obrigatórios existem.
- `i18n.cjs`: Garante paridade de chaves de tradução entre idiomas.
- `contrast.cjs`: Verifica contraste de cores (WCAG AA).
- `perf.cjs`: Monitora o tamanho do bundle final.

### `ops/`
Operações de build e geração de assets.
- `generate-bgs.cjs`: Gera os SVGs de background estáticos.
- `distribute-icons.cjs`: Copia e otimiza ícones para pastas públicas.
- `fetch-changelog.js`: Baixa commits do GitHub para o changelog do site.
- `prerender-promo.js`: Gera HTML estático para o site promocional (SSG).
- `optimize-images.cjs`: Otimiza imagens usando Sharp.

### `performance-gate/`
Sistema de análise de regressão de performance.
- `run.cjs`: Analisa um relatório Lighthouse individual contra thresholds.
- `analyze-batch.cjs`: Analisa um lote de relatórios para tendências.

---

## Comandos Principais (via npm)

| Comando | Script | Descrição |
|---------|--------|-----------|
| `npm run health` | `health.cjs` | Check-up completo do sistema (limpeza + install + build + testes) |
| `npm run health:fast` | `health.cjs --quick` | Check-up rápido (pula install e limpeza) |
| `npm run audit` | `audit/runner.cjs` | Roda auditoria Lighthouse em todos os targets |
| `npm run audit:app` | `audit/runner.cjs --filter=app` | Auditoria apenas no App |
| `npm run audit:promo` | `audit/runner.cjs --filter=promo` | Auditoria apenas no Site Promo |
| `npm run perf:analyze` | `performance-gate/analyze-batch.cjs` | Gera relatório de tendências de performance |
