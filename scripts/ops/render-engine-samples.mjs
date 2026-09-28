import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import { confirm } from '@inquirer/prompts';
import { parseArguments } from './lib/engine-samples/cli-parser.mjs';
import { interactiveSetup } from './lib/engine-samples/interactive-config.mjs';
import { getOrCreateBundle } from './lib/engine-samples/renderer-bundler.mjs';
import { writeVariants } from './lib/engine-samples/image-writer.mjs';
import { buildContactSheet } from './lib/engine-samples/contact-sheet.mjs';
import { generateHtmlGallery } from './lib/engine-samples/html-gallery.mjs';
import { validateOptions } from './lib/engine-samples/validator.mjs';
import { runWithConcurrency } from './lib/engine-samples/concurrency.mjs';
import {
  stopSpinner,
  logInfo,
  logSuccess,
  logWarning,
  logError,
  updateProgress,
} from './lib/engine-samples/logger.mjs';

const randomSeeds = (count) => Array.from({ length: count }, () => crypto.randomInt(1, 2 ** 31));
const timestampCompacto = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

async function verificarDependencias() {
  try {
    await import('sharp');
    await import('esbuild');
  } catch {
    logError('Dependências ausentes. Execute: npm install');
    process.exit(1);
  }
}

async function main() {
  const inicioGlobal = Date.now();
  await verificarDependencias();

  const cliOpts = parseArguments(process.argv.slice(2));
  const temArgs = process.argv.slice(2).length > 0;
  const usarInterativo = cliOpts.interactive || (!temArgs && !cliOpts.quick);

  let opcoes;

  // Bundle para obter engines
  const bundlePath = await getOrCreateBundle();
  const renderModule = await import(pathToFileURL(bundlePath).href);
  const availableEngines = renderModule.availableEngines;
  const presetsByEngine = renderModule.presetsByEngine ?? {};

  if (usarInterativo) {
    opcoes = await interactiveSetup(availableEngines);
    if (opcoes.random && opcoes.count > 0) {
      opcoes.seeds = randomSeeds(opcoes.count);
    } else if (!opcoes.random && opcoes.seeds.length === 0 && opcoes.count > 0) {
      opcoes.seeds = Array.from({ length: opcoes.count }, (_, i) => 101 + i * 137);
    }
    console.log('\n📋 Resumo:');
    console.log(`   Engines: ${opcoes.engines.join(', ')}`);
    console.log(`   Resolução: ${opcoes.width}x${opcoes.height}`);
    console.log(`   Amostras aleatórias: ${opcoes.count > 0 ? opcoes.count + ' por engine' : 'nenhuma'}`);
    console.log(`   Seeds: ${opcoes.random ? 'aleatórias' : (opcoes.seeds.length ? opcoes.seeds.join(',') : 'não se aplica')}`);
    console.log(`   Presets: ${opcoes.includePresets ? 'sim' : 'não'}`);
    console.log(`   Formatos: ${opcoes.formats.join(', ')}`);
    console.log(`   Qualidade: ${opcoes.quality}`);
    console.log(`   Folhas de contato: ${opcoes.sheets ? 'sim' : 'não'}`);
    console.log(`   Estrutura: ${opcoes.nested ? 'pastas por engine' : 'todos na mesma pasta'}`);
    console.log(`   Concorrência: ${opcoes.concurrency} tarefas simultâneas`);
    console.log(`   Pasta: ${opcoes.outputRoot}`);

    const confirmado = await confirm({ message: 'Deseja iniciar a geração?', default: true });
    if (!confirmado) {
      console.log('Operação cancelada.');
      process.exit(0);
    }
  } else {
    opcoes = cliOpts;
    const erros = validateOptions(opcoes);
    if (erros.length > 0) {
      logError('Erros de validação:');
      erros.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }
    if (opcoes.random) {
      opcoes.seeds = randomSeeds(opcoes.count);
    } else if (opcoes.seeds.length === 0 && opcoes.count > 0) {
      opcoes.seeds = Array.from({ length: opcoes.count }, (_, i) => 101 + i * 137);
    }
    if (!opcoes.yes) {
      console.log('\n📋 Resumo:');
      console.log(`   Engines: ${opcoes.engines.join(', ')}`);
      console.log(`   Resolução: ${opcoes.width}x${opcoes.height}`);
      console.log(`   Amostras aleatórias: ${opcoes.count > 0 ? opcoes.count + ' por engine' : 'nenhuma'}`);
      console.log(`   Seeds: ${opcoes.random ? 'aleatórias' : (opcoes.seeds.length ? opcoes.seeds.join(',') : 'não se aplica')}`);
      console.log(`   Presets: ${opcoes.includePresets ? 'sim' : 'não'}`);
      console.log(`   Formatos: ${opcoes.formats.join(', ')}`);
      console.log(`   Qualidade: ${opcoes.quality}`);
      console.log(`   Folhas: ${opcoes.sheets ? 'sim' : 'não'}`);
      console.log(`   Estrutura: ${opcoes.nested ? 'pastas por engine' : 'todos na mesma pasta'}`);
      console.log(`   Concorrência: ${opcoes.concurrency}`);
      console.log(`   Pasta: ${opcoes.outputRoot}`);

      const confirmado = await confirm({ message: 'Deseja iniciar?', default: true });
      if (!confirmado) {
        console.log('Cancelado.');
        process.exit(0);
      }
    }
  }

  const enginesSolicitadas = opcoes.engines.filter(id => availableEngines.includes(id));
  const enginesDesconhecidas = opcoes.engines.filter(id => !availableEngines.includes(id));
  if (enginesSolicitadas.length === 0) {
    logError('Nenhuma engine válida selecionada.');
    process.exit(1);
  }
  if (enginesDesconhecidas.length) {
    logWarning(`Engines ignoradas: ${enginesDesconhecidas.join(', ')}`);
  }

  const runTimestamp = timestampCompacto();
  const runDir = path.join(opcoes.outputRoot, runTimestamp);
  const tmpDir = path.join(runDir, '.tmp');
  await fs.mkdir(runDir, { recursive: true });
  await fs.mkdir(tmpDir, { recursive: true });

  const manifesto = {
    createdAt: new Date().toISOString(),
    outputDir: runDir,
    width: opcoes.width,
    height: opcoes.height,
    formats: opcoes.formats,
    quality: opcoes.quality,
    concurrency: opcoes.concurrency,
    grainLock: opcoes.grainLock,
    includePresets: opcoes.includePresets,
    sheets: opcoes.sheets,
    nested: opcoes.nested,
    engines: enginesSolicitadas,
    missingEngines: enginesDesconhecidas,
    samples: [],
    performance: {},
  };

  const getBasePath = (engineId, filename, subfolder = '') => {
    if (opcoes.nested) {
      const dir = path.join(runDir, engineId, subfolder);
      return path.join(dir, filename);
    } else {
      return path.join(runDir, `${engineId}_${subfolder ? subfolder + '_' : ''}${filename}`);
    }
  };

  const ensureDir = async (dir) => { await fs.mkdir(dir, { recursive: true }); };

  // Monta lista de tarefas
  const randomTasks = [];
  const presetTasks = [];
  if (opcoes.count > 0 && opcoes.seeds.length > 0) {
    for (const engineId of enginesSolicitadas) {
      for (const seed of opcoes.seeds) {
        randomTasks.push({ engineId, seed, type: 'random' });
      }
    }
  }
  if (opcoes.includePresets) {
    for (const engineId of enginesSolicitadas) {
      const presets = presetsByEngine[engineId] || [];
      for (const preset of presets) {
        presetTasks.push({ engineId, presetId: preset.id, presetName: preset.name, category: preset.category, type: 'preset' });
      }
    }
  }

  const totalTasks = randomTasks.length + presetTasks.length;

  // Aviso de alto volume
  const ALTO_VOLUME_THRESHOLD = 20;
  const ALTA_RESOLUCAO_THRESHOLD = 1920 * 1080;
  const pixels = opcoes.width * opcoes.height;
  if (totalTasks > ALTO_VOLUME_THRESHOLD && pixels > ALTA_RESOLUCAO_THRESHOLD) {
    logWarning(`Você solicitou ${totalTasks} tarefas em resolução ${opcoes.width}x${opcoes.height}. Isso pode levar bastante tempo.`);
    logWarning(`Considere usar --quick ou reduzir a quantidade de amostras/resolução.`);
    if (!opcoes.yes && !usarInterativo) {
      const prosseguir = await confirm({ message: 'Deseja continuar mesmo assim?', default: false });
      if (!prosseguir) {
        console.log('Cancelado.');
        process.exit(0);
      }
    }
  }

  const temposTarefas = [];
  const falhas = [];
  const logsDetalhados = [];
  let totalSegundos = 0; // <-- CORREÇÃO: declarada aqui para escopo global

  if (totalTasks > 0) {
    const tasksStartTime = Date.now();
    let completed = 0;
    updateProgress(0, totalTasks, 'Renderizando', tasksStartTime, '');

    const taskFunctions = [];

    for (const task of randomTasks) {
      taskFunctions.push(async () => {
        const { engineId, seed } = task;
        const inicio = Date.now();
        try {
          const sample = renderModule.renderEngineSample({
            engineId,
            width: opcoes.width,
            height: opcoes.height,
            seed,
            isGrainLocked: opcoes.grainLock,
          });
          const baseName = `${engineId}-seed-${seed}_${runTimestamp}`;
          const basePath = getBasePath(engineId, baseName);
          await ensureDir(path.dirname(basePath));
          await writeVariants(opcoes.formats, sample.svg, basePath, opcoes.quality);

          const jpgPath = (opcoes.formats.includes('jpg') || opcoes.formats.includes('jpeg')) ? `${basePath}.jpg` : null;
          const entry = {
            ...sample.meta,
            type: 'random',
            files: {
              svg: opcoes.formats.includes('svg') ? `${basePath}.svg` : null,
              jpg: jpgPath,
            },
          };
          manifesto.samples.push(entry);
          const duracao = Date.now() - inicio;
          temposTarefas.push(duracao);
          if (opcoes.verbose) logsDetalhados.push(`Seed ${seed} (${engineId}) → ${jpgPath || basePath + '.svg'} (${duracao}ms)`);
          return { engineId, seed, jpgPath, entry, duracao };
        } catch (err) {
          falhas.push(`Seed ${seed} (${engineId}): ${err.message}`);
          temposTarefas.push(0);
          return { engineId, seed, error: err.message };
        }
      });
    }

    for (const task of presetTasks) {
      taskFunctions.push(async () => {
        const { engineId, presetId, presetName } = task;
        const inicio = Date.now();
        try {
          const sample = renderModule.renderPresetSample({
            presetId,
            width: opcoes.width,
            height: opcoes.height,
          });
          const baseName = `${engineId}-preset-${presetId}_${runTimestamp}`;
          const basePath = getBasePath(engineId, baseName, 'presets');
          await ensureDir(path.dirname(basePath));
          await writeVariants(opcoes.formats, sample.svg, basePath, opcoes.quality);

          const jpgPath = (opcoes.formats.includes('jpg') || opcoes.formats.includes('jpeg')) ? `${basePath}.jpg` : null;
          const entry = {
            ...sample.meta,
            type: 'preset',
            files: {
              svg: opcoes.formats.includes('svg') ? `${basePath}.svg` : null,
              jpg: jpgPath,
            },
          };
          manifesto.samples.push(entry);
          const duracao = Date.now() - inicio;
          temposTarefas.push(duracao);
          if (opcoes.verbose) logsDetalhados.push(`Preset ${presetName} (${engineId}) → ${jpgPath || basePath + '.svg'} (${duracao}ms)`);
          return { engineId, presetId, jpgPath, entry, duracao };
        } catch (err) {
          falhas.push(`Preset ${presetId} (${engineId}): ${err.message}`);
          temposTarefas.push(0);
          return { engineId, presetId, error: err.message };
        }
      });
    }

    const wrappedTasks = taskFunctions.map((taskFn) => async () => {
      const result = await taskFn();
      completed++;
      let status = '';
      if (result.error) {
        status = `${result.engineId || '?'} : erro`;
      } else if (result.seed !== undefined) {
        status = `${result.engineId} seed ${result.seed}`;
      } else if (result.presetId) {
        const presetName = result.entry?.meta?.presetName || result.presetId;
        status = `${result.engineId} preset ${presetName}`;
      }
      updateProgress(completed, totalTasks, 'Renderizando', tasksStartTime, status);
      return result;
    });

    stopSpinner();

    const results = await runWithConcurrency(wrappedTasks, opcoes.concurrency);

    updateProgress(totalTasks, totalTasks, 'Concluído', tasksStartTime, '');
    console.log('');

    if (opcoes.verbose && logsDetalhados.length > 0) {
      console.log('\n📝 Detalhes da renderização:');
      logsDetalhados.forEach(msg => console.log(`   ${msg}`));
    }

    if (opcoes.sheets) {
      const jpgByEngine = {};
      for (const res of results) {
        if (res.error) continue;
        if (res.jpgPath && (opcoes.formats.includes('jpg') || opcoes.formats.includes('jpeg'))) {
          const eng = res.entry?.meta?.engineId || res.engineId;
          if (!jpgByEngine[eng]) jpgByEngine[eng] = [];
          jpgByEngine[eng].push(res.jpgPath);
        }
      }
      for (const [engineId, jpgs] of Object.entries(jpgByEngine)) {
        if (jpgs.length > 0) {
          const sheetFileName = `${engineId}-sheet_${runTimestamp}.jpg`;
          const sheetPath = getBasePath(engineId, sheetFileName);
          await ensureDir(path.dirname(sheetPath));
          await buildContactSheet(engineId, jpgs, sheetPath);
        }
      }
    }

    // Relatório de performance
    const temposValidos = temposTarefas.filter(t => t > 0);
    if (temposValidos.length > 0) {
      const media = Math.round(temposValidos.reduce((a, b) => a + b, 0) / temposValidos.length);
      const max = Math.max(...temposValidos);
      const min = Math.min(...temposValidos);
      totalSegundos = Math.round((Date.now() - tasksStartTime) / 1000);
      const totalMin = Math.floor(totalSegundos / 60);
      const totalSec = totalSegundos % 60;

      console.log('\n📊 Relatório de performance:');
      console.log(`   Tarefas concluídas: ${temposValidos.length}/${totalTasks}${falhas.length > 0 ? ` (${falhas.length} falhas)` : ''}`);
      console.log(`   Tempo total: ${totalMin}m ${totalSec}s`);
      console.log(`   Tempo médio por tarefa: ${(media / 1000).toFixed(1)}s`);
      console.log(`   Mais rápido: ${(min / 1000).toFixed(1)}s`);
      console.log(`   Mais lento: ${(max / 1000).toFixed(1)}s`);
    }

    // Atualiza manifesto com a variável totalSegundos já definida
    manifesto.performance = {
      totalTasks,
      completed: temposValidos.length,
      failed: falhas.length,
      avgMs: temposValidos.length > 0 ? Math.round(temposValidos.reduce((a, b) => a + b, 0) / temposValidos.length) : 0,
      maxMs: temposValidos.length > 0 ? Math.max(...temposValidos) : 0,
      minMs: temposValidos.length > 0 ? Math.min(...temposValidos) : 0,
      totalSec: totalSegundos,
    };

  } else {
    logInfo('Nenhuma tarefa para executar.');
    manifesto.performance = {
      totalTasks: 0,
      completed: 0,
      failed: 0,
      avgMs: 0,
      maxMs: 0,
      minMs: 0,
      totalSec: 0,
    };
  }

  await fs.writeFile(path.join(runDir, 'manifesto.json'), JSON.stringify(manifesto, null, 2));
  if (opcoes.verbose) console.log(`Manifesto salvo em ${path.join(runDir, 'manifesto.json')}`);

  try {
    await generateHtmlGallery(runDir, manifesto.samples, opcoes);
  } catch (err) {
    logWarning('Não foi possível gerar a galeria HTML: ' + err.message);
  }

  await fs.rm(tmpDir, { recursive: true, force: true });

  process.on('SIGINT', async () => {
    console.log('\nOperação interrompida. Limpando temporários...');
    await fs.rm(tmpDir, { recursive: true, force: true });
    process.exit(1);
  });

  const tempoTotal = Math.round((Date.now() - inicioGlobal) / 1000);
  const mins = Math.floor(tempoTotal / 60);
  const segs = tempoTotal % 60;
  logSuccess(`Geração concluída em ${mins}m ${segs}s.`);
  console.log(`📁 Arquivos em: ${runDir}`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exitCode = 1;
});