import { EngineDefinition, Shape } from '../types';
import { ensureVisibility, applyGrainLock } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });
const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const emberEngine: EngineDefinition = {
  id: 'ember',
  meta: {
    name: 'Ember',
    description: 'O calor das brasas e a dança da fumaça. Tons terrosos, laranjas vibrantes e atmosferas acolhedoras.',
    tagline: 'Brasas vivas e fumaça dançante.',
    promoImage: '/bg-ember.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked, presetId }) => {
    const newShapes: Shape[] = [];
    const modes = ['campfire-cozy', 'smoke-plume', 'forge-light'] as const;
    const mode = modes.includes(presetId as (typeof modes)[number])
      ? presetId as (typeof modes)[number]
      : modes[Math.floor(Math.random() * modes.length)];
    const baseColor = {
      type: 'linear' as const,
      angle: rand(86, 104),
      color1: mode === 'forge-light' ? '#220b05' : '#26110b',
      color2: mode === 'smoke-plume' ? '#130907' : '#110603'
    };

    for (let i = 0; i < (mode === 'smoke-plume' ? 4 : 3); i++) {
      newShapes.push({
        id: `smoke-${i}`,
        type: 'blob',
        x: rand(28, 72),
        y: mode === 'smoke-plume' ? rand(10, 46) : rand(16, 58),
        size: rand(84, mode === 'campfire-cozy' ? 120 : 140),
        color: getHSL(rand(12, 24), rand(24, 38), mode === 'smoke-plume' ? rand(12, 20) : rand(14, 24)),
        opacity: rand(mode === 'smoke-plume' ? 0.1 : 0.08, mode === 'smoke-plume' ? 0.2 : 0.16),
        blur: rand(72, 132),
        blendMode: 'soft-light',
        complexity: 6,
        rotation: rand(-22, 22),
        scaleX: rand(1.2, 1.8),
        scaleY: rand(0.9, 1.4)
      });
    }

    for (let i = 0; i < 4; i++) {
      newShapes.push({
        id: `ember-bed-${i}`,
        type: i < 2 ? 'rect' : 'blob',
        x: rand(20, 80),
        y: mode === 'forge-light' ? rand(72, 88) : rand(76, 92),
        size: rand(mode === 'forge-light' ? 44 : 34, mode === 'forge-light' ? 84 : 68),
        color: mode === 'forge-light'
          ? i === 0 ? '#5f1a09' : i === 1 ? '#b93a12' : i === 2 ? '#ff7a1a' : '#ffe0a0'
          : i === 0 ? '#3b1209' : i === 1 ? '#912513' : i === 2 ? '#ff641a' : '#ffb15a',
        opacity: rand(0.22, mode === 'forge-light' ? 0.5 : 0.42),
        blur: rand(mode === 'forge-light' ? 10 : 16, mode === 'forge-light' ? 22 : 34),
        blendMode: 'screen',
        rotation: rand(-12, 12),
        scaleX: rand(1.8, 3.4),
        scaleY: i < 2 ? rand(0.12, 0.22) : rand(0.28, 0.5),
        complexity: i >= 2 ? 5 : undefined
      });
    }

    for (let i = 0; i < (mode === 'campfire-cozy' ? 4 : 6); i++) {
      newShapes.push({
        id: `flame-${i}`,
        type: 'blob',
        x: rand(24, 76),
        y: rand(mode === 'campfire-cozy' ? 62 : 58, 82),
        size: rand(mode === 'campfire-cozy' ? 8 : 10, mode === 'campfire-cozy' ? 18 : 22),
        color: getHSL(rand(14, 28), 100, mode === 'forge-light' ? rand(56, 72) : rand(50, 64)),
        opacity: rand(0.22, mode === 'forge-light' ? 0.48 : 0.4),
        blur: rand(6, 14),
        blendMode: 'screen',
        complexity: 5,
        rotation: rand(-12, 12),
        scaleX: rand(0.56, 1.02),
        scaleY: rand(1.5, 2.8)
      });
    }

    for (let i = 0; i < (mode === 'campfire-cozy' ? 8 : 14); i++) {
      const rise = Math.random();
      newShapes.push({
        id: `spark-${i}`,
        type: 'circle',
        x: rand(24, 76) + Math.sin(rise * Math.PI * 2) * rand(0, 10),
        y: 86 - rise * rand(28, 72),
        size: rand(mode === 'campfire-cozy' ? 0.4 : 0.5, mode === 'campfire-cozy' ? 1.1 : 1.6),
        color: i % 3 === 0 ? '#ffd166' : getHSL(rand(12, 36), 100, rand(56, 72)),
        opacity: rand(0.22, 0.66),
        blur: rand(0.2, 1.2),
        blendMode: 'screen'
      });
    }

    if (mode !== 'campfire-cozy') {
      for (let i = 0; i < 3; i++) {
        newShapes.push({
          id: `shimmer-${i}`,
          type: 'rect',
          x: rand(28, 72),
          y: rand(44, 70),
          size: rand(26, 44),
          color: getHSL(rand(24, 36), 82, 70),
          opacity: rand(0.04, 0.08),
          blur: rand(10, 18),
          blendMode: 'overlay',
          rotation: rand(-78, -62),
          scaleX: rand(0.1, 0.16),
          scaleY: rand(2.4, 3.8)
        });
      }
    }

    if (mode === 'forge-light') {
      newShapes.push({
        id: 'forge-beam',
        type: 'rect',
        x: rand(48, 58),
        y: rand(52, 66),
        size: rand(42, 64),
        color: '#ffe0a0',
        opacity: rand(0.08, 0.14),
        blur: rand(6, 12),
        blendMode: 'screen',
        rotation: rand(-76, -66),
        scaleX: rand(0.1, 0.14),
        scaleY: rand(2.8, 3.8)
      });
    }

    const grain = applyGrainLock(config, isGrainLocked, 18);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: ensureVisibility(newShapes, baseColor),
        animation: {
            ...config.animation,
            enabled: true,
            flow: mode === 'smoke-plume' ? 1.4 : 1.1,
            speed: mode === 'campfire-cozy' ? 0.34 : 0.42,
            pulse: 1,
            rotate: 1
        }
    };
  },
  variations: [
      {
          name: 'Blue Flame',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#020510',
                  shapes: ensureVisibility(cfg.shapes.map(s => ({
                      ...s,
                      color: s.id.includes('spark') ? '#0088ff' : '#051020',
                  })), '#020510')
              };
          }
      },
      {
          name: 'Charcoal Smoke',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, 14, 0.9);
              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#130b09',
                  shapes: ensureVisibility(cfg.shapes.map(s => ({
                    ...s,
                    color: s.id.includes('smoke') ? '#3c2d29' : s.id.includes('spark') ? '#ffb46b' : '#6d2a15',
                    opacity: s.id.includes('smoke') ? Math.min(s.opacity * 1.25, 0.24) : s.opacity
                  })), '#130b09')
              };
          }
      },
      {
          name: 'Forge Heat',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise + 2);
              return {
                  ...cfg,
                  ...grain,
                  shapes: ensureVisibility(cfg.shapes.map(s => ({
                    ...s,
                    color: s.id.includes('ember-bed') || s.id.includes('flame') ? '#ff7a1a' : s.color,
                    opacity: s.id.includes('ember-bed') ? Math.min(s.opacity * 1.2, 0.52) : s.opacity
                  })), cfg.baseColor)
              };
          }
      }
  ]
};
