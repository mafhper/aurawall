import { EngineDefinition, Shape, BlendMode } from '../types';
import { shiftColor, jitter, clamp, ensureVisibility } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });

export const borealEngine: EngineDefinition = {
  id: 'boreal',
  meta: {
    name: 'Boreal',
    description: 'Inspirado na aurora boreal e sonhos etéreos. Usa alto desfoque Gaussiano e modos de mistura suaves para criar fundos fluidos.',
    tagline: 'Gradientes suaves e etéreos inspirados na aurora boreal.',
    promoImage: '/bg-boreal.svg' 
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const numShapes = Math.floor(Math.random() * 3) + 3; // 3 to 5 shapes
    const newShapes: Shape[] = [];
    const baseHue = Math.floor(Math.random() * 360);
    
    const isDarkTheme = Math.random() > 0.4;
      
    const baseColor = isDarkTheme 
        ? getHSL(baseHue, 40, Math.floor(Math.random() * 10) + 5) 
        : getHSL(baseHue, 20, Math.floor(Math.random() * 10) + 88);
      
    let noise = config.noise;

    if (!isGrainLocked) {
       noise = Math.floor(Math.random() * 25) + 20;
    }
      
    const safeBlendModes: BlendMode[] = isDarkTheme
        ? ['screen', 'color-dodge', 'normal', 'lighten'] 
        : ['multiply', 'overlay', 'normal', 'difference'];

    for (let i = 0; i < numShapes; i++) {
         const h = (baseHue + (i * 40)) % 360; 
         const s = Math.random() * 40 + 60;
         const l = isDarkTheme ? Math.random() * 40 + 50 : Math.random() * 40 + 10;
         
         newShapes.push({
           id: `rand-b-${Date.now()}-${i}`,
           type: Math.random() > 0.7 ? 'blob' : 'circle', 
           x: Math.random() * 100,
           y: Math.random() * 100,
           size: Math.random() * 80 + 60,
           color: getHSL(h, s, l),
           opacity: Math.random() * 0.4 + 0.5,
           blur: Math.random() * 60 + 60, 
           blendMode: safeBlendModes[Math.floor(Math.random() * safeBlendModes.length)],
           complexity: Math.floor(Math.random() * 4) + 4
         });
    }

    return {
        ...config,
        baseColor,
        noise,
        shapes: newShapes
    };
  },
  variations: [
    {
      name: 'Composition Remix',
      transform: (baseConfig) => {
        return {
          ...baseConfig,
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            x: clamp(jitter(s.x, 40), 0, 100),
            y: clamp(jitter(s.y, 40), 0, 100),
            size: clamp(jitter(s.size, 30), 25, 150),
            id: s.id + '-remix'
          })), baseConfig.baseColor)
        };
      }
    },
    {
      name: 'Atmosphere Shift',
      transform: (baseConfig) => {
        const atmosBase = shiftColor(baseConfig.baseColor, 10, -5, 5);
        return {
          ...baseConfig,
          baseColor: atmosBase,
          noise: clamp(baseConfig.noise - 10, 10, 50),
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            blur: Math.min(150, s.blur * 1.3),
            blendMode: Math.random() > 0.5 ? 'screen' : 'soft-light',
            opacity: clamp(s.opacity * 0.9, 0.4, 0.9),
            id: s.id + '-atmos'
          })), atmosBase)
        };
      }
    },
    {
      name: 'Deep Contrast',
      transform: (baseConfig) => {
        const contrastBase = shiftColor(baseConfig.baseColor, 0, 10, -10);
        return {
          ...baseConfig,
          baseColor: contrastBase,
          noise: clamp(baseConfig.noise + 15, 20, 80),
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 0, 20, 5),
            blendMode: Math.random() > 0.5 ? 'color-dodge' : 'normal',
            opacity: clamp(s.opacity + 0.2, 0.6, 1),
            id: s.id + '-deep'
          })), contrastBase)
        };
      }
    },
    {
      name: 'Analogous Flow',
      transform: (baseConfig) => {
        const hueShift = 30 + Math.random() * 30;
        const flowBase = shiftColor(baseConfig.baseColor, hueShift, 0, 0);
        return {
          ...baseConfig,
          baseColor: flowBase,
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, hueShift, 0, 0),
            x: clamp(jitter(s.x, 15), -10, 110),
            y: clamp(jitter(s.y, 15), -10, 110),
            id: s.id + '-flow'
          })), flowBase)
        };
      }
    },
    {
      name: 'Vibrant Pop',
      transform: (baseConfig) => {
        const popBase = shiftColor(baseConfig.baseColor, 180, 0, 0);
        return {
          ...baseConfig,
          baseColor: popBase,
          shapes: ensureVisibility(baseConfig.shapes.map(s => ({
            ...s,
            color: shiftColor(s.color, 180, 20, 0),
            blendMode: 'normal',
            id: s.id + '-pop'
          })), popBase)
        };
      }
    }
  ]
};