import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Sparkles, Zap, Play, Menu, X, Shuffle } from 'lucide-react';
import { getAppUrl } from './utils/appUrl';
import './i18n'; 
import Home from './pages/Home';
import Creation from './pages/Creation';
import Tech from './pages/Tech';
import Gallery from './pages/Gallery';
import Changes from './pages/Changes';
import About from './pages/About';

// Sub-pages for Creation
import CreationBoreal from './pages/CreationBoreal';
import CreationChroma from './pages/CreationChroma';
import CreationAnimation from './pages/CreationAnimation';
import CreationProcedural from './pages/CreationProcedural';

// ScrollToTop component - scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive 
          ? 'text-white bg-white/10 shadow-inner' 
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
};

const NavDropdown = ({ 
  to, 
  title, 
  items 
}: { 
  to: string, 
  title: string, 
  items: Array<{ to: string, label: string, icon?: React.ElementType, key: string }> 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to);

  return (
    <div 
      className="relative group "
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link 
        to={to} 
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
          isActive 
            ? 'text-white bg-white/10 shadow-inner' 
            : 'text-zinc-400 group-hover:text-white group-hover:bg-white/5'
        }`}
      >
        {title}
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Link>

      {/* Dropdown Overlay */}
      <div 
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all duration-300 origin-top transform z-50 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
        }`}
      >
        {/* Bridge to prevent closing on gap hover */}
        <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
        
        <div className="flex flex-col gap-1">
          {items.map((item) => {
             const Icon = item.icon;
             return (
               <Link
                 key={item.to}
                 to={item.to}
                 className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/10 ${
                   location.pathname === item.to 
                     ? 'text-white bg-white/5' 
                     : 'text-zinc-400 hover:text-white'
                 }`}
               >
                 {Icon && <Icon size={16} className={location.pathname === item.to ? 'text-purple-400' : 'text-zinc-500'} />}
                 <div className="flex flex-col">
                   <span className="font-medium">{item.label}</span>
                 </div>
               </Link>
             )
          })}
        </div>
      </div>
    </div>
  );
};

// Mobile Navigation Component
const MobileNav = ({ items }: { items: Array<{ to: string, label: string, icon?: React.ElementType, key: string }> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  // Prevent background scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const MobileLink = ({ to, children, className = "" }: { to: string, children: React.ReactNode, className?: string }) => {
     const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
     return (
       <Link 
         to={to} 
         onClick={() => setIsOpen(false)}
         className={`text-xl font-bold py-2 border-b border-white/5 ${isActive ? 'text-white' : 'text-zinc-500'} ${className}`}
       >
         {children}
       </Link>
     )
  }

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Fullscreen Overlay via Portal */}
      {createPortal(
        <div 
          className={`fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] transition-all duration-300 flex flex-col ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <div className="p-6 flex justify-between items-center">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  AuraWall
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={28} />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4 flex flex-col gap-4">
            <MobileLink to="/">{t('nav.home')}</MobileLink>
            
            <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                <MobileLink to="/creation" className="border-none pb-0">{t('nav.creation')}</MobileLink>
                <div className="pl-4 flex flex-col gap-3">
                    {items.map(item => (
                      <Link 
                        key={item.key} 
                        to={item.to} 
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-400 hover:text-white text-base flex items-center gap-2"
                      >
                        {item.icon && <item.icon size={16} />}
                        {item.label}
                      </Link>
                    ))}
                </div>
            </div>

            <MobileLink to="/architecture">{t('nav.arch')}</MobileLink>
            <MobileLink to="/gallery">{t('nav.gallery')}</MobileLink>
            <MobileLink to="/changes">{t('nav.changes')}</MobileLink>
            <MobileLink to="/about">{t('nav.about')}</MobileLink>
            
            <div className="mt-8">
              <a 
                href={getAppUrl()} 
                className="block w-full bg-white text-black text-center py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
              >
                {t('nav.launch')}
              </a>
            </div>
          </div>
          
          <div className="p-8 text-center text-zinc-600 text-xs">
            {t('footer')}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const creationItems = [
    { to: '/creation/boreal', label: t('creation.boreal_title', 'Boreal'), icon: Sparkles, key: 'boreal' },
    { to: '/creation/chroma', label: t('creation.chroma_title', 'Chroma'), icon: Zap, key: 'chroma' },
    { to: '/creation/animation', label: t('creation.anim_title', 'Animação'), icon: Play, key: 'animation' },
    { to: '/creation/procedural', label: t('procedural.title', 'Procedural'), icon: Shuffle, key: 'procedural' }
  ];

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
        
        {/* Floating Glass Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
          <nav className="glass-nav rounded-full px-6 py-3 flex items-center justify-between gap-4 md:gap-8 max-w-5xl w-full transition-all duration-300">
            
            <Link to="/" className="flex items-center gap-2 shrink-0 hover:scale-105 transition-transform">
              <img src={`${import.meta.env.BASE_URL}icon-light.svg`} className="w-8 h-8" alt="Logo" />
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 hidden sm:block">
                AuraWall
              </span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/">{t('nav.home')}</NavLink>
              
              <NavDropdown 
                to="/creation" 
                title={t('nav.creation')} 
                items={creationItems} 
              />
              
              <NavLink to="/architecture">{t('nav.arch')}</NavLink>
              <NavLink to="/gallery">{t('nav.gallery')}</NavLink>
              <NavLink to="/changes">{t('nav.changes')}</NavLink>
              <NavLink to="/about">{t('nav.about')}</NavLink>
            </div>

            {/* Right Side: Lang + CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <select 
                onChange={(e) => changeLanguage(e.target.value)} 
                value={i18n.language}
                className="bg-transparent text-xs text-zinc-400 font-medium focus:outline-none cursor-pointer hover:text-white uppercase hidden sm:block"
                aria-label="Select Language"
              >
                <option value="en" className="bg-zinc-900">EN</option>
                <option value="pt-BR" className="bg-zinc-900">PT</option>
                <option value="es" className="bg-zinc-900">ES</option>
                <option value="fr" className="bg-zinc-900">FR</option>
                <option value="de" className="bg-zinc-900">DE</option>
                <option value="it" className="bg-zinc-900">IT</option>
                <option value="ja" className="bg-zinc-900">JA</option>
                <option value="zh" className="bg-zinc-900">ZH</option>
              </select>

              <a href={getAppUrl()} className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105 shadow-lg shadow-white/10 whitespace-nowrap hidden sm:block">
                {t('nav.launch')}
              </a>

              {/* Mobile Menu Toggle */}
              <MobileNav items={creationItems} />
            </div>
          </nav>
        </div>

        {/* Content, padding managed by individual pages */}
        <ScrollToTop />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/creation" element={<Creation />} />
            <Route path="/creation/boreal" element={<CreationBoreal />} />
            <Route path="/creation/chroma" element={<CreationChroma />} />
            <Route path="/creation/animation" element={<CreationAnimation />} />
            <Route path="/creation/procedural" element={<CreationProcedural />} />
            <Route path="/architecture" element={<Tech />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/changes" element={<Changes />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        
        {/* Footer Gradient Transition */}
        <div className="relative h-32 mt-16">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent"></div>
        </div>
        
        <footer className="border-t border-white/10 py-12 text-center">
          <div className="flex justify-center gap-6 mb-8 text-zinc-500 flex-wrap px-6">
             <Link to="/creation" className="hover:text-white transition-colors">{t('nav.creation')}</Link>
             <Link to="/architecture" className="hover:text-white transition-colors">{t('nav.arch')}</Link>
             <Link to="/gallery" className="hover:text-white transition-colors">{t('nav.gallery')}</Link>
             <a href="https://github.com/mafhper/aurawall" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-zinc-600 text-sm">{t('footer')}</p>
        </footer>
      </div>
    </Router>
  );
}