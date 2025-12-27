# Scripts de Auditoria (scripts/audit/)

## Propósito

Este diretório contém os scripts responsáveis pela execução de auditorias de qualidade e performance do projeto. Eles orquestram ferramentas como o Lighthouse para analisar diferentes aspectos do código e da aplicação.

## Conteúdo

### Subdiretórios
- `legacy/`: Scripts de auditoria mais antigos que foram substituídos por versões mais modernas (`runner.cjs`). Mantidos por compatibilidade, mas serão depreciados.

### Arquivos
- `links.cjs`: Script para verificar a integridade de links internos e externos no código-fonte.
- `runner.cjs`: O orquestrador universal de auditorias, que pode executar testes Lighthouse em diferentes targets (aplicação, landing page, etc.).
