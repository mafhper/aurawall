import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Github, ExternalLink, Rss, PenTool, Database, User } from 'lucide-react';
import HeroBackground from '../components/HeroBackground';

const projects = [
  {
    id: 'personal-news',
    name: 'Personal News',
    description: 'Agregador de Feeds RSS com interface moderna e suporte offline.',
    icon: Rss,
    color: 'purple',
    techs: ['React', 'TypeScript', 'Tauri'],
    status: 'live',
    demoUrl: 'https://mafhper.github.io/personalnews/',
    githubUrl: 'https://github.com/mafhper/personalnews',
  },
  {
    id: 'mark-lee',
    name: 'Mark-Lee',
    description: 'Editor de texto focado em escrita sem distrações, performance e design elegante.',
    icon: PenTool,
    color: 'blue',
    techs: ['React', 'Tauri', 'Markdown'],
    status: 'dev',
    demoUrl: null,
    githubUrl: 'https://github.com/mafhper/mark-lee',
  },
  {
    id: 'lithium-cms',
    name: 'Lithium CMS',
    description: 'CMS moderno baseado em arquivos para blogs estáticos com preview ao vivo e suporte a temas.',
    icon: Database,
    color: 'green',
    techs: ['Node.js', 'Express', 'Nunjucks'],
    status: 'dev',
    demoUrl: null,
    githubUrl: 'https://github.com/mafhper/lithium',
  },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Helmet>
        <title>{t('about.title', 'Sobre o Projeto | AuraWall')}</title>
        <meta name="description" content={t('about.subtitle', 'AuraWall é uma ferramenta open source para geração de wallpapers abstratos.')} />
        <link rel="canonical" href={import.meta.env.BASE_URL + 'about'} />
      </Helmet>
      
      {/* Hero Section - Standardized like other pages */}
      <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <HeroBackground 
          className="absolute inset-0" 
          presetId="system-error"
          overlayOpacity={40}
        />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 backdrop-blur border border-white/10 flex items-center justify-center">
              <User size={32} className="text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Sobre{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400">o Projeto</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 max-w-5xl py-20">
        
        {/* Developer Bio */}
        <div className="glass-panel rounded-3xl p-10 mb-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img 
              src="https://github.com/mafhper.png" 
              alt="@mafhper"
              className="w-32 h-32 rounded-full border-4 border-purple-500/50 shadow-lg shadow-purple-500/20 shrink-0"
              width="128"
              height="128"
            />
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">@mafhper</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-4">
                {t('about.bio')}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a 
                  href="https://github.com/mafhper" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation - Why AuraWall? */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Por que AuraWall?</h2>
          <div className="glass-panel rounded-3xl p-10">
            <div className="max-w-3xl mx-auto space-y-6 text-zinc-400 leading-relaxed">
              <p>
                Gradientes, transições e texturas sempre foram parte essencial do meu processo de design. 
                Em praticamente todo projeto que desenvolvo, esses elementos visuais ajudam a criar atmosfera 
                e identidade. Mas havia um problema recorrente: sempre que precisava de um novo background, 
                era começar do zero.
              </p>
              <p>
                Buscava inspirações, mas elas raramente se encaixavam perfeitamente. Precisava de algo 
                que fosse <span className="text-white font-medium">meu</span>, gerado sob demanda, com 
                controle total sobre cores, formas e movimento.
              </p>
              <p>
                Assim nasceu o AuraWall — uma ferramenta que eu mesmo precisava. Mas ao desenvolvê-la, 
                percebi que poderia ser útil para outros desenvolvedores e designers que enfrentam o 
                mesmo desafio. Por isso, desde o início, foi pensada para ser{' '}
                <span className="text-white font-medium">open source</span>: código aberto para ser 
                estudado, adaptado e melhorado pela comunidade.
              </p>
              <p>
                Hoje, o AuraWall já serve como engine de backgrounds em alguns sites que produzi. 
                O próximo passo é tornar o acesso ainda mais fácil através de uma 
                <span className="text-purple-400 font-medium"> API pública</span>, permitindo que 
                qualquer desenvolvedor possa gerar wallpapers procedurais diretamente de seus projetos.
              </p>
            </div>
          </div>
        </div>

        {/* Other Projects */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('about.projects_title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project) => {
              const Icon = project.icon;
              const colorClasses = {
                purple: 'from-purple-500/20 to-purple-900/20 border-purple-500/30 hover:border-purple-400/50',
                blue: 'from-blue-500/20 to-blue-900/20 border-blue-500/30 hover:border-blue-400/50',
                green: 'from-green-500/20 to-green-900/20 border-green-500/30 hover:border-green-400/50',
              };
              const iconColors = {
                purple: 'text-purple-400',
                blue: 'text-blue-400',
                green: 'text-green-400',
              };
              const statusColors = {
                live: 'bg-green-500/20 text-green-400 border-green-500/30',
                dev: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
              };
              const statusLabels = {
                live: 'Disponível',
                dev: 'Em Desenvolvimento',
              };
              
              return (
                <div 
                  key={project.id}
                  className={`bg-gradient-to-b ${colorClasses[project.color as keyof typeof colorClasses]} border rounded-2xl p-6 transition-all duration-300 card-hover card-glow flex flex-col`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center ${iconColors[project.color as keyof typeof iconColors]}`}>
                      <Icon size={24} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${statusColors[project.status as keyof typeof statusColors]}`}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <p className="text-zinc-400 text-sm mb-4 leading-relaxed flex-1">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techs.map((tech) => (
                      <span key={tech} className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 relative z-10">
                    {project.demoUrl && (
                      <a 
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-lg text-xs font-bold transition-colors"
                      >
                        <ExternalLink size={12} />
                        Demo
                      </a>
                    )}
                    <a 
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${project.demoUrl ? '' : 'flex-1'}`}
                    >
                      <Github size={12} />
                      GitHub
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contribute CTA */}
        <div className="text-center glass-panel rounded-3xl p-12">
          <h2 className="text-2xl font-bold mb-4">{t('about.contribute_title')}</h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            {t('about.contribute_desc')}
          </p>
          <a 
            href="https://github.com/mafhper/aurawall" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-full font-bold transition-all"
          >
            <Github size={20} />
            {t('about.repo_link')}
          </a>
        </div>

      </div>
    </div>
  );
}
