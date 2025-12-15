import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Zap } from 'lucide-react';
import { PRESETS } from '../../../src/constants';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import CodeWindow from '../components/CodeWindow';
import { getAppUrl } from '../utils/appUrl';

export default function CreationChroma() {
  const { t } = useTranslation();
  
  // Filter Chroma presets
  const chromaPresets = PRESETS.filter(p => p.collection === 'chroma').slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero with Chroma background */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}bg-chroma.svg)`,
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
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 backdrop-blur flex items-center justify-center">
              <Zap size={32} className="text-green-400" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-4">{t('showcase.chroma_title')}</h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            {t('showcase.chroma_desc')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        
        {/* Philosophy */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">A Filosofia do Chroma</h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            {t('modes.chroma_desc')}
          </p>
          <p className="text-zinc-400 leading-relaxed">
            O modo Chroma explora o lado mais agressivo da matemática visual. 
            Inspirado em metal líquido, vidro dicróico e estéticas cyberpunk, 
            cada composição busca criar tensão visual através de alto contraste 
            e inversões de cor dramáticas.
          </p>
        </section>

        {/* Technical Specs */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8">{t('modes.key_characteristics')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 mb-3">{t('modes.chroma_char_1_title')}</h3>
              <p className="text-zinc-400 mb-4">{t('modes.chroma_char_1_desc')}</p>
              
              <div className="bg-zinc-900 rounded-xl p-4 font-mono text-sm">
                <span className="text-zinc-400">// Modos de alto contraste</span><br/>
                <span className="text-green-400">blendMode</span>: [<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">'difference'</span>,<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">'exclusion'</span>,<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">'hard-light'</span><br/>
                ]
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-400 mb-3">{t('modes.chroma_char_2_title')}</h3>
              <p className="text-zinc-400 mb-4">{t('modes.chroma_char_2_desc')}</p>
              
              <div className="bg-zinc-900 rounded-xl p-4 font-mono text-sm">
                <span className="text-zinc-400">// Filtro de turbulência</span><br/>
                <span className="text-green-400">&lt;feTurbulence</span><br/>
                &nbsp;&nbsp;<span className="text-blue-400">type</span>=<span className="text-yellow-400">"fractalNoise"</span><br/>
                &nbsp;&nbsp;<span className="text-blue-400">baseFrequency</span>=<span className="text-yellow-400">"0.02"</span><br/>
                <span className="text-green-400">/&gt;</span>
              </div>
            </div>
          </div>
        </section>

        {/* Color Strategy */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Estratégia de Cores</h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
            <p className="text-zinc-400 leading-relaxed mb-6">
              O motor Chroma trabalha com cores complementares e triádicas para maximizar 
              o contraste. O uso de modos como 'difference' inverte matematicamente os 
              canais de cor, criando bordas neon e efeitos de vidro dicróico.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-lime-600" />
              <span className="text-zinc-400 text-sm">Paleta de alto contraste típica</span>
            </div>
          </div>
        </section>

        {/* Blend Mode Comparison */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Matemática de Blend Modes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-bold">Modo</th>
                  <th className="text-left py-3 px-4 font-bold">Fórmula</th>
                  <th className="text-left py-3 px-4 font-bold">Efeito</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-green-400">difference</td>
                  <td className="py-3 px-4 font-mono">|A - B|</td>
                  <td className="py-3 px-4">Inversão baseada em luminosidade</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-green-400">exclusion</td>
                  <td className="py-3 px-4 font-mono">A + B - 2AB</td>
                  <td className="py-3 px-4">Difference mais suave</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-green-400">hard-light</td>
                  <td className="py-3 px-4 font-mono">overlay(B, A)</td>
                  <td className="py-3 px-4">Overlay invertido</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Code Example */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Estrutura de uma Shape Chroma</h2>
          <CodeWindow filename="ChromaShape.ts">
<pre>{`interface ChromaShape {
  type: 'circle' | 'blob';
  
  // Posição mais centralizada
  x: number;         // 30-70 (menos espalhado)
  y: number;
  size: number;      // 20-50% do canvas
  
  // Estilo Chroma
  color: string;     // Cores saturadas, neon
  opacity: 0.6 - 1.0;
  blur: 10 - 60;     // Baixo blur para definição
  
  // Mistura agressiva
  blendMode: 'difference' | 'exclusion' | 'hard-light';
}`}</pre>
          </CodeWindow>
        </section>

        {/* Gallery */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Exemplos Chroma</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {chromaPresets.map((preset) => (
              <div 
                key={preset.id} 
                className="aspect-[9/16] rounded-xl overflow-hidden border border-white/10 hover:border-green-500/50 transition-all"
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
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Criar com Chroma
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
