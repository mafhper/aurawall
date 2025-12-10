import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Code, Cpu, Layers, Palette, Download, Share2, Globe, Zap, TestTube2, ArrowRight, Github, Binary } from 'lucide-react';
import CodeWindow from '../components/CodeWindow';

const stackItems = [
  { key: 'core', icon: Code, color: 'blue', reason: 'React 19 fornece os hooks mais recentes e renderização concorrente para atualizações de UI suaves.' },
  { key: 'style', icon: Palette, color: 'purple', reason: 'Tailwind CSS v4 usa um motor baseado em Rust para compilação instantânea sem overhead em runtime.' },
  { key: 'render', icon: Layers, color: 'pink', reason: 'DOM SVG nativo garante escalabilidade infinita sem pixelização.' },
  { key: 'export', icon: Download, color: 'green', reason: 'Canvas API permite rasterização em qualquer resolução.' },
  { key: 'i18n', icon: Globe, color: 'cyan', reason: 'i18next oferece detecção automática de idioma e interpolação segura.' },
  { key: 'build', icon: Zap, color: 'yellow', reason: 'Vite 6 oferece HMR instantâneo e builds otimizados.' },
  { key: 'test', icon: TestTube2, color: 'orange', reason: 'Vitest & Playwright garantem a integridade visual e lógica de cada build.' },
  { key: 'github', icon: Github, color: 'gray', reason: 'GitHub Actions automatiza CI/CD, Pages hospeda o site estático, e Workflows gerencia releases.' },
  { key: 'compress', icon: Binary, color: 'teal', reason: 'lz-string compacta configurações para compartilhamento via URL com redução de até 70%.' },
];

export default function Tech() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{t('tech.title')}</h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            {t('tech.subtitle')}
          </p>
        </div>

        {/* Stack Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">{t('tech.stack_title')}</h2>
          <p className="text-zinc-500 mb-8">{t('tech.why_title')}</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stackItems.map((item) => {
              const Icon = item.icon;
              const colorClasses: Record<string, string> = {
                blue: 'border-blue-500/30 bg-blue-500/5',
                purple: 'border-purple-500/30 bg-purple-500/5',
                pink: 'border-pink-500/30 bg-pink-500/5',
                green: 'border-green-500/30 bg-green-500/5',
                cyan: 'border-cyan-500/30 bg-cyan-500/5',
                yellow: 'border-yellow-500/30 bg-yellow-500/5',
                orange: 'border-orange-500/30 bg-orange-500/5',
                gray: 'border-zinc-500/30 bg-zinc-500/5',
                teal: 'border-teal-500/30 bg-teal-500/5',
              };
              const iconColors: Record<string, string> = {
                blue: 'text-blue-400',
                purple: 'text-purple-400',
                pink: 'text-pink-400',
                green: 'text-green-400',
                cyan: 'text-cyan-400',
                yellow: 'text-yellow-400',
                orange: 'text-orange-400',
                gray: 'text-zinc-400',
                teal: 'text-teal-400',
              };
              
              return (
                <div 
                  key={item.key}
                  className={`rounded-2xl p-5 border ${colorClasses[item.color]} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon size={20} className={iconColors[item.color]} />
                    <span className="font-bold">{t(`tech.stack_${item.key}`)}</span>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.reason}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Architecture Diagram */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Arquitetura Reativa</h2>
          <div className="glass-panel rounded-2xl p-8">
            <div className="bg-zinc-900 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono">
{`┌─────────────────────────────────────────────────────────────┐
│                      App.tsx (Estado Global)                 │
│                                                              │
│  ┌─────────────┐    ┌─────────────────────────────────────┐  │
│  │   config    │───▶│         WallpaperRenderer.tsx       │  │
│  │ (Wallpaper  │    │                                     │  │
│  │   Config)   │    │  ┌─────────────────────────────┐    │  │
│  └─────────────┘    │  │        SVG DOM              │    │  │
│        ▲            │  │  ┌──────┐ ┌──────┐ ┌──────┐ │    │  │
│        │            │  │  │ defs │ │shapes│ │noise │ │    │  │
│  ┌─────────────┐    │  │  └──────┘ └──────┘ └──────┘ │    │  │
│  │  Controls   │    │  └─────────────────────────────┘    │  │
│  │    .tsx     │    └─────────────────────────────────────┘  │
│  └─────────────┘                                             │
│  └─────────────┘                                             │
│        ▲            ┌─────────────────────────────────────┐  │
│        │            │        variationService.ts          │  │
│  ┌─────────────┐    │  (Geração Procedural de Variações)  │  │
│  │    User     │───▶└─────────────────────────────────────┘  │
│  │  Actions    │                                             │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
            <p className="text-zinc-500 text-sm mt-4">
              Estado unidirecional: todas as mudanças fluem do estado global para os componentes visuais.
            </p>
          </div>
        </section>

        {/* The Seed */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">{t('tech.seed_title')}</h2>
          <p className="text-zinc-400 mb-6">{t('tech.seed_desc')}</p>
          
          <CodeWindow filename="WallpaperConfig.ts">
<pre>{`interface WallpaperConfig {
  // Dimensões do Canvas
  width: number;      // Largura em pixels
  height: number;     // Altura em pixels

  // Aparência Global
  baseColor: string | BackgroundConfig;
  noise: number;      // Intensidade do grão (0-100)
  noiseScale: number; // Escala do ruído (1-20)

  // Camadas de Composição
  shapes: Shape[];    // Array de formas vetoriais

  // Sistemas Opcionais
  animation?: AnimationSettings;
  vignette?: VignetteSettings;
}

interface Shape {
  id: string;
  type: 'circle' | 'blob';
  
  // Posição Relativa (0-100%)
  x: number;
  y: number;
  size: number;       // % da largura do canvas
  
  // Estilo
  color: string;      // Hex color
  opacity: number;    // 0.0 - 1.0
  blur: number;       // Gaussian blur (px)
  blendMode: BlendMode;
  complexity?: number; // Para blobs
}`}</pre>
          </CodeWindow>
          <div className="bg-zinc-900 border-t border-white/5 rounded-b-xl p-4 flex justify-between items-center text-xs">
               <span className="text-zinc-500">1.2kb Minified</span>
               <Link to="/creation/procedural" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  {t('tech.seed_button', 'Ver Detalhes Procedurais')} <ArrowRight size={12} />
               </Link>
          </div>
        </section>

        {/* Rendering Pipeline */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">{t('tech.pipeline_title')}</h2>
          <p className="text-zinc-400 mb-6">{t('tech.pipeline_desc')}</p>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { layer: 1, name: 'Background', desc: 'Cor sólida ou gradiente linear/radial', color: 'purple' },
              { layer: 2, name: 'Shapes', desc: 'Círculos e blobs com blur e blend modes', color: 'blue' },
              { layer: 3, name: 'Vignette', desc: 'Máscara radial com gradientTransform', color: 'pink' },
              { layer: 4, name: 'Noise', desc: 'feTurbulence com mix-blend-mode overlay', color: 'green' },
            ].map((item) => (
              <div 
                key={item.layer}
                className={`bg-zinc-900/50 border border-${item.color}-500/20 rounded-xl p-5`}
              >
                <div className={`text-xs font-bold text-${item.color}-400 mb-2`}>CAMADA {item.layer}</div>
                <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SVG Filters */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">{t('tech.filters_title')}</h2>
          <p className="text-zinc-400 mb-6">{t('tech.filters_desc')}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Noise Filter */}
            <div>
              <h3 className="text-xl font-bold text-purple-400 mb-4">Grão de Filme (Noise)</h3>
              <CodeWindow filename="noiseFilter.svg">
<pre>{`<filter id="noiseFilter">
  <!-- Gera ruído fractal -->
  <feTurbulence 
    type="fractalNoise" 
    baseFrequency={noiseScale / 1000}
    numOctaves="3" 
    stitchTiles="stitch" 
  />
  
  <!-- Remove saturação -->
  <feColorMatrix 
    type="saturate" 
    values="0" 
  />
  
  <!-- Ajusta transparência -->
  <feComponentTransfer>
    <feFuncA 
      type="linear" 
      slope={noise / 100} 
    />
  </feComponentTransfer>
</filter>`}</pre>
              </CodeWindow>
            </div>
            
            {/* Blur Filter */}
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">Desfoque Atmosférico</h3>
              <CodeWindow filename="blurFilter.svg">
<pre>{`<!-- Filtro por forma -->
<filter id="blur-{shape.id}">
  <feGaussianBlur 
    stdDeviation={shape.blur}
    result="coloredBlur" 
  />
</filter>

<!-- Aplicação na forma -->
<circle
  cx={shape.x + '%'}
  cy={shape.y + '%'}
  r={shape.size + '%'}
  fill={shape.color}
  filter="url(#blur-{shape.id})"
  style={{ 
    mixBlendMode: shape.blendMode 
  }}
/>`}</pre>
              </CodeWindow>
            </div>
          </div>
        </section>

        {/* Contrast Safeguard */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">Guarda-Costas de Contraste</h2>
          <p className="text-zinc-400 mb-6">
            Um sistema de validação automática que garante que todas as formas são visíveis,
            independentemente da combinação de cores e modos de mistura escolhidos.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-bold">Cenário de Fundo</th>
                  <th className="text-left py-3 px-4 font-bold">Problema Detectado</th>
                  <th className="text-left py-3 px-4 font-bold">Ação Corretiva</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><span className="bg-zinc-900 px-2 py-1 rounded text-xs">Pitch Black (L &lt; 10%)</span></td>
                  <td className="py-3 px-4">BlendMode é multiply, overlay ou soft-light</td>
                  <td className="py-3 px-4 text-green-400">FORÇA screen ou normal</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><span className="bg-zinc-900 px-2 py-1 rounded text-xs">Pitch Black</span></td>
                  <td className="py-3 px-4">Cor da forma é escura (L &lt; 50%)</td>
                  <td className="py-3 px-4 text-green-400">IMPULSIONA Lightness para 50-90%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs">Dark Mode (L &lt; 40%)</span></td>
                  <td className="py-3 px-4">BlendMode é multiply</td>
                  <td className="py-3 px-4 text-green-400">ALTERA para overlay ou screen</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4"><span className="bg-zinc-300 text-black px-2 py-1 rounded text-xs">Light Mode (L &gt; 60%)</span></td>
                  <td className="py-3 px-4">BlendMode é screen ou color-dodge</td>
                  <td className="py-3 px-4 text-green-400">ALTERA para multiply ou normal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Export Process */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-4">{t('tech.export_title')}</h2>
          <p className="text-zinc-400 mb-6">{t('tech.export_desc')}</p>
          
          <div className="glass-panel rounded-2xl p-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              {[
                { step: 1, label: 'SVG DOM', icon: '🎨' },
                { step: 2, label: 'XMLSerializer', icon: '📝' },
                { step: 3, label: 'Blob', icon: '📦' },
                { step: 4, label: 'Image()', icon: '🖼️' },
                { step: 5, label: 'Canvas', icon: '🎬' },
                { step: 6, label: 'DataURL', icon: '💾' },
              ].map((item, index) => (
                <React.Fragment key={item.step}>
                  <div className="bg-zinc-900 rounded-xl p-4 w-24">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-xs font-bold">{item.label}</div>
                  </div>
                  {index < 5 && <span className="text-zinc-600">→</span>}
                </React.Fragment>
              ))}
            </div>
            
            <div className="mt-8">
              <CodeWindow filename="exportFlow.ts">
<pre>{`// Fluxo de exportação simplificado
const svgString = new XMLSerializer().serializeToString(svgElement);
const blob = new Blob([svgString], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);

const img = new Image();
img.onload = () => {
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  // Trigger download...
};
img.src = url;`}</pre>
              </CodeWindow>
            </div>
          </div>
        </section>

        {/* Deep Linking - Expanded */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Compartilhamento via URL</h2>
          <p className="text-zinc-400 mb-6">
            O AuraWall permite compartilhar criações diretamente via link. Toda a configuração 
            do wallpaper é serializada, compactada e codificada na hash da URL.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Share2 size={20} className="text-purple-400" />
                <span className="font-bold">Como Funciona</span>
              </div>
              <ol className="space-y-3 text-zinc-400 text-sm">
                <li className="flex gap-3">
                  <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>O objeto <code className="bg-zinc-900 px-1 rounded">WallpaperConfig</code> é convertido para JSON</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>O JSON é compactado usando <code className="bg-zinc-900 px-1 rounded">lz-string</code> (redução de ~70%)</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>O resultado é codificado em Base64 URL-safe</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>A string é anexada à URL como <code className="bg-zinc-900 px-1 rounded">#config=...</code></span>
                </li>
              </ol>
            </div>
            
            <div>
              <CodeWindow filename="urlSharing.ts">
<pre>{`import LZString from 'lz-string';

// Codificar configuração para URL
function encodeConfig(config: WallpaperConfig): string {
  const json = JSON.stringify(config);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

// Decodificar configuração da URL
function decodeConfig(hash: string): WallpaperConfig {
  const compressed = hash.replace('#config=', '');
  const json = LZString.decompressFromEncodedURIComponent(compressed);
  return JSON.parse(json);
}

// Gerar link compartilhável
function generateShareLink(config: WallpaperConfig): string {
  const encoded = encodeConfig(config);
  return \`\${window.location.origin}#config=\${encoded}\`;
}`}</pre>
              </CodeWindow>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Share2 size={20} className="text-green-400" />
              <span className="font-bold">Exemplo de Deep Link</span>
            </div>
            <code className="text-xs bg-zinc-900 px-3 py-2 rounded-lg block overflow-x-auto text-zinc-400">
              https://aurawall.app/#config=N4IgzgpgTglgDgGxALgHQFoBMCmBXANgM4AEAkhKmmgDYQC2AjmumQMZUB0A5grgJYBDVqWAAKHAPYATRkA
            </code>
            <p className="text-zinc-500 text-sm mt-4">
              Ao abrir o link, o estado é restaurado exatamente como foi salvo - incluindo dimensões, 
              cores, formas, filtros e configurações de animação.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
