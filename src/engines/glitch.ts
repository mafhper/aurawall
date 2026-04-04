import { EngineDefinition, Shape } from '../types';
import { clamp, applyGrainLock, ensureVisibility } from '../utils/engineUtils';
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const glitchEngine: EngineDefinition = {
  id: 'glitch',
  meta: {
    name: 'Glitch',
    description: 'Decadência digital e erro de sinal. Aberração cromática, ruído intenso e caos visual.',
    tagline: 'O belo erro do sistema.',
    promoImage: '/bg-glitch.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked, presetId }) => {
    const newShapes: Shape[] = [];
    const modes = ['cyber-attack', 'system-error', 'signal-loss'] as const;
    const mode = modes.includes(presetId as (typeof modes)[number])
      ? presetId as (typeof modes)[number]
      : pick(modes);
    const palettes = [
      {
        base: '#040404',
        bright: '#f4f4f4',
        channels: [
          { suffix: 'r', color: '#ff315c', dx: -1.8, dy: 0.3 },
          { suffix: 'g', color: '#00f08a', dx: 0.2, dy: -0.5 },
          { suffix: 'b', color: '#2d6bff', dx: 1.9, dy: 0.2 }
        ]
      },
      {
        base: '#08030d',
        bright: '#efe7ff',
        channels: [
          { suffix: 'r', color: '#ff4d86', dx: -1.6, dy: 0.4 },
          { suffix: 'g', color: '#66ffd1', dx: 0.1, dy: -0.4 },
          { suffix: 'b', color: '#6f67ff', dx: 1.6, dy: 0.1 }
        ]
      }
    ];
    const palette = mode === 'system-error' ? palettes[1] : pick(palettes);
    const baseColor = palette.base;
    if (mode === 'signal-loss') {
      const blackoutCount = Math.floor(rand(3, 5));
      for (let i = 0; i < blackoutCount; i++) {
        newShapes.push({
          id: `dropout-${i}`,
          type: 'rect',
          x: 50,
          y: rand(18, 84),
          size: rand(110, 122),
          color: i % 2 === 0 ? '#0a0a0a' : '#161616',
          opacity: rand(0.68, 0.92),
          blur: 0,
          blendMode: 'normal',
          rotation: 0,
          scaleX: 5.8,
          scaleY: rand(0.06, 0.16)
        });
      }
      for (let i = 0; i < 5; i++) {
        newShapes.push({
          id: `signal-${i}`,
          type: 'rect',
          x: 50,
          y: rand(14, 82),
          size: rand(112, 122),
          color: i % 2 === 0 ? palette.channels[1].color : palette.bright,
          opacity: rand(0.06, 0.16),
          blur: rand(0, 0.2),
          blendMode: 'screen',
          rotation: 0,
          scaleX: 5.8,
          scaleY: rand(0.014, 0.028)
        });
      }
    } else {
      const signalBandCount = Math.floor(rand(4, 7));
      for (let i = 0; i < signalBandCount; i++) {
        const y = rand(12, 88);
        const width = rand(82, 120);
        const angle = mode === 'cyber-attack' ? rand(-12, 12) : rand(-1.5, 1.5);
        const scaleY = rand(0.018, mode === 'cyber-attack' ? 0.055 : 0.035);

        palette.channels.forEach((channel) => {
          newShapes.push({
            id: `signal-${i}-${channel.suffix}`,
            type: 'rect',
            x: clamp(50 + channel.dx * rand(mode === 'cyber-attack' ? 1.8 : 1.2, mode === 'cyber-attack' ? 3.2 : 2.4), 0, 100),
            y: clamp(y + channel.dy * rand(0.8, 2.2), 0, 100),
            size: width,
            color: channel.color,
            opacity: rand(0.16, 0.34),
            blur: rand(0, 0.8),
            blendMode: 'screen',
            rotation: angle,
            scaleX: rand(3.4, 5.8),
            scaleY
          });
        });
      }
    }

    const frameCount = mode === 'system-error' ? Math.floor(rand(4, 6)) : Math.floor(rand(2, 4));
    for (let i = 0; i < frameCount; i++) {
      const frameX = rand(18, 82);
      const frameY = rand(16, 84);
      const frameSize = rand(mode === 'system-error' ? 18 : 14, mode === 'system-error' ? 34 : 28);
      const tilt = mode === 'cyber-attack' ? rand(-8, 8) : rand(-3, 3);
      const scaleX = rand(1.2, mode === 'system-error' ? 2.2 : 2.8);
      const scaleY = rand(mode === 'system-error' ? 0.7 : 0.4, 1.1);

      newShapes.push({
        id: `frame-base-${i}`,
        type: 'rect',
        x: frameX,
        y: frameY,
        size: frameSize,
        color: '#111111',
        opacity: rand(0.5, 0.82),
        blur: rand(0, 0.3),
        blendMode: 'normal',
        rotation: tilt,
        scaleX,
        scaleY
      });

      if (mode !== 'signal-loss') {
        palette.channels.forEach((channel) => {
          newShapes.push({
            id: `frame-ghost-${i}-${channel.suffix}`,
            type: 'rect',
            x: clamp(frameX + channel.dx * rand(2, 4.4), 0, 100),
            y: clamp(frameY + channel.dy * rand(1.6, 3.2), 0, 100),
            size: frameSize,
            color: channel.color,
            opacity: rand(0.08, 0.16),
            blur: rand(0, 0.4),
            blendMode: 'screen',
            rotation: tilt + rand(-2, 2),
            scaleX,
            scaleY
          });
        });
      }
    }

    const shardCount = mode === 'system-error' ? 4 : 8;
    for (let i = 0; i < shardCount; i++) {
      newShapes.push({
        id: `shard-${i}`,
        type: 'rect',
        x: rand(6, 94),
        y: rand(8, 92),
        size: rand(4, 14),
        color: pick([palette.bright, '#d0d0d0', '#8c8c8c']),
        opacity: rand(0.12, 0.34),
        blur: rand(0, 0.5),
        blendMode: pick(['screen', 'difference', 'overlay']),
        rotation: mode === 'cyber-attack' ? rand(-26, 26) : rand(-10, 10),
        scaleX: rand(0.5, 2.2),
        scaleY: rand(0.08, 0.28)
      });
    }

    const scanlineCount = mode === 'signal-loss' ? 16 : 10;
    for (let i = 0; i < scanlineCount; i++) {
      newShapes.push({
        id: `scanline-${i}`,
        type: 'rect',
        x: 50,
        y: 6 + i * (mode === 'signal-loss' ? 5.6 : 8.8) + rand(-0.8, 0.8),
        size: 118,
        color: i % 3 === 0 ? '#0f0f0f' : '#ffffff',
        opacity: i % 3 === 0 ? rand(0.08, 0.12) : rand(0.02, 0.06),
        blur: 0,
        blendMode: 'overlay',
        rotation: mode === 'cyber-attack' ? rand(-1, 1) : 0,
        scaleX: 5.8,
        scaleY: rand(0.006, 0.018)
      });
    }

    const grain = applyGrainLock(config, isGrainLocked, 36, 2.6);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: ensureVisibility(newShapes, baseColor),
        animation: {
            ...config.animation,
            enabled: true,
            flow: 1.1,
            speed: 1.8,
            pulse: 0,
            rotate: 0,
            noiseAnim: 8
        }
    };
  },
  variations: [
      {
          name: 'Terminal Failure',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#001100', // Matrix Green base
                  shapes: cfg.shapes.map(s => ({
                      ...s,
                      color: '#00ff44',
                      blendMode: 'lighten',
                      blur: 0 // Hard pixels
                  }))
              };
          }
      },
      {
          name: 'Blue Screen',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#0000aa', // BSOD Blue
                  shapes: cfg.shapes.map(s => ({
                      ...s,
                      color: '#ffffff',
                      blendMode: 'overlay',
                      opacity: 0.5
                  }))
              };
          }
      }
  ]
};
