import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ENGINES } from '../data/engines';
import { getAppUrl } from '../utils/appUrl';
import { Sparkles, X, ExternalLink } from 'lucide-react';
import { PRESETS, DEFAULT_CONFIG } from '../../../src/constants'; // Import DEFAULT_CONFIG
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { getEngine } from '../../../src/engines'; // Import getEngine

const getPreviewConfig = (engineId: string) => {
  const engine = getEngine(engineId);
  if (!engine || !engine.randomizer) return DEFAULT_CONFIG;
  return engine.randomizer(DEFAULT_CONFIG, { isGrainLocked: false });
};

const EngineModal = ({ engine, onClose }: { engine: typeof ENGINES[0], onClose: () => void }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); 
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find presets for this engine
  const examples = useMemo(() => {
    return PRESETS.filter(p => p.collection === engine.id).slice(0, 3);
  }, [engine.id]);

  const ExampleCard = ({ preset }: { preset: typeof PRESETS[0] }) => {
      const [isHovered, setIsHovered] = useState(false);
      const config = useMemo(() => ({
          ...preset.config,
          animation: {
              ...preset.config.animation,
              enabled: true 
          }
      }), [preset]);

      const activeConfig = useMemo(() => ({
          ...config,
          animation: {
              ...config.animation,
              enabled: isHovered && !isMobile
          }
      }), [config, isHovered, isMobile]);

      return (
          <div 
            className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
             <WallpaperRenderer 
                config={activeConfig}
                className="w-full h-full block"
                lowQuality={true} // Always low quality for examples in modal
             />
             <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                 <span className="text-xs font-bold text-white">{preset.name}</span>
             </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-zinc-900 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Left: Visual Hero */}
          <div className="w-full md:w-2/5 relative h-48 md:h-auto bg-black">
             {/* Using WallpaperRenderer here too for consistency and potential animation */}
             <WallpaperRenderer 
                config={getPreviewConfig(engine.id)}
                className="w-full h-full object-cover opacity-80"
                lowQuality={false}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
             
             <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-4xl font-bold text-white mb-2">{engine.name}</h2>
                <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${engine.colors}`} />
             </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 p-8 md:p-10 overflow-y-auto">
             <p className="text-xl text-white font-medium mb-6 italic">"{engine.tagline}"</p>
             <p className="text-zinc-400 leading-relaxed mb-8">{engine.description}</p>

             {examples.length > 0 && (
                 <div className="mb-8">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">{t('gallery.examples')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {examples.map(ex => <ExampleCard key={ex.id} preset={ex} />)}
                    </div>
                 </div>
             )}

             <a 
               href={`${getAppUrl()}/?collection=${engine.id}`}
               className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-full font-bold transition-colors w-full justify-center md:w-auto"
             >
               {t('gallery.create_with', { name: engine.name })}
               <ExternalLink size={18} />
             </a>
          </div>
       </div>
    </div>
  );
};

export default function Gallery() {
  const { t } = useTranslation();
  const [selectedEngine, setSelectedEngine] = useState<typeof ENGINES[0] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // TailwindCSS default breakpoint for md is 768px
      setIsMobile(window.innerWidth < 768); 
    };
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile); // Check on resize
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {selectedEngine && (
          <EngineModal engine={selectedEngine} onClose={() => setSelectedEngine(null)} />
      )}

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6 border border-purple-500/20">
            <Sparkles size={12} /> {t('gallery.full_collection')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {t('gallery.hero_title')}
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            {t('gallery.hero_desc')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ENGINES.map((engine) => {
            const [isHovered, setIsHovered] = useState(false); // Local state for each card
            const config = useMemo(() => getPreviewConfig(engine.id), [engine.id]);
            const activeConfig = useMemo(() => ({
                ...config,
                animation: {
                    ...config.animation,
                    enabled: isHovered && !isMobile // Animation enabled only on hover AND not on mobile
                }
            }), [config, isHovered, isMobile]);

            return (
              <div 
                key={engine.id}
                onClick={() => setSelectedEngine(engine)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Background with WallpaperRenderer */}
                <div className="absolute inset-0 bg-zinc-900">
                   <WallpaperRenderer 
                     config={activeConfig} 
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 scale-105 group-hover:scale-100"
                     lowQuality={true} // Always low quality for gallery cards
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                   <div className={`w-12 h-1 mb-4 rounded-full bg-gradient-to-r ${engine.colors}`} />
                   <h3 className="text-2xl font-bold text-white mb-2">{engine.name}</h3>
                   <p className="text-sm font-medium text-white/80 italic mb-3">{engine.tagline}</p>
                   <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 group-hover:text-zinc-400 transition-colors">
                     {engine.description}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

                {/* CTA */}

                <div className="text-center mt-20 p-8 md:p-12 rounded-3xl border border-white/10 bg-zinc-900/30 backdrop-blur-sm relative overflow-hidden">

                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50" />

                  <div className="relative z-10">

                    <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('gallery.ready_title')}</h2>

                    <p className="text-zinc-400 mb-8 max-w-xl mx-auto">

                      {t('gallery.ready_desc')}

                    </p>

                    <a 

                      href={getAppUrl()} 

                      className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl shadow-white/5"

                    >

                      {t('gallery.start')}

                    </a>

                  </div>

                </div>

              </div>

            </div>

          );

        }

        
