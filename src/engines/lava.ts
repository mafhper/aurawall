import { EngineDefinition, Shape } from '../types';
import { shiftColor, ensureVisibility } from '../utils/engineUtils';
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
    const numShapes = Math.floor(Math.random() * 4) + 3;
    const newShapes: Shape[] = [];
    
    // Warm/Psychedelic Palettes
    const palettes = [
      { base: 0, range: 60 },   // Red-Yellow
      { base: 260, range: 60 }, // Purple-Pink
      { base: 120, range: 60 }, // Green-Blue (Toxic Lava)
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    
    const baseColor = getHSL(palette.base, 20, 10); // Darker base for contrast

    for (let i = 0; i < numShapes; i++) {
         const h = (palette.base + Math.random() * palette.range) % 360;
         const s = 80 + Math.random() * 20;
         const l = 40 + Math.random() * 30;
         
         newShapes.push({
           id: `lava-${Date.now()}-${i}`,
           type: 'blob', // Always blobs
           x: Math.random() * 60 + 20, // Center focused
           y: Math.random() * 80 + 10,
           size: Math.random() * 80 + 80, // Large blobs
           color: getHSL(h, s, l),
           opacity: 0.8,
           blur: 40, // Soft but defined
           blendMode: 'screen',
           complexity: 3 + Math.floor(Math.random() * 2) // Simple blobs
         });
    }

    return {
        ...config,
        baseColor,
        noise: isGrainLocked ? config.noise : 15,
        shapes: newShapes,
        animation: {
            ...config.animation,
            enabled: true,
            flow: 5,
            speed: 2
        }
    };
  },
  variations: [
    {
      name: 'Magma Flow',
      transform: (cfg) => ({
        ...cfg,
        baseColor: '#1a0500',
        shapes: ensureVisibility(cfg.shapes.map(s => ({
          ...s,
          color: shiftColor(s.color, 0, 0, 10),
          blendMode: 'screen'
        })), '#1a0500')
      })
    },
    {
        name: 'Toxic Sludge',
        transform: (cfg) => ({
          ...cfg,
          baseColor: '#051a05',
          shapes: ensureVisibility(cfg.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 120, 0, 0), // Shift to green
            blendMode: 'hard-light'
          })), '#051a05')
        })
      }
  ]
};
