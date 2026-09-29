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

### `scripts/ops/clean-dist.cjs` and `scripts/ops/organize-dist.cjs`

`npm run build:dist` is the shape Pages actually deploys, and it is two scripts:

- `clean-dist.cjs` removes `dist/` first. The promo build declares `outDir: '../dist'` with `emptyOutDir: true`, but Vite does not empty an `outDir` outside the project root — so `dist/app` and `dist/client` get cleaned by their own builds and **the root never does**. Once `organize-dist` has put files at the root, a plain `npm run build` leaves them there, and the next run measures last run's leftovers as if they were current output.
- `organize-dist.cjs` moves `dist/client/*` to the root of `dist/` and removes `dist/client`. It is **idempotent** — a deploy re-run is the normal recovery path for Pages, and a step that is not idempotent fails on the second run.

Both are covered by `scripts/test/organize-dist.test.cjs`, which runs against a synthetic `dist/` rather than the real build.

`scripts/test/perf.cjs` measures **everything in `dist/` except `dist/server/`**, which is what Pages serves. It used to measure `dist/app` + `dist/client`, a shape nothing deploys: the flatten step deleted `dist/client` *after* measurement, so 57 files and 0.69 MB of the promo payload would have stopped being counted while the gate stayed green.

## Commands

### Main

- `npm run dev`
- `npm run build:app`
- `npm run build:promo`
- `npm run build:dist`
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

## Release Art

The release image is resolved **per tag**, from the most specific to the most generic, in
`docs/images/releases/`. The resolution order is implemented by release-core
(`IMAGE_CORRECTION_SUFFIX=-new`), not by this repository:

| Order | File | Source | Meaning |
|---|---|---|---|
| 1 | `release-v1.0.0-new.webp` | default branch | **correction** for a published tag |
| 2 | `release-v1.0.0.webp` | the tag | art pinned to that exact version |
| 3 | `release-v1.0-new.webp` | default branch | correction for the `1.0` line |
| 4 | `release-v1.0.webp` | the tag | art for the whole `1.0` line |
| 5 | `release.webp` | the tag | legacy, single-file art |

Two rules that follow from the order, and that are easy to get wrong:

- **The `v` is part of the name.** The art is `release-v1.0.webp`, not `release-1.0.webp`. The
  editorial notes pattern does *not* carry the `v`; the art does.
- **A `-new` file is a correction, not a second artwork.** It is the way to fix the image of a tag
  that is already published. It resolves first, and the `-new` suffix is stripped when the asset is
  uploaded — **the previously published asset is not deleted**, so see the warning below.

### Adding art for a new tag

With `granularity: "minor"`, **entering a new `major.minor` line requires a new image in that tag**,
and the release workflow fails without it. So `v1.1.0` needs `release-v1.1.0.webp` (or
`release-v1.1.webp`) committed; `v1.0.1` reuses `release-v1.0.webp` and needs no editorial work.

### Fixing the art of a published tag

1. Commit `<the resolved name>-new.webp` to the default branch.
2. Re-run that tag's workflow (`gh workflow run release.yml -f tag=<tag>`).

**The tag is not moved and nothing is re-versioned.** Re-running is what makes the correction take
effect: the workflow fetches the `-new` file from the **default branch** (not from the tag — that is
the whole point, it is what allows fixing art without moving the tag), uploads it, and rewrites the
release body to point at the new asset.

#### The asset name changes, and the old one stays

This is the part worth knowing before you correct art, and it was learned by doing it on `v1.0.0`.

The uploaded asset is the resolved filename **with `-new` removed**. A correction therefore
publishes the **tag-specific** name, even when the release had previously published the line name:

| | before the correction | after |
|---|---|---|
| committed file used | `release-v1.0.webp` (from the tag, position 4) | `release-v1.0.0-new.webp` (from the default branch, position 1) |
| uploaded asset | `release-v1.0.webp` | **`release-v1.0.0.webp`** |
| body points at | `release-v1.0.webp` | `release-v1.0.0.webp` |

So a corrected release ends up carrying **both** assets: the new one the body references, and the
stale one from before. Nothing deletes it — deleting a published asset is a separate, deliberate
step (`gh release delete-asset <tag> -n <name>`), and it is not automatic because the stale file
may still be the thing some reader already bookmarked.

Replacing `release-v1.0.webp` alone does **not** fix an already published release. That is the whole
reason the `-new` convention exists: the body of a published release points at the file pinned in
the tag, so editing the default branch moves the art for *future* tags and leaves the past alone.

### Art sources

Editorial art is produced outside the repository. The current `release-v1.0.webp` is a 1440x900
WebP generated from the promo hero. Keep the committed file small — the published asset is the WebP,
not the PNG source.

## Documentation Contract

When engine behavior, preset flow, promo asset generation, or the release process changes, update:

- `README.md`
- `docs/TECHNICAL_GUIDE.md`

The docs should describe the current system as shipped, not intermediate experiments. Version
history lives in the GitHub Releases, which the release workflow generates per tag.
