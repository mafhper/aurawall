import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { PRESETS } from '../../../src/constants';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import CodeWindow from '../components/CodeWindow';
import { getAppUrl } from '../utils/appUrl';

export default function CreationBoreal() {
  const { t } = useTranslation();
  
  // Filter Boreal presets
  const borealPresets = PRESETS.filter(p => p.collection === 'boreal').slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero with Boreal background */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}bg-boreal.svg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        
        <div className="relative text-center px-6">
          <Link 
            to="/creation" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            {t('nav.creation')}
          </Link>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 backdrop-blur flex items-center justify-center">
              <Sparkles size={32} className="text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-4">{t('showcase.boreal_title')}</h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            {t('showcase.boreal_desc')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        
        {/* Philosophy */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">A Filosofia do Boreal</h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            {t('modes.boreal_desc')}
          </p>
          <p className="text-zinc-500 leading-relaxed">
            O modo Boreal é inspirado nas auroras boreais e na atmosfera de sonhos etéreos. 
            Cada composição busca evocar calma e contemplação, usando matemática para criar 
            paisagens abstratas que parecem flutuar suavemente na tela.
          </p>
        </section>

        {/* Technical Specs */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">{t('modes.key_characteristics')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-3">{t('modes.boreal_char_1_title')}</h3>
              <p className="text-zinc-400 mb-4">{t('modes.boreal_char_1_desc')}</p>
              
              <div className="bg-zinc-900 rounded-xl p-4 font-mono text-sm">
                <span className="text-zinc-500">// Faixa de blur típica</span><br/>
                <span className="text-purple-400">blur</span>: <span className="text-green-400">60</span> - <span className="text-green-400">150</span><span className="text-zinc-500">px</span>
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-3">{t('modes.boreal_char_2_title')}</h3>
              <p className="text-zinc-400 mb-4">{t('modes.boreal_char_2_desc')}</p>
              
              <div className="bg-zinc-900 rounded-xl p-4 font-mono text-sm">
                <span className="text-zinc-500">// Modos preferidos</span><br/>
                <span className="text-purple-400">blendMode</span>: [<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">'multiply'</span>,<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">'screen'</span>,<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">'overlay'</span><br/>
                ]
              </div>
            </div>
          </div>
        </section>

        {/* Color Strategy */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Estratégia de Cores</h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
            <p className="text-zinc-400 leading-relaxed mb-6">
              O motor Boreal seleciona cores análogas para criar harmonia visual. 
              As cores são escolhidas em um raio de 30° no círculo cromático, 
              garantindo que mesmo composições aleatórias mantenham coerência estética.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600" />
              <span className="text-zinc-500 text-sm">Paleta análoga típica</span>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Estrutura de uma Shape Boreal</h2>
          <CodeWindow filename="BorealShape.ts">
<pre>{`interface BorealShape {
  type: 'circle' | 'blob';
  
  // Posição relativa (0-100%)
  x: number;
  y: number;
  size: number;      // 30-70% do canvas
  
  // Estilo Boreal
  color: string;     // Cores pastéis, alta luminosidade
  opacity: 0.4 - 0.8;
  blur: 60 - 150;    // Alto blur para suavidade
  
  // Mistura suave
  blendMode: 'multiply' | 'screen' | 'overlay';
}`}</pre>
          </CodeWindow>
        </section>

        {/* Gallery */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Exemplos Boreal</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {borealPresets.map((preset) => (
              <div 
                key={preset.id} 
                className="aspect-[9/16] rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <WallpaperRenderer 
                  config={preset.config as any} 
                  className="w-full h-full" 
                  lowQuality={true} 
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <a 
              href={getAppUrl()} 
              className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Criar com Boreal
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
