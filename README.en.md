# AuraWall

**Procedural Vector Wallpaper Generator**

AuraWall is a client-side web application that generates abstract, high-resolution wallpapers using procedural algorithms and vector graphics. Unlike AI-based generators, AuraWall creates deterministic, mathematically harmonious images that are infinitely scalable and lightweight.

![AuraWall Interface](public/og-image.jpg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AuraWall operates entirely in the browser with zero server dependencies. The application uses a JSON-based configuration system (`WallpaperConfig`) that describes shapes, colors, filters, and animations. This configuration is rendered reactively as SVG, then rasterized via Canvas API for export.

### Key Principles

- **Deterministic Generation**: Same seed produces identical output every time
- **Vector-First**: All rendering happens in SVG until final export
- **Procedural Intelligence**: Curated randomness ensures aesthetic consistency
- **Zero Dependencies**: No backend, no AI APIs, no external services

---

## Features

### Generation Engines

| Engine | Aesthetic | Characteristics |
|--------|-----------|-----------------|
| **Boreal** | Ethereal, soft | High blur, analogous colors, multiply/screen blend modes |
| **Chroma** | Liquid, acidic | Low blur, complementary colors, difference/exclusion blend modes |
| **Animation** | Kinetic, flowing | CSS keyframe animations for drift, pulse, rotate, noise |

### Controls

- **Shape Management**: Add, remove, and configure individual layers
- **Color Science**: Base gradients, hue constraints, harmonic selection
- **Post-Processing**: Vignette effect, procedural grain, blur intensity
- **Motion Physics**: Animation speed, flow direction, turbulence

### Export Options

| Format | Use Case |
|--------|----------|
| PNG | Lossless, transparent background support |
| JPG | Smaller file size, configurable quality |
| SVG | Vector source for editing in Illustrator/Figma |

### Resolution Presets

- Desktop: 1920x1080, 2560x1440, 3840x2160 (4K)
- Mobile: iPhone, Android, iPad
- Custom: Any aspect ratio

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Core | React 19, TypeScript |
| Build | Vite 6, PostCSS |
| Styling | Tailwind CSS v4 |
| Graphics | Native SVG DOM, Canvas API |
| i18n | i18next (8 languages) |
| Testing | Vitest, Playwright |

---

## Installation

### Prerequisites

- Node.js 18 or higher (Node.js 20+ recommended)
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/mafhper/aurawall.git
cd aurawall

# Install dependencies
npm install

# Start development server (Main App + Promo Site concurrently)
npm run dev

# OR start them individually:
# Main Application
npm run app

# Promotional Website
npm run promo
```

The application will be available at `http://localhost:5173`.

### Production Build

```bash
# Build both applications
npm run build

# Build main application only
npm run build-app

# Build promotional website only
npm run build-promo

# Preview production build
npm run preview
```

---

## Usage

### Quick Start

1. Open the application in your browser
2. Select a generation engine (Boreal or Chroma)
3. Adjust parameters using the control panel
4. Click "Generate" or use the randomizer
5. Export in your preferred format and resolution

### URL Sharing

Configurations can be shared via URL. The application uses `lz-string` compression to encode the entire `WallpaperConfig` object into a shareable link.

### Preset Gallery

Access the gallery to browse curated presets. Each preset can be:
- Downloaded directly as PNG (1920x1080)
- Opened in the editor for customization
- Used as a starting point for new creations

---

## Project Structure

```
aurawall/
├── src/                      # Main application source
│   ├── components/           # React components
│   ├── services/             # Business logic
│   ├── constants.ts          # Presets and defaults
│   └── types.ts              # TypeScript definitions
│
├── website/                  # Promotional site (separate build)
│   ├── src/pages/            # Landing, Gallery, About
│   └── vite.config.ts        # Site build configuration
│
├── public/                   # Static assets
└── package.json              # Dependencies and scripts
```

---

## Customization

### Adding New Presets

Presets are defined in `src/constants.ts`:

```typescript
export const PRESETS: Preset[] = [
  {
    id: 'my-preset',
    name: 'My Custom Preset',
    collection: 'boreal',
    config: {
      baseColor: '#1a0a2e',
      shapes: [...],
      animation: { enabled: true, speed: 2 },
    }
  }
];
```

### Creating Custom Engines

Engines are defined by their blend mode and blur characteristics. Modify `src/services/svgGenerator.ts` to add new generation algorithms.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Author**: [@mafhper](https://github.com/mafhper)

**Repository**: [github.com/mafhper/aurawall](https://github.com/mafhper/aurawall)
