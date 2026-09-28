# Scripts de Testes (scripts/test/)

## Propósito

Este diretório contém os scripts responsáveis pela execução de testes estáticos, de qualidade e de integridade do projeto. Eles garantem que o código siga os padrões estabelecidos, que a estrutura do projeto esteja correta e que não haja problemas básicos antes do deploy.

## Conteúdo

### Arquivos
- `contrast.cjs`: Verifica o contraste de cores no projeto para conformidade com as diretrizes WCAG AA.
- `i18n.cjs`: Garante a integridade da internacionalização, verificando a paridade de chaves de tradução entre os idiomas e a detecção de textos hardcoded.
- `perf.cjs`: Analisa o tamanho final do bundle de produção para garantir que não exceda os limites definidos, prevenindo builds excessivamente grandes.
- `security-sanitization.test.cjs`: Testa a sanitização de texto que previne injeção de markup.
- `structure.cjs`: Verifica se arquivos e diretórios essenciais do projeto existem, garantindo a conformidade com a estrutura esperada.

A análise estática é o `npm run lint` (ESLint direto), que roda no CI e no gate da release. Houve
um `lint.cjs` aqui que apenas envolvia esse comando — removido por ser duplicação.
