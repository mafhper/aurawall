---
description: Workflow de Commit em 7 Etapas (Qualidade & Segurança)
---

# Workflow: Commit Seven Steps

Este fluxo garante que nenhum código quebrado ou de baixa qualidade seja versionado. Deve ser seguido antes de qualquer commit significativo.

## 1. Análise de Estado
Verifique o que foi alterado para entender o escopo.
```powershell
git status --short
```

## 2. Verificação de Saúde (Health Check)
Execute o script de saúde rápida para garantir que builds e estrutura estão íntegros.
```powershell
npm run health:fast
```
*Se falhar: Corrija os erros antes de prosseguir.*

## 3. Auditoria de Qualidade (Lint & Tests)
Garanta que o código segue os padrões do projeto.
```powershell
npm run test:lint
```
*(Opcional: Se for alteração de performance, rodar `npm run audit:app`)*

## 4. Documentação Ativa
Atualize a memória do projeto.

### `/docs/change.log`
Adicione a entrada no topo:
```
[YYYY/MM/DD - tipo: Título]
- Detalhe 1
- Detalhe 2
```

### Outros (Se necessário)
- `README.md` (Novas features)
- `docs/TECHNICAL_GUIDE.md` (Mudanças arquiteturais)

## 5. Preparação (Staging)
```powershell
git add .
```

## 6. Commit Semântico
Use o padrão Conventional Commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração de código
- `perf:` melhoria de performance
- `test:` adição/correção de testes
- `chore:` tarefas de build/ferramentas

```powershell
git commit -m "tipo: descrição clara e objetiva"
```

## 7. Sincronização (Push)
Confirme com o usuário antes de enviar.
```powershell
git push
```