import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCommit, Rocket, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import HeroBackground from '../components/HeroBackground';

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

// O histórico de VERSÕES do projeto não fica aqui: é o release-core que o publica,
// um Release por tag, em https://github.com/mafhper/aurawall/releases.
// Essa página mostra atividade real (commits do GitHub) e, se a API falhar,
// manda o leitor para o Releases — em vez de exibir um histórico inventado.

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

const statusColors = {
  'completed': 'bg-green-500',
  'in-progress': 'bg-yellow-500',
  'planned': 'bg-zinc-600',
};

export default function Changes() {
  const { t } = useTranslation();
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCommits, setShowAllCommits] = useState(false);

  useEffect(() => {
    fetch('https://api.github.com/repos/mafhper/aurawall/commits?per_page=10')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommits(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch commits:', err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get displayed commits (2 or all)
  const displayedCommits = showAllCommits ? commits : commits.slice(0, 2);

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <HeroBackground 
          className="absolute inset-0" 
          presetId="thermal-vision"
          overlayOpacity={40}
        />
        
        <div className="relative z-10 text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 backdrop-blur flex items-center justify-center">
              <Rocket size={32} className="text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Road{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400">map</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            {t('changes.subtitle')}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 max-w-4xl py-20">

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
                    <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">{item.status}</span>
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
          
          {loading ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <div className="animate-pulse text-zinc-400">{t('changes.loading_commits')}</div>
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
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
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
                      className="text-zinc-400 hover:text-purple-400 transition-colors shrink-0"
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
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-purple-400 transition-colors"
                >
                  {t('changes.view_all_github')}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ) : (
            /* A API falhou. Não inventar histórico: manda para o Releases, que é real. */
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
              <p className="text-zinc-400">{t('changes.commits_unavailable')}</p>
              <a
                href="https://github.com/mafhper/aurawall/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-purple-400 transition-colors"
              >
                {t('changes.view_releases')}
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
