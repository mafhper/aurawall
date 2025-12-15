# Technical Guide - AuraWall

## Overview

AuraWall is a procedural wallpaper generator built with React 19, TypeScript, and SVG rendering.

## Architecture

### Core Stack
- **React 19** + TypeScript - UI and state management
- **Vite 6** - Build and development server
- **Tailwind CSS v4** - Styling framework
- **SVG DOM** - Vector graphics rendering

### Project Structure
```
aurawall/
├── src/                   # Main application (editor)
│   ├── components/        # React components
│   ├── engines/           # Preset generation engines
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types.ts           # TypeScript definitions
│   └── constants.ts       # Application constants
├── website/               # Promo site (SSR/SSG)
│   ├── src/pages/         # Page components
│   └── src/components/    # Shared components
├── public/                # Static assets
├── scripts/               # Build and maintenance scripts
└── docs/                  # Documentation
```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both app and promo dev servers |
| `npm run build` | Build both app and promo for production |
| `npm run build:promo` | Build promo site with SSG |
| `npm run build:app` | Build main application |

## Health & Quality Scripts

| Command | Description |
|---------|-------------|
| `npm run health` | Full system health check |
| `npm run health:fast` | Quick health (skip install) |
| `npm run test:lint` | ESLint check |
| `npm run test:i18n` | i18n key parity check |
| `npm run test:contrast` | WCAG contrast check |
| `npm run test:perf` | Bundle size check |

## Key Components

### WallpaperRenderer
Main SVG rendering component. Accepts a `WallpaperConfig` and renders shapes with filters.

### HeroBackground
Hero section background with animated presets. Uses `presetId` for deterministic SSR.

### GalleryCard
Interactive card component with hover-to-play animation.

## Performance Targets

- **Lighthouse Score**: 90+
- **FPS**: 60 (CSS animations)
- **Bundle Size**: <5MB total

## i18n Support

Languages: English (en), Portuguese (pt-BR), Spanish (es)

All translations in `src/i18n.ts` and `website/src/i18n.ts`.
