import { EngineDefinition, Shape } from '../types';
import { ensureVisibility } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const sakuraEngine: EngineDefinition = {
  id: 'sakura',
  meta: {
    name: 'Sakura',
    description: 'A delicadeza da primavera japonesa. Pétalas dançantes, tons pastéis e brisas suaves.',
    tagline: 'Pétalas ao vento e serenidade.',
    promoImage: '/bg-sakura.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const numShapes = 12;
    const newShapes: Shape[] = [];
    
    // Soft Pink/Peach Base
    const baseColor = getHSL(340 + Math.random() * 20, 30, 90); 

    for (let i = 0; i < numShapes; i++) {
         newShapes.push({
           id: `petal-${i}`,
           type: 'blob', // Petal-like
           x: Math.random() * 100,
           y: Math.random() * 100,
           size: Math.random() * 20 + 10, // Small petals
           color: getHSL(340 + Math.random() * 30, 80, 85), // Pink/White
           opacity: 0.6,
           blur: 5, 
           blendMode: 'multiply', // Subtle darkening on light bg
           complexity: 3
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
            flow: 8, // Windy
            speed: 1
        }
    };
  },
  variations: [
      {
          name: 'Night Blossom',
          transform: (cfg) => ({
              ...cfg,
              baseColor: '#1a0b10', // Dark cherry
              shapes: ensureVisibility(cfg.shapes.map(s => ({
                  ...s,
                  blendMode: 'screen',
                  opacity: 0.8
              })), '#1a0b10')
          })
      }
  ]
};
