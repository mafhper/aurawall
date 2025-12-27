# Performance Gate (scripts/performance-gate/)

## Propósito

Este diretório contém os scripts que compõem o sistema "Performance Gate", uma ferramenta para automatizar a análise de regressões de performance. Ele avalia relatórios do Lighthouse contra baselines e thresholds definidos para determinar o sucesso ou falha de uma build em termos de performance.

## Conteúdo

### Arquivos
- `analyze-batch.cjs`: Analisa um diretório de relatórios Lighthouse em lote, gerando estatísticas, tendências e um relatório Markdown consolidado.
- `compareWithBaseline.cjs`: Compara as métricas de um relatório atual com uma baseline previamente definida para detectar regressões.
- `decideOutcome.cjs`: Decide o resultado final da avaliação de performance (Pass, Warn, Fail) com base nas violações de thresholds e regressões.
- `evaluateThresholds.cjs`: Avalia as métricas de um relatório contra os thresholds de performance (fail/warn) para um dado "form factor" (mobile/desktop).
- `getFormFactor.cjs`: Extrai o "form factor" (mobile ou desktop) de um relatório Lighthouse.
- `loadReport.cjs`: Carrega um relatório Lighthouse (JSON ou HTML), extraindo o JSON interno se necessário.
- `normalizeNavigation.cjs`: Extrai e normaliza as métricas de navegação (LCP, FCP, TBT, CLS, SI) de um relatório Lighthouse.
- `run.cjs`: Ponto de entrada principal do Performance Gate, executa a análise de um único relatório Lighthouse.
