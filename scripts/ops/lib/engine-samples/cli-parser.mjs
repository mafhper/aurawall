import path from 'node:path';
import { repoRoot, defaultOutputRoot } from './paths.mjs';

const DEFAULTS = {
  engines: ['midnight', 'astra', 'sakura', 'ember', 'oceanic'],
  count: 6,
  width: 1600,
  height: 900,
  quality: 92,
  formats: ['svg', 'jpg'],
  // Ferramenta não escreve no workspace privado: `.dev/` é gitignored, então
  // uma saída ali quebra em clone limpo (ADR-004). Ver paths.mjs.
  outputRoot: defaultOutputRoot,
  sheets: true,
  nested: false,
  grainLock: false,
  includePresets: false,
  random: false,
  interactive: false,
  quick: false,
  yes: false,
  verbose: false,
  concurrency: 4,
};

export function getDefaults() {
  return { ...DEFAULTS };
}

export function parseArguments(args) {
  const options = {
    engines: [...DEFAULTS.engines],
    count: DEFAULTS.count,
    width: DEFAULTS.width,
    height: DEFAULTS.height,
    formats: [...DEFAULTS.formats],
    outputRoot: DEFAULTS.outputRoot,
    quality: DEFAULTS.quality,
    seeds: [],
    random: false,
    includePresets: false,
    grainLock: false,
    interactive: false,
    sheets: true,
    nested: false,
    quick: false,
    yes: false,
    verbose: false,
    concurrency: DEFAULTS.concurrency,
    // Erros de digitação coletados na leitura, reportados na validação. O
    // parser não deve "consertar" entrada inválida em silêncio: quem chama
    // precisa saber que o pedido não foi o que ele escreveu.
    parseErrors: [],
  };

  for (const arg of args) {
    if (arg === '--help') {
      showHelp();
      process.exit(0);
    }
    if (arg === '--random') { options.random = true; continue; }
    if (arg === '--include-presets') { options.includePresets = true; continue; }
    if (arg === '--grain-lock') { options.grainLock = true; continue; }
    if (arg === '--interactive') { options.interactive = true; continue; }
    if (arg === '--sheets') { options.sheets = true; continue; }
    if (arg === '--no-sheets') { options.sheets = false; continue; }
    if (arg === '--flat') { options.nested = false; continue; }
    if (arg === '--nested') { options.nested = true; continue; }
    if (arg === '--quick') { options.quick = true; continue; }
    if (arg === '--yes' || arg === '-y') { options.yes = true; continue; }
    if (arg === '--verbose' || arg === '-v') { options.verbose = true; continue; }

    if (!arg.startsWith('--')) continue;
    const [key, ...rest] = arg.slice(2).split('=');
    const k = key.trim();
    const v = rest.join('=').trim();
    switch (k) {
      case 'engines':
        // Vazio explícito é erro, não "usa o padrão": `--engines=` rodando as
        // 5 engines padrão sem avisar é exatamente o tipo de surpresa que
        // enche o disco de renderizações que ninguém pediu.
        options.engines = v
          ? v.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        break;
      case 'count':
      case 'width':
      case 'height':
      case 'quality':
      case 'concurrency': {
        // Valor presente e não numérico vira erro, não default. Antes,
        // `parseInt('abc') || DEFAULTS.count` devolvia o default e o
        // chamador achava que tinha pedido 1 e recebeu 6.
        if (v !== '' && !/^\d+$/.test(v)) {
          options.parseErrors.push(`--${k}=${v} não é um número inteiro.`);
          break;
        }
        const n = parseInt(v, 10);
        if (k === 'count') options.count = Number.isFinite(n) ? n : DEFAULTS.count;
        if (k === 'width') options.width = Number.isFinite(n) ? n : DEFAULTS.width;
        if (k === 'height') options.height = Number.isFinite(n) ? n : DEFAULTS.height;
        if (k === 'quality') options.quality = Number.isFinite(n) ? n : DEFAULTS.quality;
        if (k === 'concurrency') options.concurrency = Number.isFinite(n) ? n : DEFAULTS.concurrency;
        break;
      }
      case 'formats':
        options.formats = v
          ? v.split(',').map(s => s.trim().toLowerCase()).filter(x => ['svg', 'jpg', 'jpeg'].includes(x))
          : [];
        break;
      case 'output':
        options.outputRoot = v ? path.resolve(repoRoot, v) : DEFAULTS.outputRoot;
        break;
      case 'seeds':
        options.seeds = v
          ? v.split(',').map(Number).filter(Number.isFinite)
          : [];
        break;
    }
  }

  if (options.quick) {
    options.count = 3;
    options.width = 1920;
    options.height = 1080;
    options.formats = ['jpg'];
    options.quality = 90;
    options.sheets = false;
    options.nested = false;
    options.random = true;
    options.includePresets = false;
    options.concurrency = Math.min(6, options.concurrency);
  }

  return options;
}

function showHelp() {
  const def = getDefaults();
  console.log(`
Uso: node scripts/ops/render-engine-samples.mjs [opções]

Opções:
  --engines=<lista>         Engines (ex: midnight,astra)    [padrão: ${def.engines.join(',')}]
  --count=<n>               Número de amostras aleatórias   [padrão: ${def.count}]
  --width=<px>              Largura                         [padrão: ${def.width}]
  --height=<px>             Altura                          [padrão: ${def.height}]
  --formats=<svg,jpg>       Formatos de saída               [padrão: ${def.formats.join(',')}]
  --output=<caminho>        Pasta de saída                  [padrão: ${def.outputRoot}]
  --quality=<n>             Qualidade JPEG (40-100)         [padrão: ${def.quality}]
  --random                  Seeds aleatórias (ignora --seeds)
  --seeds=<s1,s2,...>       Seeds manuais
  --include-presets         Inclui também os presets
  --sheets                  Gera folhas de contato (padrão)
  --no-sheets               Não gera folhas de contato
  --flat                    Todos os arquivos na mesma pasta (padrão)
  --nested                  Pastas separadas por engine
  --grain-lock              Congela padrão de grão
  --quick                   Modo rápido: 3 amostras, 1920x1080, JPEG 90, sem sheets, sem presets
  --concurrency=<n>         Tarefas simultâneas (1-10)      [padrão: ${def.concurrency}]
  --yes, -y                 Confirma automaticamente
  --verbose, -v             Exibe informações detalhadas
  --interactive             Força o modo interativo
  --help                    Mostra esta ajuda
`);
}