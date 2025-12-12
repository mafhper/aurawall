import { EngineDefinition, Shape } from '../types';
import { ensureVisibility } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const geometricaEngine: EngineDefinition = {
  id: 'geometrica',
  meta: {
    name: 'Geometrica',
    description: 'Precisão matemática e estrutura Bauhaus. Formas puras alinhadas à grade, cores primárias e composição equilibrada.',
    tagline: 'Ordem, grade e função.',
    promoImage: '/bg-geometrica.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const numShapes = Math.floor(Math.random() * 4) + 2; // Fewer shapes for minimalism
    const newShapes: Shape[] = [];
    
    // Bauhaus / Swiss Style Palette
    const colors = [
        '#E4002B', // International Orange/Red
        '#1244A4', // Azure
        '#F3A200', // Yellow
        '#000000', // Black
        '#FFFFFF'  // White
    ];
    
    const baseColor = '#f0f0f0'; // Off-white paper background

    // Grid System: 0, 25, 50, 75, 100
    const gridSteps = [0, 25, 50, 75, 100];
    const sizeSteps = [10, 25, 50, 75];

    for (let i = 0; i < numShapes; i++) {
         const color = colors[Math.floor(Math.random() * colors.length)];
         const x = gridSteps[Math.floor(Math.random() * gridSteps.length)];
         const y = gridSteps[Math.floor(Math.random() * gridSteps.length)];
         const size = sizeSteps[Math.floor(Math.random() * sizeSteps.length)];

         newShapes.push({
           id: `geo-${Date.now()}-${i}`,
           type: 'circle', // Still circles, but organized
           x: x,
           y: y,
           size: size,
           color: color,
           opacity: 0.95, // Almost solid
           blur: 0, // Perfectly sharp
           blendMode: color === '#000000' ? 'multiply' : 'normal', // Overprint effect for black
         });
    }

    return {
        ...config,
        baseColor,
        noise: isGrainLocked ? config.noise : 8, // Subtle paper grain
        shapes: newShapes,
        animation: {
            ...config.animation,
            enabled: false // Static design preferred
        }
    };
  },
  variations: [
      {
          name: 'Dark Mode Architect',
          transform: (cfg) => ({
              ...cfg,
              baseColor: '#101010',
              shapes: ensureVisibility(cfg.shapes.map(s => ({
                  ...s,
                  blendMode: 'screen',
                  opacity: 0.9,
                  color: s.color === '#000000' ? '#333333' : s.color
              })), '#101010')
          })
      },
      {
          name: 'Deconstructed',
          transform: (cfg) => ({
              ...cfg,
              shapes: cfg.shapes.map(s => ({
                  ...s,
                  x: s.x + (Math.random() * 10 - 5), // Slight off-grid
                  y: s.y + (Math.random() * 10 - 5),
                  opacity: 0.7,
                  blendMode: 'multiply'
              }))
          })
      }
  ]
};