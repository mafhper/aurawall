# Technical Guide

## Overview

AuraWall is a static, vector-first wallpaper system with two surfaces:

- `src/`: the editor app
- `website/`: the promo site

The shared visual contract is `WallpaperConfig`. Engines and presets create or transform that config, `WallpaperRenderer` renders it as SVG, and export flows optionally rasterize it to `JPG` or `PNG`.

## Current Product Behavior

### Editor

- one engine active at a time
- one library per engine, with exactly 3 curated presets
- preset thumbnails rendered from the actual preset config
- `Randomizar Motor Atual` preserves the selected preset identity when one is active
- `Variacoes Inspiradas` are derived from the current canvas and stay visually close to the active preset/config

### Promo

- static deployment with no backend
- engine gallery driven by `website/src/data/engines.ts`
- hero plus uniform grid layout on `/creation/engines`
- canonical `bg-*.svg` assets generated from real presets, not hand-maintained illustrations

## Core Files

### `src/constants.ts`

Contains:

- `DEFAULT_CONFIG`
- preset library
- curated hero presets
- canonical promo preset mapping through `CANONICAL_ENGINE_PRESET_IDS`

### `src/types.ts`

Defines:

- `WallpaperConfig`
- `Shape`
- engine interfaces and variation/randomizer contracts

### `src/engines/*.ts`

Each engine exposes:

- `meta`
- `randomizer`
- `variations`

The randomizer should stay cheap enough for animated SVG playback. If an engine depends on too many tiny particles or heavy blur stacks, browser animation will regress quickly.

### `src/components/WallpaperRenderer.tsx`

Responsible for:

- SVG shape rendering
- base transforms
- animation transforms
- filters and grain
- deterministic static rendering for thumbnails and promo assets

### `scripts/ops/render-engine-samples.mjs`

CLI renderer for batch engine sampling. Use it to inspect visual differentiation without opening the app UI. Run with no arguments for the interactive picker, or pass flags (`--engines=`, `--count=`, `--random`, `--formats=`, `--include-presets`, `--quick`); `--help` lists everything.

The logic lives in `scripts/ops/lib/engine-samples/` — one module per concern, so the entry point stays readable. `paths.mjs` resolves the repo root by walking up to the `package.json` rather than counting `../..` levels, and is also the single place that decides the output and cache locations (`node_modules/.cache/aurawall`, per ADR-004: tooling must not write into the private workspace).

Two behaviours are deliberate and worth keeping:

- **Invalid flags fail, they are not coerced.** `--count=abc` exits 1 instead of silently running the default count. The parser collects `parseErrors` and `validator.mjs` reports them.
- **One failing sample does not abort the run.** Failures are collected into the manifest, which is written even when some renders failed.

### `scripts/ops/render-promo-assets.mjs`

Generates the canonical promo SVGs from `CANONICAL_ENGINE_PRESET_IDS` and writes them to both `public/` and `website/public/`.

## Commands

### Main

- `npm run dev`
- `npm run build:app`
- `npm run build:promo`
- `npm run lint`

### Visual Tooling

- `npm run generate:engine-samples`
- `npm run generate:promo-assets`

## Visual Contract

When refining engines or presets:

- each engine must justify its existence with a distinct visual vocabulary
- each preset must reflect its name and tagline, not just a small palette shift
- avoid reusing the same fallback motif across engines, especially tiny bright circular particles
- keep animated SVG cost under control; visual richness cannot come from brute-force shape counts

## Documentation Contract

When engine behavior, preset flow, or promo asset generation changes, update:

- `README.md`
- `docs/TECHNICAL_GUIDE.md`

The docs should describe the current system as shipped, not intermediate experiments. Version
history lives in the GitHub Releases, which the release workflow generates per tag.
