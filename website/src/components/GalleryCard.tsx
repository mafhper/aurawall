import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ExternalLink, ChevronDown, Check, Image as ImageIcon, FileImage, Code } from 'lucide-react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { generateWallpaperSVG } from '../utils/svgGenerator';
import { getAppUrl } from '../utils/appUrl';

interface GalleryCardProps {
  preset: any;
  className?: string;
}

export default function GalleryCard({ preset, className = "aspect-[9/16]" }: GalleryCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate a unique animation config for this card to demonstrate the engine's capabilities
  const displayConfig = useMemo(() => {
    // If preset already has animation enabled, use it
    if (preset.config.animation?.enabled) return preset.config;

    // Deterministic pseudo-random based on ID to ensure it looks the same on every render/reload
    // Simple hash
    let seed = 0;
    for (let i = 0; i < preset.id.length; i++) seed += preset.id.charCodeAt(i);
    
    // Helper to get number from seed
    const rnd = (mod: number) => (seed % mod); // Simplistic but deterministic for this purpose
    
    // Add variations to seed for different properties
    const s1 = seed + 10;
    const s2 = seed + 20;

    return {
      ...preset.config,
      animation: {
        enabled: true,
        // Varied speeds and effects
        speed: (seed % 4) + 1, // 1-5 speed
        flow: (s1 % 5) + 2,    // Flow amount
        pulse: (s2 % 30),      // Pulse amount
        rotate: (seed % 2 === 0 ? 10 : 0), // Occasional rotation
        noiseAnim: (seed % 3 === 0 ? 10 : 0), // Occasional noise animation
        colorCycle: (s1 % 5 === 0), // Occasional color cycling
        colorCycleSpeed: 5
      }
    };
  }, [preset]);

  const handleDownload = async (format: 'jpg' | 'png' | 'svg') => {
    const exportWidth = 1080;
    const exportHeight = 1920;

    // Note: We use the ORIGINAL static config for download, not the animated one
    // unless the user specifically requested animated exports (which needs video export).
    const svgElement = generateWallpaperSVG(preset.config, exportWidth, exportHeight);
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    if (format === 'svg') {
        const link = document.createElement('a');
        link.href = url;
        link.download = `aurawall-${preset.id}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsOpen(false);
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
        
        let mime = 'image/jpeg';
        if (format === 'png') mime = 'image/png';
        
        const dataUrl = canvas.toDataURL(mime, 0.95);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `aurawall-${preset.id}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };
    img.src = url;
  };

  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-500 bg-zinc-900 shadow-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsOpen(false); }}
    >
      
      {/* Real Renderer Preview */}
      {/* Logic: When hovered (isHovered=true), lowQuality becomes false. 
          WallpaperRenderer sees lowQuality=false and anim.enabled=true (from displayConfig), 
          so it enables SVG animations and High Quality filters. */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
        <WallpaperRenderer 
          config={displayConfig} 
          className="w-full h-full block" 
          lowQuality={!isHovered} 
        />
      </div>
      
      {/* Overlay Content - Darker overlay for better contrast as requested */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-xs font-bold tracking-wider text-purple-400 uppercase mb-1 block">
          {preset.collection} • {preset.category}
        </span>
        <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">{preset.name}</h3>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 relative">
          
           {/* Download Dropdown */}
           <div className="relative flex-1">
             <button 
               onClick={() => setIsOpen(!isOpen)}
               className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-bold text-center hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
             >
               <Download size={16} />
               {t('gallery.download')}
               <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
             </button>
             
             {/* Menu overlay */}
             <div 
               className={`absolute bottom-full left-0 w-full mb-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-xl transition-all duration-200 origin-bottom z-10 ${
                 isOpen 
                   ? 'opacity-100 scale-100 visible' 
                   : 'opacity-0 scale-95 invisible pointer-events-none'
               }`}
             >
               <button 
                  onClick={() => handleDownload('jpg')} 
                  className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 text-sm text-white"
               >
                 <ImageIcon size={16} className="text-blue-400"/> JPG <span className="text-zinc-500 text-xs ml-auto">Mobile</span>
               </button>
               <button 
                  onClick={() => handleDownload('png')} 
                  className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 text-sm text-white"
               >
                 <FileImage size={16} className="text-green-400"/> PNG <span className="text-zinc-500 text-xs ml-auto">Lossless</span>
               </button>
               <button 
                  onClick={() => handleDownload('svg')} 
                  className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center gap-3 text-sm border-t border-white/5 text-white"
               >
                 <Code size={16} className="text-yellow-400"/> SVG <span className="text-zinc-500 text-xs ml-auto">Vector</span>
               </button>
             </div>
           </div>

          <a 
            href={`${getAppUrl()}?preset=${preset.id}`}
            className="flex-1 bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-bold text-center hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-white/10 backdrop-blur shadow-lg"
          >
            <ExternalLink size={16} />
            {t('gallery.open_editor')}
          </a>
        </div>
      </div>
    </div>
  );
}
