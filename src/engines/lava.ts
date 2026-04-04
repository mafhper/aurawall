import { EngineDefinition, Shape } from '../types';
import { shiftColor, ensureVisibility, applyGrainLock } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const lavaEngine: EngineDefinition = {
  id: 'lava',
  meta: {
    name: 'Lava',
    description: 'Fluxos psicodélicos e movimento fundido. Inspirado nas lâmpadas de lava dos anos 60/70.',
    tagline: 'Fluidez hipnótica e calor retrô.',
    promoImage: '/bg-lava.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const newShapes: Shape[] = [];

    const palettes = [
      { base: 18, blob: 34, accent: 52, shadow: 8 },
      { base: 292, blob: 314, accent: 340, shadow: 272 },
      { base: 88, blob: 132, accent: 42, shadow: 104 },
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];

    const baseColor = {
      type: 'linear' as const,
      angle: 180,
      color1: getHSL(palette.base, 28, 12),
      color2: getHSL(palette.shadow, 24, 4)
    };

    for (let i = 0; i < 2; i++) {
      newShapes.push({
        id: `lava-undercurrent-${i}`,
        type: 'blob',
        x: i === 0 ? 32 : 68,
        y: 78 + i * 6,
        size: 170 + i * 26,
        color: getHSL(palette.base + i * 6, 72, 24),
        opacity: 0.14 + i * 0.04,
        blur: 70 + i * 12,
        blendMode: 'screen',
        complexity: 4,
        scaleX: 2.8,
        scaleY: 0.5,
        rotation: i === 0 ? -10 : 10
      });
    }

    const blobCount = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < blobCount; i++) {
      const x = 18 + i * (64 / Math.max(1, blobCount - 1)) + (Math.random() * 10 - 5);
      const y = 24 + Math.random() * 46;
      const size = 54 + Math.random() * 40;
      const hue = i % 3 === 0 ? palette.accent : i % 2 === 0 ? palette.blob : palette.base;

      newShapes.push({
        id: `lava-bulb-${i}`,
        type: 'blob',
        x,
        y,
        size,
        color: getHSL(hue + Math.random() * 8 - 4, 86 + Math.random() * 10, 56 + Math.random() * 10),
        opacity: 0.58 + Math.random() * 0.16,
        blur: 18 + Math.random() * 16,
        blendMode: 'screen',
        complexity: 4,
        scaleX: 0.9 + Math.random() * 0.5,
        scaleY: 1.3 + Math.random() * 1.2,
        rotation: Math.random() * 20 - 10
      });

      newShapes.push({
        id: `lava-bulb-shadow-${i}`,
        type: 'blob',
        x: x + (Math.random() * 6 - 3),
        y: y + size * 0.18,
        size: size * 0.92,
        color: getHSL(palette.shadow, 42, 10),
        opacity: 0.12,
        blur: 14 + Math.random() * 10,
        blendMode: 'multiply',
        complexity: 4,
        scaleX: 0.9 + Math.random() * 0.4,
        scaleY: 1.1 + Math.random() * 0.8,
        rotation: Math.random() * 16 - 8
      });
    }

    newShapes.push({
      id: 'lava-sheen',
      type: 'rect',
      x: 50,
      y: 60 + Math.random() * 10,
      size: 94,
      color: getHSL(palette.accent, 82, 80),
      opacity: 0.08,
      blur: 18,
      blendMode: 'screen',
      scaleX: 3.2,
      scaleY: 0.12,
      rotation: Math.random() * 10 - 5
    });

    const grain = applyGrainLock(config, isGrainLocked, 12, 0.9);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: newShapes,
        animation: {
            ...config.animation,
            enabled: true,
            flow: 2.2,
            speed: 0.95,
            pulse: 1.6,
            rotate: 0.4
        }
    };
  },
  variations: [
    {
      name: 'Magma Flow',
      transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
        const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
        return {
          ...cfg,
          ...grain,
          baseColor: '#1a0500',
          shapes: ensureVisibility(cfg.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 0, 0, 10),
            blendMode: 'screen'
          })), '#1a0500')
        };
      }
    },
    {
        name: 'Toxic Sludge',
        transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
          const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
          return {
            ...cfg,
            ...grain,
            baseColor: '#051a05',
            shapes: ensureVisibility(cfg.shapes.map(s => ({
              ...s,
              color: shiftColor(s.color, 120, 0, 0), // Shift to green
              blendMode: 'hard-light'
            })), '#051a05')
          };
        }
      }
  ]
};
