
import { ExportSize, Preset, WallpaperConfig, AppPreferences } from './types';

export const EXPORT_SIZES: ExportSize[] = [
  { name: 'iPhone 16/15 Pro', width: 1179, height: 2556 },
  { name: 'iPhone 16/15 Plus', width: 1290, height: 2796 },
  { name: 'Android Common', width: 1080, height: 2400 },
  { name: '4K Desktop', width: 3840, height: 2160 },
  { name: 'Full HD Desktop', width: 1920, height: 1080 },
  { name: 'HD+ Desktop/Laptop', width: 1440, height: 900 },
  { name: 'Macbook Air/Pro', width: 2560, height: 1600 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'iPad / Tablet', width: 2048, height: 2732 },
];

export const DEFAULT_PREFERENCES: AppPreferences = {
  format: 'jpg',
  quality: 0.9,
  filenamePrefix: 'AuraWall',
};

export const DEFAULT_ANIMATION = {
  enabled: false,
  speed: 5,
  flow: 2,
  pulse: 2,
  rotate: 2,
  noiseAnim: 0,
  colorCycle: false,
  colorCycleSpeed: 5
};

export const DEFAULT_VIGNETTE = {
  enabled: false,
  color: '#000000',
  intensity: 0.6,
  size: 40,
  offsetX: 0,
  offsetY: 0,
  inverted: false,
  shapeX: 50, // Default to circular
  shapeY: 50  // Default to circular
};

export const DEFAULT_CONFIG: WallpaperConfig = {
  width: 1920,
  height: 1080,
  noise: 25,
  noiseScale: 1.5,
  baseColor: '#0f0c29',
  shapes: [
    { id: 'def1', type: 'circle', x: 80, y: 20, size: 100, color: '#ff00cc', opacity: 0.4, blur: 100, blendMode: 'screen' },
    { id: 'def2', type: 'circle', x: 20, y: 80, size: 120, color: '#333399', opacity: 0.6, blur: 120, blendMode: 'screen' },
    { id: 'def3', type: 'circle', x: 50, y: 50, size: 80, color: '#00d4ff', opacity: 0.3, blur: 80, blendMode: 'overlay' },
  ],
  animation: DEFAULT_ANIMATION,
  vignette: DEFAULT_VIGNETTE
};

export const PRESETS: Preset[] = [
  // ==========================================
  // COLLECTION: BOREAL (Original Ethereal Style)
  // ==========================================
  
  // --- AURA & ETHEREAL ---
  {
    id: 'angel-aura',
    name: 'Angel Aura',
    collection: 'boreal',
    category: 'Aura',
    thumbnail: 'linear-gradient(135deg, #fdf4ff 0%, #d8b4fe 100%)',
    config: {
      baseColor: '#faf5ff', 
      noise: 22,
      noiseScale: 1.2,
      shapes: [
        { id: 'aa1', type: 'circle', x: 20, y: 20, size: 120, color: '#d8b4fe', opacity: 0.6, blur: 100, blendMode: 'multiply' }, 
        { id: 'aa2', type: 'circle', x: 80, y: 80, size: 140, color: '#f9a8d4', opacity: 0.5, blur: 120, blendMode: 'multiply' }, 
        { id: 'aa3', type: 'circle', x: 50, y: 50, size: 90, color: '#bae6fd', opacity: 0.7, blur: 80, blendMode: 'multiply' }, 
        { id: 'aa4', type: 'circle', x: 50, y: 40, size: 60, color: '#ffffff', opacity: 0.9, blur: 60, blendMode: 'overlay' }, 
      ]
    }
  },
  {
    id: 'soul-glow',
    name: 'Soul Glow',
    collection: 'boreal',
    category: 'Aura',
    thumbnail: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
    config: {
      baseColor: '#0f0518', 
      noise: 35,
      noiseScale: 2,
      shapes: [
        { id: 'sg1', type: 'circle', x: 50, y: 50, size: 110, color: '#7c3aed', opacity: 0.5, blur: 100, blendMode: 'screen' }, 
        { id: 'sg2', type: 'circle', x: 50, y: 50, size: 70, color: '#db2777', opacity: 0.6, blur: 80, blendMode: 'screen' }, 
        { id: 'sg3', type: 'circle', x: 50, y: 50, size: 40, color: '#fcd34d', opacity: 0.8, blur: 40, blendMode: 'overlay' }, 
      ]
    }
  },

  // --- SOFT & PASTEL ---
  {
    id: 'cotton-candy',
    name: 'Daydream',
    collection: 'boreal',
    category: 'Soft',
    thumbnail: 'linear-gradient(135deg, #fff1f2 0%, #fda4af 100%)',
    config: {
      baseColor: '#fff1f2', 
      noise: 18,
      noiseScale: 1.0,
      shapes: [
        { id: 'cc1', type: 'circle', x: 10, y: 10, size: 130, color: '#fecdd3', opacity: 0.8, blur: 120, blendMode: 'multiply' },
        { id: 'cc2', type: 'circle', x: 90, y: 90, size: 120, color: '#bfdbfe', opacity: 0.7, blur: 100, blendMode: 'multiply' },
        { id: 'cc3', type: 'circle', x: 50, y: 50, size: 80, color: '#fef3c7', opacity: 0.6, blur: 80, blendMode: 'multiply' },
      ]
    }
  },
  {
    id: 'dune-haze',
    name: 'Dune Haze',
    collection: 'boreal',
    category: 'Soft',
    thumbnail: 'linear-gradient(135deg, #f5f5f4 0%, #d6d3d1 100%)',
    config: {
      baseColor: '#e7e5e4', 
      noise: 40,
      noiseScale: 1.8,
      shapes: [
        { id: 'dh1', type: 'circle', x: 50, y: 20, size: 150, color: '#a8a29e', opacity: 0.4, blur: 120, blendMode: 'multiply' },
        { id: 'dh2', type: 'circle', x: 50, y: 120, size: 100, color: '#fbbf24', opacity: 0.3, blur: 100, blendMode: 'overlay' }, 
        { id: 'dh3', type: 'circle', x: 10, y: 60, size: 80, color: '#d1d5db', opacity: 0.5, blur: 60, blendMode: 'multiply' },
      ]
    }
  },

  // --- DARK & MOODY ---
  {
    id: 'midnight-oil',
    name: 'Midnight',
    collection: 'boreal',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)',
    config: {
      baseColor: '#020617', 
      noise: 45,
      noiseScale: 2.5,
      shapes: [
        { id: 'mo1', type: 'circle', x: 10, y: 90, size: 130, color: '#1d4ed8', opacity: 0.5, blur: 120, blendMode: 'screen' }, 
        { id: 'mo2', type: 'circle', x: 90, y: 10, size: 100, color: '#be185d', opacity: 0.4, blur: 100, blendMode: 'screen' }, 
        { id: 'mo3', type: 'circle', x: 50, y: 50, size: 60, color: '#ffffff', opacity: 0.1, blur: 50, blendMode: 'overlay' }, 
      ]
    }
  },

  // ==========================================
  // COLLECTION: CHROMA (New Liquid/Acid Style)
  // ==========================================
  
  {
    id: 'liquid-metal',
    name: 'Liquid Metal',
    collection: 'chroma',
    category: 'Liquid',
    thumbnail: 'linear-gradient(135deg, #000000 0%, #333333 50%, #ffffff 100%)',
    config: {
      baseColor: '#0a0a0a',
      noise: 40,
      noiseScale: 3,
      shapes: [
        { id: 'lm1', type: 'circle', x: 40, y: 40, size: 90, color: '#ffffff', opacity: 0.8, blur: 30, blendMode: 'exclusion' },
        { id: 'lm2', type: 'circle', x: 60, y: 60, size: 100, color: '#cccccc', opacity: 0.7, blur: 40, blendMode: 'difference' },
        { id: 'lm3', type: 'circle', x: 50, y: 50, size: 120, color: '#333333', opacity: 0.5, blur: 60, blendMode: 'overlay' },
      ]
    }
  },
  {
    id: 'acid-rain',
    name: 'Acid Rain',
    collection: 'chroma',
    category: 'Acid',
    thumbnail: 'linear-gradient(135deg, #000000 0%, #00ff00 100%)',
    config: {
      baseColor: '#050505',
      noise: 50,
      noiseScale: 4,
      shapes: [
        { id: 'ar1', type: 'circle', x: 30, y: 30, size: 110, color: '#39ff14', opacity: 0.6, blur: 20, blendMode: 'difference' }, // Neon Green
        { id: 'ar2', type: 'circle', x: 70, y: 70, size: 100, color: '#ff00ff', opacity: 0.6, blur: 30, blendMode: 'difference' }, // Magenta
        { id: 'ar3', type: 'circle', x: 50, y: 50, size: 150, color: '#0000ff', opacity: 0.4, blur: 80, blendMode: 'exclusion' },
      ]
    }
  },
  {
    id: 'thermal-vision',
    name: 'Thermal',
    collection: 'chroma',
    category: 'Acid',
    thumbnail: 'linear-gradient(135deg, #000080 0%, #ff0000 50%, #ffff00 100%)',
    config: {
      baseColor: '#000020', // Dark Blue
      noise: 30,
      noiseScale: 2,
      shapes: [
        { id: 'tv1', type: 'circle', x: 50, y: 50, size: 120, color: '#ff0000', opacity: 0.8, blur: 50, blendMode: 'screen' },
        { id: 'tv2', type: 'circle', x: 50, y: 50, size: 80, color: '#ffff00', opacity: 0.8, blur: 30, blendMode: 'overlay' },
        { id: 'tv3', type: 'circle', x: 50, y: 20, size: 100, color: '#0000ff', opacity: 0.6, blur: 60, blendMode: 'difference' },
      ]
    }
  },
  {
    id: 'oil-slick',
    name: 'Oil Slick',
    collection: 'chroma',
    category: 'Liquid',
    thumbnail: 'linear-gradient(135deg, #1a1a1a 0%, #555555 100%)',
    config: {
      baseColor: '#121212',
      noise: 15,
      noiseScale: 1,
      shapes: [
        { id: 'os1', type: 'circle', x: 20, y: 80, size: 130, color: '#00ffff', opacity: 0.5, blur: 40, blendMode: 'color-dodge' },
        { id: 'os2', type: 'circle', x: 80, y: 20, size: 130, color: '#ff00aa', opacity: 0.5, blur: 40, blendMode: 'color-dodge' },
        { id: 'os3', type: 'circle', x: 50, y: 50, size: 100, color: '#444444', opacity: 0.8, blur: 80, blendMode: 'exclusion' },
      ]
    }
  },
  {
    id: 'deep-void',
    name: 'Deep Void',
    collection: 'chroma',
    category: 'Liquid',
    thumbnail: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
    config: {
      baseColor: '#000000',
      noise: 60,
      noiseScale: 5,
      shapes: [
        { id: 'dv1', type: 'circle', x: 50, y: 50, size: 180, color: '#1a1a1a', opacity: 1, blur: 100, blendMode: 'normal' },
        { id: 'dv2', type: 'circle', x: 50, y: 50, size: 120, color: '#ffffff', opacity: 0.8, blur: 40, blendMode: 'difference' },
        { id: 'dv3', type: 'circle', x: 50, y: 50, size: 90, color: '#808080', opacity: 0.5, blur: 20, blendMode: 'exclusion' },
      ]
    }
  }
];
