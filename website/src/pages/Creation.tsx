import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Play, ArrowRight, Shuffle, Scale, Palette, Aperture, Activity, Layers, Box, Cpu } from 'lucide-react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { PRESETS } from '../../../src/constants';
import HeroBackground from '../components/HeroBackground';

// Helper to get specific preset configs
const getPresetConfig = (id: string) => {
  const preset = PRESETS.find(p => p.id === id);
  return preset ? preset.config : PRESETS[0].config;
};

// Component for rendering individual creation modes
const CreationModeItem = ({ mode, hoveredMode, setHoveredMode }: { 
  mode: any, 
  hoveredMode: string | null, 
  setHoveredMode: (id: string | null) => void 
}) => {
  const { t } = useTranslation();
  const isHovered = hoveredMode === mode.id;

  const accentClasses = {
    purple: 'text-purple-400 border-purple-500/30 hover:border-purple-400/50',
    blue: 'text-blue-400 border-blue-500/30 hover:border-blue-400/50',
  };
  
  const buttonBg = {
     purple: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300',
     blue: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300',
  };

  // Dynamic config for hover animation
  const displayConfig = useMemo(() => ({
    ...mode.config,
    animation: {
      ...mode.config.animation,
      enabled: true, // Always enable for this view to ensure it works on hover
      speed: mode.id === 'animation' ? 8 : 4, // Fixed speed
      flow: mode.id === 'animation' ? 5 : 3,  // Fixed flow
    }
  }), [mode.config, mode.id]);

  // Custom Title/Desc handling because of key changes
  const title = mode.id === 'engines' ? 'Motores de Criação' : t(mode.titleKey);
  const desc = mode.id === 'engines' ? mode.descKey : t('showcase.animation_desc'); // Quick fallback for animation desc

  return (
    <div 
      className={`flex flex-col ${mode.isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
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
              lowQuality={false}
              paused={!isHovered}
           />
         </div>
         
         {/* Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

         {/* Icon Badge */}
         <div className="absolute top-8 left-8">
           <div className={`w-16 h-16 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center ${accentClasses[mode.accentColor as keyof typeof accentClasses].split(' ')[0]}`}>
             <mode.icon size={32} />
           </div>
         </div>
      </Link>

      {/* Text Content */}
      <div className="w-full lg:w-1/2 space-y-8">
        <div className="space-y-4">
           <h2 className="text-5xl font-bold">{title}</h2>
           <p className="text-2xl text-zinc-300 leading-relaxed max-w-lg">
             {desc}
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
};

export default function Creation() {
  const { t } = useTranslation();
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  // Compute animation config once
  const animationConfig = useMemo(() => {
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
  }, []);

  const creationModes = [
    {
      id: 'engines',
      path: '/creation/engines',
      icon: Sparkles,
      titleKey: 'nav.creation',
      descKey: t('creation.engines_desc'),
      config: getPresetConfig('angel-aura'), // Representative
      accentColor: 'purple',
      isReverse: false,
    },
    {
      id: 'animation',
      path: '/creation/animation',
      icon: Play,
      titleKey: 'creation.anim_title',
      descKey: t('creation.animation_proc_desc'),
      config: animationConfig,
      accentColor: 'blue',
      isReverse: true,
    },
  ];

  // Hero background config with medium-tone preset (now handled by HeroBackground randomization)
  // We keep this just in case we want to force distinct presets later, but for now we trust HeroBackground
  
  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section Container - Standardized Height */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        
        {/* Usage of Reusable HeroBackground with deterministic preset */}
        <HeroBackground 
          className="absolute inset-0" 
          overlayOpacity={40} 
          presetId="phoenix-rise"
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Modo{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Criação</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {t('creation.subtitle')}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-20">

        {/* Zig-Zag Mode Sections */}
        <div className="flex flex-col gap-32 mb-40">
          {creationModes.map((mode) => (
            <CreationModeItem 
              key={mode.id} 
              mode={mode} 
              hoveredMode={hoveredMode} 
              setHoveredMode={setHoveredMode} 
            />
          ))}
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
                     <p className="text-zinc-400">{t('creation.proc_rule_1_desc')}</p>
                   </div>
                 </div>
                 
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-blue-400 mt-1">
                     <Layers size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-white">{t('creation.proc_rule_2')}</h3>
                     <p className="text-zinc-400">{t('creation.proc_rule_2_desc')}</p>
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
            <p className="text-zinc-400 text-lg">{t('creation.params_desc')}</p>
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
                 <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_shapes_desc')}</p>
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
                 <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_colors_desc')}</p>
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
                 <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_effects_desc')}</p>
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
                 <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{t('creation.param_motion_desc')}</p>
               </div>
             </div>
          </div>
          
           {/* Deep Customization - Expanded Section */}
           <section className="mt-24 pt-10 border-t border-white/5">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-widest">
                    <Cpu size={14} />
                    <span>Engine Core</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold">Customização Profunda</h2>
                  
                  <div className="space-y-6 text-lg text-zinc-400 leading-relaxed">
                    <p>
                      O AuraWall não oferece apenas imagens estáticas. Cada preset é um ponto de partida para 
                      uma exploração visual infinita. Através do nosso editor, você tem controle granular sobre 
                      cada aspecto da geração.
                    </p>
                    
                    <ul className="space-y-4">
                       <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors">
                          <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-1 font-bold">1</span>
                          <div>
                            <strong className="text-white block mb-1">Paletas de Cores</strong>
                            <span className="text-sm">Defina cores base, secundárias e acentos com precisão HSL.</span>
                          </div>
                       </li>
                       <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-1 font-bold">2</span>
                          <div>
                            <strong className="text-white block mb-1">Geometria & Escala</strong>
                            <span className="text-sm">Ajuste densidade de partículas, espessura de linhas e distribuição espacial.</span>
                          </div>
                       </li>
                       <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors">
                          <span className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-1 font-bold">3</span>
                          <div>
                            <strong className="text-white block mb-1">Física e Movimento</strong>
                            <span className="text-sm">Controle velocidade global, "flow fields" e turbulência do ruído Perlin.</span>
                          </div>
                       </li>
                    </ul>
                   </div>
                 </div>
                 
                 {/* Visual Simulation of Controls */}
                 <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rounded-[2rem]" />
                    
                    <div className="glass-panel rounded-[2rem] p-8 border border-white/10 relative z-10 space-y-8 bg-zinc-900/80 backdrop-blur-xl">
                       <div className="flex items-center justify-between border-b border-white/5 pb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                          </div>
                          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Editor Simulation</span>
                       </div>
                       
                       <div className="space-y-6">
                         {[
                           { label: 'Densidade de Partículas', val: '75%', color: 'bg-blue-500' },
                           { label: 'Velocidade de Animação', val: '30%', color: 'bg-purple-500' },
                           { label: 'Escala de Ruído', val: '60%', color: 'bg-pink-500' },
                           { label: 'Turbulência', val: '45%', color: 'bg-cyan-500' }
                         ].map((s, i) => (
                            <div key={i} className="space-y-3">
                               <div className="flex justify-between text-sm font-medium text-zinc-300">
                                  <span>{s.label}</span>
                                  <span className="font-mono text-xs opacity-70">{s.val}</span>
                               </div>
                               <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-white/5 relative group-hover:border-white/10 transition-colors">
                                  <div className={`h-full ${s.color} rounded-full relative`} style={{ width: s.val }}>
                                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                               </div>
                            </div>
                         ))}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                          <div className="h-12 bg-zinc-800/50 rounded-xl border border-white/5 flex items-center justify-center text-zinc-400 font-mono text-xs">
                             #2F1A45
                          </div>
                          <div className="h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-300 font-bold text-sm">
                             Gerar Novo
                          </div>
                       </div>
                    </div>
                 </div>
               </div>
               
               {/* CTA Button - Outside grid for proper mobile layout */}
               <div className="mt-12 text-center lg:text-left">
                  <Link 
                    to="/creation/procedural" 
                    className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105"
                  >
                    Explorar Sistema Procedural <ArrowRight size={20} />
                  </Link>
               </div>
            </section>
        </div>

      </div>
    </div>
  );
}