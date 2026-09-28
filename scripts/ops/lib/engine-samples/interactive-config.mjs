import { checkbox, number, confirm, select, input } from '@inquirer/prompts';
import { getDefaults } from './cli-parser.mjs';

export async function interactiveSetup(availableEngines) {
  const DEFAULTS = getDefaults();

  console.log('\n🎨 Aurawall – Gerador de amostras de engines\n');

  const engines = await checkbox({
    message: 'Escolha as engines:',
    choices: availableEngines.map(e => ({ name: e, value: e, checked: true })),
    required: true,
  });

  const width = await number({ message: 'Largura (px):', default: DEFAULTS.width });
  const height = await number({ message: 'Altura (px):', default: DEFAULTS.height });

  const mode = await select({
    message: 'Tipo de amostras:',
    choices: [
      { name: 'Apenas geração aleatória', value: 'random' },
      { name: 'Apenas presets', value: 'presets' },
      { name: 'Ambos (aleatória + presets)', value: 'both' },
    ],
  });

  const count = mode !== 'presets'
    ? await number({ message: 'Quantas amostras aleatórias por engine?', default: DEFAULTS.count })
    : 0;

  const useRandomSeeds = mode !== 'presets'
    ? await confirm({ message: 'Usar seeds aleatórias?', default: true })
    : false;

  const formats = await checkbox({
    message: 'Formatos de saída:',
    choices: [
      { name: 'SVG', value: 'svg', checked: true },
      { name: 'JPEG', value: 'jpg', checked: true },
    ],
  });

  const includePresets = (mode === 'presets' || mode === 'both');

  const quality = await number({ message: 'Qualidade JPEG (40-100):', default: DEFAULTS.quality });

  const generateSheets = await confirm({ message: 'Gerar folhas de contato (contact sheets)?', default: true });

  const structure = await select({
    message: 'Estrutura de pastas:',
    choices: [
      { name: 'Todos os arquivos na mesma pasta', value: 'flat' },
      { name: 'Pastas separadas por engine', value: 'nested' },
    ],
  });

  const outputDirChoice = await select({
    message: 'Pasta de saída:',
    choices: [
      { name: `Padrão (${DEFAULTS.outputRoot})`, value: 'default' },
      { name: 'Escolher outra pasta', value: 'custom' },
    ],
  });

  let outputRoot = DEFAULTS.outputRoot;
  if (outputDirChoice === 'custom') {
    // Antes esta escolha imprimia "execute com --output" e seguia com o
    // padrão: perguntava algo e não fazia nada. Agora pergunta a pasta.
    const escolhida = await input({
      message: 'Caminho da pasta de saída:',
      default: DEFAULTS.outputRoot,
    });
    outputRoot = escolhida.trim() || DEFAULTS.outputRoot;
  }

  const verbose = await confirm({ message: 'Modo detalhado (verbose)?', default: false });

  // Concorrência (opcional)
  const advanced = await confirm({ message: 'Deseja configurar opções avançadas (concorrência)?', default: false });
  let concurrency = DEFAULTS.concurrency;
  if (advanced) {
    concurrency = await number({
      message: 'Número máximo de tarefas simultâneas (1-10):',
      default: DEFAULTS.concurrency,
    });
    concurrency = Math.min(10, Math.max(1, concurrency));
  }

  return {
    engines,
    count,
    width,
    height,
    formats,
    quality,
    outputRoot,
    includePresets,
    grainLock: false,
    random: useRandomSeeds,
    seeds: useRandomSeeds ? [] : [],
    sheets: generateSheets,
    nested: structure === 'nested',
    verbose,
    concurrency,
    quick: false,
    yes: false,
  };
}