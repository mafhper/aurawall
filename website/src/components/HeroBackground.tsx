import React from 'react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { WallpaperConfig } from '../../../src/types';

interface HeroBackgroundProps {
  config: WallpaperConfig;
  opacity?: number; // 0 to 1, visibility of the wallpaper
}

export default function HeroBackground({ config, opacity = 0.4 }: HeroBackgroundProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden top-0 left-0 cursor-crosshair"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
       <WallpaperRenderer 
         config={{
             ...config,
             width: 960, // Optimize: Render at HD 
             height: 540, // Upscaled by CSS
             animation: {
                 speed: 1, // Default fallback
                 flow: 1,  // Default fallback
                 ...config.animation,
                 enabled: true // Always enabled in config, control playback via paused prop
             }
         }}
         className="w-full h-full block scale-110" 
         lowQuality={false}
         paused={!isHovered}
       />
       {/* Overlay to fade it out - pointer-events-none to allow hover to pass through to container */}
       <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: 1 - opacity }} />
       <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black pointer-events-none" />
    </div>
  );
}