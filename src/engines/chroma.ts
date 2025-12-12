import { EngineDefinition, Shape, BlendMode } from '../types';
import { shiftColor, jitter, clamp, ensureVisibility } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const chromaEngine: EngineDefinition = {
  id: 'chroma',
  meta: {
    name: 'Chroma',
    description: 'Estética ácida e digital. Foco em distorção, cores neon e modos de mistura agressivos (Difference, Exclusion).',
    tagline: 'Distorções líquidas e cores ácidas.',
    promoImage: '/bg-chroma.svg' 
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const numShapes = Math.floor(Math.random() * 3) + 3; 
    const newShapes: Shape[] = [];
    const baseHue = Math.floor(Math.random() * 360);
    
    // Usually darker bases work better for "liquid light"
    const baseColor = getHSL(baseHue, 10, 5); // Very dark base
    
    let noise = config.noise;
    let noiseScale = config.noiseScale;

    if (!isGrainLocked) {
      noise = Math.floor(Math.random() * 40) + 30; // Higher grain
      noiseScale = Math.random() * 2 + 2; // Coarser grain
    }

    const acidModes: BlendMode[] = ['difference', 'exclusion', 'hard-light', 'color-dodge', 'overlay'];

    for (let i = 0; i < numShapes; i++) {
       // More random hue jumps for acid look
       const h = Math.random() * 360; 
       const s = 100; // Max saturation
       const l = 50; 
       
       newShapes.push({
         id: `rand-c-${Date.now()}-${i}`,
         type: Math.random() > 0.3 ? 'blob' : 'circle', // Prefer blobs for chroma
         x: Math.random() * 80 + 10, // Keep more centered
         y: Math.random() * 80 + 10,
         size: Math.random() * 100 + 50,
         color: getHSL(h, s, l),
         opacity: Math.random() * 0.5 + 0.5,
         blur: Math.random() * 40 + 10, // LOWER Blur for definition
         blendMode: acidModes[Math.floor(Math.random() * acidModes.length)],
         complexity: Math.floor(Math.random() * 5) + 5
       });
    }

    return {
        ...config,
        baseColor,
        noise,
        noiseScale,
        shapes: newShapes
    };
  },
  variations: [
    {
      name: 'Liquid Distort',
      transform: (baseConfig) => {
        return {
          ...baseConfig,
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            x: clamp(jitter(s.x, 20), 20, 80), // Keep centered
            y: clamp(jitter(s.y, 20), 20, 80),
            size: clamp(jitter(s.size, 40), 50, 150),
            blur: clamp(jitter(s.blur, 20), 10, 60), // Lower blur
            blendMode: Math.random() > 0.5 ? 'difference' : 'exclusion',
            id: s.id + '-chroma-distort'
          })), baseConfig.baseColor)
        };
      }
    },
    {
      name: 'Acid Wash',
      transform: (baseConfig) => {
        const acidBase = shiftColor(baseConfig.baseColor, 120, 20, 0);
        return {
          ...baseConfig,
          baseColor: acidBase,
          noise: 60, // High grain
          noiseScale: 4, // Coarse grain
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 120, 40, 0), // Shift hue + boost sat
            blendMode: 'difference',
            id: s.id + '-chroma-acid'
          })), acidBase)
        };
      }
    },
    {
      name: 'Thermal Shift',
      transform: (baseConfig) => {
        const thermalBase = shiftColor(baseConfig.baseColor, 180, 0, 10);
        return {
          ...baseConfig,
          baseColor: thermalBase,
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 180, 0, 0),
            blur: Math.max(20, s.blur - 30), // Sharper
            blendMode: 'hard-light',
            id: s.id + '-chroma-thermal'
          })), thermalBase)
        };
      }
    },
    {
      name: 'Glass Shards',
      transform: (baseConfig) => {
        return {
          ...baseConfig,
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            blur: 10, // Very sharp
            opacity: 0.4,
            size: s.size * 1.2,
            blendMode: 'overlay',
            id: s.id + '-chroma-glass'
          })), baseConfig.baseColor)
        };
      }
    },
    {
      name: 'Dark Matter',
      transform: (baseConfig) => {
        return {
          ...baseConfig,
          baseColor: '#000000',
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            blur: 80,
            opacity: 1,
            color: '#ffffff', // White on black exclusion = inversion
            blendMode: 'exclusion',
            id: s.id + '-chroma-dark'
          })), '#000000')
        };
      }
    }
  ]
};