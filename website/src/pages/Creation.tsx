import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Zap, Play, ArrowRight, Shuffle, Scale, Palette, Aperture, Activity, Layers, Box, Cpu } from 'lucide-react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { PRESETS } from '../../../src/constants';

// Helper to get specific preset configs
const getPresetConfig = (id: string) => {
  const preset = PRESETS.find(p => p.id === id);
  return preset ? preset.config : PRESETS[0].config;
};

export default function Creation() {
  const { t } = useTranslation();
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const creationModes = [
    {
      id: 'boreal',
      path: '/creation/boreal',
      icon: Sparkles,
      config: getPresetConfig('angel-aura'), // Boreal representative
      accentColor: 'purple',
    },
    {
      id: 'chroma',
      path: '/creation/chroma',
      icon: Zap,
      config: getPresetConfig('liquid-metal'), // Chroma representative
      accentColor: 'green',
    },
    {
      id: 'animation',
      path: '/creation/animation',
      icon: Play,
      // Custom high-energy config for Animation
      config: useMemo(() => {
        const base = getPresetConfig('soul-glow');
        return {
          ...base,
          animation: {
            ...base.animation,
            enabled: true,
            speed: 8,
            flow: 5,
            pulse: 10
          }
        };
      }, []),
      accentColor: 'blue',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto px-6">
        
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{t('creation.title')}</h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            {t('creation.subtitle')}
          </p>
        </div>

        {/* Zig-Zag Mode Sections */}
        <div className="flex flex-col gap-32 mb-40">
          {creationModes.map((mode, index) => {
            const Icon = mode.icon;
            const isReverse = index % 2 !== 0;
            const isHovered = hoveredMode === mode.id;

            const accentClasses = {
              purple: 'text-purple-400 border-purple-500/30 hover:border-purple-400/50',
              green: 'text-green-400 border-green-500/30 hover:border-green-400/50',
              blue: 'text-blue-400 border-blue-500/30 hover:border-blue-400/50',
            };
            
            const buttonBg = {
               purple: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300',
               green: 'bg-green-500/10 hover:bg-green-500/20 text-green-300',
               blue: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300',
            };

            // Dynamic config for hover animation
            const displayConfig = useMemo(() => ({
              ...mode.config,
              animation: {
                ...mode.config.animation,
                enabled: true, // Always enable for this view to ensure it works on hover
                speed: mode.id === 'animation' ? 8 : (isHovered ? 4 : 0), // Speed up on hover
                flow: mode.id === 'animation' ? 5 : (isHovered ? 3 : 0),
              }
            }), [mode.config, isHovered, mode.id]);

            return (
              <div 
                key={mode.id} 
                className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                
                {/* Visual Card */}
                <Link 
                  to={mode.path}
                  className={`relative w-full lg:w-1/2 aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 transition-all duration-500 shadow-2xl group ${isHovered ? 'scale-[1.02] border-opacity-50' : ''} ${accentClasses[mode.accentColor as keyof typeof accentClasses].split(' ')[1]}`}
                >
                   {/* Background Renderer */}
                   <div className="absolute inset-0">
                     <WallpaperRenderer 
                        config={displayConfig}
                        className="w-full h-full block"
                        lowQuality={!isHovered && mode.id !== 'animation'} // Animation mode always high quality? Or maybe toggle too. usage: lowQuality disables filters/animation
                     />
                   </div>
                   
                   {/* Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                   {/* Icon Badge */}
                   <div className="absolute top-8 left-8">
                     <div className={`w-16 h-16 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center ${accentClasses[mode.accentColor as keyof typeof accentClasses].split(' ')[0]}`}>
                       <Icon size={32} />
                     </div>
                   </div>
                </Link>

                {/* Text Content */}
                <div className="w-full lg:w-1/2 space-y-8">
                  <div className="space-y-4">
                     <h2 className="text-5xl font-bold">{t(`showcase.${mode.id}_title`)}</h2>
                     <p className="text-2xl text-zinc-300 leading-relaxed max-w-lg">
                       {t(`showcase.${mode.id}_desc`)}
                     </p>
                  </div>
                  
                  {/* Additional Summary/Details as requested */}
                  <div className="space-y-6 pl-6 border-l-2 border-white/10">
                     <p className="text-zinc-500 leading-relaxed">
                       {t(`modes.${mode.id}_desc`)}
                     </p>
                  </div>

                  <Link 
                    to={mode.path}
                    className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:translate-x-2 ${buttonBg[mode.accentColor as keyof typeof buttonBg]}`}
                  >
                    {t('creation.explore')}
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Procedural Intelligence Section (Deep Dive) */}
        <div className="max-w-6xl mx-auto mb-32">
           <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="flex-1">
               <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
                  <Shuffle size={32} />
               </div>
               <h2 className="text-4xl font-bold mb-6">{t('creation.proc_title')}</h2>
               <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                 {t('creation.proc_intro')}
               </p>
               
               <div className="space-y-6">
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-green-400 mt-1">
                     <Scale size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-white">{t('creation.proc_rule_1')}</h3>
                     <p className="text-zinc-500">{t('creation.proc_rule_1_desc')}</p>
                   </div>
                 </div>
                 
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-blue-400 mt-1">
                     <Layers size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-white">{t('creation.proc_rule_2')}</h3>
                     <p className="text-zinc-500">{t('creation.proc_rule_2_desc')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Explore Procedural Button */}
                <Link 
                  to="/creation/procedural"
                  className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:translate-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                >
                  {t('creation.explore')}
                  <ArrowRight size={20} />
                </Link>
              </div>
             
             {/* Visual Demo of Procedural Logic */}
             <div className="flex-1 w-full">
               <div className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 relative p-8 flex items-center justify-center group">
                  {/* Pseudo-diagram */}
                  <div className="absolute inset-0 bg-zinc-950/50" />
                  
                  {/* Central Node */}
                  <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-pulse cursor-pointer hover:scale-110 transition-transform">
                     <Link to="/creation/procedural" className="font-bold text-black text-xs text-center leading-tight">
                        {t('creation.procedural_link', 'Ver Mágica')}
                     </Link>
                  </div>
                  
                  {/* Orbital Nodes */}
                  <div className="absolute w-[300px] h-[300px] border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute w-[200px] h-[200px] border border-purple-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                  
                  {/* Connected Dots */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                     <div className="absolute top-[20%] left-[50%] w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_20px_purple]" />
                     <div className="absolute top-[80%] left-[50%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_20px_blue]" />
                     <div className="absolute top-[50%] left-[80%] w-3 h-3 bg-green-500 rounded-full shadow-[0_0_20px_green]" />
                     <div className="absolute top-[50%] left-[20%] w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_20px_pink]" />
                  </div>
               </div>
             </div>
           </div>
        </div>
        
        {/* Parameters Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('creation.params_title')}</h2>
            <p className="text-zinc-500 text-lg">{t('creation.params_desc')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Shapes */}
             <div className="bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-purple-500/30 transition-colors group">
               <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                 <Box size={24} />
               </div>
               <h3 className="font-bold text-xl mb-2">{t('creation.param_shapes')}</h3>
               <p className="text-zinc-500 text-sm leading-relaxed">{t('creation.param_shapes_desc')}</p>
             </div>
             
             {/* Colors */}
             <div className="bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-pink-500/30 transition-colors group">
               <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors">
                 <Palette size={24} />
               </div>
               <h3 className="font-bold text-xl mb-2">{t('creation.param_colors')}</h3>
               <p className="text-zinc-500 text-sm leading-relaxed">{t('creation.param_colors_desc')}</p>
             </div>
             
             {/* Effects */}
             <div className="bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-blue-500/30 transition-colors group">
               <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                 <Aperture size={24} />
               </div>
               <h3 className="font-bold text-xl mb-2">{t('creation.param_effects')}</h3>
               <p className="text-zinc-500 text-sm leading-relaxed">{t('creation.param_effects_desc')}</p>
             </div>
             
             {/* Motion */}
             <div className="bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-green-500/30 transition-colors group">
               <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                 <Activity size={24} />
               </div>
               <h3 className="font-bold text-xl mb-2">{t('creation.param_motion')}</h3>
               <p className="text-zinc-500 text-sm leading-relaxed">{t('creation.param_motion_desc')}</p>
             </div>
          </div>
          
           {/* Deep Customization Alert */}
           <div className="mt-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                 <div className="bg-purple-500/20 p-4 rounded-full text-purple-400 shrink-0">
                     <Cpu size={32} />
                 </div>
                 <div className="flex-1">
                     <h3 className="text-2xl font-bold mb-4 text-white">{t('creation.custom_title')}</h3>
                     <p className="text-zinc-400 leading-relaxed mb-6">
                         {t('creation.custom_desc')}
                     </p>
                     
                     {/* Mode-specific Examples */}
                     <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-purple-500/10">
                           <h4 className="font-bold text-purple-400 mb-2 text-sm">{t('creation.boreal_title')}</h4>
                           <code className="text-xs text-zinc-500 block">blur: 80-150px</code>
                           <code className="text-xs text-zinc-500 block">blendMode: screen</code>
                           <code className="text-xs text-zinc-500 block">opacity: 0.3-0.6</code>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                           <h4 className="font-bold text-green-400 mb-2 text-sm">{t('creation.chroma_title')}</h4>
                           <code className="text-xs text-zinc-500 block">blur: 20-60px</code>
                           <code className="text-xs text-zinc-500 block">blendMode: difference</code>
                           <code className="text-xs text-zinc-500 block">opacity: 0.6-0.9</code>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-blue-500/10">
                           <h4 className="font-bold text-blue-400 mb-2 text-sm">{t('creation.anim_title')}</h4>
                           <code className="text-xs text-zinc-500 block">speed: 2-8</code>
                           <code className="text-xs text-zinc-500 block">flow: 1-5</code>
                           <code className="text-xs text-zinc-500 block">pulse: 0-10</code>
                        </div>
                     </div>
                 </div>
                
                {/* Explore Button */}
                <Link 
                  to="/creation/procedural"
                  className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:translate-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                >
                  {t('creation.explore')}
                  <ArrowRight size={20} />
                </Link>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
