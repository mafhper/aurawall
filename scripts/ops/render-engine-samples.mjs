import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const DEFAULT_ENGINES = ['midnight', 'astra', 'sakura', 'ember', 'oceanic'];
const DEFAULT_COUNT = 6;
const DEFAULT_WIDTH = 1600;
const DEFAULT_HEIGHT = 900;
const DEFAULT_QUALITY = 92;
const DEFAULT_OUTPUT_ROOT = path.join(repoRoot, '.dev', 'img', 'cli-samples');

const formatRunTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
};

const formatElapsed = (startedAt) => {
  const totalSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
};

const parseArgs = (args) => {
  const options = {
    engines: [...DEFAULT_ENGINES],
    count: DEFAULT_COUNT,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    formats: ['svg', 'jpg'],
    outputRoot: DEFAULT_OUTPUT_ROOT,
    isGrainLocked: false,
    quality: DEFAULT_QUALITY,
    seeds: [],
    includePresets: false,
  };

  for (const arg of args) {
    if (arg === '--grain-lock') {
      options.isGrainLocked = true;
      continue;
    }
    if (arg === '--include-presets') {
      options.includePresets = true;
      continue;
    }

    if (!arg.startsWith('--')) continue;
    const [rawKey, rawValue = ''] = arg.slice(2).split('=');
    const key = rawKey.trim();
    const value = rawValue.trim();

    if (key === 'engines' && value) {
      options.engines = value.split(',').map((item) => item.trim()).filter(Boolean);
    } else if (key === 'count' && value) {
      const parsedCount = Number.parseInt(value, 10);
      options.count = Number.isFinite(parsedCount) ? Math.max(0, parsedCount) : DEFAULT_COUNT;
    } else if (key === 'width' && value) {
      options.width = Math.max(320, Number.parseInt(value, 10) || DEFAULT_WIDTH);
    } else if (key === 'height' && value) {
      options.height = Math.max(320, Number.parseInt(value, 10) || DEFAULT_HEIGHT);
    } else if (key === 'formats' && value) {
      options.formats = value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
    } else if (key === 'output' && value) {
      options.outputRoot = path.resolve(repoRoot, value);
    } else if (key === 'quality' && value) {
      options.quality = Math.min(100, Math.max(40, Number.parseInt(value, 10) || DEFAULT_QUALITY));
    } else if (key === 'seeds' && value) {
      options.seeds = value
        .split(',')
        .map((item) => Number.parseInt(item.trim(), 10))
        .filter((item) => Number.isFinite(item));
    }
  }

  if (options.seeds.length === 0 && options.count > 0) {
    options.seeds = Array.from({ length: options.count }, (_, index) => 101 + index * 137);
  } else if (options.seeds.length > 0) {
    options.count = options.seeds.length;
  }

  return options;
};

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
    if (!engine) {
      throw new Error('Unknown engine: ' + engineId);
    }

    const config = withSeed(seed, () => {
      const nextConfig = engine.randomizer(cloneConfig(width, height), { isGrainLocked });
      return {
        ...nextConfig,
        width,
        height,
      };
    });

    const shapeTypeCounts = config.shapes.reduce((acc, shape) => {
      acc[shape.type] = (acc[shape.type] || 0) + 1;
      return acc;
    }, {});

    const svg = renderToStaticMarkup(
      React.createElement(WallpaperRenderer, {
        config,
        paused: true,
      })
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
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      throw new Error('Unknown preset: ' + presetId);
    }

    const config = applyPreset(preset, width, height);
    const shapeTypeCounts = config.shapes.reduce((acc, shape) => {
      acc[shape.type] = (acc[shape.type] || 0) + 1;
      return acc;
    }, {});

    const svg = renderToStaticMarkup(
      React.createElement(WallpaperRenderer, {
        config,
        paused: true,
      })
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

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true });
};

const writeVariant = async (formats, svg, outputBasePath, quality) => {
  const buffer = Buffer.from(svg);

  if (formats.includes('svg')) {
    await fs.writeFile(`${outputBasePath}.svg`, buffer);
  }

  if (formats.includes('jpg') || formats.includes('jpeg')) {
    await sharp(buffer)
      .flatten({ background: '#000000' })
      .jpeg({ quality, mozjpeg: true })
      .toFile(`${outputBasePath}.jpg`);
  }
};

const buildSheet = async (engineId, jpgPaths, sheetPath) => {
  if (jpgPaths.length === 0) return;

  const meta = await Promise.all(jpgPaths.map((jpgPath) => sharp(jpgPath).metadata()));
  const cellWidth = Math.max(...meta.map((item) => item.width || 0));
  const cellHeight = Math.max(...meta.map((item) => item.height || 0));
  const columns = Math.min(3, jpgPaths.length);
  const rows = Math.ceil(jpgPaths.length / columns);
  const padding = 28;
  const titleHeight = 74;
  const captionHeight = 42;
  const sheetWidth = columns * cellWidth + (columns + 1) * padding;
  const sheetHeight = titleHeight + rows * (cellHeight + captionHeight) + (rows + 1) * padding;

  const overlays = [];
  const background = sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 8, g: 8, b: 12, alpha: 1 }
    }
  });

  const escapeXml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

  const titleSvg = Buffer.from(`
    <svg width="${sheetWidth}" height="${titleHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#08080c"/>
      <text x="${padding}" y="34" fill="#f5f7fb" font-size="28" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${escapeXml(engineId)}</text>
      <text x="${padding}" y="58" fill="#a9b0bd" font-size="15" font-family="Segoe UI, Arial, sans-serif">CLI samples rendered from the current source engine and SVG renderer</text>
    </svg>
  `);

  overlays.push({ input: titleSvg, top: 0, left: 0 });

  for (let index = 0; index < jpgPaths.length; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = padding + column * (cellWidth + padding);
    const top = titleHeight + padding + row * (cellHeight + captionHeight);
    const labelTop = top + cellHeight + 10;
    const fileName = path.basename(jpgPaths[index]);

    overlays.push({ input: jpgPaths[index], top, left });

    const captionSvg = Buffer.from(`
      <svg width="${cellWidth}" height="${captionHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#08080c"/>
        <text x="0" y="24" fill="#dce2ea" font-size="18" font-family="Segoe UI, Arial, sans-serif" font-weight="600">${escapeXml(fileName)}</text>
      </svg>
    `);
    overlays.push({ input: captionSvg, top: labelTop, left });
  }

  await background.composite(overlays).jpeg({ quality: 92, mozjpeg: true }).toFile(sheetPath);
};

const bundleRenderer = async (tmpDir) => {
  const bundlePath = path.join(tmpDir, 'engine-sample-renderer.mjs');

  await build({
    stdin: {
      contents: renderModuleSource,
      resolveDir: repoRoot,
      sourcefile: 'engine-sample-renderer.tsx',
      loader: 'tsx'
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: bundlePath,
    external: ['react', 'react-dom/server', 'react/jsx-runtime'],
    logLevel: 'silent'
  });

  return bundlePath;
};

const main = async () => {
  const startedAt = Date.now();
  const options = parseArgs(process.argv.slice(2));
  const runDir = path.join(options.outputRoot, formatRunTimestamp());
  const tmpDir = path.join(runDir, '.tmp');

  console.log(`[engine-samples] Starting run`);
  console.log(`[engine-samples] Output: ${runDir}`);
  console.log(`[engine-samples] Engines: ${options.engines.join(', ')}`);
  console.log(`[engine-samples] Size: ${options.width}x${options.height}`);
  console.log(`[engine-samples] Formats: ${options.formats.join(', ')}`);
  console.log(`[engine-samples] Seeds: ${options.seeds.join(', ')}`);
  console.log(`[engine-samples] Include presets: ${options.includePresets ? 'yes' : 'no'}`);

  await ensureDir(runDir);
  await ensureDir(tmpDir);

  const bundlePath = await bundleRenderer(tmpDir);
  const renderModule = await import(pathToFileURL(bundlePath).href);
  const availableEngines = new Set(renderModule.availableEngines);
  const presetsByEngine = renderModule.presetsByEngine || {};

  const requestedEngines = options.engines.filter((engineId) => availableEngines.has(engineId));
  const missingEngines = options.engines.filter((engineId) => !availableEngines.has(engineId));

  if (requestedEngines.length === 0) {
    throw new Error('No valid engines requested.');
  }

  if (missingEngines.length > 0) {
    console.log(`[engine-samples] Skipping unknown engines: ${missingEngines.join(', ')}`);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    outputDir: runDir,
    width: options.width,
    height: options.height,
    formats: options.formats,
    quality: options.quality,
    isGrainLocked: options.isGrainLocked,
    requestedEngines,
    missingEngines,
    includePresets: options.includePresets,
    samples: []
  };

  for (const engineId of requestedEngines) {
    const engineDir = path.join(runDir, engineId);
    await ensureDir(engineDir);
    const jpgPaths = [];
    console.log(`[engine-samples] Engine ${engineId}: ${options.seeds.length} sample(s)`);

    for (const seed of options.seeds) {
      console.log(`[engine-samples] Rendering ${engineId} seed=${seed}...`);
      const sample = renderModule.renderEngineSample({
        engineId,
        width: options.width,
        height: options.height,
        seed,
        isGrainLocked: options.isGrainLocked
      });

      const baseName = `${engineId}-seed-${seed}`;
      const outputBasePath = path.join(engineDir, baseName);
      await writeVariant(options.formats, sample.svg, outputBasePath, options.quality);
      console.log(`[engine-samples] Saved ${baseName}.${options.formats.includes('jpg') || options.formats.includes('jpeg') ? 'jpg' : 'svg'}`);

      const jpgPath = `${outputBasePath}.jpg`;
      if (options.formats.includes('jpg') || options.formats.includes('jpeg')) {
        jpgPaths.push(jpgPath);
      }

      manifest.samples.push({
        ...sample.meta,
        kind: 'random',
        files: {
          svg: options.formats.includes('svg') ? `${outputBasePath}.svg` : null,
          jpg: (options.formats.includes('jpg') || options.formats.includes('jpeg')) ? jpgPath : null
        }
      });
    }

    if (jpgPaths.length > 0) {
      console.log(`[engine-samples] Building contact sheet for ${engineId}...`);
      await buildSheet(engineId, jpgPaths, path.join(engineDir, `${engineId}-sheet.jpg`));
    }

    if (options.includePresets) {
      const enginePresets = presetsByEngine[engineId] || [];
      const presetDir = path.join(engineDir, 'presets');
      const presetJpgPaths = [];

      await ensureDir(presetDir);
      console.log(`[engine-samples] Engine ${engineId}: ${enginePresets.length} preset(s)`);

      for (const preset of enginePresets) {
        console.log(`[engine-samples] Rendering preset ${engineId}/${preset.id}...`);
        const sample = renderModule.renderPresetSample({
          presetId: preset.id,
          width: options.width,
          height: options.height,
        });

        const baseName = `${engineId}-preset-${preset.id}`;
        const outputBasePath = path.join(presetDir, baseName);
        await writeVariant(options.formats, sample.svg, outputBasePath, options.quality);
        console.log(`[engine-samples] Saved ${baseName}.${options.formats.includes('jpg') || options.formats.includes('jpeg') ? 'jpg' : 'svg'}`);

        const jpgPath = `${outputBasePath}.jpg`;
        if (options.formats.includes('jpg') || options.formats.includes('jpeg')) {
          presetJpgPaths.push(jpgPath);
        }

        manifest.samples.push({
          ...sample.meta,
          kind: 'preset',
          files: {
            svg: options.formats.includes('svg') ? `${outputBasePath}.svg` : null,
            jpg: (options.formats.includes('jpg') || options.formats.includes('jpeg')) ? jpgPath : null
          }
        });
      }

      if (presetJpgPaths.length > 0) {
        console.log(`[engine-samples] Building preset sheet for ${engineId}...`);
        await buildSheet(`${engineId} presets`, presetJpgPaths, path.join(presetDir, `${engineId}-presets-sheet.jpg`));
      }
    }
  }

  await fs.writeFile(path.join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await fs.rm(tmpDir, { recursive: true, force: true });

  console.log(`[engine-samples] Completed in ${formatElapsed(startedAt)}`);
  console.log(JSON.stringify({
    outputDir: runDir,
    requestedEngines,
    missingEngines,
    seeds: options.seeds,
    formats: options.formats
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
