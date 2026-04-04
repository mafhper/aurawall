import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const OUTPUT_DIRS = [
  path.join(repoRoot, 'public'),
  path.join(repoRoot, 'website', 'public'),
];

const renderModuleSource = `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import WallpaperRenderer from './src/components/WallpaperRenderer.tsx';
  import { DEFAULT_CONFIG, PRESETS, CANONICAL_ENGINE_PRESET_IDS } from './src/constants.ts';

  const cloneConfig = (preset, width, height) => ({
    ...structuredClone(DEFAULT_CONFIG),
    width,
    height,
    baseColor: preset.config.baseColor || DEFAULT_CONFIG.baseColor,
    shapes: preset.config.shapes || [],
    noise: preset.config.noise ?? DEFAULT_CONFIG.noise,
    noiseScale: preset.config.noiseScale ?? DEFAULT_CONFIG.noiseScale,
    animation: { ...DEFAULT_CONFIG.animation, ...(preset.config.animation || {}), enabled: false },
    vignette: { ...DEFAULT_CONFIG.vignette, ...(preset.config.vignette || {}) },
  });

  export const buildPromoAssets = ({ width, height }) => {
    return Object.entries(CANONICAL_ENGINE_PRESET_IDS).map(([engineId, presetId]) => {
      const preset = PRESETS.find((item) => item.id === presetId);
      if (!preset) {
        throw new Error('Missing canonical preset for engine: ' + engineId + ' -> ' + presetId);
      }

      const svg = renderToStaticMarkup(
        React.createElement(WallpaperRenderer, {
          config: cloneConfig(preset, width, height),
          paused: true,
          lowQuality: false,
        })
      );

      return {
        engineId,
        presetId,
        svg,
      };
    });
  };
`;

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true });
};

const bundleRenderer = async (tmpDir) => {
  const bundlePath = path.join(tmpDir, 'promo-asset-renderer.mjs');

  await build({
    stdin: {
      contents: renderModuleSource,
      resolveDir: repoRoot,
      sourcefile: 'promo-asset-renderer.tsx',
      loader: 'tsx',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: bundlePath,
    external: ['react', 'react-dom/server', 'react/jsx-runtime'],
    logLevel: 'silent',
  });

  return bundlePath;
};

const main = async () => {
  const width = 1600;
  const height = 900;
  const tmpDir = path.join(repoRoot, '.dev', 'img', 'promo-assets-tmp');

  await ensureDir(tmpDir);
  const bundlePath = await bundleRenderer(tmpDir);
  const renderModule = await import(pathToFileURL(bundlePath).href);
  const assets = renderModule.buildPromoAssets({ width, height });

  for (const asset of assets) {
    const fileName = `bg-${asset.engineId}.svg`;
    for (const outputDir of OUTPUT_DIRS) {
      await fs.writeFile(path.join(outputDir, fileName), asset.svg, 'utf8');
    }
    console.log(`[promo-assets] ${asset.engineId} <- ${asset.presetId}`);
  }
};

main().catch((error) => {
  console.error('[promo-assets] Failed to render assets');
  console.error(error);
  process.exitCode = 1;
});
