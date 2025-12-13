# Guia de Build e Manutenção - AuraWall

Este documento descreve detalhadamente o processo de construção (build), a estrutura de diretórios gerada, os scripts disponíveis e as diretrizes para manutenção do repositório, que abriga tanto a aplicação web (Gerador de Wallpapers) quanto o site promocional (Landing Page e Documentação).

---

## 1. Visão Geral da Arquitetura do Repositório

O projeto opera como um **monorepo híbrido**, onde o código da aplicação principal e do site promocional coexistem, compartilhando configurações e dependências, mas com processos de build distintos que convergem para uma única saída de deploy.

- **Raiz (`/`):** Contém configurações globais (`package.json`, `vite.config.ts`, `tailwind.config.js`) e, agora, a pasta `src/` com o código da Aplicação.
- **`src/`:** Código-fonte da **Aplicação Principal** (o gerador de wallpapers).
- **`website/`:** Código-fonte do **Site Promocional** (Landing Page, Docs). Possui sua própria estrutura React/Vite, mas herda estilos e configurações da raiz quando possível.
- **`dist/`:** Diretório de saída final, pronto para deploy estático.

---

## 2. Scripts de NPM (`package.json`)

Os seguintes comandos estão disponíveis para desenvolvimento e produção:

| Comando | Descrição | Contexto |
| :--- | :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento para a **Aplicação Principal** (localhost:3000). | Dev (App) |
| `npm run dev:site` | Inicia o servidor de desenvolvimento para o **Site Promocional** (localhost:5173). | Dev (Site) |
| `npm run dev:all` | **Desenvolvimento Unificado.** Roda App + Site simultaneamente com proxy para `/app/`. | Dev |
| `npm run build:app` | Compila apenas a Aplicação Principal para `dist/app/`. | Build |
| `npm run build:site` | Compila apenas o Site Promocional para `dist/`. **Atenção:** Este comando limpa a pasta `dist/` antes de rodar. | Build |
| `npm run build` | **Comando Mestre.** Executa `build:site` e depois `build:app`. Gera a estrutura completa de deploy. | CI/CD |
| `npm run preview` | Serve o conteúdo da pasta `dist/` localmente para teste final. | Teste |

### Lógica do Script `build`
O comando `npm run build` é composto por: `npm run build:site && npm run build:app`.
1.  Primeiro, o **Site** é construído na raiz de `dist/`. O Vite limpa o diretório `dist/` nesta etapa (`emptyOutDir: true`).
2.  Em seguida, a **App** é construída em `dist/app/`. O Vite é configurado para **não** limpar o diretório pai (`emptyOutDir: true` apenas dentro de `dist/app`, ou gerenciado via flags), garantindo que o site não seja apagado.

### Desenvolvimento Unificado (`dev:all`)
O comando `npm run dev:all` utiliza `concurrently` para rodar ambos os servidores simultaneamente. O site promocional (localhost:5173) possui um **proxy** configurado para `/app/`, redirecionando requisições para o servidor da aplicação (localhost:3000). Isso permite testar os links "Launch App" do site promo em ambiente de desenvolvimento.

---

## 3. Estrutura de Saída (`dist/`)

Após um build completo bem-sucedido, a pasta `dist/` terá a seguinte estrutura, pronta para ser hospedada em qualquer servidor estático (GitHub Pages, Vercel, Netlify):

```
dist/
├── index.html              # Home do Site Promocional
├── assets/                 # CSS/JS/Imagens do Site
├── favicon.svg             # Favicon global
├── header-animation.svg    # Asset compartilhado
├── ...
│
└── app/                    # Subdiretório da Aplicação
    ├── index.html          # Ponto de entrada do Gerador (AuraWall App)
    └── assets/             # CSS/JS compilados da Aplicação
```

Isso permite que o domínio raiz (`aurawall.github.io`) sirva o site de marketing, enquanto a aplicação funcional reside em `aurawall.github.io/app`.

---

## 4. GitHub Actions e Pages

O repositório está configurado com Integração Contínua (CI) via GitHub Actions para fazer deploy automático no GitHub Pages.

### Workflow (`.github/workflows/deploy.yml`)
1.  **Gatilho:** Push na branch `main`.
2.  **Job de Build:**
    - Instala dependências (`npm ci`).
    - Executa o comando mestre `npm run build`.
    - O artefato gerado é a pasta `dist/`.
3.  **Job de Deploy:**
    - Publica o artefato `dist/` para o ambiente GitHub Pages.

---

## 5. Guia de Manutenção

### Adicionando Funcionalidades à Aplicação (`src/`)
- Trabalhe normalmente em `src/`.
- Use `npm run dev` para visualizar.
- O build será automaticamente incluído em `/app` no próximo deploy.

### Alterando o Site Promocional (`website/`)
- Trabalhe em `website/src/`.
- Use `npm run dev:site` para visualizar.
- O site compartilha o `tailwind.config.js` da raiz, garantindo consistência visual (fontes, cores, gradientes).
- Se precisar de novos assets, coloque-os em `website/public/` ou `public/` (raiz) se forem compartilhados. Nota: Assets na raiz `public/` precisam ser copiados manualmente para `website/public/` durante o dev se o Vite não estiver configurado para servir a raiz, mas no build final ambos convergem.

### Atualizando Dependências
- Como é um monorepo simulado, todas as dependências (React, Tailwind, Vite) estão no `package.json` da raiz.
- Instale pacotes na raiz: `npm install nome-do-pacote`.
- Ambos (App e Site) podem importar esses pacotes.

### Cuidados com o Tailwind v4
- O projeto usa Tailwind v4 com `@tailwindcss/postcss`.
- O arquivo de entrada CSS é `src/index.css` (para o App) e é importado também no `website/src/main.tsx` (para o Site) para compartilhar estilos globais.
- Se criar CSS específico para o site que não deva vazar para o app, crie um arquivo CSS separado em `website/src/` e importe-o apenas lá.

### 5.1 Atualização de Assets (10/12/2024)
Os ícones e assets de marca foram atualizados com a versão final (`icon-forge-assets-3`).
- **Fontes:** `_desenvolvimento/img/icon-forge-assets-3`
- **Destinos:** `public/` (App) e `website/public/` (Site)
- **Principal:** `icon-light.svg` (derivado de `favicon.svg`)

### 5.2 Sistema de Compartilhamento V2 (10/12/2024)

O AuraWall usa um sistema de compactação avançado para gerar links compartilháveis curtos.

#### Arquivos Principais
- **`src/utils/compactUrlEncoder.ts`** - Encoder/decoder V2 com array notation
- **`src/utils/urlUtils.ts`** - API pública (importa de compactUrlEncoder)

#### Formatos de URL Suportados

| Formato | Descrição | Tamanho |
|---------|-----------|---------|
| `#c=...` | V2 Compact (array notation) | ~400 chars |
| `#cfg=...` | Legacy (backward compat) | ~1100 chars |
| `?preset=id` | Preset Deep Link | ~20 chars |

#### Otimizações V2 (Redução de ~78%)

1. **Array Notation:** Shapes são arrays posicionais em vez de objetos
   ```
   V1: {"i":"aa1","t":"c","x":20,"y":20,"z":120,"c":"d8b4fe","o":0.6,"u":100,"b":"m"}
   V2: [0,20,20,120,"d8b4fe",60,100,3]
   ```
2. **Sem IDs:** IDs são gerados em runtime (`s0, s1, s2...`)
3. **Cores Compactas:** `#aabbcc → abc` (sem # e shorthand)
4. **BlendModes Numéricos:** `"screen" → 1`
5. **Omissão de Defaults:** Animation/Vignette só incluídos se modificados
6. **Suporte a HSL:** Cores HSL são preservadas intactas

