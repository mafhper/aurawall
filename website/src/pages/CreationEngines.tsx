import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ENGINES } from '../data/engines';
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
  const { t } = useTranslation();

  // Shuffle engines once on mount
  const [{ hero, secondary, grid }] = useState(() => {
    const shuffled = [...ENGINES].sort(() => Math.random() - 0.5);
    return {
      hero: shuffled[0],
      secondary: shuffled.slice(1, 4),
      grid: shuffled.slice(4)
    };
  });

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto px-6">
        
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
                <Sparkles size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-bold">Motores de Criação</h1>
                <p className="text-zinc-500">Explore a diversidade procedural do AuraWall.</p>
            </div>
        </div>

        {/* Hero Section */}
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
