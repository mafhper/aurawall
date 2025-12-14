import { WallpaperConfig } from '../types';

const generateKeyframes = () => `
  @keyframes aura-float {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes aura-pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.4; }
  }
`;

const getBlendMode = (mode: string) => {
  // Map complex SVG blend modes to standard CSS blend modes
  const map: Record<string, string> = {
    'normal': 'normal',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    'difference': 'difference',
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity'
  };
  return map[mode] || 'normal';
};

export const generateReactCode = (config: WallpaperConfig) => {
  const bgStyle = typeof config.baseColor === 'string'
    ? `bg-[${config.baseColor}]`
    : 'bg-black'; // Fallback for gradients in class names (complex to map perfectly to tailwind classes, using style tag in component is safer)

  const bgCss = typeof config.baseColor === 'string'
    ? config.baseColor
    : config.baseColor.type === 'linear'
      ? `linear-gradient(${config.baseColor.angle}deg, ${config.baseColor.color1}, ${config.baseColor.color2})`
      : `radial-gradient(circle at center, ${config.baseColor.color1}, ${config.baseColor.color2})`;

  const shapes = config.shapes.map((shape, i) => {
    // Simplify shapes for DOM rendering: use simpler animations and positioning
    const size = shape.size * 1.5; // Bump size for CSS blur compensation
    const animationClass = config.animation?.enabled
      ? `animate-[aura-float_${10 + i * 2}s_infinite_linear]`
      : '';

    return `        {/* Shape ${i + 1} */}
        <div 
          className="absolute rounded-full mix-blend-${getBlendMode(shape.blendMode)} filter blur-[${shape.blur}px] ${animationClass}"
          style={{
            top: '${shape.y}%',
            left: '${shape.x}%',
            width: '${size}%',
            height: '${size}%',
            backgroundColor: '${shape.color}',
            opacity: ${shape.opacity},
            transform: 'translate(-50%, -50%)',
            animationDelay: '${i * -2}s'
          }}
        ></div>`;
  }).join('\n');

  return `import React from 'react';

export default function AuraBackground() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '${bgCss}' }}>
      
      {/* Shapes Container */}
      <div className="absolute inset-0">
${shapes}
      </div>

      {/* Noise Overlay (Optional) */}
      <div 
        className="absolute inset-0 opacity-[${config.noise / 100}] mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")' 
        }}
      ></div>
    </div>
  );
}

/* 
  Add this to your tailwind.config.js theme.extend.keyframes if needed, 
  or use arbitrary values as generated.
  
  ${generateKeyframes()}
*/
`;
};

export const generateHtmlCssCode = (config: WallpaperConfig) => {
  const bgCss = typeof config.baseColor === 'string'
    ? config.baseColor
    : config.baseColor.type === 'linear'
      ? `linear-gradient(${config.baseColor.angle}deg, ${config.baseColor.color1}, ${config.baseColor.color2})`
      : `radial-gradient(circle at center, ${config.baseColor.color1}, ${config.baseColor.color2})`;

  const shapeDivs = config.shapes.map((shape, i) => {
    const size = shape.size * 1.5;
    const anim = config.animation?.enabled ? `animation: aura-float ${10 + i * 2}s infinite linear; animation-delay: ${i * -2}s;` : '';
    return `    <div class="aura-shape shape-${i}" style="top: ${shape.y}%; left: ${shape.x}%; width: ${size}%; height: ${size}%; background-color: ${shape.color}; opacity: ${shape.opacity}; filter: blur(${shape.blur}px); mix-blend-mode: ${getBlendMode(shape.blendMode)}; ${anim}"></div>`;
  }).join('\n');

  return `<!-- HTML Structure -->
<div class="aura-container">
  <div class="aura-wrapper">
${shapeDivs}
  </div>
  <div class="aura-noise"></div>
</div>

/* CSS Styles */
<style>
  .aura-container {
    position: relative;
    width: 100%;
    height: 100vh; /* Or container height */
    overflow: hidden;
    background: ${bgCss};
  }

  .aura-wrapper {
    position: absolute;
    inset: 0;
  }

  .aura-shape {
    position: absolute;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .aura-noise {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: ${config.noise / 100};
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
  }

  ${generateKeyframes()}
</style>
`;
};
