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
             <div className="relative bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-purple-500/30 transition-all group overflow-hidden">
               {/* Animated Background on Hover */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-blue-600/30 animate-[pulse_3s_ease-in-out_infinite]" />
                 <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-purple-500/40 rounded-full blur-2xl animate-[float_4s_ease-in-out_infinite]" />
                 <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-pink-500/40 rounded-full blur-2xl animate-[float_5s_ease-in-out_infinite_reverse]" />
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                   <Box size={24} />
                 </div>
                 <h3 className="font-bold text-xl mb-2">{t('creation.param_shapes')}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_shapes_desc')}</p>
               </div>
             </div>
             
             {/* Colors */}
             <div className="relative bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-pink-500/30 transition-all group overflow-hidden">
               {/* Animated Background on Hover */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/30 via-orange-500/20 to-yellow-600/30 animate-[pulse_4s_ease-in-out_infinite]" />
                 <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-pink-500/40 rounded-full blur-2xl animate-[float_3s_ease-in-out_infinite]" />
                 <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-orange-500/40 rounded-full blur-2xl animate-[float_4s_ease-in-out_infinite_reverse]" />
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors">
                   <Palette size={24} />
                 </div>
                 <h3 className="font-bold text-xl mb-2">{t('creation.param_colors')}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_colors_desc')}</p>
               </div>
             </div>
             
             {/* Effects */}
             <div className="relative bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-blue-500/30 transition-all group overflow-hidden">
               {/* Animated Background on Hover */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/30 via-cyan-500/20 to-teal-600/30 animate-[pulse_3.5s_ease-in-out_infinite]" />
                 <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-500/40 rounded-full blur-3xl animate-[float_5s_ease-in-out_infinite]" />
                 <div className="absolute top-1/4 right-1/4 w-14 h-14 bg-cyan-500/40 rounded-full blur-2xl animate-[float_3s_ease-in-out_infinite_reverse]" />
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                   <Aperture size={24} />
                 </div>
                 <h3 className="font-bold text-xl mb-2">{t('creation.param_effects')}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_effects_desc')}</p>
               </div>
             </div>
             
             {/* Motion */}
             <div className="relative bg-zinc-900 border border-white/5 p-8 rounded-2xl hover:border-green-500/30 transition-all group overflow-hidden">
               {/* Animated Background on Hover */}
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="absolute inset-0 bg-gradient-to-tl from-green-600/30 via-emerald-500/20 to-lime-600/30 animate-[pulse_4.5s_ease-in-out_infinite]" />
                 <div className="absolute bottom-1/4 left-1/3 w-26 h-26 bg-green-500/40 rounded-full blur-2xl animate-[float_4s_ease-in-out_infinite]" />
                 <div className="absolute top-1/3 right-1/3 w-18 h-18 bg-emerald-500/40 rounded-full blur-2xl animate-[float_3.5s_ease-in-out_infinite_reverse]" />
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                   <Activity size={24} />
                 </div>
                 <h3 className="font-bold text-xl mb-2">{t('creation.param_motion')}</h3>
                 <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_motion_desc')}</p>
               </div>
             </div>
          </div>
          
           {/* Deep Customization Alert */}
           <div className="mt-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8">
              <div className="flex flex-col gap-6">
                 <div className="flex items-start gap-6">
                    <div className="bg-purple-500/20 p-4 rounded-full text-purple-400 shrink-0">
                        <Cpu size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4 text-white">{t('creation.custom_title')}</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            {t('creation.custom_desc')}
                        </p>
                    </div>
                 </div>
                 
                 {/* Mode-specific Examples with Sliders */}
                 <div className="grid md:grid-cols-3 gap-4">
                    {/* Motor Boreal Panel */}
                    <div className="bg-black/30 rounded-xl p-5 border border-purple-500/10">
                       <h4 className="font-bold text-purple-400 mb-4 text-sm">{t('creation.boreal_title')}</h4>
                       <div className="space-y-4">
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">blur</span>
                                <span className="text-purple-400 font-mono">120px</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{width: '75%'}} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">opacity</span>
                                <span className="text-purple-400 font-mono">0.45</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{width: '45%'}} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">blendMode</span>
                                <span className="text-purple-400 font-mono">screen</span>
                             </div>
                             <div className="flex gap-1 mt-1">
                                {['normal', 'screen', 'overlay'].map(mode => (
                                   <span key={mode} className={`text-[10px] px-2 py-0.5 rounded ${mode === 'screen' ? 'bg-purple-500/30 text-purple-300' : 'bg-zinc-800 text-zinc-500'}`}>{mode}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    {/* Motor Chroma Panel */}
                    <div className="bg-black/30 rounded-xl p-5 border border-green-500/10">
                       <h4 className="font-bold text-green-400 mb-4 text-sm">{t('creation.chroma_title')}</h4>
                       <div className="space-y-4">
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">blur</span>
                                <span className="text-green-400 font-mono">40px</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{width: '50%'}} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">opacity</span>
                                <span className="text-green-400 font-mono">0.75</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{width: '75%'}} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">blendMode</span>
                                <span className="text-green-400 font-mono">difference</span>
                             </div>
                             <div className="flex gap-1 mt-1">
                                {['multiply', 'difference', 'exclusion'].map(mode => (
                                   <span key={mode} className={`text-[10px] px-2 py-0.5 rounded ${mode === 'difference' ? 'bg-green-500/30 text-green-300' : 'bg-zinc-800 text-zinc-500'}`}>{mode}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    {/* Motor Animation Panel */}
                    <div className="bg-black/30 rounded-xl p-5 border border-blue-500/10">
                       <h4 className="font-bold text-blue-400 mb-4 text-sm">{t('creation.anim_title')}</h4>
                       <div className="space-y-4">
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">speed</span>
                                <span className="text-blue-400 font-mono">5</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{width: '62.5%'}} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">flow</span>
                                <span className="text-blue-400 font-mono">3</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{width: '60%'}} />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-500">pulse</span>
                                <span className="text-blue-400 font-mono">7</span>
                             </div>
                             <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{width: '70%'}} />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Explore Button - Moved to bottom, left-aligned */}
                 <div className="pt-4">
                    <Link 
                      to="/creation/procedural"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:translate-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
                    >
                      {t('creation.explore')}
                      <ArrowRight size={20} />
                    </Link>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
