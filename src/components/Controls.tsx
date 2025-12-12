import React, { useState, useEffect, memo } from 'react';
import { WallpaperConfig, Shape, BlendMode, CollectionId, AnimationSettings, VignetteSettings, AppPreferences, BackgroundConfig } from '../types';
import { EXPORT_SIZES, PRESETS } from '../constants';
import WallpaperRenderer from './WallpaperRenderer';
import { FavoriteItem } from '../hooks/useFavorites';
import { 
  Settings2, 
  Layers, 
  Download, 
  Plus, 
  Trash2,
  Monitor,
  Smartphone,
  Shuffle,
  FileCode,
  Palette,
  Sparkles,
  Zap,
  Wind,
  ChevronDown,
  Lock,
  Unlock,
  Play,
  Copy, 
  Aperture,
  RotateCw,
  SlidersHorizontal,
  Undo,
  Redo,
  Share2,
  CopyCheck,
  Heart,
  Star,
  Search,
  ArrowLeft
} from 'lucide-react';
import { DEFAULT_ANIMATION, DEFAULT_VIGNETTE } from '../constants';
import { hslToHex } from '../utils/colorUtils';
import { useTranslation } from 'react-i18next';
import PreferencesMenu from './PreferencesMenu'; 

import { getAllEngines, getEngine } from '../engines';
import EngineGallery from './EngineGallery';

const COLLECTION_ICONS: Record<string, any> = {
  boreal: Wind,
  chroma: Zap,
  lava: Zap, // Reuse Zap or find better
  midnight: Star,
  geometrica: Aperture,
  glitch: FileCode,
  sakura: Wind,
  ember: Sparkles,
  oceanic: Wind // Using Wind as placeholder for Waves/Water
};

interface ControlsProps {
  config: WallpaperConfig;
  variations?: WallpaperConfig[];
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
  selectedPresetId?: string | null;
  activeCollection: CollectionId;
  setActiveCollection: (c: CollectionId) => void;
  enabledEngines: string[];
  setEnabledEngines: (engines: string[]) => void;
  setConfig: React.Dispatch<React.SetStateAction<WallpaperConfig>>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  favorites: FavoriteItem[];
  isFavorite: boolean;
  toggleFavorite: () => void;
  addFavorite: (config: WallpaperConfig) => void; // Keep for compatibility if needed, but toggle prefers config from parent context or wrapper
  removeFavorite: (id: string) => void;
  onDownload: () => void;
  onDownloadSvgFile: () => void; 
  onShowSVGModal: () => void; 
  onApplyPreset: (presetId: string) => void;
  onApplyVariation: (variation: WallpaperConfig) => void;
  onResize: (width: number, height: number) => void;
  onRandomize: () => void;
  isGrainLocked: boolean;
  onToggleGrainLock: () => void;
}

const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = true,
  rightElement = null 
}: { 
  title: string, 
  children: React.ReactNode, 
  defaultOpen?: boolean,
  rightElement?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5 pb-2 mb-2">
      <div 
        className="flex justify-between items-center py-2 cursor-pointer group select-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-300 transition-colors cursor-pointer">
          {title}
        </label>
        <div className="flex items-center gap-2">
          {rightElement}
          <ChevronDown 
            size={14} 
            className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}
      >
        {children}
      </div>
    </div>
  );
};

const ControlsInner: React.FC<ControlsProps> = ({ 
  config, 
  variations = [],
  preferences,
  setPreferences,
  selectedPresetId,
  activeCollection,
  setActiveCollection,
  enabledEngines,
  setEnabledEngines,
  setConfig,
  undo,
  redo,
  canUndo,
  canRedo, 
  favorites,
  isFavorite,
  toggleFavorite,
  addFavorite,
  removeFavorite,
  onDownload,
  onDownloadSvgFile,
  onShowSVGModal,
  onApplyPreset,
  onApplyVariation,
  onResize,
  onRandomize,
  isGrainLocked,
  onToggleGrainLock
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'adjust' | 'shapes' | 'sizes' | 'motion' | 'preferences' | 'favorites'>('adjust');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [slotToReplace, setSlotToReplace] = useState<string | null>(null);

  const handleOpenGallery = (currentEngineId: string) => {
    setSlotToReplace(currentEngineId);
    setShowGallery(true);
  };

  const handleEquipEngine = (newEngineId: string) => {
    if (slotToReplace) {
        const newEnabled = enabledEngines.map(id => id === slotToReplace ? newEngineId : id);
        setEnabledEngines(newEnabled);
        setActiveCollection(newEngineId);
        setShowGallery(false);
        setSlotToReplace(null);
    }
  };

  // Filter categories based on active collection
  const collectionPresets = PRESETS.filter(p => p.collection === activeCollection);
  const categories = ['All', ...Array.from(new Set(collectionPresets.map(p => p.category)))];

  // Reset category when collection changes
  useEffect(() => {
    setActiveCategory('All');
  }, [activeCollection]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const updateBackground = (updates: Partial<BackgroundConfig>) => {
    setConfig(prev => {
      const currentBg: BackgroundConfig = typeof prev.baseColor === 'string' 
        ? { type: 'solid', color1: prev.baseColor, color2: '#000000', angle: 135 } 
        : prev.baseColor;
      
      return {
        ...prev,
        baseColor: { ...currentBg, ...updates }
      };
    });
  };

  const handleNoiseChange = (val: number) => {
    setConfig(prev => ({ ...prev, noise: val }));
  };

  const handleNoiseScaleChange = (val: number) => {
    setConfig(prev => ({ ...prev, noiseScale: val }));
  };

  const updateShape = (id: string, key: keyof Shape, value: any) => {
    setConfig(prev => ({
      ...prev,
      shapes: prev.shapes.map(s => s.id === id ? { ...s, [key]: value } : s)
    }));
  };

  const removeShape = (id: string) => {
    setConfig(prev => ({
      ...prev,
      shapes: prev.shapes.filter(s => s.id !== id)
    }));
  };

  const addShape = () => {
    const newShape: Shape = {
      id: `manual-${Date.now()}`,
      type: 'circle',
      x: 50,
      y: 50,
      size: 50,
      color: '#ffffff',
      opacity: 0.5,
      blur: 50,
      blendMode: 'normal'
    };
    setConfig(prev => ({ ...prev, shapes: [...prev.shapes, newShape] }));
  };

  const updateAnim = (key: keyof AnimationSettings, value: any) => {
    setConfig(prev => ({
       ...prev,
       animation: { ...prev.animation, [key]: value } as AnimationSettings
    }));
  };
  
  const toggleAnim = () => {
    setConfig(prev => ({
       ...prev,
       animation: { 
         ...(prev.animation || DEFAULT_ANIMATION), 
         enabled: !(prev.animation?.enabled) 
       }
    }));
  };

  const updateVignette = (key: keyof VignetteSettings, value: any) => {
    setConfig(prev => ({
       ...prev,
       vignette: { ...(prev.vignette || DEFAULT_VIGNETTE), [key]: value } as VignetteSettings
    }));
  };

  const toggleVignette = () => {
    setConfig(prev => ({
       ...prev,
       vignette: { 
         ...(prev.vignette || DEFAULT_VIGNETTE), 
         enabled: !(prev.vignette?.enabled) 
       }
    }));
  };

  const isRandomMode = selectedPresetId === 'custom-random';
  const anim = config.animation || DEFAULT_ANIMATION;
  const vig = config.vignette || DEFAULT_VIGNETTE;
  
  // Normalize background for UI
  const bgConfig: BackgroundConfig = typeof config.baseColor === 'string'
    ? { type: 'solid', color1: config.baseColor, color2: '#000000', angle: 135 }
    : config.baseColor;

  return (
    <div className="flex flex-col h-full bg-[#18181b] border-r border-white/10 w-full overflow-hidden">
      
      {/* Header */}
      <div className="hidden md:block p-6 border-b border-white/10 relative overflow-hidden group">
        <img 
          src={`${import.meta.env.BASE_URL}header-animation.svg`}
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-700" 
        />
        <div className="flex items-center justify-between relative z-10">
            <a 
              href={import.meta.env.DEV ? 'http://localhost:5173' : '/aurawall/'}
              className="flex items-center gap-3 hover:opacity-100 transition-all cursor-pointer group/logo relative"
              title={t('back_to_home')}
            >
              <div className="relative w-8 h-8">
                <img 
                  src={`${import.meta.env.BASE_URL}icon-light.svg`}
                  alt="AuraWall Logo" 
                  className="w-8 h-8 absolute inset-0 transition-all duration-300 group-hover/logo:opacity-0 group-hover/logo:scale-75"
                />
                <ArrowLeft 
                  className="w-8 h-8 text-white absolute inset-0 opacity-0 scale-75 -translate-x-2 transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:scale-100 group-hover/logo:translate-x-0" 
                />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 group-hover/logo:text-white transition-colors">
                {t('app_title')}
              </h1>
            </a>
          
          <div className="flex items-center gap-1">
             <button 
               onClick={undo} disabled={!canUndo}
               className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
               title="Undo"
             >
               <Undo size={16} />
             </button>
             <button 
               onClick={redo} disabled={!canRedo}
               className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
               title="Redo"
             >
               <Redo size={16} />
             </button>
             <div className="w-px h-4 bg-white/10 mx-1" />
             <button 
               onClick={toggleFavorite}
               className={`p-2 rounded transition-colors ${isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-zinc-400 hover:text-pink-400 hover:bg-white/10'}`}
               title={isFavorite ? t('remove_favorite') : t('add_favorite')}
             >
               <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
             </button>
             <button 
               onClick={handleShare}
               className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-purple-400 transition-colors relative"
               title="Share Link"
             >
               {copied ? <CopyCheck size={16} className="text-green-400"/> : <Share2 size={16} />}
             </button>
          </div>
        </div>
      </div>

      {/* Tabs - Sticky on Mobile */}
      <div className="flex border-b border-white/10 bg-[#18181b] z-10 shrink-0">
        <button 
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'adjust' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Settings2 size={16} /> <span className="hidden xs:inline">{t('tab_adjust')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'shapes' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Layers size={16} /> <span className="hidden xs:inline">{t('tab_shapes')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('motion')}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'motion' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Play size={16} /> <span className="hidden xs:inline">{t('tab_motion')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('sizes')}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'sizes' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Monitor size={16} /> <span className="hidden xs:inline">{t('tab_size')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'favorites' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Star size={16} /> <span className="hidden xs:inline">{t('tab_favorites')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 py-3 text-xs md:text-sm font-medium flex justify-center items-center gap-2 ${activeTab === 'preferences' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <SlidersHorizontal size={16} /> <span className="hidden xs:inline">{t('preferences')}</span>
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-2 pb-20">
        
        {activeTab === 'preferences' && (
          <PreferencesMenu 
            preferences={preferences}
            setPreferences={setPreferences}
            onClose={() => setActiveTab('adjust')} 
          />
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                 {t('favorites_title')}
               </label>
               <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{favorites.length}</span>
             </div>
             
             {favorites.length === 0 ? (
               <div className="text-center py-10 text-zinc-500 text-sm border border-dashed border-white/10 rounded-lg">
                 <Heart size={24} className="mx-auto mb-2 opacity-50" />
                 {t('no_favorites')}
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-3">
                 {favorites.map((fav) => (
                   <div key={fav.id} className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-colors">
                      <div className="absolute inset-0 cursor-pointer" onClick={() => {
                        setConfig(fav.config);
                        // Optional: Navigate to adjust tab to edit
                      }}>
                        <WallpaperRenderer config={fav.config} className="w-full h-full" lowQuality={true} />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(fav.id);
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('remove_favorite')}
                      >
                        <Trash2 size={12} />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'adjust' && (
          <div> {/* Container for all 'adjust' tab content */}
            {/* Collection Switcher */}
            <div className="bg-zinc-900 rounded-lg p-1 flex gap-1 border border-white/10 mb-6 relative">
              {enabledEngines.map(engineId => {
                const engine = getEngine(engineId);
                if (!engine) return null;

                const Icon = COLLECTION_ICONS[engineId] || Sparkles;
                const isActive = activeCollection === engineId;
                
                // Dynamic style based on ID 
                let activeClass = 'bg-zinc-800 text-blue-300 shadow-sm border border-blue-500/30';
                if (engineId === 'boreal') activeClass = 'bg-zinc-800 text-purple-300 shadow-sm border border-purple-500/30';
                if (engineId === 'chroma') activeClass = 'bg-zinc-800 text-green-300 shadow-sm border border-green-500/30';
                if (engineId === 'lava') activeClass = 'bg-zinc-800 text-orange-300 shadow-sm border border-orange-500/30';
                if (engineId === 'midnight') activeClass = 'bg-zinc-800 text-indigo-300 shadow-sm border border-indigo-500/30';
                if (engineId === 'glitch') activeClass = 'bg-zinc-800 text-pink-300 shadow-sm border border-pink-500/30';
                if (engineId === 'oceanic') activeClass = 'bg-zinc-800 text-cyan-300 shadow-sm border border-cyan-500/30';

                return (
                  <div key={engineId} className="flex-1 relative group/btn">
                    <button
                        onClick={() => setActiveCollection(engineId)}
                        className={`w-full py-2 rounded text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                        isActive ? activeClass : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <Icon size={14} /> <span className="hidden xl:inline">{engine.meta.name}</span>
                        <span className="inline xl:hidden">{engine.meta.name.slice(0, 3)}</span>
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenGallery(engineId);
                        }}
                        className="absolute -top-2 -right-2 bg-zinc-700 text-white rounded-full p-1 opacity-0 group-hover/btn:opacity-100 hover:bg-purple-500 transition-all z-10 shadow-lg scale-75"
                        title="Trocar motor"
                    >
                        <Settings2 size={10} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions (Random) */}
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-white/5 space-y-3 mb-6">
              <button 
                onClick={onRandomize}
                className={`btn-premium w-full text-zinc-300 py-3 px-3 rounded-lg flex items-center justify-center gap-2 text-xs border font-medium ${
                    isRandomMode ? 'bg-purple-500/20 border-purple-500 text-purple-200 glow-purple' : 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border-white/5'
                }`}
              >
                <Shuffle size={14} /> 
                {activeCollection === 'boreal' ? t('random_ethereal') : t('random_liquid')}
              </button>
            </div>

            <div className="space-y-1">
              <CollapsibleSection title={`${activeCollection} Series`}>
                {/* Horizontal Category Chips */}
                {!isRandomMode && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar -mx-1 px-1">
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors flex-shrink-0 border ${
                          activeCategory === c 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Grid System */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
                  
                  {/* Special Logic: If Random Mode, show variations FIRST */}
                  {isRandomMode && variations.length > 0 && (
                     <>
                        <div className="col-span-3 text-[10px] text-purple-400 font-medium uppercase tracking-wider flex items-center gap-1 my-1">
                          <Sparkles size={12} /> {t('inspired_variations')}
                        </div>
                        {variations.map((variant, vIdx) => (
                            <button
                              key={`rand-v-${vIdx}`}
                              onClick={() => onApplyVariation(variant)}
                              className="group relative aspect-square rounded-lg overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all active:scale-95 animate-in fade-in zoom-in duration-500"
                              style={{ animationDelay: `${vIdx * 50}ms` }}
                              title={t('creative_variation_title')}
                            >
                              <WallpaperRenderer 
                                config={variant} 
                                className="w-full h-full"
                                lowQuality={true} 
                              />
                              <div className="absolute top-1 right-1 opacity-70">
                                 <Palette size={10} className="text-white drop-shadow-md"/>
                              </div>
                            </button>
                        ))}
                        <div className="col-span-3 h-px bg-white/5 my-2" />
                        <div className="col-span-3 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                           {t('library')}
                        </div>
                     </>
                  )}

                  {/* Standard Preset Rendering */}
                  {(() => {
                    const filtered = collectionPresets.filter(p => activeCategory === 'All' || p.category === activeCategory);
                    const items: React.ReactNode[] = [];

                    filtered.forEach(preset => {
                      const isSelected = selectedPresetId === preset.id;
                      
                      // The Preset Button
                      items.push(
                        <button
                          key={preset.id}
                          onClick={() => onApplyPreset(preset.id)}
                          className={`group relative aspect-square rounded-lg overflow-hidden border transition-all active:scale-95 ${
                            isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="absolute inset-0" style={{ background: preset.thumbnail }} />
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-[10px] py-1 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                            {preset.name}
                          </span>
                          {isSelected && (
                             <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 shadow-lg" />
                          )}
                        </button>
                      );

                      // Inline Variations (Only if NOT in Random Mode)
                      if (isSelected && !isRandomMode && variations.length > 0) {
                        variations.forEach((variant, vIdx) => {
                          items.push(
                            <button
                              key={`${preset.id}-v-${vIdx}`}
                              onClick={() => onApplyVariation(variant)}
                              className="group relative aspect-square rounded-lg overflow-hidden border border-purple-500/30 hover:border-purple-500 transition-all active:scale-95 animate-in fade-in zoom-in duration-300"
                              title={t('generated_variation_title')}
                            >
                              <WallpaperRenderer 
                                config={variant} 
                                className="w-full h-full"
                                lowQuality={true} 
                              />
                              <div className="absolute top-1 right-1 opacity-50">
                                 <Palette size={10} className="text-white drop-shadow-md"/>
                              </div>
                            </button>
                          );
                        });
                      }
                    });

                    if (items.length === 0) {
                      return <div className="col-span-3 text-center text-xs text-zinc-500 py-4">{t('no_presets_category')}</div>;
                    }

                    return items;
                  })()}
                </div>
              </CollapsibleSection>

              {/* Background Control (Updated) */}
              <CollapsibleSection title={t('background_base')}>
                <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5 space-y-3">
                  
                  {/* Type Selector */}
                  <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-700">
                    {(['solid', 'linear', 'radial'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => updateBackground({ type: t })}
                        className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-colors ${
                          bgConfig.type === t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Color 1 (Primary) */}
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden relative flex-shrink-0">
                        <input 
                          type="color" 
                          value={bgConfig.color1.startsWith('#') ? bgConfig.color1 : hslToHex(bgConfig.color1)} 
                          onChange={(e) => updateBackground({ color1: e.target.value })}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0 opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: bgConfig.color1 }} />
                     </div>
                     <div className="flex-1 text-xs text-zinc-400">Primary Color</div>
                  </div>

                  {/* Gradient Controls */}
                  {bgConfig.type !== 'solid' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3 pt-2 border-t border-white/5">
                       
                       {/* Color 2 */}
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden relative flex-shrink-0">
                            <input 
                              type="color" 
                              value={bgConfig.color2.startsWith('#') ? bgConfig.color2 : hslToHex(bgConfig.color2)} 
                              onChange={(e) => updateBackground({ color2: e.target.value })}
                              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0 opacity-0"
                            />
                            <div className="w-full h-full" style={{ backgroundColor: bgConfig.color2 }} />
                         </div>
                         <div className="flex-1 text-xs text-zinc-400">Secondary Color</div>
                       </div>

                       {/* Angle (Linear only) */}
                       {bgConfig.type === 'linear' && (
                         <div>
                            <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                              <span>Angle</span>
                              <span>{bgConfig.angle}°</span>
                            </div>
                            <input 
                              type="range" min="0" max="360" 
                              value={bgConfig.angle || 0} 
                              onChange={(e) => updateBackground({ angle: Number(e.target.value) })}
                              className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                            />
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Vignette Control (NEW) */}
              <CollapsibleSection 
                title={t('vignette_mask')}
                rightElement={
                  <div className="relative inline-block w-8 mr-1 align-middle select-none">
                    <input 
                      type="checkbox" 
                      checked={vig.enabled}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent collapse
                        toggleVignette();
                      }}
                      className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out top-0.5"
                      style={{ 
                        right: vig.enabled ? '0' : 'auto', 
                        left: vig.enabled ? 'auto' : '0',
                        borderColor: vig.enabled ? '#a855f7' : '#3f3f46'
                      }}
                    />
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVignette();
                      }}
                      className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${vig.enabled ? 'bg-purple-900' : 'bg-zinc-700'}`}
                    ></div>
                  </div>
                }
              >
                <div className={`bg-zinc-800/30 p-3 rounded-lg border border-white/5 space-y-3 transition-opacity ${vig.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  
                  {/* Color */}
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] text-zinc-500">{t('mask_color')}</span>
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden relative">
                          <input 
                            type="color" 
                            value={vig.color.startsWith('#') ? vig.color : hslToHex(vig.color)} 
                            onChange={(e) => updateVignette('color', e.target.value)}
                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 opacity-0"
                          />
                          <div className="w-full h-full" style={{ backgroundColor: vig.color }} />
                        </div>
                     </div>
                  </div>

                  {/* Intensity */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('intensity_opacity')}</span>
                      <span>{Math.round(vig.intensity * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={vig.intensity} 
                      onChange={(e) => updateVignette('intensity', Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('spread_center_size')}</span>
                      <span>{vig.size}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={vig.size} 
                      onChange={(e) => updateVignette('size', Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Offset X */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('offset_x')}</span>
                      <span>{vig.offsetX}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="-50" 
                      max="50" 
                      value={vig.offsetX} 
                      onChange={(e) => updateVignette('offsetX', Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Offset Y */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('offset_y')}</span>
                      <span>{vig.offsetY}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="-50" 
                      max="50" 
                      value={vig.offsetY} 
                      onChange={(e) => updateVignette('offsetY', Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <hr className="border-white/5" />

                  {/* Shape X */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('shape_x_horizontal')}</span>
                      <span>{vig.shapeX}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={vig.shapeX} 
                      onChange={(e) => updateVignette('shapeX', Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Shape Y */}
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('shape_y_vertical')}</span>
                      <span>{vig.shapeY}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={vig.shapeY} 
                      onChange={(e) => updateVignette('shapeY', Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Inverted Toggle */}
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] text-zinc-500">{t('invert_mask_spotlight')}</span>
                     <div className="relative inline-block w-10 mr-1 align-middle select-none">
                       <input 
                         type="checkbox" 
                         checked={vig.inverted}
                         onChange={() => updateVignette('inverted', !vig.inverted)}
                         className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out top-0.5"
                         style={{ 
                           right: vig.inverted ? '0' : 'auto', 
                           left: vig.inverted ? 'auto' : '0',
                           borderColor: vig.inverted ? '#a855f7' : '#3f3f46'
                         }}
                       />
                       <div 
                         onClick={() => updateVignette('inverted', !vig.inverted)}
                         className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${vig.inverted ? 'bg-purple-900' : 'bg-zinc-700'}`}
                       ></div>
                     </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Noise Control */}
              <CollapsibleSection 
                title={t('grain_effect')}
                rightElement={
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleGrainLock();
                    }}
                    className={`p-1 rounded transition-colors ${isGrainLocked ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                    title={isGrainLocked ? t('parameters_locked_randomization_ignored') : t('parameters_unlocked')}
                  >
                    {isGrainLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                }
              >
                <div className={`bg-zinc-800/30 p-3 rounded-lg border border-white/5 space-y-3 transition-opacity ${isGrainLocked ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('intensity')}</span>
                      <span>{config.noise}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      disabled={isGrainLocked}
                      value={config.noise} 
                      onChange={(e) => handleNoiseChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-2">
                      <span>{t('scale')}</span>
                      <span>{config.noiseScale}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      step="0.1"
                      disabled={isGrainLocked}
                      value={config.noiseScale} 
                      onChange={(e) => handleNoiseScaleChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </div>
        )}

        {activeTab === 'shapes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center sticky top-0 bg-[#18181b] py-2 z-10">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {t('layers', { count: config.shapes.length })}
              </label>
              <button 
                onClick={addShape}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors font-medium shadow-lg shadow-purple-900/20"
              >
                <Plus size={14} /> {t('add')}
              </button>
            </div>

            <div className="space-y-3">
              {config.shapes.map((shape, index) => (
                <div key={shape.id} className="bg-zinc-800/50 rounded-lg p-3 border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: shape.color }} />
                      <span className="text-xs font-medium text-zinc-300">{t('layer_n', { n: index + 1 })}</span>
                    </div>
                    <button 
                      onClick={() => removeShape(shape.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {/* Position X/Y */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">{t('pos_x')}</span>
                      <input 
                        type="range" min="-50" max="150" 
                        value={shape.x} onChange={(e) => updateShape(shape.id, 'x', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                    <div>
                       <span className="text-[10px] text-zinc-500 block mb-1">{t('pos_y')}</span>
                      <input 
                        type="range" min="-50" max="150" 
                        value={shape.y} onChange={(e) => updateShape(shape.id, 'y', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Size & Blur */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                       <span className="text-[10px] text-zinc-500 block mb-1">{t('size')}</span>
                      <input 
                        type="range" min="10" max="200" 
                        value={shape.size} onChange={(e) => updateShape(shape.id, 'size', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                    <div>
                       <span className="text-[10px] text-zinc-500 block mb-1">{t('blur')}</span>
                      <input 
                        type="range" min="0" max="200" 
                        value={shape.blur} onChange={(e) => updateShape(shape.id, 'blur', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Color & Opacity */}
                  <div className="flex gap-3 items-center pt-1">
                     <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white/20 shrink-0">
                        <input 
                          type="color" 
                          value={shape.color.startsWith('#') ? shape.color : hslToHex(shape.color)} 
                          onChange={(e) => updateShape(shape.id, 'color', e.target.value)}
                          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: shape.color }} />
                    </div>
                    <div className="flex-1">
                       <span className="text-[10px] text-zinc-500 block mb-1">{t('opacity')}</span>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={shape.opacity} onChange={(e) => updateShape(shape.id, 'opacity', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Shape Type & Blend Mode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">{t('shape_type')}</span>
                      <select 
                        value={shape.type}
                        onChange={(e) => updateShape(shape.id, 'type', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-2 py-1.5 focus:outline-none focus:border-purple-500"
                      >
                        <option value="circle">{t('circle')}</option>
                        <option value="blob">{t('organic_blob')}</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">{t('blend_mode')}</span>
                      <select 
                        value={shape.blendMode || 'normal'}
                        onChange={(e) => updateShape(shape.id, 'blendMode', e.target.value as BlendMode)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-2 py-1.5 focus:outline-none focus:border-purple-500"
                      >
                        <option value="normal">{t('normal')}</option>
                        <option value="screen">{t('screen_lighten')}</option>
                        <option value="overlay">{t('overlay_contrast')}</option>
                        <option value="multiply">{t('multiply_darken')}</option>
                        <option value="color-dodge">{t('color_dodge_glow')}</option>
                        <option value="soft-light">{t('soft_light_subtle')}</option>
                        <option value="difference">{t('difference_invert')}</option>
                        <option value="exclusion">{t('exclusion_invert_soft')}</option>
                        <option value="lighten">{t('lighten_max')}</option>
                        <option value="darken">{t('darken_min')}</option>
                        <option value="color-burn">{t('color_burn')}</option>
                        <option value="hard_light">{t('hard_light')}</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Blob Complexity (Only if blob) */}
                  {shape.type === 'blob' && (
                    <div>
                       <span className="text-[10px] text-zinc-500 block mb-1">{t('complexity_edges')}</span>
                      <input 
                        type="range" min="3" max="10" step="1"
                        value={shape.complexity || 6} onChange={(e) => updateShape(shape.id, 'complexity', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MOTION TAB (NEW) */}
        {activeTab === 'motion' && (
           <div className="space-y-6">
             <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {t('live_animation')}
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    checked={anim.enabled}
                    onChange={toggleAnim}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out top-0.5"
                    style={{ 
                      right: anim.enabled ? '0' : 'auto', 
                      left: anim.enabled ? 'auto' : '0',
                      borderColor: anim.enabled ? '#a855f7' : '#3f3f46'
                    }}
                  />
                  <div 
                    onClick={toggleAnim}
                    className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${anim.enabled ? 'bg-purple-900' : 'bg-zinc-700'}`}
                  ></div>
                </div>
             </div>
             
             <div className={`space-y-4 transition-opacity duration-300 ${anim.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
               
               <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5 space-y-4">
                 
                 {/* Speed */}
                 <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{t('global_speed')}</span>
                      <span>{anim.speed.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="10" step="0.1"
                      value={anim.speed} onChange={(e) => updateAnim('speed', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 <hr className="border-white/5" />
                 
                 {/* Drift/Flow */}
                 <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{t('drift_flow')}</span>
                      <span>{anim.flow}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={anim.flow} onChange={(e) => updateAnim('flow', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 {/* Pulse */}
                 <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{t('pulse_breathing')}</span>
                      <span>{anim.pulse}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={anim.pulse} onChange={(e) => updateAnim('pulse', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 {/* Rotate */}
                 <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{t('slow_rotate')}</span>
                      <span>{anim.rotate}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={anim.rotate} onChange={(e) => updateAnim('rotate', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>
                 
                 {/* Noise Anim */}
                 <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{t('static_noise_tv')}</span>
                      <span>{anim.noiseAnim}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={anim.noiseAnim} onChange={(e) => updateAnim('noiseAnim', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>

                 <hr className="border-white/5" />

                 {/* Color Cycle Toggle */}
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">{t('color_cycle_shapes')}</span>
                    <div className="relative inline-block w-10 mr-1 align-middle select-none">
                      <input 
                        type="checkbox" 
                        checked={anim.colorCycle}
                        onChange={() => updateAnim('colorCycle', !anim.colorCycle)}
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out top-0.5"
                        style={{ 
                          right: anim.colorCycle ? '0' : 'auto', 
                          left: anim.colorCycle ? 'auto' : '0',
                          borderColor: anim.colorCycle ? '#a855f7' : '#3f3f46'
                        }}
                      />
                      <div 
                        onClick={() => updateAnim('colorCycle', !anim.colorCycle)}
                        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${anim.colorCycle ? 'bg-purple-900' : 'bg-zinc-700'}`}
                      ></div>
                    </div>
                 </div>

                 {/* Color Cycle Speed */}
                 <div className={`${anim.colorCycle ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{t('color_cycle_speed')}</span>
                      <span>{anim.colorCycleSpeed}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={anim.colorCycleSpeed} onChange={(e) => updateAnim('colorCycleSpeed', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-purple-500"
                    />
                 </div>
               </div>
             </div>
           </div>
        )}

        {activeTab === 'sizes' && (
          <div className="space-y-6">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              {t('device_presets')}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {EXPORT_SIZES.map((size) => (
                <div key={size.name} className="flex items-center gap-2">
                  <button
                    onClick={() => onResize(size.width, size.height)}
                    className={`flex-grow flex items-center justify-between p-3 rounded-lg border transition-all ${
                      config.width === size.width && config.height === size.height 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-white/10 hover:border-white/20 bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       {size.width > size.height ? <Monitor size={18} className="text-zinc-400"/> : <Smartphone size={18} className="text-zinc-400"/>}
                       <div className="text-left">
                         <div className="text-sm font-medium text-white">{size.name}</div>
                         <div className="text-xs text-zinc-500">{size.width} x {size.height}</div>
                       </div>
                    </div>
                    {config.width === size.width && config.height === size.height && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                    )}
                  </button>
                  <button
                    onClick={() => onResize(size.height, size.width)}
                    className="p-3 rounded-lg border border-white/10 hover:border-white/30 bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title={t('rotate_orientation')}
                  >
                    <RotateCw size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Manual Size Inputs */}
            <div className="pt-4 border-t border-white/10">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                {t('custom_size')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Width (px)</label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    defaultValue={config.width}
                    onBlur={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 1920;
                      if (val < 100) val = 100;
                      if (val > 8000) val = 8000;
                      e.target.value = val.toString();
                      if (val !== config.width) onResize(val, config.height);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Height (px)</label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    defaultValue={config.height}
                    onBlur={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 1080;
                      if (val < 100) val = 100;
                      if (val > 8000) val = 8000;
                      e.target.value = val.toString();
                      if (val !== config.height) onResize(config.width, val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                    }}
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Download - Fixed at bottom */}
      <div className="p-4 md:p-6 border-t border-white/10 bg-[#18181b] z-20 shrink-0 flex gap-2">
         <button 
          onClick={onShowSVGModal}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-98 border border-white/10"
        >
          <FileCode size={20} />
          <span className="hidden sm:inline">{t('view_svg')}</span>
          <span className="inline sm:hidden">{t('view_svg_short')}</span>
        </button>
        <button 
          onClick={onDownloadSvgFile}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-98 border border-white/10"
        >
          <Download size={20} />
          <span className="hidden sm:inline">{t('download_svg')}</span>
          <span className="inline sm:hidden">{t('download_svg_short')}</span>
        </button>
        <button 
          onClick={onDownload}
          className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-lg shadow-white/5"
        >
          <Download size={20} />
          <span className="hidden sm:inline">{t('export_jpg')}</span>
          <span className="inline sm:hidden">{t('export_jpg_short')}</span>
        </button>
      </div>

      {showGallery && slotToReplace && (
        <EngineGallery 
          onClose={() => setShowGallery(false)}
          onEquip={handleEquipEngine}
          activeEngineId={slotToReplace}
        />
      )}
    </div>
  );
};

ControlsInner.displayName = 'ControlsInner';

export const Controls = memo(ControlsInner);
Controls.displayName = 'Controls';