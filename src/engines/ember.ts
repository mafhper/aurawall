import { EngineDefinition, Shape } from '../types';
import { ensureVisibility } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const emberEngine: EngineDefinition = {
  id: 'ember',
  meta: {
    name: 'Ember',
    description: 'O calor das brasas e a dança da fumaça. Tons terrosos, laranjas vibrantes e atmosferas acolhedoras.',
    tagline: 'Brasas vivas e fumaça dançante.',
    promoImage: '/bg-ember.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const newShapes: Shape[] = [];
    const baseColor = '#100502'; // Coal dark

    // 1. Smoke (Background)
    for (let i = 0; i < 3; i++) {
        newShapes.push({
            id: `smoke-${i}`,
            type: 'blob',
            x: Math.random() * 100,
            y: Math.random() * 80, // Rising
            size: 100,
            color: '#302020',
            opacity: 0.4,
            blur: 80,
            blendMode: 'screen',
            complexity: 6
        });
    }

    // 2. Sparks (Foreground)
    const numSparks = 8;
    for (let i = 0; i < numSparks; i++) {
         newShapes.push({
           id: `spark-${i}`,
           type: 'circle',
           x: Math.random() * 100,
           y: Math.random() * 100,
           size: Math.random() * 5 + 2,
           color: getHSL(10 + Math.random() * 30, 100, 60), // Fire Orange/Yellow
           opacity: 0.9,
           blur: 4,
           blendMode: 'screen',
         });
    }

    return {
        ...config,
        baseColor,
        noise: isGrainLocked ? config.noise : 25, // Ashy
        shapes: newShapes,
        animation: {
            ...config.animation,
            enabled: true,
            flow: 2, // Rising heat
            speed: 0.5
        }
    };
  },
  variations: [
      {
          name: 'Blue Flame',
          transform: (cfg) => ({
              ...cfg,
              baseColor: '#020510',
              shapes: ensureVisibility(cfg.shapes.map(s => ({
                  ...s,
                  color: s.id.includes('spark') ? '#0088ff' : '#051020',
              })), '#020510')
          })
      }
  ]
};
