# AuraWall

**Gerador Procedural de Wallpapers Vetoriais**

AuraWall é uma aplicação web client-side que gera wallpapers abstratos em alta resolução usando algoritmos procedurais e gráficos vetoriais. Diferente de geradores baseados em IA, o AuraWall cria imagens determinísticas, matematicamente harmoniosas, infinitamente escaláveis e leves.

![Interface do AuraWall](public/og-image.jpg)

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Personalização](#personalização)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Visão Geral

O AuraWall opera inteiramente no navegador sem dependências de servidor. A aplicação utiliza um sistema de configuração baseado em JSON (`WallpaperConfig`) que descreve formas, cores, filtros e animações. Esta configuração é renderizada reativamente como SVG, depois rasterizada via Canvas API para exportação.

### Princípios Fundamentais

- **Geração Determinística**: Mesma semente produz resultado idêntico sempre
- **Vector-First**: Toda renderização acontece em SVG até a exportação final
- **Inteligência Procedural**: Aleatoriedade curada garante consistência estética
- **Zero Dependências**: Sem backend, sem APIs de IA, sem serviços externos

---

## Funcionalidades

### Engines de Geração

| Engine | Estética | Características |
|--------|----------|-----------------|
| **Boreal** | Etéreo, suave | Alto blur, cores análogas, blend modes multiply/screen |
| **Chroma** | Líquido, ácido | Baixo blur, cores complementares, blend modes difference/exclusion |
| **Lava** | Psicodélico, quente | Movimento fluido retrô, paletas quentes, formas blob |
| **Midnight** | Cósmico, profundo | Fundos escuros, nuvens de nebulosa, partículas de estrelas |
| **Geometrica** | Bauhaus, grade | Alinhamento rígido à grade, cores primárias, formas nítidas |
| **Glitch** | Caos digital | Separação RGB (aberração cromática), artefatos, ruído digital |
| **Sakura** | Floral, gentil | Tons pastéis, formas de pétalas, simulação de vento |
| **Ember** | Fogo, cinza | Carvão escuro, faíscas laranjas vibrantes, fumaça subindo |
| **Oceanic** | Aquático, profundo | Azuis profundos, movimento fluido orgânico, sensação subaquática |
| **Animation** | Cinético, fluido | Animações CSS keyframe para drift, pulse, rotate, noise |

### Controles

- **Gerenciamento de Formas**: Adicionar, remover e configurar camadas individuais
- **Ciência de Cores**: Gradientes base, restrições de matiz, seleção harmônica
- **Extrator de Paleta**: Visualize e copie os códigos Hex exatos usados na composição
- **Pós-Processamento**: Efeito de vinheta, granulação procedural, intensidade de blur
- **Física de Movimento**: Velocidade de animação, direção de fluxo, turbulência
- **Modo Zen**: Oculte a interface para uma experiência imersiva de quadro digital

### Opções de Exportação

| Formato | Caso de Uso |
|---------|-------------|
| PNG | Lossless, suporte a fundo transparente |
| JPG | Arquivo menor, qualidade configurável |
| SVG | Fonte vetorial para edição em Illustrator/Figma |

### Presets de Resolução

- Desktop: 1920x1080, 2560x1440, 3840x2160 (4K)
- Mobile: iPhone, Android, iPad
- Personalizado: Qualquer proporção

---

## Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| Core | React 19, TypeScript |
| Build | Vite 6, PostCSS |
| Estilização | Tailwind CSS v4 |
| Gráficos | SVG DOM Nativo, Canvas API |
| i18n | i18next (8 idiomas) |
| Testes | Vitest, Playwright |

---

## Instalação

### Pré-requisitos

- Node.js 18 ou superior (Node.js 20+ recomendado)
- npm ou yarn

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/mafhper/aurawall.git
cd aurawall

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento (aplicação principal)
npm run dev

# Inicie o servidor de desenvolvimento do site promocional
npm run dev:site
```

A aplicação estará disponível em `http://localhost:5173`.

### Build de Produção

```bash
# Build da aplicação principal
npm run build

# Build do site promocional
npm run build:site

# Preview do build de produção
npm run preview
```

---

## Uso

### Início Rápido

1. Abra a aplicação no navegador
2. Selecione um engine de geração (Boreal ou Chroma)
3. Ajuste os parâmetros usando o painel de controle
4. Clique em "Gerar" ou use o randomizador
5. Exporte no formato e resolução de sua preferência

### Compartilhamento via URL

Configurações podem ser compartilhadas via URL. A aplicação usa compressão `lz-string` para codificar todo o objeto `WallpaperConfig` em um link compartilhável.

```
https://aurawall.com/app/?config=N4IgDgTg...
```

### Galeria de Presets

Acesse a galeria para navegar pelos presets curados. Cada preset pode ser:
- Baixado diretamente como PNG (1920x1080)
- Aberto no editor para personalização
- Usado como ponto de partida para novas criações

---

## Estrutura do Projeto

```
aurawall/
├── src/                      # Código fonte da aplicação principal
│   ├── components/           # Componentes React
│   │   ├── WallpaperRenderer.tsx   # Renderizador SVG core
│   │   ├── ControlPanel/     # Controles de UI
│   │   └── ExportModal.tsx   # Funcionalidade de exportação
│   ├── services/             # Lógica de negócio
│   │   ├── svgGenerator.ts   # Geração procedural
│   │   ├── colorService.ts   # Algoritmos de harmonia de cores
│   │   └── variationService.ts # Variações de presets
│   ├── constants.ts          # Presets e valores padrão
│   ├── types.ts              # Definições TypeScript
│   └── App.tsx               # Raiz da aplicação
│
├── website/                  # Site promocional (build separado)
│   ├── src/
│   │   ├── pages/            # Landing, Galeria, Sobre, etc.
│   │   ├── components/       # Componentes específicos do site
│   │   └── i18n.ts           # Traduções
│   └── vite.config.ts        # Configuração de build do site
│
├── public/                   # Assets estáticos
│   ├── icon.svg              # Ícone da aplicação
│   ├── og-image.png          # Imagem para compartilhamento social
│   └── bg-*.svg              # Texturas de fundo
│
├── _desenvolvimento/         # Documentação interna
│   └── docs/                 # Guias técnicos
│
├── vite.config.ts            # Configuração de build da app principal
├── tailwind.config.js        # Configuração do Tailwind CSS
└── package.json              # Dependências e scripts
```

---

## Personalização

### Adicionando Novos Presets

Presets são definidos em `src/constants.ts`:

```typescript
export const PRESETS: Preset[] = [
  {
    id: 'meu-preset',
    name: 'Meu Preset Personalizado',
    collection: 'boreal', // ou 'chroma'
    config: {
      baseColor: '#1a0a2e',
      shapes: [...],
      animation: { enabled: true, speed: 2 },
      // ...
    }
  }
];
```

### Criando Engines Personalizados

Engines agora são modulares e definidos em `src/engines/`. Para criar um novo engine:

1. Crie um novo arquivo (ex: `src/engines/meuEngine.ts`) implementando a interface `EngineDefinition`.
2. Defina metadados, configuração padrão e uma função `randomizer`.
3. Registre o engine em `src/engines/index.ts`.

```typescript
// src/engines/meuEngine.ts
export const meuEngine: EngineDefinition = {
  id: 'meu-engine',
  meta: { name: 'Meu Engine', ... },
  randomizer: (config) => { ... },
  variations: [ ... ]
};
```

### Estendendo o Site Promocional

O site promocional é um projeto Vite separado em `/website`. Ele compartilha componentes da aplicação principal:

```typescript
// Importar da app principal
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { PRESETS } from '../../../src/constants';
```

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch de feature: `git checkout -b feature/sua-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona sua feature'`
4. Push para a branch: `git push origin feature/sua-feature`
5. Abra um Pull Request

### Diretrizes de Desenvolvimento

- Siga o estilo e padrões de código existentes
- Adicione traduções para qualquer texto visível ao usuário
- Teste em múltiplos navegadores
- Atualize a documentação conforme necessário

---

## Licença

Licença MIT - Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Autor**: [@mafhper](https://github.com/mafhper)

**Repositório**: [github.com/mafhper/aurawall](https://github.com/mafhper/aurawall)
