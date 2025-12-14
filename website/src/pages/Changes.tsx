import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCommit, Calendar, Sparkles, Wrench, AlertTriangle, Rocket, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// GitHub commit interface
interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

// This will be populated by the fetch-changelog script during build
interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'breaking' | 'refactor';
}

// Static changelog data - used as fallback and for version milestones
const staticChangelog: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2024-12-10',
    title: 'Promo Site e Sistema de Collections',
    description: 'Lançamento do site promocional integrado com galeria de presets, páginas de documentação arquitetural, sistema de collections para organização de presets, e suporte a compartilhamento de configurações via URL.',
    type: 'feature',
  },
  {
    version: '0.1.1',
    date: '2024-12-09',
    title: 'Documentação Técnica e Sementes Procedurais',
    description: 'Implementação do sistema de sementes para geração determinística de wallpapers, permitindo reprodutibilidade exata. Adição de documentação técnica detalhada sobre algoritmos de geração.',
    type: 'refactor',
  },
  {
    version: '0.1.0',
    date: '2024-12-08',
    title: 'Lançamento Inicial',
    description: 'Primeira versão pública do AuraWall com engines Boreal e Chroma, sistema de animação CSS em tempo real, exportação multi-formato (PNG, JPG, SVG) e internacionalização para 8 idiomas.',
    type: 'feature',
  },
];

const roadmapItems = [
  {
    id: 'api',
    title: 'API Pública',
    description: 'Acesso programático para gerar wallpapers via REST API.',
    status: 'in-progress' as const,
  },
  {
    id: 'desktop',
    title: 'App Desktop',
    description: 'Aplicação nativa para Windows, macOS e Linux com suporte a wallpapers animados no sistema.',
    status: 'in-progress' as const,
  },
  {
    id: 'modes',
    title: 'Novos Modos e Fluidos',
    description: 'Expansão da galeria com novos motores visuais: Midnight, Geometrica, Glitch, Sakura, Ember, Oceanic e mais.',
    status: 'completed' as const,
  },
  {
    id: 'perf',
    title: 'Otimização Extrema',
    description: 'Remoção de GTM, Code Splitting, Otimização de Assets (WebP/SVG) e preparação para Static Site Generation (SSG) no GitHub Pages.',
    status: 'in-progress' as const,
  },
];

const typeIcons = {
  feature: Sparkles,
  fix: Wrench,
  breaking: AlertTriangle,
  refactor: GitCommit,
};

const typeColors = {
  feature: 'bg-green-500/10 text-green-400 border-green-500/30',
  fix: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  breaking: 'bg-red-500/10 text-red-400 border-red-500/30',
  refactor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const statusColors = {
  'completed': 'bg-green-500',
  'in-progress': 'bg-yellow-500',
  'planned': 'bg-zinc-600',
};

export default function Changes() {
  const { t } = useTranslation();
  const [changelog] = useState<ChangelogEntry[]>(staticChangelog);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [showAllCommits, setShowAllCommits] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(true);

  // Fetch real commits from GitHub
  useEffect(() => {
    fetch('https://api.github.com/repos/mafhper/aurawall/commits?per_page=20')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: GitHubCommit[]) => {
        setCommits(data);
        setLoadingCommits(false);
      })
      .catch(() => {
        console.log('Could not fetch GitHub commits');
        setLoadingCommits(false);
      });
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get displayed commits (2 or all)
  const displayedCommits = showAllCommits ? commits : commits.slice(0, 2);

  return (
    <div className="min-h-screen bg-black text-white pt-40 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{t('changes.title')}</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t('changes.subtitle')}
          </p>
        </div>

        {/* Roadmap */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Rocket className="text-blue-400" />
            {t('changes.roadmap_title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {roadmapItems.map((item, index) => (
              <div 
                key={item.id}
                className="glass-panel border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all card-hover animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2">{t(`changes.roadmap_${item.id}_title`, item.title)}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{t(`changes.roadmap_${item.id}_desc`, item.description)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-white/5 px-2 py-1 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${statusColors[item.status]}`}></span>
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version History - Real GitHub Commits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <GitCommit className="text-purple-400" />
            {t('changes.changelog_title')}
          </h2>
          
          {loadingCommits ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <div className="animate-pulse text-zinc-500">Carregando commits do GitHub...</div>
            </div>
          ) : commits.length > 0 ? (
            <div className="space-y-4">
              {/* Commit List */}
              {displayedCommits.map((commit, index) => (
                <div 
                  key={commit.sha}
                  className="glass-panel rounded-xl p-5 border-l-4 border-l-purple-500/50 hover:border-l-purple-500 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <GitCommit size={18} className="text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1 truncate">
                        {commit.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                        <span>•</span>
                        <span>{commit.commit.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(commit.commit.author.date)}</span>
                      </div>
                    </div>
                    <a 
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-purple-400 transition-colors shrink-0"
                      title="Ver no GitHub"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))}

              {/* Expand/Collapse Button - Outside Cards */}
              {commits.length > 2 && (
                <button 
                  onClick={() => setShowAllCommits(!showAllCommits)}
                  className="w-full py-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 rounded-xl transition-all"
                >
                  {showAllCommits ? (
                    <>
                      {t('changes.show_less', 'Mostrar Menos')} 
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      {t('changes.view_full_history', 'Ver Histórico Completo')} ({commits.length - 2} mais)
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}

              {/* Link to GitHub */}
              <div className="text-center pt-4">
                <a 
                  href="https://github.com/mafhper/aurawall/commits/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-400 transition-colors"
                >
                  Ver todos os commits no GitHub
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ) : (
            /* Fallback to static changelog */
            <div className="space-y-6">
              {changelog.map((entry, index) => {
                const Icon = typeIcons[entry.type];
                return (
                  <div 
                    key={index}
                    className="glass-panel rounded-2xl p-8 border-l-4 border-l-purple-500 card-hover card-glow animate-in fade-in slide-in-from-bottom-8 duration-700"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-base font-mono font-bold shadow-inner shadow-purple-500/20">
                        v{entry.version}
                      </span>
                      <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${typeColors[entry.type]}`}>
                        <Icon size={12} />
                        {entry.type}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500 text-sm ml-auto">
                        <Calendar size={14} />
                        {entry.date}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{entry.title}</h3>
                    <p className="text-zinc-400 leading-relaxed text-lg">{entry.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
