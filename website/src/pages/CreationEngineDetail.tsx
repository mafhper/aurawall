import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { ENGINES } from '../data/engines';
import { PRESETS, DEFAULT_ANIMATION } from '../../../src/constants';
import { getAppUrl } from '../utils/appUrl';
import HeroBackground from '../components/HeroBackground';

// Preset Card Component with hover-to-play
const PresetCard = ({ preset }: { preset: typeof PRESETS[0] }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const config = useMemo(() => ({
    ...preset.config,
    animation: {
      ...DEFAULT_ANIMATION,
      ...preset.config.animation,
      enabled: true,
      speed: preset.config.animation?.speed || 1,
      flow: preset.config.animation?.flow || 1,
    }
  }), [preset.config]);

  return (
    <a
      href={`${getAppUrl()}/?preset=${preset.id}`}
      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-xl block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <WallpaperRenderer 
        config={config}
        className="w-full h-full block"
        lowQuality={false}
        paused={!isHovered}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-sm">{preset.name}</p>
        <p className="text-zinc-400 text-xs">{preset.category}</p>
      </div>
    </a>
  );
};

// Preview Card Component with hover-to-play (for sidebar)
const PreviewCard = React.memo(({ preset }: { preset: typeof PRESETS[0] | null }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // useMemo must be called before any early return
  const config = useMemo(() => {
    if (!preset) return null;
    return {
      ...preset.config,
      animation: {
        ...DEFAULT_ANIMATION,
        ...preset.config.animation,
        enabled: true,
      }
    };
  }, [preset]);

  if (!preset || !config) return null;

  return (
    <div 
      className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <WallpaperRenderer 
        config={config}
        className="w-full h-full block"
        lowQuality={false}
        paused={!isHovered}
      />
      <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-mono border border-white/10 text-zinc-400">
        {preset.name}
      </div>
    </div>
  );
});

export default function CreationEngineDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const engineMeta = ENGINES.find(e => e.id === id);
  
  // Get all presets for this engine's collection
  const enginePresets = useMemo(() => 
    PRESETS.filter(p => p.collection === id),
    [id]
  );
  
  const firstPreset = enginePresets[0] || null;
  
  // Deterministic preset selection based on engine ID (Stable for SSR & hydration)
  const activeHeroPresetId = useMemo(() => {
    if (enginePresets.length === 0) return firstPreset?.id || 'soul-glow';
    
    // Simple hash from string id
    let hash = 0;
    for (let i = 0; i < (id || '').length; i++) {
        hash = ((hash << 5) - hash) + (id || '').charCodeAt(i);
        hash |= 0;
    }
    const randomIndex = Math.abs(hash) % enginePresets.length;
    
    return enginePresets[randomIndex].id;
  }, [enginePresets, id, firstPreset]);

  if (!engineMeta) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">{t('engines.not_found')}</h1>
                <Link to="/creation/engines" className="text-purple-400 hover:text-white transition-colors">{t('engines.back_to_list')}</Link>
            </div>
        </div>
    );
  }

  // Find current and next engine indices for navigation
  const currentIndex = ENGINES.findIndex(e => e.id === id);
  const nextEngine = ENGINES[(currentIndex + 1) % ENGINES.length];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Random preset from engine collection, hover to play */}
      <div className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <HeroBackground 
          presetId={activeHeroPresetId}
          className="absolute inset-0"
          overlayOpacity={50}
        />
        
        <div className="relative z-10 container mx-auto px-6 pb-20">
          <div className="flex justify-between items-center mb-6">
            <Link to="/creation/engines" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={20} /> {t('engines.back_to_engines')}
            </Link>
            <Link 
              to={`/creation/engine/${nextEngine.id}`} 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              {t('engines.next_engine', { name: nextEngine.name })} <ArrowRight size={20} />
            </Link>
          </div>
          
          <span className="inline-block w-fit px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest mb-4 uppercase">
            Engine // {engineMeta.id}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{engineMeta.name}</h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl font-light italic">"{t(`engines.${engineMeta.id}_tagline`)}"</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
         <div className="grid md:grid-cols-2 gap-16 items-start">
            
            {/* Description */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-6">{t('engines.visual_philosophy')}</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {t(`engines.${engineMeta.id}_desc`)}
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" /> {t('engines.key_characteristics')}
                    </h3>
                    <ul className="space-y-3 text-zinc-400">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />
                            {t('engines.char_1')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />
                            {t('engines.char_2')}
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />
                            {t('engines.char_3')}
                        </li>
                    </ul>
                </div>

                <div className="pt-8">
                    <a 
                      href={`${getAppUrl()}/?collection=${engineMeta.id}`} 
                      className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-white/20"
                    >
                      {t('gallery.create_with', { name: engineMeta.name })}
                      <ArrowRight size={20} />
                    </a>
                </div>
            </div>

            {/* Sidebar preview with hover-to-play - using first preset */}
            <PreviewCard preset={firstPreset} />

         </div>

         {/* Presets Grid Section */}
         {enginePresets.length > 0 && (
           <section className="mt-20">
             <h2 className="text-3xl font-bold mb-8">{t('engines.engine_styles', { name: engineMeta.name })}</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {enginePresets.map(preset => (
                 <PresetCard key={preset.id} preset={preset} />
               ))}
             </div>
           </section>
         )}

      </div>
    </div>
  );
}
