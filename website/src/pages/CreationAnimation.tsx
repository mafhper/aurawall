import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, Waves, Maximize, RotateCw, Tv } from 'lucide-react';
import CodeWindow from '../components/CodeWindow';
import { getAppUrl } from '../utils/appUrl';

const motionTypes = [
  {
    id: 'flow',
    icon: Waves,
    color: 'purple',
    cssProperty: 'transform: translate()',
  },
  {
    id: 'pulse',
    icon: Maximize,
    color: 'blue',
    cssProperty: 'transform: scale()',
  },
  {
    id: 'rotate',
    icon: RotateCw,
    color: 'green',
    cssProperty: 'transform: rotate()',
  },
  {
    id: 'noise',
    icon: Tv,
    color: 'pink',
    cssProperty: 'seed attribute',
  },
];

import HeroBackground from '../components/HeroBackground';

export default function CreationAnimation() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <HeroBackground 
          className="absolute inset-0"
          presetId="pacific-drift"
          overlayOpacity={40}
        />
        
        <div className="relative z-10 text-center px-6">
          <Link 
            to="/creation" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            {t('nav.creation')}
          </Link>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 backdrop-blur flex items-center justify-center">
              <Play size={32} className="text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Motion{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">Engine</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            Sistema de animação performático usando CSS Keyframes nativos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        
        {/* Why CSS over JS */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-6">Por que CSS ao invés de JavaScript?</h2>
          <div className="glass-panel rounded-2xl p-8">
            <p className="text-zinc-400 text-lg leading-relaxed mb-6">
              Muitas ferramentas de arte generativa usam um loop <code className="bg-zinc-800 px-2 py-1 rounded">requestAnimationFrame</code> em 
              JavaScript para atualizar posições. Isso consome ciclos de CPU na thread principal.
            </p>
            <p className="text-zinc-400 text-lg leading-relaxed">
              O AuraWall gera um bloco <code className="bg-zinc-800 px-2 py-1 rounded">&lt;style&gt;</code> estático 
              com <code className="bg-zinc-800 px-2 py-1 rounded">@keyframes</code> únicos para cada forma. 
              Uma vez injetado, a GPU do navegador assume o controle. Isso garante <strong className="text-white">60fps 
              mesmo em dispositivos móveis</strong> enquanto mantém a thread JS livre para interações de UI.
            </p>
          </div>
        </section>

        {/* Motion Types */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-8">Tipos de Movimento</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {motionTypes.map((motion) => {
              const Icon = motion.icon;
              const colorClasses = {
                purple: 'border-purple-500/30 text-purple-400',
                blue: 'border-blue-500/30 text-blue-400',
                green: 'border-green-500/30 text-green-400',
                pink: 'border-pink-500/30 text-pink-400',
              };
              
              const titles: Record<string, string> = {
                flow: 'Drift & Flow',
                pulse: 'Pulse & Breathe',
                rotate: 'Slow Rotation',
                noise: 'Noise Animation',
              };
              
              const descriptions: Record<string, string> = {
                flow: 'Cada forma recebe um vetor de trajetória aleatório. Usando CSS transform: translate(), elementos flutuam organicamente pelo canvas.',
                pulse: 'Transformações de escala são aplicadas em ritmo sinusoidal. Deslocando o delay de animação para cada camada, criamos um efeito de "respiração".',
                rotate: 'Rotação lenta em torno do centro da forma. Cria movimento sutil sem distração do conteúdo principal.',
                noise: 'Animação do atributo seed do filtro de turbulência para criar um efeito de "TV estática" dinâmica.',
              };
              
              return (
                <div 
                  key={motion.id}
                  className={`glass-panel rounded-2xl p-6 border ${colorClasses[motion.color as keyof typeof colorClasses]}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={24} className={colorClasses[motion.color as keyof typeof colorClasses]} />
                    <h3 className="text-xl font-bold">{titles[motion.id]}</h3>
                  </div>
                  <p className="text-zinc-400 mb-4">{descriptions[motion.id]}</p>
                  <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-400">
                    {motion.cssProperty}
                  </code>
                </div>
              );
            })}
          </div>
        </section>

        {/* Animation Settings Code */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Estrutura AnimationSettings</h2>
          <CodeWindow filename="AnimationSettings.ts">
<pre>{`interface AnimationSettings {
  enabled: boolean;
  
  // Velocidade global (0.1 - 2.0)
  speed: number;
  
  // Intensidade de movimento
  intensity: number;   // 0-100
  
  // Tipos de movimento ativos
  flow: boolean;       // Translação X/Y
  pulse: boolean;      // Escala
  rotate: boolean;     // Rotação
  noiseAnim: boolean;  // Seed do ruído
}

// Exemplo de keyframes gerados:
@keyframes shape-0-drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(15px, -10px); }
}

@keyframes shape-0-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}`}</pre>
          </CodeWindow>
        </section>

        {/* Performance */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">Performance</h2>
          <p className="text-zinc-400 mb-8 max-w-3xl">
            Otimizado para máxima fluidez. Todas as animações rodam na GPU via CSS Compositor, 
            liberando a main thread para interatividade.
          </p>
          
          {/* Main Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-900/50 border border-blue-500/20 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">60</div>
              <div className="text-blue-400 text-sm font-medium mb-1">FPS</div>
              <p className="text-zinc-400 text-xs">Frame rate consistente em todas animações</p>
            </div>
            <div className="bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-purple-400 mb-2">&lt;1%</div>
              <div className="text-purple-400 text-sm font-medium mb-1">CPU</div>
              <p className="text-zinc-400 text-xs">Uso mínimo da main thread JavaScript</p>
            </div>
            <div className="bg-zinc-900/50 border border-green-500/20 rounded-2xl p-6 text-center">
              <div className="text-5xl font-bold text-green-400 mb-2">100</div>
              <div className="text-green-400 text-sm font-medium mb-1">Lighthouse</div>
              <p className="text-zinc-400 text-xs">Score perfeito em Performance</p>
            </div>
          </div>
          
          {/* Technical Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-lg mb-4 text-white">Otimizações Aplicadas</h3>
              <ul className="space-y-3 text-zinc-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span><code className="text-green-400">will-change: transform</code> pré-promove layers para GPU</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span><code className="text-green-400">transform3d</code> força aceleração de hardware</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>Keyframes únicos por shape evitam reflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span>Paint containment isola repinturas</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-lg mb-4 text-white">Benchmark Mobile</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">iPhone 12</span>
                    <span className="text-green-400 font-mono">60 fps</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Galaxy S21</span>
                    <span className="text-green-400 font-mono">60 fps</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Moto G7 Power</span>
                    <span className="text-yellow-400 font-mono">55 fps</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <a 
            href={getAppUrl()} 
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-full font-bold transition-colors"
          >
            <Play size={20} />
            Experimentar Animações
          </a>
        </section>

      </div>
    </div>
  );
}
