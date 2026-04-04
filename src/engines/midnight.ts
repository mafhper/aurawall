import { EngineDefinition, Shape } from '../types';
import { applyGrainLock, ensureVisibility, shiftColor } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const midnightEngine: EngineDefinition = {
  id: 'midnight',
  meta: {
    name: 'Midnight',
    description: 'A imensidão do cosmos. Estrelas distantes, nebulosas sutis e o silêncio do espaço profundo.',
    tagline: 'Poeira estelar e silêncio profundo.',
    promoImage: '/bg-midnight.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked, presetId }) => {
    const newShapes: Shape[] = [];
    const modes = ['deep-space', 'ion-trail', 'red-shift'] as const;
    const mode = modes.includes(presetId as (typeof modes)[number])
      ? presetId as (typeof modes)[number]
      : pick(modes);

    const palette = mode === 'ion-trail'
      ? { hue: 224, accent: 202, warm: 46, bg1: 11, bg2: 4 }
      : mode === 'red-shift'
        ? { hue: 338, accent: 18, warm: 36, bg1: 8, bg2: 3 }
        : { hue: 232, accent: 216, warm: 40, bg1: 9, bg2: 3 };

    const baseColor = {
      type: 'radial' as const,
      color1: getHSL(palette.hue, mode === 'red-shift' ? 34 : 22, palette.bg1),
      color2: getHSL(palette.hue + (mode === 'red-shift' ? -10 : 6), mode === 'red-shift' ? 40 : 28, palette.bg2)
    };

    if (mode === 'ion-trail') {
      for (let i = 0; i < 2; i++) {
        newShapes.push({
          id: `midnight-ion-${i}`,
          type: 'blob',
          x: i === 0 ? rand(34, 46) : rand(54, 70),
          y: i === 0 ? rand(34, 46) : rand(46, 62),
          size: rand(118, 176),
          color: getHSL(i === 0 ? palette.hue : palette.accent, rand(66, 88), rand(34, 50)),
          opacity: rand(0.1, 0.18),
          blur: rand(56, 92),
          blendMode: 'screen',
          complexity: 6,
          rotation: rand(-30, -20),
          scaleX: rand(3.2, 4.8),
          scaleY: rand(0.16, 0.24)
        });
      }

      for (let i = 0; i < 2; i++) {
        newShapes.push({
          id: `midnight-ion-beam-${i}`,
          type: 'rect',
          x: rand(34, 68),
          y: rand(28, 56),
          size: rand(72, 108),
          color: getHSL(i === 0 ? palette.accent : palette.hue + 10, 82, 80),
          opacity: rand(0.08, 0.14),
          blur: rand(8, 16),
          blendMode: 'screen',
          rotation: rand(-34, -24),
          scaleX: rand(0.08, 0.14),
          scaleY: rand(2.8, 4.2)
        });
      }
    } else if (mode === 'red-shift') {
      newShapes.push({
        id: 'midnight-red-haze',
        type: 'blob',
        x: rand(36, 50),
        y: rand(48, 58),
        size: rand(136, 182),
        color: getHSL(palette.hue, 72, 34),
        opacity: rand(0.12, 0.2),
        blur: rand(72, 106),
        blendMode: 'screen',
        complexity: 7,
        rotation: rand(-18, -8),
        scaleX: rand(2.8, 3.8),
        scaleY: rand(0.36, 0.52)
      });
      newShapes.push({
        id: 'midnight-red-band',
        type: 'blob',
        x: rand(70, 80),
        y: rand(34, 46),
        size: rand(84, 122),
        color: getHSL(palette.accent, 86, 62),
        opacity: rand(0.1, 0.16),
        blur: rand(38, 64),
        blendMode: 'screen',
        complexity: 6,
        rotation: rand(18, 28),
        scaleX: rand(1.2, 1.7),
        scaleY: rand(0.82, 1.08)
      });
      newShapes.push({
        id: 'midnight-red-core',
        type: 'circle',
        x: rand(60, 68),
        y: rand(48, 56),
        size: rand(14, 24),
        color: getHSL(palette.warm, 94, 72),
        opacity: rand(0.08, 0.14),
        blur: rand(14, 24),
        blendMode: 'screen'
      });
    } else {
      newShapes.push({
        id: 'midnight-deep-nebula',
        type: 'blob',
        x: rand(38, 48),
        y: rand(46, 58),
        size: rand(122, 172),
        color: getHSL(palette.accent, rand(28, 42), rand(18, 26)),
        opacity: rand(0.06, 0.12),
        blur: rand(110, 146),
        blendMode: 'screen',
        complexity: 6,
        rotation: rand(-18, 18),
        scaleX: rand(2.2, 3.2),
        scaleY: rand(0.42, 0.62)
      });
    }

    const dustCount = mode === 'deep-space' ? 7 : mode === 'ion-trail' ? 4 : 5;
    for (let i = 0; i < dustCount; i++) {
      newShapes.push({
        id: `midnight-dust-${i}`,
        type: 'rect',
        x: rand(18, 82),
        y: rand(16, 84),
        size: rand(mode === 'ion-trail' ? 38 : 44, mode === 'red-shift' ? 86 : 102),
        color: getHSL(palette.hue + rand(-10, 10), rand(16, 30), rand(8, 18)),
        opacity: rand(0.14, 0.26),
        blur: rand(12, 24),
        blendMode: 'multiply',
        rotation: mode === 'ion-trail' ? rand(-34, -20) : rand(-24, 24),
        scaleX: rand(2.6, 4.2),
        scaleY: rand(0.08, 0.14)
      });
    }

    const starCount = mode === 'deep-space' ? 26 : mode === 'ion-trail' ? 14 : 16;
    for (let i = 0; i < starCount; i++) {
      const warm = mode === 'red-shift' ? Math.random() > 0.56 : Math.random() > 0.9;
      newShapes.push({
        id: `midnight-star-${i}`,
        type: 'circle',
        x: rand(3, 97),
        y: rand(4, 96),
        size: rand(0.32, warm ? 1 : 0.72),
        color: warm ? getHSL(palette.warm, 68, 76) : '#eef3ff',
        opacity: rand(0.16, warm ? 0.52 : 0.42),
        blur: warm ? rand(0.1, 0.6) : rand(0, 0.2),
        blendMode: 'normal'
      });
    }

    const grain = applyGrainLock(config, isGrainLocked, 11, 0.95);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: ensureVisibility(newShapes, baseColor),
        animation: {
          ...config.animation,
          enabled: true,
          flow: mode === 'ion-trail' ? 0.9 : 0.4,
          speed: mode === 'ion-trail' ? 0.38 : 0.24,
          pulse: 0,
          rotate: 0
        }
    };
  },
  variations: [
      {
          name: 'Supernova',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              return {
                  ...cfg,
                  ...grain,
                  shapes: ensureVisibility(cfg.shapes.map(s => s.id.includes('nebula') ? {
                      ...s,
                      color: '#ffaa00',
                      opacity: 0.24,
                      blendMode: 'screen'
                  } : s), cfg.baseColor)
              };
          }
      },
      {
          name: 'Blue Shift',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              const baseColor = shiftColor(cfg.baseColor, -12, 10, -2);
              return {
                  ...cfg,
                  ...grain,
                  baseColor,
                  shapes: ensureVisibility(cfg.shapes.map(s => ({
                    ...s,
                    color: shiftColor(s.color, -12, 12, s.id.includes('dust') ? -8 : 4),
                    blur: s.id.includes('dust') ? s.blur * 1.1 : s.blur
                  })), baseColor)
              };
          }
      },
      {
          name: 'Moonless',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, 8, 0.8);
              const baseColor = '#020208';
              return {
                  ...cfg,
                  ...grain,
                  baseColor,
                  shapes: ensureVisibility(cfg.shapes.map(s => ({
                    ...s,
                    opacity: s.id.includes('star') ? s.opacity * 0.72 : s.opacity * 0.82,
                    color: s.id.includes('nebula') ? '#50506b' : s.color
                  })), baseColor)
              };
          }
      }
  ]
};
