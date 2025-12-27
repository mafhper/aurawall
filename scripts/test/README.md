# Scripts de Testes (scripts/test/)

## Propósito

Este diretório contém os scripts responsáveis pela execução de testes estáticos, de qualidade e de integridade do projeto. Eles garantem que o código siga os padrões estabelecidos, que a estrutura do projeto esteja correta e que não haja problemas básicos antes do deploy.

## Conteúdo

### Arquivos
- `contrast.cjs`: Verifica o contraste de cores no projeto para conformidade com as diretrizes WCAG AA.
- `i18n.cjs`: Garante a integridade da internacionalização, verificando a paridade de chaves de tradução entre os idiomas e a detecção de textos hardcoded.
- `lint.cjs`: Executa a ferramenta ESLint para análise estática do código, identificando erros e problemas de estilo.
- `perf.cjs`: Analisa o tamanho final do bundle de produção para garantir que não exceda os limites definidos, prevenindo builds excessivamente grandes.
- `structure.cjs`: Verifica se arquivos e diretórios essenciais do projeto existem, garantindo a conformidade com a estrutura esperada.
