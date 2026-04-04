import { EngineDefinition, Shape } from '../types';
import { ensureVisibility, applyGrainLock } from '../utils/engineUtils';
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const geometricaEngine: EngineDefinition = {
  id: 'geometrica',
  meta: {
    name: 'Geometrica',
    description: 'Precisão matemática e estrutura Bauhaus. Formas puras alinhadas à grade, cores primárias e composição equilibrada.',
    tagline: 'Ordem, grade e função.',
    promoImage: '/bg-geometrica.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked, presetId }) => {
    const newShapes: Shape[] = [];
    const modes = ['bauhaus-one', 'grid-rhythm', 'nocturne-grid'] as const;
    const mode = modes.includes(presetId as (typeof modes)[number])
      ? presetId as (typeof modes)[number]
      : pick(modes);
    const palette = mode === 'nocturne-grid'
      ? { bg: '#121212', primary: '#E4002B', secondary: '#1f5dce', accent: '#F3A200', ink: '#2a2a2a', paper: '#F3F0EA' }
      : { bg: '#f0ede7', primary: '#E4002B', secondary: '#1244A4', accent: '#F3A200', ink: '#111111', paper: '#F3F0EA' };
    const baseColor = palette.bg;
    const isDark = mode === 'nocturne-grid';
    const composition = mode === 'grid-rhythm'
      ? {
          blocks: [
            { x: 22, y: 24, size: 18, color: palette.ink, scaleX: 2.8, scaleY: 0.18 },
            { x: 44, y: 24, size: 20, color: palette.secondary, scaleX: 1.2, scaleY: 0.7 },
            { x: 64, y: 24, size: 20, color: palette.accent, scaleX: 1.2, scaleY: 0.7 },
            { x: 82, y: 24, size: 14, color: palette.ink, scaleX: 0.9, scaleY: 0.7 },
            { x: 22, y: 54, size: 18, color: palette.primary, scaleX: 1.4, scaleY: 0.7 },
            { x: 42, y: 54, size: 18, color: palette.paper, scaleX: 1.2, scaleY: 0.7 }
          ],
          circles: [
            { x: 68, y: 54, size: 16, color: palette.secondary }
          ],
          bars: [
            { x: 28, y: 82, size: 52, color: palette.ink, rotation: 0 }
          ]
        }
      : mode === 'nocturne-grid'
        ? {
            blocks: [
              { x: 36, y: 32, size: 28, color: palette.paper, scaleX: 2.2, scaleY: 0.28 },
              { x: 74, y: 56, size: 32, color: palette.secondary, scaleX: 1.2, scaleY: 1.2 },
              { x: 24, y: 74, size: 18, color: palette.primary, scaleX: 2.4, scaleY: 0.34 }
            ],
            circles: [
              { x: 66, y: 20, size: 12, color: palette.accent }
            ],
            bars: [
              { x: 56, y: 48, size: 58, color: palette.paper, rotation: 0 }
            ]
          }
        : {
            blocks: [
              { x: 32, y: 36, size: 34, color: palette.primary, scaleX: 2.2, scaleY: 0.68 },
              { x: 74, y: 24, size: 18, color: palette.ink, scaleX: 2.4, scaleY: 0.36 },
              { x: 52, y: 56, size: 54, color: palette.paper, scaleX: 2.8, scaleY: 0.12 }
            ],
            circles: [
              { x: 72, y: 68, size: 30, color: palette.secondary },
              { x: 22, y: 78, size: 12, color: palette.accent }
            ],
            bars: []
          };

    composition.blocks.forEach((block, index) => {
      newShapes.push({
        id: `geo-block-${index}`,
        type: 'rect',
        x: block.x + rand(-2, 2),
        y: block.y + rand(-2, 2),
        size: block.size,
        color: block.color,
        opacity: 0.98,
        blur: 0,
        blendMode: 'normal',
        rotation: mode === 'grid-rhythm' ? 0 : rand(-1, 1),
        scaleX: block.scaleX,
        scaleY: block.scaleY
      });
    });

    composition.circles.forEach((circle, index) => {
      newShapes.push({
        id: `geo-circle-${index}`,
        type: 'circle',
        x: circle.x + rand(mode === 'grid-rhythm' ? -0.5 : -1.5, mode === 'grid-rhythm' ? 0.5 : 1.5),
        y: circle.y + rand(mode === 'grid-rhythm' ? -0.5 : -1.5, mode === 'grid-rhythm' ? 0.5 : 1.5),
        size: circle.size,
        color: circle.color,
        opacity: 0.98,
        blur: 0,
        blendMode: 'normal'
      });
    });

    composition.bars.forEach((bar, index) => {
      newShapes.push({
        id: `geo-bar-${index}`,
        type: 'rect',
        x: bar.x + rand(-1, 1),
        y: bar.y + rand(-1, 1),
        size: bar.size,
        color: bar.color,
        opacity: isDark ? 0.92 : 0.96,
        blur: 0,
        blendMode: 'normal',
        rotation: bar.rotation,
        scaleX: bar.rotation === 90 ? 2.6 : 2.8,
        scaleY: bar.rotation === 90 ? 0.24 : 0.16
      });
    });

    const grain = applyGrainLock(config, isGrainLocked, 4);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: ensureVisibility(newShapes, baseColor),
        animation: {
            ...config.animation,
            enabled: false
        }
    };
  },
  variations: [
      {
          name: 'Dark Mode Architect',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#101010',
                  shapes: ensureVisibility(cfg.shapes.map(s => ({
                      ...s,
                      blendMode: 'screen',
                      opacity: 0.9,
                      color: s.color === '#111111' ? '#333333' : s.color
                  })), '#101010')
              };
          }
      },
      {
          name: 'Deconstructed',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              return {
                  ...cfg,
                  ...grain,
                  shapes: cfg.shapes.map(s => ({
                      ...s,
                      x: s.x + (Math.random() * 10 - 5),
                      y: s.y + (Math.random() * 10 - 5),
                      opacity: 0.7,
                      blendMode: 'multiply',
                      rotation: (s.rotation || 0) + pick([-8, -4, 4, 8])
                  }))
              };
          }
      }
  ]
};
