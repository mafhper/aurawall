import { EngineDefinition, Shape } from '../types';
import { clamp } from '../utils/engineUtils';

export const glitchEngine: EngineDefinition = {
  id: 'glitch',
  meta: {
    name: 'Glitch',
    description: 'Decadência digital e erro de sinal. Aberração cromática, ruído intenso e caos visual.',
    tagline: 'O belo erro do sistema.',
    promoImage: '/bg-glitch.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const numShapes = Math.floor(Math.random() * 6) + 3;
    const newShapes: Shape[] = [];
    
    const baseColor = '#050505'; // Void black

    for (let i = 0; i < numShapes; i++) {
         const cx = Math.random() * 100;
         const cy = Math.random() * 100;
         const baseSize = Math.random() * 50 + 10;
         
         // RGB Split / Chromatic Aberration Simulation
         // Instead of one shape, we spawn 3 slightly offset channels
         
         const offset = Math.random() * 4 + 1; // Glitch intensity
         
         // Channel Red
         newShapes.push({
           id: `glitch-${i}-r`,
           type: 'circle',
           x: clamp(cx - offset, 0, 100),
           y: cy,
           size: baseSize,
           color: '#ff0000',
           opacity: 0.8,
           blur: 2,
           blendMode: 'screen', // Additive mixing
         });

         // Channel Green
         newShapes.push({
            id: `glitch-${i}-g`,
            type: 'circle',
            x: cx,
            y: clamp(cy - offset, 0, 100),
            size: baseSize,
            color: '#00ff00',
            opacity: 0.8,
            blur: 2,
            blendMode: 'screen',
          });

         // Channel Blue
         newShapes.push({
            id: `glitch-${i}-b`,
            type: 'circle',
            x: clamp(cx + offset, 0, 100),
            y: cy,
            size: baseSize,
            color: '#0000ff',
            opacity: 0.8,
            blur: 2,
            blendMode: 'screen',
          });
          
          // Occasional "Dead Pixel" Block (High complexity blob acting as noise artifact)
          if (Math.random() > 0.7) {
              newShapes.push({
                  id: `artifact-${i}`,
                  type: 'blob',
                  x: Math.random() * 100,
                  y: Math.random() * 100,
                  size: Math.random() * 30 + 5,
                  color: '#ffffff',
                  opacity: 1,
                  blur: 0,
                  blendMode: 'difference',
                  complexity: 10
              });
          }
    }

    return {
        ...config,
        baseColor,
        noise: isGrainLocked ? config.noise : 60, 
        noiseScale: 4, // Digital noise
        shapes: newShapes,
        animation: {
            ...config.animation,
            enabled: true,
            noiseAnim: 8, // High static
            speed: 5
        }
    };
  },
  variations: [
      {
          name: 'Terminal Failure',
          transform: (cfg) => ({
              ...cfg,
              baseColor: '#001100', // Matrix Green base
              shapes: cfg.shapes.map(s => ({
                  ...s,
                  color: '#00ff44',
                  blendMode: 'lighten',
                  blur: 0 // Hard pixels
              }))
          })
      },
      {
          name: 'Blue Screen',
          transform: (cfg) => ({
              ...cfg,
              baseColor: '#0000aa', // BSOD Blue
              shapes: cfg.shapes.map(s => ({
                  ...s,
                  color: '#ffffff',
                  blendMode: 'overlay',
                  opacity: 0.5
              }))
          })
      }
  ]
};