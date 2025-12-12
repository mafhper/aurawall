import { EngineDefinition, Shape } from '../types';
import { ensureVisibility } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const midnightEngine: EngineDefinition = {
  id: 'midnight',
  meta: {
    name: 'Midnight',
    description: 'A imensidão do cosmos. Estrelas distantes, nebulosas sutis e o silêncio do espaço profundo.',
    tagline: 'Poeira estelar e silêncio profundo.',
    promoImage: '/bg-midnight.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const newShapes: Shape[] = [];
    
    // Deep Space Base
    const baseColor = getHSL(240 + Math.random() * 40, 30, 4); // Deep Blue/Purple Black

    // 1. Nebula Clouds (Background)
    for (let i = 0; i < 3; i++) {
        newShapes.push({
            id: `nebula-${i}`,
            type: 'blob',
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 150,
            color: getHSL(200 + Math.random() * 100, 60, 20),
            opacity: 0.3,
            blur: 100,
            blendMode: 'screen',
            complexity: 5
        });
    }

    // 2. Stars (Foreground)
    const numStars = 15;
    for (let i = 0; i < numStars; i++) {
         newShapes.push({
           id: `star-${i}`,
           type: 'circle',
           x: Math.random() * 100,
           y: Math.random() * 100,
           size: Math.random() * 2 + 1, // Tiny
           color: '#ffffff',
           opacity: Math.random() * 0.5 + 0.5,
           blur: Math.random() > 0.8 ? 2 : 0, // Occasional glow
           blendMode: 'normal',
         });
    }

    return {
        ...config,
        baseColor,
        noise: isGrainLocked ? config.noise : 10,
        noiseScale: 1,
        shapes: newShapes
    };
  },
  variations: [
      {
          name: 'Supernova',
          transform: (cfg) => ({
              ...cfg,
              shapes: cfg.shapes.map(s => s.id.includes('nebula') ? {
                  ...s,
                  color: '#ffaa00',
                  opacity: 0.5,
                  blendMode: 'screen'
              } : s)
          })
      }
  ]
};
