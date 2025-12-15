import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('notfound.title')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-lg">
          {/* 404 Display */}
          <div className="mb-8">
            <span className="text-[150px] md:text-[200px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 select-none">
              404
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t('notfound.heading')}
          </h1>
          
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            {t('notfound.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all transform hover:scale-105 shadow-lg"
            >
              <Home size={20} />
              {t('notfound.go_home')}
            </Link>
            
            <Link 
              to="/creation/engines"
              className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-700 transition-all border border-white/10"
            >
              <Sparkles size={20} />
              {t('notfound.view_engines')}
            </Link>
          </div>

          <button 
            onClick={() => window.history.back()}
            className="mt-8 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t('notfound.go_back')}</span>
          </button>
        </div>
      </div>
    </>
  );
}

