import { EngineDefinition, Shape } from '../types';
import { ensureVisibility, shiftColor, applyGrainLock } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });
const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const oceanicEngine: EngineDefinition = {
  id: 'oceanic',
  meta: {
    name: 'Oceanic',
    description: 'A calma e a fúria dos mares. Ondas orgânicas, tons profundos de azul e fluidez constante.',
    tagline: 'Profundezas azuis e marés vivas.',
    promoImage: '/bg-oceanic.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked, presetId }) => {
    const newShapes: Shape[] = [];
    const modes = ['pacific-drift', 'the-abyss', 'reef-current'] as const;
    const mode = modes.includes(presetId as (typeof modes)[number])
      ? presetId as (typeof modes)[number]
      : modes[Math.floor(Math.random() * modes.length)];
    const baseHue = mode === 'the-abyss' ? rand(206, 220) : mode === 'reef-current' ? rand(188, 206) : rand(194, 210);
    const baseColor = {
      type: 'linear' as const,
      angle: rand(172, 188),
      color1: getHSL(baseHue - 14, mode === 'the-abyss' ? 42 : 48, mode === 'the-abyss' ? 12 : mode === 'pacific-drift' ? 84 : 22),
      color2: getHSL(baseHue + 4, mode === 'pacific-drift' ? 46 : 58, mode === 'pacific-drift' ? 62 : 5)
    };

    for (let i = 0; i < 3; i++) {
      newShapes.push({
        id: `wave-${i}`,
        type: 'blob',
        x: rand(18, 84),
        y: mode === 'the-abyss' ? rand(38, 84) : rand(18, 72),
        size: rand(mode === 'the-abyss' ? 124 : 96, mode === 'pacific-drift' ? 150 : 172),
        color: getHSL(baseHue + rand(-12, 10), rand(42, 68), mode === 'pacific-drift' ? rand(34, 58) : rand(22, 38)),
        opacity: rand(mode === 'pacific-drift' ? 0.16 : 0.1, mode === 'the-abyss' ? 0.14 : 0.18),
        blur: rand(mode === 'reef-current' ? 34 : 42, 76),
        blendMode: i % 2 === 0 ? 'screen' : mode === 'the-abyss' ? 'multiply' : 'soft-light',
        complexity: 5,
        rotation: rand(-18, 18),
        scaleX: rand(mode === 'reef-current' ? 2.8 : 2.2, 3.6),
        scaleY: rand(mode === 'reef-current' ? 0.18 : 0.22, mode === 'the-abyss' ? 0.56 : 0.46)
      });
    }

    for (let i = 0; i < (mode === 'the-abyss' ? 2 : 3); i++) {
      newShapes.push({
        id: `ray-${i}`,
        type: 'rect',
        x: rand(20, 80),
        y: mode === 'the-abyss' ? rand(8, 18) : rand(8, 26),
        size: rand(48, 96),
        color: getHSL(baseHue - 24, 66, 82),
        opacity: rand(mode === 'the-abyss' ? 0.03 : 0.04, mode === 'pacific-drift' ? 0.14 : 0.1),
        blur: rand(12, 24),
        blendMode: 'screen',
        rotation: rand(-82, -64),
        scaleX: rand(0.08, 0.16),
        scaleY: rand(2.2, 3.8)
      });
    }

    for (let i = 0; i < (mode === 'reef-current' ? 5 : 4); i++) {
      newShapes.push({
        id: `caustic-${i}`,
        type: 'rect',
        x: rand(14, 86),
        y: mode === 'the-abyss' ? rand(8, 28) : rand(10, 42),
        size: rand(28, 74),
        color: mode === 'reef-current' && i % 3 === 2 ? '#ff8a5b' : i === 0 ? '#9be7ff' : getHSL(baseHue - 20, 82, 72),
        opacity: rand(mode === 'the-abyss' ? 0.04 : 0.05, mode === 'reef-current' ? 0.12 : 0.1),
        blur: rand(8, mode === 'reef-current' ? 14 : 16),
        blendMode: 'screen',
        rotation: rand(-12, 12),
        scaleX: rand(2.8, 5.4),
        scaleY: rand(0.05, 0.1)
      });
    }

    if (mode !== 'the-abyss') {
      newShapes.push({
        id: 'surface-line',
        type: 'rect',
        x: 50,
        y: rand(12, 18),
        size: 120,
        color: getHSL(baseHue - 18, 54, 82),
        opacity: rand(0.08, 0.14),
        blur: rand(6, 12),
        blendMode: 'screen',
        scaleX: 4,
        scaleY: 0.06
      });
    }

    for (let i = 0; i < 2; i++) {
      newShapes.push({
        id: `depth-${i}`,
        type: 'rect',
        x: rand(18, 82),
        y: rand(54, 92),
        size: rand(62, 118),
        color: getHSL(baseHue + rand(-10, 10), rand(38, 54), rand(10, 18)),
        opacity: rand(0.08, 0.14),
        blur: rand(30, 54),
        blendMode: 'multiply',
        rotation: rand(-8, 8),
        scaleX: rand(2.8, 4.4),
        scaleY: rand(0.3, 0.56)
      });
    }

    const grain = applyGrainLock(config, isGrainLocked, mode === 'the-abyss' ? 16 : 12, 0.9);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: ensureVisibility(newShapes, baseColor),
        animation: {
            ...config.animation,
            enabled: true,
            flow: mode === 'reef-current' ? 4.1 : mode === 'pacific-drift' ? 3.4 : 2.6,
            speed: mode === 'the-abyss' ? 0.62 : 0.8,
            pulse: 1.2,
            rotate: 0,
            colorCycle: false,
            colorCycleSpeed: 2
        }
    };
  },
  variations: [
    {
      name: 'Stormy Seas',
      transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
        const grain = applyGrainLock(cfg, isGrainLocked, 40);
        return {
          ...cfg,
          baseColor: '#0a1015', // Dark grey-blue
          ...grain,
          shapes: ensureVisibility(cfg.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 0, -20, -10), // Desaturated
            blendMode: 'hard-light',
            blur: s.blur * 0.8 // Sharper waves
          })), '#0a1015')
        };
      }
    },
    {
        name: 'Coral Reef',
        transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
          const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
          return {
            ...cfg,
            ...grain,
            baseColor: '#002030', // Clear tropical water
            shapes: cfg.shapes.map((s, i) => ({
              ...s,
              color: i % 2 === 0 ? shiftColor(s.color, 0, 0, 0) : '#ff7f50', // Inject coral orange
              blendMode: 'screen'
            }))
          };
        }
      }
  ]
};
