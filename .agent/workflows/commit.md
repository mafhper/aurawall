---
description: Commit com atualização automática de documentação
---

# Workflow: Commit Inteligente

Quando o usuário pedir para fazer commit (ex: "faça o commit", "/commit", "commit das mudanças"):

## 1. Verificar Estado do Repositório
// turbo
```powershell
git status --short
```

## 2. Analisar Mudanças Significativas
- Revisar arquivos modificados
- Identificar se há mudanças que impactam:
  - Funcionalidades do usuário
  - APIs públicas
  - Configurações importantes
  - Breaking changes

## 3. Atualizar Documentação (se necessário)

### `/docs/change.log`
// turbo
Adicionar nova entrada NO TOPO do arquivo:
```
[YYYY/MM/DD - Título descritivo]
Descrição curta das mudanças
```

### `README.md` / `README.pt-BR.md`
Atualizar se houver:
- Novas funcionalidades
- Mudanças de uso
- Novos comandos/configurações

### `/docs/knowledge.md`
Atualizar se houver:
- Novas decisões técnicas
- Padrões adotados
- Referências importantes

## 4. Preparar Commit
// turbo
```powershell
git add .
```

## 5. Criar Mensagem de Commit Semântica
Usar formato conventional commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` apenas documentação
- `refactor:` refatoração sem mudança de comportamento
- `style:` formatação, espaços
- `chore:` manutenção, dependências

// turbo
```powershell
git commit -m "tipo: descrição concisa"
```

## 6. (Opcional) Push
Perguntar ao usuário se deseja fazer push:
```powershell
git push
```

---

## Notas
- Sempre verificar se há arquivos não rastreados importantes
- Não fazer commit de arquivos de build (`dist/`, `node_modules/`)
- Preferir commits atômicos (uma mudança lógica por commit)
