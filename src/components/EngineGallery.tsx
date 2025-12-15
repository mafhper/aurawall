import React, { useState, useEffect } from 'react';
import { getAllEngines, EngineDefinition } from '../engines';
import WallpaperRenderer from './WallpaperRenderer';
import { X, Check, Sparkles } from 'lucide-react';
import { WallpaperConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface EngineGalleryProps {
  onClose: () => void;
  onEquip: (engineId: string) => void;
  activeEngineId: string;
}

// Extracted to fix rules-of-hooks violation
const EngineCard = ({ 
  engine, 
  preview, 
  isActive, 
  onEquip 
}: { 
  engine: EngineDefinition; 
  preview: WallpaperConfig | undefined; 
  isActive: boolean; 
  onEquip: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onEquip}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex flex-col text-left rounded-lg overflow-hidden border transition-all hover:scale-[1.02] ${
        isActive 
        ? 'border-purple-500 ring-1 ring-purple-500 bg-zinc-800' 
        : 'border-white/10 hover:border-purple-500/50 bg-zinc-800/50'
      }`}
    >
       <div className="h-32 w-full relative bg-black overflow-hidden">
          {preview && (
            <WallpaperRenderer 
              config={{
                ...preview,
                animation: { ...preview.animation, enabled: true }
              }} 
              className="w-full h-full object-cover" 
              lowQuality={true}
              paused={!isHovered}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
          {isActive && (
            <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <Check size={10} /> ATIVO
            </div>
          )}
       </div>
       <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-white mb-1">{engine.meta.name}</h3>
          <span className="text-xs text-purple-300 font-medium mb-2 block">{engine.meta.tagline}</span>
          <p className="text-xs text-zinc-400 line-clamp-3">{engine.meta.description}</p>
       </div>
    </button>
  );
};

export default function EngineGallery({ onClose, onEquip, activeEngineId }: EngineGalleryProps) {
  const engines = getAllEngines();
  const [previews, setPreviews] = useState<Record<string, WallpaperConfig>>({});

  useEffect(() => {
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
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Sparkles className="text-purple-500" /> Galeria de Motores
             </h2>
             <p className="text-sm text-zinc-400 mt-1">Escolha um motor para ativar no slot selecionado.</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X size={24} className="text-zinc-400" />
           </button>
        </div>
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {engines.map(engine => (
             <EngineCard
               key={engine.id}
               engine={engine}
               preview={previews[engine.id]}
               isActive={activeEngineId === engine.id}
               onEquip={() => onEquip(engine.id)}
             />
           ))}
        </div>
      </div>
    </div>
  );
}
