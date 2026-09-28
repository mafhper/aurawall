import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { build } from 'esbuild';
import { createSpinner } from './logger.mjs';
import { cacheDir as CACHE_DIR, repoRoot } from './paths.mjs';

const BUNDLE_PATH = path.join(CACHE_DIR, 'engine-sample-renderer.mjs');
const HASH_PATH = path.join(CACHE_DIR, 'engine-sample-renderer.hash.txt');

const renderModuleSource = `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import WallpaperRenderer from './src/components/WallpaperRenderer.tsx';
  import { DEFAULT_CONFIG, PRESETS } from './src/constants.ts';
  import { engines } from './src/engines/index.ts';

  const normalizeSeed = (seed) => {
    let value = Number.isFinite(seed) ? Math.abs(Math.floor(seed)) : 1;
    if (value === 0) value = 1;
    return value >>> 0;
  };

  const mulberry32 = (seed) => {
    let a = normalizeSeed(seed);
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const withSeed = (seed, fn) => {
    const originalRandom = Math.random;
    Math.random = mulberry32(seed);
    try {
      return fn();
    } finally {
      Math.random = originalRandom;
    }
  };

  const cloneConfig = (width, height) => {
    const base = structuredClone(DEFAULT_CONFIG);
    base.width = width;
    base.height = height;
    return base;
  };

  const applyPreset = (preset, width, height) => {
    const base = cloneConfig(width, height);
    return {
      ...base,
      ...preset.config,
      width,
      height,
      baseColor: preset.config.baseColor ?? base.baseColor,
      shapes: preset.config.shapes ?? base.shapes,
      noise: preset.config.noise ?? base.noise,
      noiseScale: preset.config.noiseScale ?? base.noiseScale,
      animation: {
        ...base.animation,
        ...(preset.config.animation || {}),
      },
      vignette: {
        ...base.vignette,
        ...(preset.config.vignette || {}),
      },
    };
  };

  export const availableEngines = Object.keys(engines);
  export const presetsByEngine = PRESETS.reduce((acc, preset) => {
    if (!acc[preset.collection]) acc[preset.collection] = [];
    acc[preset.collection].push({
      id: preset.id,
      name: preset.name,
      category: preset.category,
    });
    return acc;
  }, {});

  export const renderEngineSample = ({ engineId, width, height, seed, isGrainLocked }) => {
    const engine = engines[engineId];
    if (!engine) throw new Error('Engine desconhecida: ' + engineId);

    const config = withSeed(seed, () => {
      const nextConfig = engine.randomizer(cloneConfig(width, height), { isGrainLocked });
      return { ...nextConfig, width, height };
    });

    const shapeTypeCounts = config.shapes.reduce((acc, shape) => {
      acc[shape.type] = (acc[shape.type] || 0) + 1;
      return acc;
    }, {});

    const svg = renderToStaticMarkup(
      React.createElement(WallpaperRenderer, { config, paused: true })
    );

    return {
      svg,
      meta: {
        engineId,
        seed,
        baseColor: config.baseColor,
        noise: config.noise,
        noiseScale: config.noiseScale,
        shapeCount: config.shapes.length,
        shapeTypeCounts,
      }
    };
  };

  export const renderPresetSample = ({ presetId, width, height }) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) throw new Error('Preset desconhecido: ' + presetId);

    const config = applyPreset(preset, width, height);
    const shapeTypeCounts = config.shapes.reduce((acc, shape) => {
      acc[shape.type] = (acc[shape.type] || 0) + 1;
      return acc;
    }, {});

    const svg = renderToStaticMarkup(
      React.createElement(WallpaperRenderer, { config, paused: true })
    );

    return {
      svg,
      meta: {
        engineId: preset.collection,
        presetId: preset.id,
        presetName: preset.name,
        presetCategory: preset.category,
        baseColor: config.baseColor,
        noise: config.noise,
        noiseScale: config.noiseScale,
        shapeCount: config.shapes.length,
        shapeTypeCounts,
      }
    };
  };
`;

const sha256 = (content) => crypto.createHash('sha256').update(content).digest('hex');

export async function getOrCreateBundle() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const currentHash = sha256(renderModuleSource);
  // Primeiro uso, ou cache apagado: cachedHash fica '' e recompila.
  const cachedHash = await fs.readFile(HASH_PATH, 'utf-8').catch(() => '');

  if (cachedHash === currentHash && fsSync.existsSync(BUNDLE_PATH)) {
    return BUNDLE_PATH;
  }

  const spinner = createSpinner('Preparando módulo de renderização...');
  try {
    await build({
      stdin: {
        contents: renderModuleSource,
        resolveDir: repoRoot,
        sourcefile: 'engine-sample-renderer.tsx',
        loader: 'tsx',
      },
      bundle: true,
      format: 'esm',
      platform: 'node',
      outfile: BUNDLE_PATH,
      external: ['react', 'react-dom/server', 'react/jsx-runtime'],
      logLevel: 'silent',
    });
    await fs.writeFile(HASH_PATH, currentHash);
    spinner.succeed('Módulo de renderização atualizado.');
    return BUNDLE_PATH;
  } catch (err) {
    spinner.fail('Falha ao gerar o bundle de renderização.');
    throw err;
  }
}