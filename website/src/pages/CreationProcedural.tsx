import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Binary, 
  Palette, 
  Waves, 
  Layers, 
  FunctionSquare, 
  Zap,
  ArrowRight,
  BookOpen,
  GitBranch,
  Shield,
  Database
} from 'lucide-react';
import WallpaperRenderer from '../../../src/components/WallpaperRenderer';
import HeroBackground from '../components/HeroBackground';
import { PRESETS } from '../../../src/constants';
import CodeWindow from '../components/CodeWindow';

const getPresetConfig = (id: string) => {
  const preset = PRESETS.find(p => p.id === id);
  return preset ? preset.config : PRESETS[0].config;
};

const ProceduralSection = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
  <div 
    className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all card-hover animate-in fade-in slide-in-from-bottom-8 duration-700" 
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="bg-purple-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-purple-400">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-zinc-400 leading-relaxed text-lg">
      {desc}
    </p>
  </div>
);

export default function CreationProcedural() {
  const { t } = useTranslation();
  
  const tags = [
    t('procedural.tag_deterministic', 'Determinístico'),
    t('procedural.tag_seed', 'Baseado em Seed'),
    t('procedural.tag_vector', 'Vetorial'),
    t('procedural.tag_resolution', 'Resolução Independente')
  ];
  
  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero with Background */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Renderer */}
        <HeroBackground 
          className="absolute inset-0"
          presetId="nebula-cloud"
          overlayOpacity={40}
        />
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full mb-6 font-mono text-sm border border-purple-500/20">
              <Binary size={16} />
              <span>CORE.LOGIC.MATH</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {t('procedural.title')}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              {t('procedural.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl py-24">
        {/* Main Math Explanation */}
        <div className="grid md:grid-cols-2 gap-8 mb-40">
            <ProceduralSection 
                icon={FunctionSquare}
                title={t('procedural.math_title')}
                desc={t('procedural.math_desc')}
                delay={0}
            />
             <ProceduralSection 
                icon={Waves}
                title={t('procedural.noise_title')}
                desc={t('procedural.noise_desc')}
                delay={200}
            />
             <ProceduralSection 
                icon={Palette}
                title={t('procedural.color_title')}
                desc={t('procedural.color_desc')}
                delay={400}
            />
             <ProceduralSection 
                icon={Layers}
                title={t('procedural.glass_title')}
                desc={t('procedural.glass_desc')}
                delay={600}
            />
        </div>

        {/* Chaos Controlled Section */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 bg-zinc-900/50 mb-32 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                    <h2 className="text-3xl font-bold">{t('procedural.chaos_title', 'Caos Controlado')}</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        {t('procedural.chaos_desc', 'Aleatoriedade pura é ruído. A beleza procedural vem da estocasticidade controlada. Definimos limites (intervalos de matiz, variância de tamanho, vetores de fluxo) e deixamos os algoritmos improvisar dentro dessas barreiras de segurança.')}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-8">
                        {tags.map(tag => (
                            <span key={tag} className="px-4 py-2 bg-white/5 rounded-full text-zinc-400 text-sm border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                
                {/* Code Snippet - Styled Window */}
                <CodeWindow filename="generateShape.ts" className="flex-1">
<pre>
{`const generateShape = (seed) => {
  // ${t('procedural.code_comment_1', 'Determinístico "Aleatório"')}
  const rng = createRNG(seed);
  
  return {
    x: rng.next(0, 100),
    y: rng.next(0, 100),
    size: rng.next(20, 150),
    // ${t('procedural.code_comment_2', 'Seleção de Cor Harmônica')}
    color: pickHarmonicColor(
      baseHue, 
      ['analogous', 'triadic'][rng.int(0,1)]
    ),
    // ${t('procedural.code_comment_3', 'Simulação Física')}
    velocity: {
      x: rng.next(-1, 1),
      y: rng.next(-1, 1)
    }
  };
}`}
</pre>
                </CodeWindow>
            </div>
        </div>

        {/* =========================================== */}
        {/* ACADEMIC DEEP DIVE: THE SEED ARCHITECTURE */}
        {/* =========================================== */}
        
        <div className="mb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full mb-6 font-mono text-sm border border-blue-500/20">
              <BookOpen size={16} />
              <span>{t('procedural.deep_dive_badge', 'DEEP DIVE')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('procedural.seed_architecture_title', 'A Arquitetura da Semente (Seed)')}</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              {t('procedural.seed_architecture_desc', 'Diferente de editores de imagem baseados em pixels (raster), o AuraWall define a imagem através de um estado leve e serializável chamado WallpaperConfig. Este objeto JSON é a "semente" que contém todas as instruções necessárias para reconstruir a imagem em qualquer resolução.')}
            </p>
          </div>

          {/* WallpaperConfig Structure */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-blue-400">
                  <Database size={24} />
                </div>
                <h3 className="text-2xl font-bold">{t('procedural.wallpaper_config_title', 'Estrutura WallpaperConfig')}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                {t('procedural.wallpaper_config_desc', 'O objeto principal que armazena todo o estado visual. Contém dimensões, cor base (sólida ou gradiente), intensidade de ruído, array de formas e configurações de animação/vinheta.')}
              </p>
              <ul className="space-y-3 text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">width/height</span>
                  <span>{t('procedural.field_dimensions', 'Dimensões do canvas (proporção e resolução)')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 font-mono text-sm bg-purple-500/10 px-2 py-1 rounded">baseColor</span>
                  <span>{t('procedural.field_basecolor', 'Cor de fundo (Hex) ou configuração de gradiente')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded">shapes[]</span>
                  <span>{t('procedural.field_shapes', 'Array de formas com posição, cor, blur e blendMode')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 font-mono text-sm bg-pink-500/10 px-2 py-1 rounded">animation?</span>
                  <span>{t('procedural.field_animation', 'Configurações de animação em tempo real (opcional)')}</span>
                </li>
              </ul>
            </div>
            
            <CodeWindow filename="WallpaperConfig.ts">
<pre>
{`interface WallpaperConfig {
  // ${t('procedural.comment_dimensions', 'Dimensões do Canvas')}
  width: number;      
  height: number;     

  // ${t('procedural.comment_appearance', 'Aparência Global')}
  baseColor: string | BackgroundConfig;
  noise: number;      // 0-100
  noiseScale: number; // 1-20

  // ${t('procedural.comment_layers', 'Camadas de Composição')}
  shapes: Shape[];    

  // ${t('procedural.comment_postprocess', 'Pós-processamento')}
  animation?: AnimationSettings;
  vignette?: VignetteSettings;
}`}
</pre>
            </CodeWindow>
          </div>

          {/* Shape Structure */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <CodeWindow filename="Shape.ts">
<pre>
{`interface Shape {
  id: string;           // React keys & filtros
  type: 'circle' | 'blob';
  
  // ${t('procedural.comment_position', 'Posicionamento Relativo (%)')}
  x: number;            // 0-100
  y: number;            // 0-100
  size: number;         // % da largura
  
  // ${t('procedural.comment_style', 'Estilo')}
  color: string;        // Hex
  opacity: number;      // 0.0 - 1.0
  blur: number;         // stdDeviation
  
  // ${t('procedural.comment_math', 'Matemática de Cores')}
  blendMode: BlendMode;
  complexity?: number;  // blob edges
}`}
</pre>
            </CodeWindow>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-green-400">
                  <GitBranch size={24} />
                </div>
                <h3 className="text-2xl font-bold">{t('procedural.shape_structure_title', 'Estrutura da Forma (Shape)')}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                {t('procedural.shape_structure_desc', 'Cada elemento visual é uma "Forma" com propriedades específicas de mistura e posição relativa. O uso de porcentagens nas coordenadas garante que o layout seja responsivo em qualquer resolução.')}
              </p>
              <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
                <h4 className="font-bold text-white mb-3">{t('procedural.blend_modes_title', 'Modos de Mistura (BlendMode)')}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <code className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded">multiply</code>
                  <code className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">screen</code>
                  <code className="text-green-400 bg-green-500/10 px-2 py-1 rounded">overlay</code>
                  <code className="text-pink-400 bg-pink-500/10 px-2 py-1 rounded">difference</code>
                  <code className="text-orange-400 bg-orange-500/10 px-2 py-1 rounded">exclusion</code>
                  <code className="text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">hard-light</code>
                </div>
              </div>
            </div>
          </div>

          {/* Contrast Safeguard */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-yellow-500/20 bg-yellow-900/10 mb-16">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-yellow-500/20 p-4 rounded-2xl text-yellow-400 shrink-0">
                <Shield size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">{t('procedural.safeguard_title', 'O "Guarda-Costas de Contraste"')}</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  {t('procedural.safeguard_desc', 'A função ensureVisibility atua como um "linter" visual, corrigindo matematicamente cores e modos que resultariam em invisibilidade. Converte cores Hex para HSL, analisa o fundo e aplica regras automáticas.')}
                </p>
                
                {/* Safeguard Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-zinc-300">{t('procedural.table_scenario', 'Cenário de Fundo')}</th>
                        <th className="text-left py-3 px-4 text-zinc-300">{t('procedural.table_problem', 'Problema Detectado')}</th>
                        <th className="text-left py-3 px-4 text-zinc-300">{t('procedural.table_action', 'Ação Corretiva')}</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-400">
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4"><code className="text-red-400">Pitch Black (L&lt;10%)</code></td>
                        <td className="py-3 px-4">multiply, overlay</td>
                        <td className="py-3 px-4 text-green-400">{t('procedural.action_force_screen', 'Força screen/normal')}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3 px-4"><code className="text-orange-400">Dark (L&lt;40%)</code></td>
                        <td className="py-3 px-4">multiply</td>
                        <td className="py-3 px-4 text-green-400">{t('procedural.action_switch_overlay', 'Altera para overlay/screen')}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><code className="text-yellow-400">Light (L&gt;60%)</code></td>
                        <td className="py-3 px-4">screen, color-dodge</td>
                        <td className="py-3 px-4 text-green-400">{t('procedural.action_switch_multiply', 'Altera para multiply/normal')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
            <Link 
                to="/creation"
                className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl hover:shadow-white/20"
            >
                <Zap size={20} />
                {t('creation.title')} 
                <ArrowRight size={20} />
            </Link>
        </div>

      </div>
    </div>
  );
}
