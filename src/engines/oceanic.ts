import { EngineDefinition, Shape } from '../types';
import { ensureVisibility, shiftColor } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const oceanicEngine: EngineDefinition = {
  id: 'oceanic',
  meta: {
    name: 'Oceanic',
    description: 'A calma e a fúria dos mares. Ondas orgânicas, tons profundos de azul e fluidez constante.',
    tagline: 'Profundezas azuis e marés vivas.',
    promoImage: '/bg-oceanic.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const numShapes = Math.floor(Math.random() * 4) + 3;
    const newShapes: Shape[] = [];
    
    // Deep Ocean Palette
    const baseHue = 190 + Math.random() * 40; // Cyan to Blue (190-230)
    const baseColor = getHSL(baseHue, 60, 10); // Deep dark blue

    for (let i = 0; i < numShapes; i++) {
         const h = (baseHue + Math.random() * 40 - 20) % 360;
         const s = 60 + Math.random() * 30;
         const l = 20 + Math.random() * 40; // Varied lightness for depth
         
         // Use blobs to simulate water currents
         newShapes.push({
           id: `ocean-${Date.now()}-${i}`,
           type: 'blob',
           x: Math.random() * 100,
           y: Math.random() * 80 + 20, // Lower half weighted
           size: Math.random() * 100 + 50,
           color: getHSL(h, s, l),
           opacity: 0.6,
           blur: 40,
           blendMode: Math.random() > 0.6 ? 'overlay' : 'screen', // Overlay for depth, Screen for highlights
           complexity: 4 + Math.floor(Math.random() * 3) // Organic shapes
         });
    }

    // Add "Foam" or highlights
    if (Math.random() > 0.3) {
        newShapes.push({
            id: `foam-${Date.now()}`,
            type: 'blob',
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 40,
            color: '#ffffff',
            opacity: 0.3,
            blur: 20,
            blendMode: 'overlay',
            complexity: 6
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
            flow: 4, // Gentle flow
            speed: 1.5,
            colorCycle: true,
            colorCycleSpeed: 2
        }
    };
  },
  variations: [
    {
      name: 'Stormy Seas',
      transform: (cfg) => ({
        ...cfg,
        baseColor: '#0a1015', // Dark grey-blue
        noise: 40, // Rough texture
        shapes: ensureVisibility(cfg.shapes.map(s => ({
          ...s,
          color: shiftColor(s.color, 0, -20, -10), // Desaturated
          blendMode: 'hard-light',
          blur: s.blur * 0.8 // Sharper waves
        })), '#0a1015')
      })
    },
    {
        name: 'Coral Reef',
        transform: (cfg) => ({
          ...cfg,
          baseColor: '#002030', // Clear tropical water
          shapes: cfg.shapes.map((s, i) => ({
            ...s,
            color: i % 2 === 0 ? shiftColor(s.color, 0, 0, 0) : '#ff7f50', // Inject coral orange
            blendMode: 'screen'
          }))
        })
      }
  ]
};
