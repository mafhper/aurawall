import { EngineDefinition, Shape } from '../types';
import { applyGrainLock, ensureVisibility, shiftColor } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const astraEngine: EngineDefinition = {
  id: 'astra',
  meta: {
    name: 'Astra',
    description: 'Nebulosas profundas, poeira estelar e núcleos luminosos. Um motor cósmico inspirado no espaço profundo.',
    tagline: 'Nebulosas densas e luz orbital.',
    promoImage: '/bg-astra.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked, presetId }) => {
    const newShapes: Shape[] = [];
    const modes = ['blue-nebula', 'lunar-halo', 'golden-orbit'] as const;
    const mode = modes.includes(presetId as (typeof modes)[number])
      ? presetId as (typeof modes)[number]
      : pick(modes);
    const palettes = [
      { baseHue: 222, accentHue: 190, secondaryHue: 244, warmHue: 40, roseHue: 306 },
      { baseHue: 234, accentHue: 198, secondaryHue: 260, warmHue: 46, roseHue: 314 },
      { baseHue: 216, accentHue: 182, secondaryHue: 236, warmHue: 34, roseHue: 298 }
    ];
    const palette = pick(palettes);
    const baseColor = {
      type: 'radial' as const,
      color1: getHSL(palette.baseHue + 6, 62, mode === 'lunar-halo' ? 12 : 11),
      color2: getHSL(palette.baseHue - 12, 56, 3)
    };

    if (mode !== 'blue-nebula') {
      newShapes.push({
        id: 'astra-halo-ring',
        type: 'circle',
        x: mode === 'golden-orbit' ? rand(58, 68) : rand(48, 58),
        y: rand(42, 56),
        size: mode === 'lunar-halo' ? rand(54, 76) : rand(30, 50),
        color: getHSL(palette.warmHue + rand(-4, 5), 94, 76),
        opacity: mode === 'lunar-halo' ? rand(0.14, 0.22) : rand(0.08, 0.14),
        blur: rand(14, 26),
        blendMode: 'screen'
      });
    }

    newShapes.push({
      id: 'astra-ribbon-hero',
      type: 'blob',
      x: mode === 'golden-orbit' ? rand(30, 46) : rand(40, 60),
      y: mode === 'lunar-halo' ? rand(54, 64) : rand(42, 58),
      size: rand(mode === 'lunar-halo' ? 124 : 164, 228),
      color: getHSL(mode === 'golden-orbit' ? palette.secondaryHue : palette.accentHue, rand(88, 100), rand(42, 54)),
      opacity: rand(mode === 'lunar-halo' ? 0.12 : 0.18, 0.28),
      blur: rand(mode === 'golden-orbit' ? 52 : 44, 76),
      blendMode: 'screen',
      complexity: 6,
      rotation: mode === 'blue-nebula' ? rand(-24, 24) : mode === 'golden-orbit' ? rand(-34, -18) : rand(-12, 12),
      scaleX: rand(mode === 'blue-nebula' ? 3.6 : 2.4, 5.2),
      scaleY: rand(mode === 'blue-nebula' ? 0.18 : 0.24, mode === 'lunar-halo' ? 0.42 : 0.28)
    });

    for (let i = 0; i < 2; i++) {
      newShapes.push({
        id: `astra-ribbon-${i}`,
        type: 'blob',
        x: mode === 'golden-orbit' ? (i === 0 ? rand(54, 74) : rand(24, 40)) : i === 0 ? rand(18, 42) : rand(54, 84),
        y: rand(26, 72),
        size: rand(mode === 'lunar-halo' ? 94 : 124, 188),
        color: getHSL((i % 2 === 0 ? palette.accentHue : palette.secondaryHue) + rand(-10, 14), rand(84, 100), rand(28, 44)),
        opacity: rand(mode === 'lunar-halo' ? 0.08 : 0.12, 0.22),
        blur: rand(54, 92),
        blendMode: 'screen',
        complexity: 6,
        rotation: mode === 'golden-orbit' ? rand(18, 34) : rand(-44, 44),
        scaleX: rand(mode === 'lunar-halo' ? 2.2 : 2.8, 4.2),
        scaleY: rand(mode === 'lunar-halo' ? 0.24 : 0.18, mode === 'lunar-halo' ? 0.46 : 0.32)
      });
    }

    newShapes.push({
      id: 'astra-rose-nebula',
      type: 'blob',
      x: rand(24, 76),
      y: rand(24, 76),
      size: rand(76, 124),
      color: getHSL(palette.roseHue, rand(80, 96), rand(38, 50)),
      opacity: rand(0.08, 0.16),
      blur: rand(48, 84),
      blendMode: 'screen',
      complexity: 5,
      rotation: rand(-34, 34),
      scaleX: rand(1.4, 2.3),
      scaleY: rand(0.28, 0.52)
    });

    for (let i = 0; i < (mode === 'golden-orbit' ? 3 : 2); i++) {
      newShapes.push({
        id: `astra-amber-${i}`,
        type: 'blob',
        x: i === 0 ? rand(66, 90) : rand(10, 30),
        y: i === 0 ? rand(18, 40) : rand(60, 84),
        size: rand(52, 94),
        color: getHSL(palette.warmHue + rand(-8, 10), rand(78, 94), rand(42, 54)),
        opacity: rand(mode === 'golden-orbit' ? 0.16 : 0.12, 0.22),
        blur: rand(24, 52),
        blendMode: 'screen',
        complexity: 5,
        rotation: rand(-32, 32),
        scaleX: rand(1.2, 1.9),
        scaleY: rand(0.36, 0.62)
      });
    }

    const beamCount = mode === 'blue-nebula' ? Math.floor(rand(2, 4)) : mode === 'lunar-halo' ? 1 : Math.floor(rand(2, 3));
    for (let i = 0; i < beamCount; i++) {
      newShapes.push({
        id: `astra-beam-${i}`,
        type: 'rect',
        x: rand(18, 82),
        y: rand(20, 80),
        size: rand(54, 88),
        color: getHSL(i % 2 === 0 ? palette.accentHue : palette.secondaryHue, rand(88, 100), rand(74, 84)),
        opacity: rand(0.12, 0.22),
        blur: rand(4, 10),
        blendMode: 'screen',
        rotation: mode === 'golden-orbit' ? rand(18, 42) : rand(-68, 68),
        scaleX: rand(0.08, 0.16),
        scaleY: rand(2.2, 4.8)
      });
    }

    for (let i = 0; i < (mode === 'golden-orbit' ? 3 : 2); i++) {
      newShapes.push({
        id: `astra-orbit-${i}`,
        type: 'rect',
        x: mode === 'golden-orbit' ? 58 + (i - 1) * 8 : 50 + (i === 0 ? -4 : 6),
        y: mode === 'golden-orbit' ? 46 + (i - 1) * 4 : 50 + (i === 0 ? 4 : -6),
        size: rand(48, 76),
        color: getHSL(i === 0 ? palette.secondaryHue : palette.warmHue + 4, rand(78, 96), rand(62, 76)),
        opacity: rand(0.08, 0.14),
        blur: rand(8, 18),
        blendMode: 'screen',
        rotation: i === 0 ? rand(18, 34) : rand(-30, -14),
        scaleX: rand(1.8, 2.8),
        scaleY: rand(0.08, 0.14)
      });
    }

    newShapes.push({
      id: 'astra-nucleus',
      type: 'circle',
      x: mode === 'golden-orbit' ? rand(60, 68) : rand(42, 58),
      y: mode === 'lunar-halo' ? rand(42, 48) : rand(36, 56),
      size: rand(mode === 'lunar-halo' ? 18 : 28, mode === 'golden-orbit' ? 34 : 48),
      color: getHSL(palette.warmHue + rand(-4, 4), 96, 72),
      opacity: rand(mode === 'golden-orbit' ? 0.12 : 0.16, 0.24),
      blur: rand(12, 22),
      blendMode: 'screen'
    });

    for (let i = 0; i < 2; i++) {
      newShapes.push({
        id: `astra-dust-${i}`,
        type: 'rect',
        x: rand(22, 78),
        y: rand(18, 68),
        size: rand(58, 118),
        color: getHSL(palette.baseHue + rand(-12, 8), rand(26, 42), rand(10, 24)),
        opacity: rand(0.16, 0.28),
        blur: rand(16, 30),
        blendMode: 'multiply',
        rotation: rand(-26, 26),
        scaleX: rand(2, 3.2),
        scaleY: rand(0.12, 0.22)
      });
    }

    for (let i = 0; i < (mode === 'lunar-halo' ? 8 : 14); i++) {
      const warm = mode === 'golden-orbit' ? Math.random() > 0.42 : Math.random() > 0.62;
      newShapes.push({
        id: `astra-star-${i}`,
        type: 'circle',
        x: rand(2, 98),
        y: rand(3, 97),
        size: rand(0.35, warm ? 1.2 : 0.9),
        color: warm ? getHSL(palette.warmHue, 92, 82) : '#f6fbff',
        opacity: rand(0.2, 0.7),
        blur: warm ? rand(0.2, 1.1) : rand(0, 0.4),
        blendMode: 'normal'
      });
    }

    const grain = applyGrainLock(config, isGrainLocked, 14, 0.9);

    return {
      ...config,
      baseColor,
      ...grain,
      shapes: ensureVisibility(newShapes, baseColor),
      animation: {
        ...config.animation,
          enabled: true,
          flow: mode === 'golden-orbit' ? 1.9 : 1.6,
          speed: mode === 'lunar-halo' ? 0.52 : 0.62,
          pulse: 1.4,
          rotate: mode === 'golden-orbit' ? 0.9 : 0.4,
          colorCycle: false
      }
    };
  },
  variations: [
    {
      name: 'Blue Expanse',
      transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
        const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
        const baseColor = shiftColor(cfg.baseColor, -10, 8, -2);
        return {
          ...cfg,
          ...grain,
          baseColor,
          shapes: ensureVisibility(cfg.shapes.map(shape => ({
            ...shape,
            color: shiftColor(shape.color, -12, 10, shape.id.includes('dust') ? -6 : 4)
          })), baseColor)
        };
      }
    },
    {
      name: 'Golden Halo',
      transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
        const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise + 4);
        return {
          ...cfg,
          ...grain,
          shapes: ensureVisibility(cfg.shapes.map(shape => ({
            ...shape,
            color: shape.id.includes('core') || shape.id.includes('star')
              ? shiftColor(shape.color, 10, 8, 8)
              : shiftColor(shape.color, 4, 0, 0)
          })), cfg.baseColor)
        };
      }
    }
  ]
};
