import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PRESETS } from '../../../src/constants';
import GalleryCard from '../components/GalleryCard';
import { getAppUrl } from '../utils/appUrl';

export default function Gallery() {
  const { t } = useTranslation();

  // Shuffle presets on each page load
  const shuffledPresets = useMemo(() => {
    return [...PRESETS].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">{t('gallery.title')}</h1>
          <p className="text-xl text-zinc-400">{t('gallery.subtitle')}</p>
          <p className="text-sm text-zinc-600 mt-2">
            Os exemplos são embaralhados a cada visita. Atualize a página para ver mais.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shuffledPresets.map((preset) => (
            <GalleryCard 
              key={preset.id} 
              preset={preset} 
              // no className implies default aspect-[9/16]
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-zinc-500 mb-4">
            Quer criar seus próprios wallpapers? Explore todas as possibilidades no editor.
          </p>
          <a 
            href={getAppUrl()} 
            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-purple-900/40"
          >
            Abrir Editor
          </a>
        </div>
      </div>
    </div>
  );
}