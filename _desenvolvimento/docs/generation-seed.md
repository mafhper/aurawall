# AuraWall Engine - Documentação Técnica do Processo de Geração

Este documento detalha a arquitetura, os algoritmos e a lógica matemática por trás do gerador de wallpapers **AuraWall**. A aplicação funciona como um motor de arte generativa vetorial, não destrutiva e determinística, capaz de operar em múltiplos modos estéticos (Engines).

---

## 1. Arquitetura de Dados ("The Seed")

Diferente de editores de imagem baseados em pixels (raster), o AuraWall define a imagem através de um estado leve e serializável chamado `WallpaperConfig`. Este objeto JSON é a "semente" (seed) que contém todas as instruções necessárias para reconstruir a imagem visualmente em qualquer resolução.

### Estrutura do Objeto `WallpaperConfig`

```typescript
interface WallpaperConfig {
  // Dimensões do Canvas (definem a proporção e resolução de exportação)
  width: number;
  height: number;

  // Aparência Global
  baseColor: string | BackgroundConfig; // Cor de fundo (Hex) ou configuração de gradiente.
  noise: number;      // Intensidade do filtro de grão (0-100). Afeta a opacidade da camada de ruído.
  noiseScale: number; // Escala do grão (1-20). Afeta a "feTurbulence" do SVG.

  // Camadas de Composição
  shapes: Shape[];

  // Configurações de Pós-processamento e Animação
  animation?: AnimationSettings; // Configurações de animação em tempo real.
  vignette?: VignetteSettings;   // Configurações da máscara de vinheta.     
}
```

### Estrutura da Forma (`Shape`)

Cada elemento visual é uma "Forma" com propriedades específicas de mistura e posição relativa.

```typescript
interface Shape {
  id: string;           // Identificador único para React keys e filtros
  type: 'circle' | 'blob'; // Primitiva geométrica
  x: number;            // Posição horizontal em % (0-100)
  y: number;            // Posição vertical em % (0-100)
  size: number;         // Diâmetro relativo à largura do canvas (%)
  color: string;        // Cor de preenchimento (Hex)
  opacity: number;      // Transparência (0.0 a 1.0)
  blur: number;         // Intensidade do Desfoque Gaussiano (stdDeviation)
  blendMode: BlendMode; // Como este pixel interage com o pixel de fundo
  complexity?: number;  // Para formas do tipo 'blob', define o número de arestas/pontos.
}
```

---

## 2. Arquitetura Modular de Engines

A partir da versão v2, o AuraWall migrou de uma lógica hardcoded para um sistema modular de definições de motor (`EngineDefinition`). Cada motor é um módulo independente que encapsula sua própria lógica de randomização, metadados e estratégias de variação.

### Interface `EngineDefinition`

```typescript
export interface EngineDefinition {
  id: string; // ex: 'boreal', 'chroma', 'lava'
  meta: {
    name: string;
    description: string;
    tagline: string;
    promoImage?: string;
  };
  // Função pura que gera uma configuração nova baseada no estilo do motor
  randomizer: (currentConfig: WallpaperConfig, options: { isGrainLocked: boolean }) => WallpaperConfig;
  // Lista de transformações determinísticas aplicáveis a qualquer configuração
  variations: VariationRule[];
}
```

### Catálogo de Engines Disponíveis

1.  **Boreal (Original):** Etéreo, suave, alto blur, cores análogas.
2.  **Chroma (Original):** Ácido, nítido, baixo blur, cores complementares e modos de exclusão.
3.  **Lava:** Psicodélico, inspirado em lâmpadas de lava, cores quentes e movimento fluido.
4.  **Midnight:** Espaço profundo, estrelas, nebulosas e fundos muito escuros.
5.  **Geometrica:** Estilo Bauhaus, alinhamento estrito à grade, cores primárias e formas nítidas.
6.  **Glitch:** Caos digital, simulação de aberração cromática (RGB split), artefatos e ruído.
7.  **Sakura:** Delicado, tons pastéis, rosa/branco, simulação de pétalas ao vento.
8.  **Ember:** Fogo e cinzas, fundo escuro com partículas laranjas brilhantes e fumaça.
9.  **Oceanic:** Profundezas marinhas, tons de ciano/azul profundo e formas orgânicas fluidas.

---

## 3. Lógica de Cores e Extração

### Utilitários de Cor (`colorUtils.ts`)
O sistema utiliza funções robustas para conversão entre HEX e HSL. A versão mais recente suporta parsing de valores HSL com ponto flutuante (ex: `50.5%`) para garantir precisão máxima na extração de paletas.

### Guarda-Costas de Contraste (`ensureVisibility`)
Localizado em `utils/engineUtils.ts`, atua como um "linter" visual:
*   Converte cores para HSL.
*   Analisa a luminância do fundo.
*   Força modos de mistura aditivos (`screen`) em fundos escuros e subtrativos (`multiply`) em fundos claros para garantir visibilidade.

### Extrator de Paleta
Uma ferramenta integrada na UI que analisa o `WallpaperConfig` atual, extrai todas as cores únicas (base e formas), converte para HEX e permite cópia rápida.

---

## 4. Pipeline de Renderização (SVG & Filtros)

A renderização é feita via SVG no componente `WallpaperRenderer.tsx`.

### 4.1. Stack de Camadas (Z-Index)
1.  **Background:** Cor sólida ou Gradiente (`<linearGradient>`, `<radialGradient>`).
2.  **Shapes Group:** Formas vetoriais com `mix-blend-mode` CSS e `filter` SVG (Blur).
3.  **Vignette Layer:** Máscara radial opcional.
4.  **Noise Overlay:** Filtro `<feTurbulence>` aplicado sobre toda a imagem.

### 4.2. Animação (Modo Zen)
As animações são baseadas em CSS Keyframes gerados dinamicamente no `WallpaperRenderer`. O **Modo Zen** oculta a UI e gerencia a visibilidade do cursor para transformar o navegador em um quadro digital.

---

## 5. Internacionalização e Histórico

O sistema utiliza `i18next` para traduções (8 idiomas) e um hook personalizado `useHistory` para gerenciar estados de undo/redo, permitindo experimentação sem medo.
