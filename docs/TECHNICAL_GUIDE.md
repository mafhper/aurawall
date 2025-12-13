# Guia Técnico - AuraWall

Este documento detalha a arquitetura, as decisões de design e os algoritmos que impulsionam o AuraWall.

## 1. Visão Geral da Arquitetura

O AuraWall segue uma arquitetura **reativa unidirecional**. O estado da aplicação (`config`) é a única fonte de verdade.

```mermaid
graph TD
    A[Estado Global (App.tsx)] -->|Props| B(Controls.tsx)
    A -->|Props| C(WallpaperRenderer.tsx)
    B -->|Eventos| A
    D[VariationService] -->|Geração Procedural| A
```

### Stack Tecnológico Atualizado
- **React 19:** Uso de novos hooks e otimizações.
- **Tailwind CSS v4:** Utiliza a nova engine baseada em Rust (via `@tailwindcss/postcss`) para compilação instantânea e zero-runtime overhead.
- **Vite 6:** Build tool ultra-rápido.

---

## 2. O Motor de Renderização (`WallpaperRenderer.tsx`)

O coração visual da aplicação. Este componente não desenha em Canvas diretamente; ele constrói uma árvore SVG DOM. Isso garante que a pré-visualização seja nítida em qualquer nível de zoom (graças aos vetores) e extremamente leve.

### Otimizações de Performance
- **`React.memo`:** O componente é memoizado para evitar re-renderizações quando apenas a UI de controles muda (ex: abrir um menu).
- **`useMemo`:**
  - **Cálculo de Shapes:** Paths de blobs complexos são recalculados apenas quando seus parâmetros mudam, não a cada frame.
  - **Estilos CSS:** Animações (`<style>`) são geradas apenas se a aba "Motion" estiver ativa.

### Filtros SVG
O visual "Ethereal" é alcançado combinando:
1.  **`<feTurbulence>`:** Gera ruído Perlin para textura.
2.  **`<feGaussianBlur>`:** Aplicado individualmente por forma ou globalmente.
3.  **`<feColorMatrix>`:** Usado para saturação e ajustes de cor no ruído.

### Props Importantes
- **`config`**: O objeto de estado completo que define o wallpaper (cores, formas, animação).
- **`lowQuality`**: Quando `true`, desativa filtros pesados (blur, noise) e a geração de CSS de animação. Ideal para thumbnails ou listas.
- **`paused`**: Quando `true`, define `animation-play-state: paused` nos elementos. Isso congela o movimento das formas (CSS) na posição atual sem remover a animação. *Nota: Não afeta animações nativas SVG (`<animate>`) como a oscilação de ruído.*

---

## 3. Animação e Movimento

O sistema de animação (`AnimationSettings`) não usa JavaScript para interpolar valores (o que seria pesado na CPU). Em vez disso, injetamos regras **CSS Keyframes** dinâmicas diretamente no SVG.

Isso permite que a GPU do navegador gerencie a animação (compositor thread), garantindo 60fps mesmo em dispositivos móveis.

Tipos de Movimento:
- **Flow:** Translação suave em eixos X/Y.
- **Pulse:** Escala rítmica.
- **Rotate:** Rotação lenta em torno do centro da forma.
- **Noise Anim:** Animação do atributo `seed` do filtro de turbulência para efeito "TV Static".

---

## 4. Exportação e Rasterização

Embora a visualização seja vetorial, a exportação final geralmente precisa ser raster (JPG/PNG).

**Fluxo de Exportação:**
1.  **Serialização:** O nó SVG DOM é convertido em uma string XML via `XMLSerializer`.
2.  **Blob:** Criamos um `Blob` do tipo `image/svg+xml`.
3.  **Image Object:** Carregamos esse blob em um objeto `new Image()`.
4.  **Canvas Draw:** Desenhamos a imagem em um `<canvas>` HTML5 oculto com as dimensões de saída desejadas (ex: 4K).
5.  **Data URL:** Convertemos o canvas para DataURL (`canvas.toDataURL`), aplicando a qualidade e formato escolhidos nas Preferências.

---

## 5. Internacionalização (i18n)

Implementado com `i18next` e `react-i18next`.
- **Detecção:** Automática via navegador ou localStorage.
- **Estrutura:** Arquivo único `i18n.ts` contendo todos os recursos (para simplicidade deste projeto), mas escalável para arquivos JSON separados.

---

## 6. Estrutura de Pastas

- `components/`: Componentes UI (Botões, Menus) e o Renderizador.
- `services/`: Lógica de negócios pura (geração de variações, matemática de cores).
- `utils/`: Funções auxiliares (conversão de cores, paths SVG).
- `docs/`: Documentação técnica.
- `public/`: Assets estáticos (ícones, manifest, branding).

---

## 7. Gerenciamento de Scripts (`package.json`)

Para otimizar o fluxo de trabalho e padronizar o acesso às principais funcionalidades, os scripts do `package.json` foram simplificados e renomeados para comandos de palavra única sempre que possível.

| Comando NPM         | Descrição                                                                      |
| :------------------ | :----------------------------------------------------------------------------- |
| `npm run dev`       | Inicia os servidores de desenvolvimento para a aplicação principal e o site promocional (concurrentemente). |
| `npm run app`       | Inicia o servidor de desenvolvimento apenas para a aplicação principal.        |
| `npm run promo`     | Inicia o servidor de desenvolvimento apenas para o site promocional.           |
| `npm run build`     | Executa a build de produção para ambos, o site promocional e a aplicação principal. |
| `npm run build-app`   | Executa a build de produção apenas para a aplicação principal.                   |
| `npm run build-promo` | Executa a build de produção apenas para o site promocional.                      |
| `npm run health`    | Realiza uma verificação completa de saúde do sistema: limpa dependências, reinstala e executa todas as builds, gerando um relatório detalhado. |
| `npm run icons`     | Distribui os ícones e favicons gerados para os diretórios corretos.             |
| `npm run logs`      | Busca e atualiza o changelog do projeto.                                        |
| `npm run preview`   | Inicia um servidor de preview para os artefatos da build de produção.         |

