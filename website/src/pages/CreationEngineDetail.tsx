import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import { getEngine } from '../../../src/engines';
import { ENGINES } from '../data/engines';
import { DEFAULT_CONFIG } from '../../../src/constants';
import { getAppUrl } from '../utils/appUrl';

export default function CreationEngineDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const engineMeta = ENGINES.find(e => e.id === id);
  const engineLogic = getEngine(id || '');

  // Generate a fresh config for this view
  const config = useMemo(() => {
    if (!engineLogic || !engineLogic.randomizer) return DEFAULT_CONFIG;
    // Generate a high-quality, animated config
    const cfg = engineLogic.randomizer(DEFAULT_CONFIG, { isGrainLocked: false });
    return {
        ...cfg,
        animation: {
            ...cfg.animation,
            enabled: true, // Force animation for the hero header
            speed: Math.max(2, (cfg.animation?.speed || 1)) // Ensure decent speed
        }
    };
  }, [id]);

  if (!engineMeta) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Motor não encontrado</h1>
                <Link to="/creation/engines" className="text-purple-400 hover:text-white transition-colors">Voltar para a lista</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Immersive Hero */}
      <div className="relative h-[60vh] overflow-hidden">
         <div className="absolute inset-0">
            <WallpaperRenderer 
                config={config}
                className="w-full h-full block"
                lowQuality={false}
            />
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
         
         <div className="absolute inset-0 container mx-auto px-6 flex flex-col justify-end pb-20">
            <Link to="/creation/engines" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} /> Voltar para Motores
            </Link>
            <span className={`inline-block w-fit px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest mb-4 uppercase`}>
                Engine // {engineMeta.id}
            </span>
            <h1 className="text-5xl md:text-8xl font-bold mb-4 tracking-tight">{engineMeta.name}</h1>
            <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl font-light italic">"{engineMeta.tagline}"</p>
         </div>
      </div>

      <div className="container mx-auto px-6 py-20">
         <div className="grid md:grid-cols-2 gap-16 items-start">
            
            {/* Description */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold mb-6">Filosofia Visual</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {engineMeta.description}
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-yellow-500" /> Características Chave
                    </h3>
                    <ul className="space-y-3 text-zinc-400">
                        {/* We could infer these from code or add to metadata later. For now, generic. */}
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />
                            Geração procedural determinística
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />
                            Paletas de cores adaptativas
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mt-2" />
                            Renderização vetorial infinita
                        </li>
                    </ul>
                </div>

                <div className="pt-8">
                    <a 
                      href={`${getAppUrl()}/?collection=${engineMeta.id}`} 
                      className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-white/20"
                    >
                      Criar com {engineMeta.name}
                      <ArrowRight size={20} />
                    </a>
                </div>
            </div>

            {/* Sidebar / Stats / variations preview could go here */}
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10">
                 {/* Another variation or detail shot */}
                 <WallpaperRenderer 
                    config={{
                        ...config,
                        shapes: config.shapes.map(s => ({ ...s, x: 100 - s.x })) // Simple variation: Mirror
                    }}
                    className="w-full h-full block"
                 />
                 <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-mono border border-white/10 text-zinc-400">
                    ID: {engineMeta.id}-var-01
                 </div>
            </div>

         </div>
      </div>
    </div>
  );
}
