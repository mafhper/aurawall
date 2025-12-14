import React, { forwardRef, useMemo, memo } from 'react';
import { WallpaperConfig } from '../types';
import { getBlobPath } from '../utils/blobUtils';
import { DEFAULT_VIGNETTE } from '../constants';
import { shiftColor } from '../utils/engineUtils';

interface WallpaperRendererProps {
  config: WallpaperConfig;
  className?: string;
  style?: React.CSSProperties;
  lowQuality?: boolean; // New prop for thumbnails
  paused?: boolean; // New prop to pause animation without removing it
}

const WallpaperRendererInner = forwardRef<SVGSVGElement, WallpaperRendererProps>(({ config, className, style, lowQuality = false, paused = false }, ref) => {
  const { width = 1920, height = 1080, shapes, baseColor, noise = 0, noiseScale = 1, animation } = config;
  
  const anim = useMemo(() => animation || { enabled: false, speed: 0, flow: 0, pulse: 0, rotate: 0, noiseAnim: 0, colorCycle: false, colorCycleSpeed: 0 }, [animation]);
  const isAnimated = anim.enabled && !lowQuality;

  const vig = useMemo(() => config.vignette ? { 
    ...DEFAULT_VIGNETTE, // Merge with defaults to ensure all properties exist
    ...config.vignette 
  } : DEFAULT_VIGNETTE, [config.vignette]);


  const styles = useMemo(() => {
    // Only generate CSS animations if animation is enabled AND not in low quality mode
    if (!isAnimated) return null;

    // Time multiplier: Higher speed = Lower duration
    const baseDuration = 20 / (anim.speed || 1); 
    const colorCycleBaseDuration = 60 / (anim.colorCycleSpeed || 1);

    let css = `
      @keyframes noise-shift {
        0% { transform: translate(0,0); }
        25% { transform: translate(-1%, 1%); }
        50% { transform: translate(1%, -1%); }
        75% { transform: translate(-1%, -1%); }
        100% { transform: translate(0,0); }
      }
    `;

    shapes.forEach((shape, i) => {
      // Deterministic randoms based on index
      const r1 = ((i * 13) % 10) / 10; // 0.0 - 0.9
      const r2 = ((i * 29) % 10) / 10;
      const r3 = ((i * 37) % 10) / 10;
      
      // FLOW: Translate X/Y
      const flowX = (anim.flow || 0) * (r1 > 0.5 ? 5 : -5); // +/- %
      const flowY = (anim.flow || 0) * (r2 > 0.5 ? 5 : -5);
      
      // PULSE: Scale
      const scaleMin = 1 - ((anim.pulse || 0) / 50);
      const scaleMax = 1 + ((anim.pulse || 0) / 50);

      // ROTATE: Degrees
      const rotDir = i % 2 === 0 ? 1 : -1;
      const rotDeg = (anim.rotate || 0) * 15 * rotDir;

      // Unique duration for organic feel
      const duration = baseDuration * (0.8 + r1 * 0.4); 
      const delay = -1 * (r2 * 10);
      
      // Color Cycle Animation
      const colorAnimDuration = colorCycleBaseDuration * (0.8 + r3 * 0.4);
      const colorAnimDelay = -1 * (r1 * 5);


      css += `
        @keyframes move-${shape.id} {
          0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
          33% { transform: translate(${flowX * 0.7}%, ${flowY * 0.5}%) scale(${scaleMax}) rotate(${rotDeg * 0.3}deg); }
          66% { transform: translate(${flowX * -0.5}%, ${flowY * 0.8}%) scale(${scaleMin}) rotate(${rotDeg * 0.6}deg); }
          100% { transform: translate(0%, 0%) scale(1) rotate(${rotDeg}deg); }
        }
        
        #shape-${shape.id} {
          transform-origin: ${shape.x}% ${shape.y}%;
          animation: move-${shape.id} ${duration}s ease-in-out infinite alternate;
          animation-delay: ${delay}s;
          ${anim.colorCycle ? `filter: hue-rotate(0deg); animation: move-${shape.id} ${duration}s ease-in-out infinite alternate, hue-rotate ${colorAnimDuration}s linear infinite; animation-delay: ${delay}s, ${colorAnimDelay}s;` : ''}
          animation-play-state: ${paused ? 'paused' : 'running'};
        }
      `;
    });

    return <style>{css}</style>;
  }, [anim, shapes, isAnimated, paused]);

  // Background Gradient Logic
  const bgDef = useMemo(() => {
    if (typeof baseColor === 'string') return null;
    
    if (baseColor.type === 'linear') {
      return (
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${baseColor.angle || 0}, 0.5, 0.5)`}>
          <stop offset="0%" stopColor={baseColor.color1} />
          <stop offset="100%" stopColor={baseColor.color2} />
        </linearGradient>
      );
    }
    
    if (baseColor.type === 'radial') {
      return (
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={baseColor.color1} />
          <stop offset="100%" stopColor={baseColor.color2} />
        </radialGradient>
      );
    }
    
    return null;
  }, [baseColor]);

  // Memoize shape rendering calculations
  const renderedShapes = useMemo(() => {
    return shapes.map((shape) => {
      // Pre-calculate animation duration/delay for color cycle ONLY if needed inside the loop
      // But since we use CSS for most, we only need specific props for SVG attrs
      
      if (shape.type === 'blob') {
         const pixelSize = (shape.size / 100) * width; 
         const pathData = getBlobPath(pixelSize, pixelSize, shape.id, shape.complexity || 6, 0.4);
         
         return {
           ...shape,
           pixelSize,
           pathData,
           isBlob: true
         };
      }
      return { ...shape, isBlob: false };
    });
  }, [shapes, width]); // Re-calculate only if dimensions or shapes change

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{
        ...style,
        backgroundColor: typeof baseColor === 'string' ? baseColor : 'transparent', // Fallback for solid
      }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {styles}
        {bgDef}

        {/* Vignette Gradient Definition */}
        {vig.enabled && (
          <radialGradient 
            id="vignette-grad" 
            cx="0.5" 
            cy="0.5" 
            r="0.5"
            gradientTransform={`translate(${0.5 + vig.offsetX/100} ${0.5 + vig.offsetY/100}) scale(${vig.shapeX/50} ${vig.shapeY/50}) translate(-0.5 -0.5)`}
          >
            {/* If inverted, center is opaque, edges transparent */}
            <stop offset={`${vig.size}%`} stopColor={vig.color} stopOpacity={vig.inverted ? vig.intensity : "0"} />
            <stop offset="100%" stopColor={vig.color} stopOpacity={vig.inverted ? "0" : vig.intensity} />
          </radialGradient>
        )}

        {/* Noise Filter - Only render if not lowQuality */}
        {!lowQuality && (
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency={noiseScale / 1000} 
              numOctaves="3" 
              stitchTiles="stitch" 
            >
              {/* Animate Grain Turbulence for TV Static effect */}
              {isAnimated && !paused && anim.noiseAnim > 0 && (
                 <animate 
                   attributeName="seed" 
                   values="0;100;0" 
                   dur={`${2 / (anim.noiseAnim/5)}s`} 
                   repeatCount="indefinite" 
                 />
              )}
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
               <feFuncA type="linear" slope={noise / 100} /> 
            </feComponentTransfer>
          </filter>
        )}

        {/* Shape Blur Filter */}
        {shapes.map((shape) => (
           <filter key={`blur-${shape.id}`} id={`blur-${shape.id}`} x="-100%" y="-100%" width="300%" height="300%">
             <feGaussianBlur stdDeviation={lowQuality ? shape.blur / 2 : shape.blur} result="coloredBlur" />
           </filter>
        ))}
      </defs>

      {/* Base Background */}
      <rect width="100%" height="100%" fill={typeof baseColor === 'string' ? baseColor : "url(#bgGradient)"} />

      {/* Shapes Layer */}
      <g>
        {renderedShapes.map((shape) => {
          // Re-calculate animation vars for Color Cycle inside the map if strictly needed for attributes
          // But here we just used them in styles or explicit animate tags.
          // We need to access index-based randoms again or pass them.
          // Since map index matches, we can recalculate quickly or just use the logic below.
          
          // Note: The original code calculated r3/r1 inside the map loop for generateStyles
          // but here we are in render loop. To match 'generateStyles' randomness we need consistent logic
          // or rely on CSS classes. 
          
          // For the <animate> tag inside SVG elements (Color Cycle), we need the values.
          // Let's recalculate the lightweight math here.
          
          const i = shapes.findIndex(s => s.id === shape.id); // Find original index
          const r1 = ((i * 13) % 10) / 10;
          const r3 = ((i * 37) % 10) / 10;
          const colorCycleBaseDuration = 60 / (anim.colorCycleSpeed || 1);
          const colorAnimDuration = colorCycleBaseDuration * (0.8 + r3 * 0.4);
          const colorAnimDelay = -1 * (r1 * 5);

          if (shape.isBlob) {
             return (
               <path
                 key={shape.id} // Pass key directly
                 id={`shape-${shape.id}`}
                 d={shape.pathData}
                 fill={shape.color}
                 opacity={shape.opacity}
                 filter={`url(#blur-${shape.id})`}
                 style={{ 
                   mixBlendMode: shape.blendMode,
                   transformBox: 'fill-box',
                   transform: `translate(${(shape.x / 100) * width - shape.pixelSize!/2}px, ${(shape.y / 100) * height - shape.pixelSize!/2}px)`
                 }}
               >
                 {anim.colorCycle && !paused && (
                   <animate 
                     attributeName="fill"
                     values={`${shape.color};${shiftColor(shape.color, 60, 0, 0)};${shiftColor(shape.color, 120, 0, 0)};${shape.color}`}
                     dur={`${colorAnimDuration}s`}
                     begin={`${colorAnimDelay}s`}
                     repeatCount="indefinite"
                   />
                 )}
               </path>
             );
          }
          
          return (
            <circle
              key={shape.id} // Pass key directly
              id={`shape-${shape.id}`}
              cx={`${shape.x}%`}
              cy={`${shape.y}%`}
              r={`${shape.size / 2}%`} 
              fill={shape.color}
              opacity={shape.opacity}
              filter={`url(#blur-${shape.id})`}
              style={{ mixBlendMode: shape.blendMode }}
            >
              {anim.colorCycle && !paused && (
                 <animate 
                   attributeName="fill"
                   values={`${shape.color};${shiftColor(shape.color, 60, 0, 0)};${shiftColor(shape.color, 120, 0, 0)};${shape.color}`}
                   dur={`${colorAnimDuration}s`}
                   begin={`${colorAnimDelay}s`}
                   repeatCount="indefinite"
                 />
              )}
            </circle>
          );
        })}
      </g>

      {/* Vignette Layer */}
      {vig.enabled && (
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#vignette-grad)" 
          style={{ mixBlendMode: 'normal' }} // Normal blend to darken/lighten effectively
        />
      )}

      {/* Noise Overlay */}
      {!lowQuality && (
        <rect
          width="100%"
          height="100%"
          filter="url(#noiseFilter)"
          opacity={1} 
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
    </svg>
  );
});

WallpaperRendererInner.displayName = 'WallpaperRendererInner';

const WallpaperRenderer = memo(WallpaperRendererInner);
WallpaperRenderer.displayName = 'WallpaperRenderer';

export default WallpaperRenderer;
