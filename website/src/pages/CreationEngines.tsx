import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { ENGINES } from '../data/engines';
import HeroBackground from '../components/HeroBackground';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { getEngine } from '../../../src/engines';
import { DEFAULT_CONFIG } from '../../../src/constants';

// Helper to get a config for preview
const getPreviewConfig = (engineId: string) => {
  const engine = getEngine(engineId);
  if (!engine || !engine.randomizer) return DEFAULT_CONFIG;
  
  // Use a deterministic seed logic if possible, or just random
  // For static preview consistency we might want to store seeds, but random is fine for now
  return engine.randomizer(DEFAULT_CONFIG, { isGrainLocked: false });
};

const EngineCard = ({ engine, variant = 'grid' }: { engine: typeof ENGINES[0], variant?: 'hero' | 'secondary' | 'grid' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate config once per mount to avoid jitter on re-renders, 
  // but we want it fresh on page load.
  const config = useMemo(() => {
      const cfg = getPreviewConfig(engine.id);
      // Force animation ENABLED in config, but we control play state via CSS or conditional rendering?
      // Actually WallpaperRenderer takes config.animation.enabled.
      // If we want "static until hover", we can toggle enabled based on hover.
      return {
          ...cfg,
          animation: {
              ...cfg.animation,
              enabled: true // Always enable to allow CSS generation
          }
      };
  }, [engine.id]);

  // To truly pause, we pass a prop to WallpaperRenderer or we modify the config passed.
  // The user wants "images stay still until I pass the mouse".
  // WallpaperRenderer generates CSS animations. We can't easily pause CSS via props without modifying Renderer.
  // Workaround: Toggle `enabled` in the config passed to the renderer.
  
  const activeConfig = useMemo(() => ({
      ...config,
      animation: {
          ...config.animation,
          // If variant is hero, maybe always animate? User said "all images".
          // Let's stick to hover for all.
          enabled: isHovered 
      }
  }), [config, isHovered]);

  const heightClass = variant === 'hero' ? 'h-[500px] md:h-[600px]' : (variant === 'secondary' ? 'h-[400px]' : 'aspect-[4/3]');
  
  return (
    <Link 
      to={`/creation/engine/${engine.id}`}
      className={`group relative block w-full rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${heightClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Renderer Layer */}
      <div className="absolute inset-0 bg-zinc-900">
         <WallpaperRenderer 
            config={activeConfig}
            className="w-full h-full block"
            lowQuality={!isHovered} // Optimization
         />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 p-8 flex flex-col justify-end">
         <div className={`w-12 h-1 mb-4 rounded-full bg-gradient-to-r ${engine.colors} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
         
         <h3 className={`${variant === 'hero' ? 'text-5xl md:text-7xl' : 'text-2xl md:text-3xl'} font-bold text-white mb-2`}>
            {engine.name}
         </h3>
         
         {variant !== 'grid' && (
             <p className={`text-zinc-300 font-medium ${variant === 'hero' ? 'text-xl' : 'text-sm'} italic mb-4 max-w-2xl`}>
                {engine.tagline}
             </p>
         )}
         
         {variant === 'hero' && (
             <span className="inline-flex items-center gap-2 text-white font-bold mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                Explorar Tema <ArrowRight size={20} />
             </span>
         )}
      </div>
    </Link>
  );
};

export default function CreationEngines() {
  // const { t } = useTranslation(); // unused

  // Initialize with default order, then shuffle on mount
  const [layout, setLayout] = useState(() => ({
    hero: ENGINES[0],
    secondary: ENGINES.slice(1, 4),
    grid: ENGINES.slice(4)
  }));

  useEffect(() => {
    // Shuffle engines on client-side mount
    const timer = setTimeout(() => {
      const shuffled = [...ENGINES].sort(() => Math.random() - 0.5);
      setLayout({
        hero: shuffled[0],
        secondary: shuffled.slice(1, 4),
        grid: shuffled.slice(4)
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const { hero, secondary, grid } = layout;
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section - Standardized */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <HeroBackground 
          className="absolute inset-0" 
          presetId="magma-lamp"
          overlayOpacity={40}
        />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 backdrop-blur border border-white/10 flex items-center justify-center">
              <Sparkles size={32} className="text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Motores</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-light">
             {t('gallery.hero_subtitle', 'Cada motor possui uma filosofia visual única, gerando infinitas variações baseadas em seus princípios estéticos.')}
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
             <Link to="/creation" className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                <ArrowLeft size={18} /> Voltar para Criação
             </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-20">

        {/* Hero Section - Featured Engine */}
        <div className="mb-8">
            <EngineCard engine={hero} variant="hero" />
        </div>

        {/* Secondary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {secondary.map(engine => (
                <EngineCard key={engine.id} engine={engine} variant="secondary" />
            ))}
        </div>

        {/* Grid Section */}
        <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">Mais Motores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grid.map(engine => (
                <EngineCard key={engine.id} engine={engine} variant="grid" />
            ))}
        </div>

      </div>
    </div>
  );
}
