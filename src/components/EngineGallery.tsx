import React, { useState, useEffect } from 'react';
import { getAllEngines } from '../engines';
import WallpaperRenderer from './WallpaperRenderer';
import { X, Check, Sparkles } from 'lucide-react';
import { WallpaperConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface EngineGalleryProps {
  onClose: () => void;
  onEquip: (engineId: string) => void;
  activeEngineId: string; // The one being replaced or currently active
}

export default function EngineGallery({ onClose, onEquip, activeEngineId }: EngineGalleryProps) {
  const engines = getAllEngines();
  const [previews, setPreviews] = useState<Record<string, WallpaperConfig>>({});

  useEffect(() => {
    // Generate previews for all engines asynchronously to avoid render blocking/impurity
    const timer = setTimeout(() => {
        const newPreviews: Record<string, WallpaperConfig> = {};
        engines.forEach(eng => {
            if (eng.randomizer) {
                newPreviews[eng.id] = eng.randomizer(DEFAULT_CONFIG, { isGrainLocked: false });
            }
        });
        setPreviews(newPreviews);
    }, 0);
    return () => clearTimeout(timer);
  }, [engines]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Sparkles className="text-purple-500" /> Galeria de Motores
             </h2>
             <p className="text-sm text-zinc-400 mt-1">
               Escolha um motor para ativar no slot selecionado.
             </p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X size={24} className="text-zinc-400" />
           </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {engines.map(engine => {
             const [isHovered, setIsHovered] = useState(false);
             return (
             <button
               key={engine.id}
               onClick={() => onEquip(engine.id)}
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
               className={`group flex flex-col text-left rounded-lg overflow-hidden border transition-all hover:scale-[1.02] ${
                 activeEngineId === engine.id 
                 ? 'border-purple-500 ring-1 ring-purple-500 bg-zinc-800' 
                 : 'border-white/10 hover:border-purple-500/50 bg-zinc-800/50'
               }`}
             >
                {/* Preview */}
                <div className="h-32 w-full relative bg-black overflow-hidden">
                   {previews[engine.id] && (
                     <WallpaperRenderer 
                       config={{
                         ...previews[engine.id],
                         animation: {
                             ...previews[engine.id].animation,
                             enabled: true // Ensure animation is considered enabled in config
                         }
                       }} 
                       className="w-full h-full object-cover" 
                       lowQuality={true} // Keep lowQuality for performance
                       paused={!isHovered} // Pause when not hovering
                     />
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                   {activeEngineId === engine.id && (
                     <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                       <Check size={10} /> ATIVO
                     </div>
                   )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                   <h3 className="text-base font-bold text-white mb-1">{engine.meta.name}</h3>
                   <span className="text-xs text-purple-300 font-medium mb-2 block">{engine.meta.tagline}</span>
                   <p className="text-xs text-zinc-400 line-clamp-3">{engine.meta.description}</p>
                </div>
             </button>
           )})}
        </div>
      </div>
    </div>
  );
}
