import React, { useState, useRef, useEffect, useCallback } from 'react';
import WallpaperRenderer from './components/WallpaperRenderer';
// import { Controls } from './components/Controls'; // Converted to lazy
// Type needs to match so we import type or just rely on fallback
const Controls = React.lazy(() => import('./components/Controls').then(module => ({ default: module.Controls })));
import { WallpaperConfig, CollectionId, AppPreferences } from './types';
import { DEFAULT_CONFIG, PRESETS, DEFAULT_PREFERENCES } from './constants';
import { generateVariations } from './services/variationService';
import { getEngine } from './engines';
import { ZoomIn, ZoomOut, Maximize, X, Play } from 'lucide-react';
const CodeExportModal = React.lazy(() => import('./components/CodeExportModal'));
import { useTranslation } from 'react-i18next';
import { useHistory } from './hooks/useHistory';
import { useFavorites } from './hooks/useFavorites';
import { encodeConfigToUrl, decodeConfigFromUrl } from './utils/urlUtils';

export default function App() {
  const { t } = useTranslation();
  
  // Helper to check for collection param
  const getCollectionFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('collection');
  }

  // Initialize with URL config if available, otherwise check collection param, otherwise default
  const getInitialConfig = () => {
    const decoded = decodeConfigFromUrl();
    if (decoded) return decoded;

    const colParam = getCollectionFromUrl();
    if (colParam) {
       const engine = getEngine(colParam);
       if (engine && engine.randomizer) {
           // Generate a fresh random config for this collection
           return engine.randomizer(DEFAULT_CONFIG, { isGrainLocked: false });
       }
    }
    return DEFAULT_CONFIG;
  };

  const { 
    state: config, 
    setState: setConfig, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<WallpaperConfig>(getInitialConfig());

  const { favorites, isFavorite: isFavoriteFn, toggleFavorite: toggleFavoriteFn, removeFavorite } = useFavorites();

  // Wrapper functions to adapt hook interface to Controls props
  const isCurrentConfigFavorite = isFavoriteFn(config);
  const handleToggleFavorite = useCallback(() => toggleFavoriteFn(config), [toggleFavoriteFn, config]);
  const handleAddFavorite = useCallback((cfg: WallpaperConfig) => toggleFavoriteFn(cfg), [toggleFavoriteFn]);

  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [variations, setVariations] = useState<WallpaperConfig[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<CollectionId>(() => {
      return (getCollectionFromUrl() as CollectionId) || 'boreal';
  });
  // Default enabled engines (3 slots)
  const [enabledEngines, setEnabledEngines] = useState<string[]>(['boreal', 'chroma', 'lava']);
  const [isGrainLocked, setIsGrainLocked] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false); // New state for Zen Mode
  
  const [zoom, setZoom] = useState(0.4); // Preview scale
  const [isFullscreen, setIsFullscreen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [svgContentForModal, setSvgContentForModal] = useState('');

  // Zen Mode: Hide cursor on inactivity
  useEffect(() => {
    if (!isZenMode) return;

    let cursorTimer: number;
    const hideCursor = () => {
      document.documentElement.style.cursor = 'none';
    };
    const showCursor = () => {
      document.documentElement.style.cursor = 'default';
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(hideCursor, 3000); // Hide after 3 seconds
    };

    document.documentElement.style.cursor = 'default'; // Ensure visible on mode entry
    showCursor(); // Start timer immediately

    window.addEventListener('mousemove', showCursor);
    window.addEventListener('keydown', showCursor);

    return () => {
      clearTimeout(cursorTimer);
      document.documentElement.style.cursor = 'default'; // Always ensure cursor is restored on unmount or mode change
      window.removeEventListener('mousemove', showCursor);
      window.removeEventListener('keydown', showCursor);
    };
  }, [isZenMode]);

  // Persist state to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      encodeConfigToUrl(config);
    }, 1000); // Debounce URL updates
    return () => clearTimeout(timer);
  }, [config]);

  // Clean initialization URL params (Deep link cleanup)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('preset')) {
      // Clean query params but keep hash if it exists (though usually we load from one or other)
      // For clean experience, we just remove the query param
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []); // Run once on mount

  // Responsive zoom adjustment on mount
  useEffect(() => {
    const updateZoom = () => {
      // Mobile zoom
      if (window.innerWidth < 768) {
        setZoom(0.2); 
      } else {
        setZoom(0.45);
      }
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  // Debounced Variation Generation when config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const vars = generateVariations(config, activeCollection);
      setVariations(vars);
    }, 600); 

    return () => clearTimeout(timer);
  }, [config, activeCollection]);

  const handleApplyPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset && preset.config) {
      setSelectedPresetId(presetId);
      const newConfig = {
        ...config, // Keep current dimensions
        ...preset.config,
        shapes: preset.config.shapes || [],
        baseColor: preset.config.baseColor || config.baseColor,
        // Only update noise if NOT locked
        noise: isGrainLocked ? config.noise : (preset.config.noise ?? config.noise),
        noiseScale: isGrainLocked ? config.noiseScale : (preset.config.noiseScale ?? config.noiseScale),
        animation: { ...(config.animation || {}), ...preset.config.animation },
        vignette: { ...(config.vignette || {}), ...preset.config.vignette }
      };
      setConfig(newConfig);
      // Immediate variation generation
      setVariations(generateVariations(newConfig, activeCollection));
    }
  }, [config, activeCollection, isGrainLocked, setConfig]);

  const handleApplyVariation = useCallback((variantConfig: WallpaperConfig) => {
    setConfig(prevConfig => ({
      ...variantConfig,
      width: prevConfig.width,
      height: prevConfig.height,
      // Preserve locked grain even when applying variation
      noise: isGrainLocked ? prevConfig.noise : variantConfig.noise,
      noiseScale: isGrainLocked ? prevConfig.noiseScale : variantConfig.noiseScale
    }));
  }, [isGrainLocked, setConfig]);

  // Improved Color Logic for Randomization
  const handleRandomize = useCallback(() => {
    setSelectedPresetId('custom-random'); 
    
    const engine = getEngine(activeCollection);
    
    if (engine && engine.randomizer) {
        const randomConfig = engine.randomizer(config, { isGrainLocked });
        setConfig(randomConfig);
        setVariations(generateVariations(randomConfig, activeCollection));
    }
  }, [config, activeCollection, isGrainLocked, setConfig]);

  const handleResize = useCallback((width: number, height: number) => {
    setConfig(prev => ({ ...prev, width, height }));
  }, [setConfig]);

  // Helper to generate filename with readable date
  const generateFilename = useCallback((ext: string) => {
    const prefix = preferences.filenamePrefix || 'AuraWall';
    const collection = activeCollection;
    const isAnimated = config.animation?.enabled;
    const animSuffix = isAnimated ? t('suffix_animated') : '';
    
    // Format: YYYY-MM-DD_HH-mm
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
    
    return `${prefix}-${collection}${animSuffix}-${dateStr}.${ext}`;
  }, [preferences.filenamePrefix, activeCollection, config.animation, t]);

  // New function for direct SVG file download
  const handleDownloadSvgFile = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generateFilename('svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateFilename]);

  // Function to capture SVG content and show the modal
  const handleShowCodeModal = useCallback(() => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    setSvgContentForModal(svgData);
    setShowCodeModal(true);
  }, []);

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, config.width, config.height);
      
      const format = preferences.format === 'png' ? 'image/png' : 'image/jpeg';
      // PNG ignores quality argument in standard toDataURL, but we pass it anyway.
      // For JPG, it expects 0-1.
      const quality = preferences.format === 'png' ? 1 : preferences.quality;
      
      const dataUrl = canvas.toDataURL(format, quality);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = generateFilename(preferences.format);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [config.width, config.height, preferences, generateFilename]);

  return (
    <main className="flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">
      
      {/* Preview Area */}
      <div className="md:order-2 flex-1 relative bg-[#09090b] overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 order-1 h-[45vh] md:h-auto border-b md:border-b-0 border-white/10">
        
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md rounded-lg p-1.5 md:p-2 border border-white/5 z-10 shadow-lg">
          <button onClick={() => setZoom(z => Math.max(0.1, z - 0.05))} className="p-2 md:p-3 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors" aria-label={t('zoom_out')}>
            <ZoomOut size={20} />
          </button>
          <span className="text-[10px] md:text-xs font-mono w-8 md:w-12 text-center text-zinc-300">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.05))} className="p-2 md:p-3 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors" aria-label={t('zoom_in')}>
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-3 md:h-4 bg-white/10 mx-1"></div>
           <button onClick={() => setIsFullscreen(true)} className="p-2 md:p-3 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors" title={t('full_screen_preview')} aria-label={t('full_screen_preview')}>
            <Maximize size={20} />
          </button>
          <button onClick={() => setIsZenMode(true)} className="p-2 md:p-3 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors" title="Modo Zen" aria-label="Modo Zen">
            <Play size={20} />
          </button>
        </div>

        <div 
          className="relative shadow-2xl shadow-black/50 transition-transform duration-200 ease-out origin-center"
          style={{ width: config.width, height: config.height, transform: `scale(${zoom})` }}
        >
          <WallpaperRenderer ref={svgRef} config={config} className="w-full h-full block" />
        </div>

        <div className="hidden md:block absolute bottom-6 left-6 text-zinc-500 text-xs font-mono">
          {config.width}x{config.height}px
        </div>
      </div>
      
      {/* Conditionally render Controls Sidebar and Modals */}
      {!isZenMode && (
        <>
          {/* Controls Sidebar */}
          <div className="md:order-1 h-[55vh] md:h-full w-full md:w-96 flex-shrink-0 order-2">
            <React.Suspense fallback={<div className="w-full h-full bg-[#18181b] animate-pulse" />}>
              <Controls 
                config={config} 
                variations={variations}
                preferences={preferences}
                setPreferences={setPreferences}
                selectedPresetId={selectedPresetId}
                activeCollection={activeCollection}
                setActiveCollection={setActiveCollection}
                enabledEngines={enabledEngines}
                setEnabledEngines={setEnabledEngines}
                setConfig={setConfig}
                undo={undo}
                redo={redo}
                canUndo={canUndo}
                canRedo={canRedo} 
                favorites={favorites}
                isFavorite={isCurrentConfigFavorite}
                toggleFavorite={handleToggleFavorite}
                addFavorite={handleAddFavorite}
                removeFavorite={removeFavorite}
                onDownload={handleDownload}
                onDownloadSvgFile={handleDownloadSvgFile} 
                onShowSVGModal={handleShowCodeModal} 
                onApplyPreset={handleApplyPreset}
                onApplyVariation={handleApplyVariation}
                onResize={handleResize}
                onRandomize={handleRandomize}
                isGrainLocked={isGrainLocked}
                onToggleGrainLock={() => setIsGrainLocked(prev => !prev)}
              />
            </React.Suspense>
          </div>

          {/* Fullscreen Modal */}
          {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
              <button 
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-4 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md z-50 transition-colors border border-white/10"
              >
                <X size={24} />
              </button>
              <div className="w-full h-full p-0 flex items-center justify-center bg-zinc-950">
                 <WallpaperRenderer 
                  config={config}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '100vh', maxWidth: '100vw' }} 
                />
              </div>
            </div>
          )}

          {/* Code Export Modal */}
          {showCodeModal && (
            <React.Suspense fallback={null}>
              <CodeExportModal 
                svgContent={svgContentForModal} 
                config={config}
                onClose={() => setShowCodeModal(false)} 
              />
            </React.Suspense>
          )}
        </>
      )}

      {/* Zen Mode Exit Button */}
      {isZenMode && (
        <button 
          onClick={() => setIsZenMode(false)}
          className="fixed top-6 right-6 z-50 p-3 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-opacity duration-300 opacity-0 hover:opacity-100"
          title="Sair do Modo Zen"
        >
          <X size={24} />
        </button>
      )}
    </main>
  );
}