import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Shield, Maximize, Play, Palette, Download, ArrowRight, Wand2, RefreshCw } from 'lucide-react';
import { PRESETS, HERO_PRESETS, DEFAULT_CONFIG, DEFAULT_ANIMATION } from '../../../src/constants';
import GalleryCard from '../components/GalleryCard';
import { getAppUrl } from '../utils/appUrl';
import { encodeConfigCompact } from '../../../src/utils/compactUrlEncoder';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';

// Synonyms for the random button
const RANDOM_ACTIONS = [
  "Randomize",
  "Transform",
  "Remix",
  "Shuffle",
  "Evolve",
  "Mutate"
];

export default function Home() {
  const { t } = useTranslation();
  
  // State for Hero Background
  // Initialize with a colorful preset (Angel Aura) to avoid black screen
  // State for Hero Background
  // Initialize with a curated preset to avoid black/white extremes and ensure determinism
  const [heroConfig, setHeroConfig] = useState(() => {
     // Deterministic selection for SSG consistency (hydration match)
     // randomize in useEffect if dynamic start is desired
     const seed = HERO_PRESETS[0];
     
    return {
      ...DEFAULT_CONFIG,
      ...seed,
      animation: {
        ...DEFAULT_ANIMATION,
        enabled: true,
        speed: 2,
        flow: 3
      }
    };
  });

  const [actionIndex, setActionIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Hover states for animations
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isBorealHovered, setIsBorealHovered] = useState(false);
  const [isChromaHovered, setIsChromaHovered] = useState(false);
  
  // Prepare configs for feature cards
  const borealPreset = useMemo(() => PRESETS.find(p => p.id === 'angel-aura') || PRESETS[0], []);
  const chromaPreset = useMemo(() => PRESETS.find(p => p.id === 'liquid-metal') || PRESETS[1], []);

  const borealConfig = useMemo(() => ({
    ...borealPreset.config,
    animation: { ...borealPreset.config.animation, enabled: true, speed: 2, flow: 4 }
  }), [borealPreset]);

  const chromaConfig = useMemo(() => ({
    ...chromaPreset.config,
    animation: { ...chromaPreset.config.animation, enabled: true, speed: 3, flow: 3 }
  }), [chromaPreset]);

  const handleRandomize = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);

    // Pick new random preset
    const availablePresets = PRESETS.filter(p => !p.config.baseColor || p.config !== heroConfig); 
    const randomPreset = availablePresets[Math.floor(Math.random() * availablePresets.length)] || PRESETS[0];
    
    setHeroConfig({
      ...randomPreset.config,
      animation: {
        ...randomPreset.config.animation,
        enabled: true,
        speed: Math.random() * 1.5 + 1.0, // Min 1.0
        flow: Math.random() * 1.5 + 1.0   // Min 1.0
      }
    });

    // Cycle text
    setActionIndex((prev) => (prev + 1) % RANDOM_ACTIONS.length);
  };

  // Get 3 random presets for the gallery teaser
  const [galleryPresets, setGalleryPresets] = useState(() => {
    return [...PRESETS].slice(0, 3);
  });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setGalleryPresets([...PRESETS].sort(() => Math.random() - 0.5).slice(0, 3));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const launchUrl = useMemo(() => {
    const fullHdConfig = {
      ...heroConfig,
      width: 1920,
      height: 1080
    };
    const encoded = encodeConfigCompact(fullHdConfig);
    return `${getAppUrl()}#c=${encoded}`;
  }, [heroConfig]);

  return (
    <>
      <Helmet>
        <title>{t('seo.home_title', 'AuraWall - Abstract Wallpaper Engine')}</title>
        <meta name="description" content={t('seo.home_desc', 'Create stunning abstract wallpapers with AuraWall\'s procedural generation engine. 9 unique engines, infinite variations.')} />
        <link rel="canonical" href="https://mafhper.github.io/aurawall/" />
      </Helmet>
      <div 
        className="relative overflow-hidden bg-black text-white selection:bg-purple-500/30 min-h-screen"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        
        {/* Dynamic Hero Background - Fixed dimensions to prevent CLS */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ minHeight: '100vh' }}
        >
           <WallpaperRenderer 
             config={heroConfig}
             className="w-full h-full block scale-110" 
             lowQuality={false}
             paused={!isHeroHovered}
           />
           {/* Reduced overlay opacity to show colors better (was 60%) */}
           <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none" />
        </div>

        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 pointer-events-none">
          <div className="container mx-auto max-w-6xl text-center pointer-events-auto">
            <span className="inline-block py-2 px-4 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-semibold tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
              {t('hero.badge')}
            </span>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 leading-tight drop-shadow-2xl">
              {t('hero.title_1')} <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                {t('hero.title_2')}
              </span>
            </h1>
            
            <p className="mt-4 text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 drop-shadow-md">
              {t('hero.desc')}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
               <Link 
                 to="/creation/engines" 
                 className="glass-panel hover:bg-white/10 text-white font-bold py-4 px-10 rounded-full transition-colors flex items-center justify-center gap-2 min-w-[180px] backdrop-blur-md border border-white/10"
                 title={t('hero.cta_secondary')}
               >
                 {t('hero.cta_secondary')}
                 <ArrowRight size={18} />
               </Link>

               {/* Randomize Button Restored */}
               <button
                 onClick={handleRandomize}
                 className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-3 min-w-[160px]"
               >
                 <div className={`transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`}>
                   <RefreshCw size={20} className="text-white/90" />
                 </div>
                 <span className="relative z-10 w-24 text-left">
                    {RANDOM_ACTIONS[actionIndex]}
                 </span>
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
               </button>

               <a 
                 href={launchUrl} 
                 className="bg-white text-black hover:bg-zinc-200 font-bold py-4 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 hover:shadow-white/20 flex items-center justify-center gap-2 min-w-[180px]"
               >
                 {t('hero.cta_primary')}
               </a>
            </div>
          </div>
        </div>

        {/* Features Section - 6 features now */}
        <div className="py-24 bg-gradient-to-b from-black via-zinc-950 to-black relative z-10">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4">{t('features.title')}</h2>
            <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
              Combinando matemática com estética para criar arte visual única.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="glass-panel rounded-2xl p-8 group border-purple-500/10 hover:border-purple-500/40 card-hover card-glow bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-purple-300 transition-colors">{t('features.feat_1_title')}</h3>
                <p className="text-zinc-400 leading-relaxed">{t('features.feat_1_desc')}</p>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel rounded-2xl p-8 group border-blue-500/10 hover:border-blue-500/40 card-hover card-glow bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                  <Maximize size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors">{t('features.feat_2_title')}</h3>
                <p className="text-zinc-400 leading-relaxed">{t('features.feat_2_desc')}</p>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel rounded-2xl p-8 group border-green-500/10 hover:border-green-500/40 card-hover card-glow bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform duration-500">
                  <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-green-300 transition-colors">{t('features.feat_3_title')}</h3>
                <p className="text-zinc-400 leading-relaxed">{t('features.feat_3_desc')}</p>
              </div>

              {/* Feature 4 */}
              <div className="glass-panel rounded-2xl p-8 group border-pink-500/10 hover:border-pink-500/40 card-hover card-glow bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform duration-500">
                  <Play size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-pink-300 transition-colors">{t('features.feat_4_title')}</h3>
                <p className="text-zinc-400 leading-relaxed">{t('features.feat_4_desc')}</p>
              </div>

              {/* Feature 5 */}
              <div className="glass-panel rounded-2xl p-8 group border-yellow-500/10 hover:border-yellow-500/40 card-hover card-glow bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform duration-500">
                  <Palette size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-300 transition-colors">{t('features.feat_5_title')}</h3>
                <p className="text-zinc-400 leading-relaxed">{t('features.feat_5_desc')}</p>
              </div>

              {/* Feature 6 */}
              <div className="glass-panel rounded-2xl p-8 group border-cyan-500/10 hover:border-cyan-500/40 card-hover card-glow bg-zinc-900/40 backdrop-blur-sm">
                <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                  <Download size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-300 transition-colors">{t('features.feat_6_title')}</h3>
                <p className="text-zinc-400 leading-relaxed">{t('features.feat_6_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-32 border-t border-white/5 relative z-10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 tracking-tight">{t('home_compare.title')}</h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">{t('home_compare.desc')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
               {/* Boreal Card */}
               <div 
                 className="group relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-700 shadow-2xl"
                 onMouseEnter={() => setIsBorealHovered(true)}
                 onMouseLeave={() => setIsBorealHovered(false)}
               >
                 {/* Background */}
                 <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                    <WallpaperRenderer 
                      config={borealConfig}
                      className="w-full h-full block"
                      lowQuality={false}
                      paused={!isBorealHovered}
                    />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 pointer-events-none" />
                 
                 <div className="absolute inset-0 p-10 flex flex-col justify-end pointer-events-none">
                    <span className="inline-block w-fit px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold tracking-widest mb-4 border border-purple-500/20 backdrop-blur-md">
                      ORIGIN
                    </span>
                    <h3 className="text-4xl font-bold mb-2 text-white">{t('showcase.boreal_title')}</h3>
                    <p className="text-zinc-300 text-lg leading-relaxed max-w-sm">{t('showcase.boreal_desc')}</p>
                  </div>
               </div>

               {/* Chroma Card */}
               <div 
                 className="group relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-green-500/50 transition-all duration-700 shadow-2xl"
                 onMouseEnter={() => setIsChromaHovered(true)}
                 onMouseLeave={() => setIsChromaHovered(false)}
               >
                 {/* Background */}
                 <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                  <WallpaperRenderer 
                    config={chromaConfig}
                    className="w-full h-full block"
                    lowQuality={false}
                    paused={!isChromaHovered}
                  />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 pointer-events-none" />
                 
                 <div className="absolute inset-0 p-10 flex flex-col justify-end pointer-events-none">
                    <span className="inline-block w-fit px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold tracking-widest mb-4 border border-green-500/20 backdrop-blur-md">
                      EVOLVED
                    </span>
                    <h3 className="text-4xl font-bold mb-2 text-white">{t('showcase.chroma_title')}</h3>
                    <p className="text-zinc-300 text-lg leading-relaxed max-w-sm">{t('showcase.chroma_desc')}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Gallery Teaser - New section */}
        <div className="py-24 bg-gradient-to-b from-black via-zinc-950/50 to-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Coleção Expandida</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Explore 9 motores de geração distintos, de ondas oceânicas a falhas digitais e estética Bauhaus.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {galleryPresets.map((preset) => (
                <GalleryCard 
                  key={preset.id} 
                  preset={preset} 
                  className="aspect-[3/4] min-h-[360px]"
                />
              ))}
            </div>
            
            {/* Single CTA for both sections */}
            <div className="text-center">
              <Link 
                to="/creation/engines" 
                className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Ver Todos os Motores
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA - Large Illustrated Section */}
        <div className="py-32 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Floating orbs */}
            <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>
          
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto">
              {/* Main CTA Card */}
              <div className="glass-panel rounded-3xl p-12 md:p-16 border border-white/10 relative overflow-hidden">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
                
                <div className="relative z-10 text-center">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Wand2 size={36} className="text-white" />
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">
                    {t('home_cta.title')}
                  </h2>
                  
                  <p className="text-xl md:text-2xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t('home_cta.desc')}
                  </p>
                  
                  {/* Features mini-list */}
                  <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-zinc-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      100% Gratuito
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      Sem Registro
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      Exportação Ilimitada
                    </span>
                  </div>
                  
                  <a 
                    href={getAppUrl()} 
                    className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-100 font-bold py-5 px-14 rounded-full text-lg shadow-[0_0_80px_-10px_rgba(255,255,255,0.5)] transition-all transform hover:scale-105 hover:shadow-[0_0_100px_-5px_rgba(168,85,247,0.4)]"
                  >
                    {t('home_cta.btn')}
                    <ArrowRight size={22} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
