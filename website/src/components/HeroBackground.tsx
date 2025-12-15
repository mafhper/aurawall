import React, { useMemo } from 'react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { WallpaperConfig } from '../../../src/types';
import { PRESETS, DEFAULT_ANIMATION } from '../../../src/constants';

// Curated list of VALID presets that work well as page backgrounds
// Using medium-contrast, vibrant presets (avoiding too dark or too light)
const HERO_PRESET_IDS = [
  'soul-glow',        // Purple/Pink vibrant aura (index 0)
  'phoenix-rise',     // Orange/Red warm tones (index 1)
  'oil-slick',        // Cyan/Magenta neon (index 2)
  'thermal-vision',   // Red/Yellow thermal (index 3)
  'magma-lamp',       // Orange/Red lava (index 4)
  'nebula-cloud',     // Purple/Red nebula (index 5)
  'system-error',     // Magenta/Cyan glitch (index 6)
  'pacific-drift',    // Cyan/Blue oceanic (index 7)
];

// Get preset by ID or index for deterministic selection
const getPresetById = (id: string) => {
  return PRESETS.find(p => p.id === id) || PRESETS.find(p => p.id === 'soul-glow') || PRESETS[0];
};

const getPresetByIndex = (index: number) => {
  const validPresets = PRESETS.filter(p => HERO_PRESET_IDS.includes(p.id));
  if (validPresets.length === 0) {
    return PRESETS[0];
  }
  return validPresets[index % validPresets.length];
};

interface HeroBackgroundProps {
  /** Explicit config (takes priority) */
  config?: WallpaperConfig;
  /** Use a specific preset ID - RECOMMENDED for avoiding hydration issues */
  presetId?: string;
  /** Use a deterministic index from the curated list */
  presetIndex?: number;
  /** Custom class name */
  className?: string;
  /** Internal overlay opacity [0-100] - actual darkness applied */
  overlayOpacity?: number;
  /** External hover control (overrides internal state) */
  isHovered?: boolean;
  /** Content children */
  children?: React.ReactNode;
}

export default function HeroBackground({ 
  config: propConfig, 
  presetId,
  presetIndex,
  className = '',
  overlayOpacity = 40,
  isHovered: externalHovered,
  children
}: HeroBackgroundProps) {
  const [internalHovered, setInternalHovered] = React.useState(false);
  
  // Use external hover if provided, otherwise use internal state
  const isHovered = externalHovered !== undefined ? externalHovered : internalHovered;

  // Determine preset deterministically (SSR-safe)
  const activePreset = useMemo(() => {
    if (presetId) {
      return getPresetById(presetId);
    }
    if (presetIndex !== undefined) {
      return getPresetByIndex(presetIndex);
    }
    // Default fallback - always the same for SSR consistency
    return getPresetById('soul-glow');
  }, [presetId, presetIndex]);

  // Determine final config
  const finalConfig = useMemo(() => {
    if (propConfig) return propConfig;
    
    return {
      width: 1920,
      height: 1080,
      noise: 20,
      noiseScale: 1,
      baseColor: '#0a0a0a',
      shapes: [],
      ...activePreset.config,
      animation: {
        ...DEFAULT_ANIMATION,
        ...activePreset.config.animation,
        enabled: true,
      }
    } as WallpaperConfig;
  }, [propConfig, activePreset]);

  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden top-0 left-0 cursor-crosshair z-0 ${className}`}
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
    >
       <WallpaperRenderer 
         config={{
             ...finalConfig,
             width: 960, // Optimize: Render at HD 
             height: 540, // Upscaled by CSS
             animation: {
                 speed: 1,
                 flow: 1,
                 ...finalConfig.animation,
                 enabled: true
             }
         }}
         className="w-full h-full block scale-110" 
         lowQuality={false}
         paused={!isHovered}
       />
       {/* Dark overlay - opacity is percentage of darkness */}
       <div 
         className="absolute inset-0 bg-black pointer-events-none" 
         style={{ opacity: overlayOpacity / 100 }} 
       />
       {/* Gradient fade to black at bottom */}
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />
       
       {children && (
         <div className="relative z-10 w-full h-full pointer-events-none">
           <div className="pointer-events-auto w-full h-full">
             {children}
           </div>
         </div>
       )}
    </div>
  );
}