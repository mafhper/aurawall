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

  // ==========================================
  // COLLECTION: LAVA (Psychedelic/Warm)
  // ==========================================
  {
    id: 'magma-lamp',
    name: 'Magma Lamp',
    collection: 'lava',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #4a0404 0%, #ff4500 100%)',
    config: {
      baseColor: '#2e0202',
      noise: 15,
      shapes: [
        { id: 'lava1', type: 'blob', x: 50, y: 80, size: 90, color: '#ff4500', opacity: 0.8, blur: 50, blendMode: 'screen', complexity: 4 },
        { id: 'lava2', type: 'blob', x: 50, y: 30, size: 70, color: '#ff8c00', opacity: 0.7, blur: 40, blendMode: 'screen', complexity: 3 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 4, speed: 2 }
    }
  },
  {
    id: 'toxic-waste',
    name: 'Toxic Waste',
    collection: 'lava',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #0f3d0f 0%, #00ff00 100%)',
    config: {
      baseColor: '#051a05',
      noise: 20,
      shapes: [
        { id: 'tox1', type: 'blob', x: 30, y: 60, size: 100, color: '#00ff00', opacity: 0.6, blur: 60, blendMode: 'hard-light', complexity: 5 },
        { id: 'tox2', type: 'blob', x: 70, y: 40, size: 80, color: '#adff2f', opacity: 0.5, blur: 50, blendMode: 'overlay', complexity: 4 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 6, speed: 3 }
    }
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    collection: 'lava',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #2f0600 0%, #ff7a00 45%, #ffe066 100%)',
    config: {
      baseColor: '#220500',
      noise: 16,
      shapes: [
        { id: 'sf1', type: 'blob', x: 34, y: 66, size: 86, color: '#ff6a00', opacity: 0.76, blur: 48, blendMode: 'screen', complexity: 4 },
        { id: 'sf2', type: 'blob', x: 62, y: 36, size: 74, color: '#ffb000', opacity: 0.62, blur: 42, blendMode: 'screen', complexity: 4 },
        { id: 'sf3', type: 'blob', x: 78, y: 74, size: 66, color: '#ffe066', opacity: 0.42, blur: 36, blendMode: 'overlay', complexity: 3 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 5, speed: 2.2 }
    }
  },

  // ==========================================
  // COLLECTION: MIDNIGHT (Space/Cosmic)
  // ==========================================
  {
    id: 'deep-space',
    name: 'Deep Space',
    collection: 'midnight',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #02030b 0%, #0d1534 58%, #2d3f6d 100%)',
    config: {
      baseColor: '#02030b',
      noise: 16,
      noiseScale: 1.2,
      shapes: [
        { id: 'ds1', type: 'blob', x: 38, y: 48, size: 168, color: '#173b8a', opacity: 0.18, blur: 132, blendMode: 'screen', complexity: 7, rotation: -18, scaleX: 2.8, scaleY: 0.54 },
        { id: 'ds2', type: 'rect', x: 54, y: 38, size: 108, color: '#090d18', opacity: 0.28, blur: 28, blendMode: 'multiply', rotation: -10, scaleX: 3.6, scaleY: 0.16 },
        { id: 'ds3', type: 'rect', x: 46, y: 60, size: 84, color: '#10172d', opacity: 0.16, blur: 22, blendMode: 'multiply', rotation: 8, scaleX: 2.4, scaleY: 0.12 },
        { id: 'ds4', type: 'circle', x: 22, y: 20, size: 1.2, color: '#ffffff', opacity: 0.62, blur: 0.2, blendMode: 'normal' },
        { id: 'ds5', type: 'circle', x: 72, y: 22, size: 1.4, color: '#d8e7ff', opacity: 0.58, blur: 0.2, blendMode: 'normal' },
        { id: 'ds6', type: 'circle', x: 32, y: 72, size: 1.1, color: '#ffffff', opacity: 0.46, blur: 0, blendMode: 'normal' },
        { id: 'ds7', type: 'circle', x: 76, y: 78, size: 1.3, color: '#e6efff', opacity: 0.44, blur: 0, blendMode: 'normal' },
      ]
    }
  },
  {
    id: 'ion-trail',
    name: 'Ion Trail',
    collection: 'midnight',
    category: 'Aura',
    thumbnail: 'linear-gradient(135deg, #040814 0%, #1857d6 48%, #a8ebff 100%)',
    config: {
      baseColor: '#030713',
      noise: 14,
      noiseScale: 1.1,
      shapes: [
        { id: 'it1', type: 'blob', x: 36, y: 42, size: 154, color: '#2f72ff', opacity: 0.26, blur: 86, blendMode: 'screen', complexity: 6, rotation: -28, scaleX: 3.6, scaleY: 0.24 },
        { id: 'it2', type: 'blob', x: 62, y: 54, size: 138, color: '#98eaff', opacity: 0.18, blur: 58, blendMode: 'screen', complexity: 5, rotation: -28, scaleX: 3.1, scaleY: 0.18 },
        { id: 'it3', type: 'rect', x: 54, y: 44, size: 98, color: '#e4f6ff', opacity: 0.1, blur: 10, blendMode: 'screen', rotation: -30, scaleX: 0.12, scaleY: 3.2 },
        { id: 'it4', type: 'rect', x: 42, y: 62, size: 76, color: '#0b1020', opacity: 0.24, blur: 20, blendMode: 'multiply', rotation: -28, scaleX: 3.4, scaleY: 0.14 },
        { id: 'it5', type: 'circle', x: 80, y: 18, size: 1.4, color: '#ffffff', opacity: 0.5, blur: 0.2, blendMode: 'normal' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 2, speed: 0.7, pulse: 1, rotate: 1 }
    }
  },
  {
    id: 'red-shift',
    name: 'Red Shift',
    collection: 'midnight',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #12060d 0%, #8d1830 45%, #ffb26b 100%)',
    config: {
      baseColor: '#080206',
      noise: 18,
      noiseScale: 1.35,
      shapes: [
        { id: 'rs1', type: 'blob', x: 38, y: 48, size: 160, color: '#9f1638', opacity: 0.28, blur: 90, blendMode: 'screen', complexity: 7, rotation: -18, scaleX: 2.8, scaleY: 0.5 },
        { id: 'rs2', type: 'blob', x: 72, y: 40, size: 98, color: '#ffb46d', opacity: 0.2, blur: 58, blendMode: 'screen', complexity: 6, rotation: 24, scaleX: 1.3, scaleY: 1.04 },
        { id: 'rs3', type: 'rect', x: 52, y: 46, size: 88, color: '#2b0914', opacity: 0.22, blur: 18, blendMode: 'multiply', rotation: 18, scaleX: 3.2, scaleY: 0.14 },
        { id: 'rs4', type: 'circle', x: 62, y: 52, size: 26, color: '#ffd28a', opacity: 0.12, blur: 18, blendMode: 'screen' },
        { id: 'rs5', type: 'circle', x: 18, y: 26, size: 1.3, color: '#fff8ea', opacity: 0.4, blur: 0, blendMode: 'normal' },
      ]
    }
  },

  // ==========================================
  // COLLECTION: GEOMETRICA (Bauhaus/Grid)
  // ==========================================
  {
    id: 'bauhaus-one',
    name: 'Bauhaus I',
    collection: 'geometrica',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #f0f0f0 0%, #e4002b 52%, #1244a4 100%)',
    config: {
      baseColor: '#f0f0f0',
      noise: 8,
      shapes: [
        { id: 'b1', type: 'rect', x: 32, y: 36, size: 34, color: '#e4002b', opacity: 0.96, blur: 0, blendMode: 'multiply', scaleX: 2.2, scaleY: 0.68 },
        { id: 'b2', type: 'circle', x: 72, y: 68, size: 30, color: '#1244a4', opacity: 0.94, blur: 0, blendMode: 'multiply' },
        { id: 'b3', type: 'rect', x: 74, y: 24, size: 18, color: '#111111', opacity: 0.92, blur: 0, blendMode: 'multiply', rotation: 90, scaleX: 2.4, scaleY: 0.36 },
        { id: 'b4', type: 'circle', x: 22, y: 78, size: 12, color: '#f3a200', opacity: 0.96, blur: 0, blendMode: 'normal' },
        { id: 'b5', type: 'rect', x: 52, y: 56, size: 54, color: '#f4efe6', opacity: 0.98, blur: 0, blendMode: 'normal', scaleX: 2.8, scaleY: 0.12 },
      ]
    }
  },
  {
    id: 'grid-rhythm',
    name: 'Grid Rhythm',
    collection: 'geometrica',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #f3efe5 0%, #f3a200 36%, #1244a4 100%)',
    config: {
      baseColor: '#f3efe5',
      noise: 8,
      shapes: [
        { id: 'gr1', type: 'rect', x: 20, y: 24, size: 16, color: '#111111', opacity: 0.92, blur: 0, blendMode: 'multiply', rotation: 90, scaleX: 2.8, scaleY: 0.18 },
        { id: 'gr2', type: 'rect', x: 42, y: 24, size: 18, color: '#1244a4', opacity: 0.94, blur: 0, blendMode: 'multiply', scaleX: 1.2, scaleY: 0.7 },
        { id: 'gr3', type: 'rect', x: 64, y: 24, size: 18, color: '#f3a200', opacity: 0.96, blur: 0, blendMode: 'normal', scaleX: 1.2, scaleY: 0.7 },
        { id: 'gr4', type: 'rect', x: 80, y: 24, size: 14, color: '#111111', opacity: 0.9, blur: 0, blendMode: 'multiply', scaleX: 0.9, scaleY: 0.7 },
        { id: 'gr5', type: 'rect', x: 20, y: 52, size: 16, color: '#e4002b', opacity: 0.96, blur: 0, blendMode: 'multiply', scaleX: 1.4, scaleY: 0.7 },
        { id: 'gr6', type: 'rect', x: 42, y: 52, size: 18, color: '#f4efe6', opacity: 0.98, blur: 0, blendMode: 'normal', scaleX: 1.2, scaleY: 0.7 },
        { id: 'gr7', type: 'circle', x: 68, y: 54, size: 16, color: '#1244a4', opacity: 0.94, blur: 0, blendMode: 'multiply' },
        { id: 'gr8', type: 'rect', x: 28, y: 82, size: 52, color: '#111111', opacity: 0.9, blur: 0, blendMode: 'multiply', scaleX: 2.8, scaleY: 0.14 },
      ]
    }
  },
  {
    id: 'nocturne-grid',
    name: 'Nocturne Grid',
    collection: 'geometrica',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #090909 0%, #132b7a 55%, #f3a200 100%)',
    config: {
      baseColor: '#121212',
      noise: 9,
      shapes: [
        { id: 'ng1', type: 'rect', x: 36, y: 32, size: 26, color: '#f3efe5', opacity: 0.94, blur: 0, blendMode: 'screen', scaleX: 2.2, scaleY: 0.28 },
        { id: 'ng2', type: 'circle', x: 72, y: 62, size: 30, color: '#1244a4', opacity: 0.9, blur: 0, blendMode: 'screen' },
        { id: 'ng3', type: 'rect', x: 22, y: 74, size: 18, color: '#e4002b', opacity: 0.96, blur: 0, blendMode: 'screen', rotation: 90, scaleX: 2.2, scaleY: 0.34 },
        { id: 'ng4', type: 'circle', x: 64, y: 22, size: 12, color: '#f3a200', opacity: 0.96, blur: 0, blendMode: 'screen' },
      ]
    }
  },

  // ==========================================
  // COLLECTION: GLITCH (Cyber/Chaos)
  // ==========================================
  {
    id: 'cyber-attack',
    name: 'Cyber Attack',
    collection: 'glitch',
    category: 'Neon',
    thumbnail: 'linear-gradient(135deg, #040404 0%, #18060f 36%, #2d6bff 100%)',
    config: {
      baseColor: '#040404',
      noise: 38,
      noiseScale: 2.8,
      shapes: [
        { id: 'ca1', type: 'rect', x: 44, y: 24, size: 106, color: '#ff315c', opacity: 0.26, blur: 0.2, blendMode: 'screen', rotation: -6, scaleX: 5.6, scaleY: 0.034 },
        { id: 'ca2', type: 'rect', x: 48, y: 27, size: 106, color: '#00f08a', opacity: 0.18, blur: 0.15, blendMode: 'screen', rotation: -4, scaleX: 5.3, scaleY: 0.022 },
        { id: 'ca3', type: 'rect', x: 53, y: 30, size: 106, color: '#2d6bff', opacity: 0.24, blur: 0.18, blendMode: 'screen', rotation: -2, scaleX: 5.4, scaleY: 0.028 },
        { id: 'ca4', type: 'rect', x: 38, y: 50, size: 96, color: '#0d0d0d', opacity: 0.78, blur: 0, blendMode: 'normal', rotation: 10, scaleX: 1.4, scaleY: 0.5 },
        { id: 'ca5', type: 'rect', x: 66, y: 68, size: 34, color: '#ff315c', opacity: 0.12, blur: 0.15, blendMode: 'screen', rotation: 18, scaleX: 3.2, scaleY: 0.24 },
        { id: 'ca6', type: 'rect', x: 22, y: 78, size: 18, color: '#f4f4f4', opacity: 0.2, blur: 0, blendMode: 'difference', rotation: 22, scaleX: 2.8, scaleY: 0.14 },
        { id: 'ca7', type: 'rect', x: 78, y: 18, size: 12, color: '#ffffff', opacity: 0.14, blur: 0, blendMode: 'screen', rotation: -20, scaleX: 2.2, scaleY: 0.08 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 1.1, speed: 1.8, pulse: 0, rotate: 0, noiseAnim: 8 }
    }
  },
  {
    id: 'system-error',
    name: 'System Error',
    collection: 'glitch',
    category: 'Neon',
    thumbnail: 'linear-gradient(135deg, #09030d 0%, #171222 42%, #ff4d86 100%)',
    config: {
      baseColor: '#09030d',
      noise: 42,
      noiseScale: 3,
      shapes: [
        { id: 'se1', type: 'rect', x: 26, y: 28, size: 34, color: '#0f0f10', opacity: 0.92, blur: 0, blendMode: 'normal', rotation: 0, scaleX: 1.8, scaleY: 1.2 },
        { id: 'se2', type: 'rect', x: 29, y: 30, size: 34, color: '#6f67ff', opacity: 0.12, blur: 0.15, blendMode: 'screen', rotation: 0, scaleX: 1.8, scaleY: 1.2 },
        { id: 'se3', type: 'rect', x: 70, y: 28, size: 26, color: '#0f0f10', opacity: 0.9, blur: 0, blendMode: 'normal', rotation: 0, scaleX: 1.4, scaleY: 0.8 },
        { id: 'se4', type: 'rect', x: 66, y: 54, size: 42, color: '#0f0f10', opacity: 0.9, blur: 0, blendMode: 'normal', rotation: 0, scaleX: 1.9, scaleY: 1.08 },
        { id: 'se5', type: 'rect', x: 64, y: 58, size: 42, color: '#ff4d86', opacity: 0.12, blur: 0.1, blendMode: 'screen', rotation: 0, scaleX: 1.9, scaleY: 1.08 },
        { id: 'se6', type: 'rect', x: 50, y: 16, size: 66, color: '#66ffd1', opacity: 0.12, blur: 0.15, blendMode: 'screen', rotation: 0, scaleX: 3.8, scaleY: 0.02 },
        { id: 'se7', type: 'rect', x: 50, y: 82, size: 88, color: '#6f67ff', opacity: 0.14, blur: 0.15, blendMode: 'screen', rotation: 0, scaleX: 4.4, scaleY: 0.026 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 1, speed: 1.6, pulse: 0, rotate: 0, noiseAnim: 9 }
    }
  },
  {
    id: 'signal-loss',
    name: 'Signal Loss',
    collection: 'glitch',
    category: 'Neon',
    thumbnail: 'linear-gradient(135deg, #030303 0%, #161616 52%, #7cffe4 100%)',
    config: {
      baseColor: '#030303',
      noise: 40,
      noiseScale: 2.9,
      shapes: [
        { id: 'sl1', type: 'rect', x: 50, y: 20, size: 118, color: '#e9e9e9', opacity: 0.08, blur: 0.1, blendMode: 'screen', rotation: 0, scaleX: 5.9, scaleY: 0.018 },
        { id: 'sl2', type: 'rect', x: 50, y: 36, size: 118, color: '#0a0a0a', opacity: 0.92, blur: 0, blendMode: 'normal', rotation: 0, scaleX: 5.8, scaleY: 0.12 },
        { id: 'sl3', type: 'rect', x: 50, y: 50, size: 118, color: '#7cffe4', opacity: 0.14, blur: 0.15, blendMode: 'screen', rotation: 0, scaleX: 5.5, scaleY: 0.018 },
        { id: 'sl4', type: 'rect', x: 50, y: 62, size: 118, color: '#121212', opacity: 0.84, blur: 0, blendMode: 'normal', rotation: 0, scaleX: 5.7, scaleY: 0.09 },
        { id: 'sl5', type: 'rect', x: 50, y: 76, size: 118, color: '#f2f2f2', opacity: 0.07, blur: 0.1, blendMode: 'screen', rotation: 0, scaleX: 5.8, scaleY: 0.016 },
        { id: 'sl6', type: 'rect', x: 26, y: 52, size: 16, color: '#f4f4f4', opacity: 0.18, blur: 0, blendMode: 'difference', rotation: 0, scaleX: 1.3, scaleY: 0.12 },
        { id: 'sl7', type: 'rect', x: 74, y: 52, size: 18, color: '#f4f4f4', opacity: 0.14, blur: 0, blendMode: 'difference', rotation: 0, scaleX: 1.5, scaleY: 0.1 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 1, speed: 1.7, pulse: 0, rotate: 0, noiseAnim: 8 }
    }
  },

  // ==========================================
  // COLLECTION: SAKURA (Soft/Floral)
  // ==========================================
  {
    id: 'hanami-season',
    name: 'Hanami',
    collection: 'sakura',
    category: 'Soft',
    thumbnail: 'linear-gradient(135deg, #fff7f9 0%, #f7cad9 55%, #e7b8c9 100%)',
    config: {
      baseColor: '#fff7f9',
      noise: 12,
      shapes: [
        { id: 'han1', type: 'blob', x: 18, y: 18, size: 16, color: '#f2b8cb', opacity: 0.5, blur: 4, blendMode: 'multiply', complexity: 3, rotation: -22, scaleX: 2.4, scaleY: 0.28 },
        { id: 'han2', type: 'blob', x: 34, y: 24, size: 18, color: '#d88ca8', opacity: 0.56, blur: 4, blendMode: 'multiply', complexity: 3, rotation: -12, scaleX: 2.6, scaleY: 0.26 },
        { id: 'han3', type: 'blob', x: 52, y: 20, size: 17, color: '#e7a6ba', opacity: 0.48, blur: 4, blendMode: 'multiply', complexity: 3, rotation: -18, scaleX: 2.5, scaleY: 0.24 },
        { id: 'han4', type: 'blob', x: 70, y: 28, size: 16, color: '#c77d97', opacity: 0.5, blur: 4, blendMode: 'multiply', complexity: 3, rotation: -8, scaleX: 2.7, scaleY: 0.24 },
        { id: 'han5', type: 'blob', x: 28, y: 56, size: 14, color: '#f5c7d7', opacity: 0.44, blur: 5, blendMode: 'multiply', complexity: 3, rotation: -30, scaleX: 2.2, scaleY: 0.3 },
        { id: 'han6', type: 'blob', x: 62, y: 64, size: 13, color: '#efb3c4', opacity: 0.46, blur: 5, blendMode: 'multiply', complexity: 3, rotation: -16, scaleX: 2.1, scaleY: 0.3 },
        { id: 'han7', type: 'circle', x: 72, y: 26, size: 26, color: '#fff5f8', opacity: 0.18, blur: 24, blendMode: 'overlay' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 4.5, speed: 0.8, rotate: 1.2 }
    }
  },
  {
    id: 'night-bloom',
    name: 'Night Bloom',
    collection: 'sakura',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #2a0a16 0%, #be185d 100%)',
    config: {
      baseColor: '#2a0a16',
      noise: 20,
      shapes: [
        { id: 'nb1', type: 'blob', x: 50, y: 50, size: 36, color: '#be185d', opacity: 0.62, blur: 20, blendMode: 'screen', complexity: 4, rotation: -14, scaleX: 1.9, scaleY: 0.7 },
        { id: 'nb2', type: 'circle', x: 50, y: 50, size: 20, color: '#fce7f3', opacity: 0.9, blur: 10, blendMode: 'screen' },
        { id: 'nb3', type: 'blob', x: 32, y: 38, size: 22, color: '#fb7185', opacity: 0.54, blur: 10, blendMode: 'screen', complexity: 3, rotation: 18, scaleX: 1.8, scaleY: 0.62 },
      ]
    }
  },
  {
    id: 'blush-breeze',
    name: 'Blush Breeze',
    collection: 'sakura',
    category: 'Soft',
    thumbnail: 'linear-gradient(135deg, #fff7ed 0%, #fecdd3 45%, #fce7f3 100%)',
    config: {
      baseColor: '#fff7ed',
      noise: 12,
      shapes: [
        { id: 'bb1', type: 'blob', x: 26, y: 34, size: 18, color: '#fbcfe8', opacity: 0.74, blur: 4, blendMode: 'multiply', complexity: 3, rotation: -10, scaleX: 1.9, scaleY: 0.68 },
        { id: 'bb2', type: 'blob', x: 62, y: 50, size: 20, color: '#fecdd3', opacity: 0.72, blur: 5, blendMode: 'multiply', complexity: 3, rotation: 16, scaleX: 2, scaleY: 0.66 },
        { id: 'bb3', type: 'blob', x: 78, y: 26, size: 14, color: '#fda4af', opacity: 0.64, blur: 4, blendMode: 'multiply', complexity: 3, rotation: 24, scaleX: 1.7, scaleY: 0.7 },
      ]
    }
  },

  // ==========================================
  // COLLECTION: EMBER (Fire/Warm)
  // ==========================================
  {
    id: 'campfire-cozy',
    name: 'Campfire',
    collection: 'ember',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #100502 0%, #ea580c 100%)',
    config: {
      baseColor: '#100502',
      noise: 30,
      shapes: [
        { id: 'cf1', type: 'blob', x: 50, y: 38, size: 114, color: '#3b211b', opacity: 0.3, blur: 92, blendMode: 'soft-light', complexity: 6, rotation: -8, scaleX: 1.4, scaleY: 1.1 },
        { id: 'cf2', type: 'rect', x: 50, y: 84, size: 72, color: '#7a2612', opacity: 0.3, blur: 20, blendMode: 'screen', rotation: 2, scaleX: 3.2, scaleY: 0.24 },
        { id: 'cf3', type: 'blob', x: 50, y: 68, size: 24, color: '#ea580c', opacity: 0.42, blur: 8, blendMode: 'screen', complexity: 5, rotation: 0, scaleX: 0.76, scaleY: 1.9 },
        { id: 'cf4', type: 'blob', x: 44, y: 64, size: 18, color: '#ffd166', opacity: 0.28, blur: 6, blendMode: 'screen', complexity: 5, rotation: -10, scaleX: 0.6, scaleY: 1.7 },
        { id: 'cf5', type: 'circle', x: 58, y: 28, size: 1.6, color: '#ffd166', opacity: 0.34, blur: 0.6, blendMode: 'screen' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 3, speed: 0.8, pulse: 2 }
    }
  },
  {
    id: 'smoke-plume',
    name: 'Smoke Plume',
    collection: 'ember',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #120704 0%, #4b2d27 55%, #d97706 100%)',
    config: {
      baseColor: '#120704',
      noise: 28,
      shapes: [
        { id: 'sp1', type: 'blob', x: 46, y: 30, size: 126, color: '#3e2a26', opacity: 0.36, blur: 88, blendMode: 'screen', complexity: 6, rotation: 10, scaleX: 1.7, scaleY: 0.92 },
        { id: 'sp2', type: 'blob', x: 62, y: 44, size: 110, color: '#231714', opacity: 0.28, blur: 72, blendMode: 'screen', complexity: 6, rotation: -14, scaleX: 1.5, scaleY: 0.86 },
        { id: 'sp3', type: 'circle', x: 48, y: 68, size: 10, color: '#fb923c', opacity: 0.92, blur: 6, blendMode: 'screen' },
        { id: 'sp4', type: 'circle', x: 58, y: 26, size: 2.8, color: '#ffd166', opacity: 0.88, blur: 2, blendMode: 'screen' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 3, speed: 0.7, pulse: 2 }
    }
  },
  {
    id: 'forge-light',
    name: 'Forge Light',
    collection: 'ember',
    category: 'Aura',
    thumbnail: 'linear-gradient(135deg, #220805 0%, #a12f0f 40%, #ffd166 100%)',
    config: {
      baseColor: '#1b0704',
      noise: 24,
      shapes: [
        { id: 'fl1', type: 'rect', x: 50, y: 84, size: 76, color: '#6f200f', opacity: 0.32, blur: 18, blendMode: 'screen', scaleX: 3.6, scaleY: 0.22 },
        { id: 'fl2', type: 'rect', x: 50, y: 74, size: 84, color: '#ff9a42', opacity: 0.18, blur: 10, blendMode: 'screen', scaleX: 3.8, scaleY: 0.1 },
        { id: 'fl3', type: 'blob', x: 38, y: 30, size: 112, color: '#2d170f', opacity: 0.28, blur: 62, blendMode: 'soft-light', complexity: 6, rotation: -18, scaleX: 1.5, scaleY: 1.04 },
        { id: 'fl4', type: 'rect', x: 58, y: 52, size: 52, color: '#ffe1a0', opacity: 0.12, blur: 8, blendMode: 'screen', rotation: -72, scaleX: 0.12, scaleY: 2.8 },
        { id: 'fl5', type: 'blob', x: 52, y: 64, size: 22, color: '#ffd166', opacity: 0.24, blur: 8, blendMode: 'screen', complexity: 5, rotation: 0, scaleX: 0.7, scaleY: 2.2 },
      ]
    }
  },

  // ==========================================
  // COLLECTION: OCEANIC (Water/Flow)
  // ==========================================
  {
    id: 'pacific-drift',
    name: 'Pacific',
    collection: 'oceanic',
    category: 'Soft',
    thumbnail: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    config: {
      baseColor: '#e9fbff',
      noise: 16,
      shapes: [
        { id: 'pac1', type: 'blob', x: 48, y: 78, size: 126, color: '#06b6d4', opacity: 0.42, blur: 64, blendMode: 'multiply', complexity: 4, rotation: -10, scaleX: 1.8, scaleY: 0.84 },
        { id: 'pac2', type: 'blob', x: 54, y: 42, size: 86, color: '#3b82f6', opacity: 0.34, blur: 54, blendMode: 'multiply', complexity: 5, rotation: 16, scaleX: 1.7, scaleY: 0.62 },
        { id: 'pac3', type: 'rect', x: 56, y: 26, size: 66, color: '#d7f7ff', opacity: 0.14, blur: 18, blendMode: 'screen', rotation: -8, scaleX: 2.4, scaleY: 0.2 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 5, speed: 1.4, pulse: 2 }
    }
  },
  {
    id: 'the-abyss',
    name: 'The Abyss',
    collection: 'oceanic',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #020617 0%, #0f2744 52%, #123555 100%)',
    config: {
      baseColor: '#020617',
      noise: 30,
      shapes: [
        { id: 'aby1', type: 'blob', x: 56, y: 62, size: 170, color: '#10344f', opacity: 0.22, blur: 116, blendMode: 'screen', complexity: 6, rotation: -12, scaleX: 2.8, scaleY: 0.8 },
        { id: 'aby2', type: 'blob', x: 40, y: 74, size: 132, color: '#0a2237', opacity: 0.18, blur: 84, blendMode: 'multiply', complexity: 6, rotation: 14, scaleX: 2.2, scaleY: 0.74 },
        { id: 'aby3', type: 'rect', x: 52, y: 18, size: 76, color: '#79dfff', opacity: 0.08, blur: 12, blendMode: 'screen', rotation: -74, scaleX: 0.1, scaleY: 3.1 },
        { id: 'aby4', type: 'rect', x: 58, y: 30, size: 88, color: '#8de8ff', opacity: 0.08, blur: 18, blendMode: 'screen', rotation: 8, scaleX: 2.8, scaleY: 0.12 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 3, speed: 1.1, pulse: 2, colorCycle: true, colorCycleSpeed: 2 }
    }
  },
  {
    id: 'reef-current',
    name: 'Reef Current',
    collection: 'oceanic',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #032135 0%, #06b6d4 42%, #ff8a5b 100%)',
    config: {
      baseColor: '#031a29',
      noise: 18,
      noiseScale: 1.25,
      shapes: [
        { id: 'rc1', type: 'blob', x: 36, y: 54, size: 138, color: '#06b6d4', opacity: 0.34, blur: 58, blendMode: 'screen', complexity: 5, rotation: -14, scaleX: 3.2, scaleY: 0.3 },
        { id: 'rc2', type: 'blob', x: 70, y: 46, size: 104, color: '#3b82f6', opacity: 0.22, blur: 34, blendMode: 'screen', complexity: 5, rotation: 18, scaleX: 2.4, scaleY: 0.24 },
        { id: 'rc3', type: 'blob', x: 78, y: 70, size: 28, color: '#ff8a5b', opacity: 0.14, blur: 10, blendMode: 'screen', complexity: 4, rotation: 8, scaleX: 1.1, scaleY: 0.9 },
        { id: 'rc4', type: 'rect', x: 56, y: 22, size: 74, color: '#d8fbff', opacity: 0.1, blur: 14, blendMode: 'screen', rotation: -10, scaleX: 2.8, scaleY: 0.12 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 4, speed: 1.2, pulse: 2, colorCycle: true, colorCycleSpeed: 2 }
    }
  },

  // ==========================================
  // COLLECTION: ASTRA (Deep Space/Nebula)
  // ==========================================
  {
    id: 'blue-nebula',
    name: 'Blue Nebula',
    collection: 'astra',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #03101b 0%, #1dd6d6 40%, #4156ff 70%, #f2b46a 100%)',
    config: {
      baseColor: '#03101b',
      noise: 14,
      noiseScale: 1.3,
      shapes: [
        { id: 'an1', type: 'blob', x: 38, y: 56, size: 164, color: '#1ad1d6', opacity: 0.2, blur: 66, blendMode: 'screen', complexity: 6, rotation: -18, scaleX: 4.2, scaleY: 0.22 },
        { id: 'an2', type: 'blob', x: 68, y: 42, size: 138, color: '#4c5eff', opacity: 0.18, blur: 72, blendMode: 'screen', complexity: 6, rotation: 20, scaleX: 3.4, scaleY: 0.24 },
        { id: 'an3', type: 'rect', x: 54, y: 48, size: 64, color: '#f1c17a', opacity: 0.14, blur: 10, blendMode: 'screen', rotation: -22, scaleX: 0.14, scaleY: 3.2 },
        { id: 'an4', type: 'circle', x: 54, y: 46, size: 38, color: '#ffd388', opacity: 0.16, blur: 18, blendMode: 'screen' },
        { id: 'an5', type: 'rect', x: 50, y: 50, size: 56, color: '#7fdcff', opacity: 0.1, blur: 10, blendMode: 'screen', rotation: 24, scaleX: 2.4, scaleY: 0.1 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 1.6, speed: 0.6, pulse: 1.2, rotate: 0.4 }
    }
  },
  {
    id: 'lunar-halo',
    name: 'Lunar Halo',
    collection: 'astra',
    category: 'Aura',
    thumbnail: 'linear-gradient(135deg, #05070d 0%, #607edf 42%, #f8d59a 100%)',
    config: {
      baseColor: '#04070f',
      noise: 12,
      noiseScale: 1.2,
      shapes: [
        { id: 'lh1', type: 'circle', x: 54, y: 44, size: 42, color: '#f8e2bf', opacity: 0.16, blur: 14, blendMode: 'screen' },
        { id: 'lh2', type: 'circle', x: 54, y: 44, size: 26, color: '#ffffff', opacity: 0.12, blur: 10, blendMode: 'screen' },
        { id: 'lh3', type: 'circle', x: 54, y: 44, size: 62, color: '#9cb3ff', opacity: 0.08, blur: 8, blendMode: 'screen' },
        { id: 'lh4', type: 'blob', x: 34, y: 62, size: 128, color: '#2145c3', opacity: 0.2, blur: 106, blendMode: 'screen', complexity: 6, rotation: -16, scaleX: 2.6, scaleY: 0.52 },
        { id: 'lh5', type: 'rect', x: 54, y: 34, size: 86, color: '#d9e5ff', opacity: 0.08, blur: 8, blendMode: 'screen', rotation: 18, scaleX: 2.4, scaleY: 0.08 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 2, speed: 0.7, pulse: 1, rotate: 1 }
    }
  },
  {
    id: 'golden-orbit',
    name: 'Golden Orbit',
    collection: 'astra',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #09040a 0%, #2146c7 36%, #f3b562 100%)',
    config: {
      baseColor: '#09040a',
      noise: 16,
      noiseScale: 1.35,
      shapes: [
        { id: 'go1', type: 'blob', x: 34, y: 42, size: 146, color: '#2146c7', opacity: 0.22, blur: 96, blendMode: 'screen', complexity: 6, rotation: -16, scaleX: 2.8, scaleY: 0.46 },
        { id: 'go2', type: 'blob', x: 70, y: 58, size: 116, color: '#f3b562', opacity: 0.18, blur: 52, blendMode: 'screen', complexity: 5, rotation: 24, scaleX: 1.6, scaleY: 0.82 },
        { id: 'go3', type: 'rect', x: 54, y: 48, size: 84, color: '#ffd37f', opacity: 0.1, blur: 10, blendMode: 'screen', rotation: 24, scaleX: 2.8, scaleY: 0.08 },
        { id: 'go4', type: 'rect', x: 50, y: 44, size: 62, color: '#f3c978', opacity: 0.08, blur: 8, blendMode: 'screen', rotation: -18, scaleX: 2.2, scaleY: 0.08 },
        { id: 'go5', type: 'circle', x: 64, y: 46, size: 16, color: '#ffe2a8', opacity: 0.08, blur: 8, blendMode: 'screen' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 2, speed: 0.8, pulse: 1, rotate: 1 }
    }
  }
];

export const CANONICAL_ENGINE_PRESET_IDS: Record<string, string> = {
  boreal: 'angel-aura',
  chroma: 'liquid-metal',
  lava: 'magma-lamp',
  midnight: 'deep-space',
  geometrica: 'bauhaus-one',
  glitch: 'signal-loss',
  sakura: 'hanami-season',
  ember: 'campfire-cozy',
  oceanic: 'reef-current',
  astra: 'blue-nebula',
};

// ==========================================
// CURATED SEEDS FOR HERO BACKGROUNDS (AESTHETIC & DETERMINISTIC)
// ==========================================
export const HERO_PRESETS: Partial<WallpaperConfig>[] = [
  // 1. Deep Purple / Pink Aura (Sophisticated)
  {
    baseColor: '#0f0518',
    shapes: [
      { id: 'h1', type: 'circle', x: 20, y: 20, size: 120, color: '#d8b4fe', opacity: 0.6, blur: 100, blendMode: 'multiply' },
      { id: 'h2', type: 'circle', x: 80, y: 80, size: 140, color: '#f9a8d4', opacity: 0.5, blur: 120, blendMode: 'multiply' },
      { id: 'h3', type: 'circle', x: 50, y: 50, size: 90, color: '#bae6fd', opacity: 0.7, blur: 80, blendMode: 'multiply' },
    ]
  },
  // 2. Cosmic Blue / Teal (Deep)
  {
    baseColor: '#020617',
    shapes: [
      { id: 'h4', type: 'blob', x: 50, y: 50, size: 150, color: '#1d4ed8', opacity: 0.5, blur: 120, blendMode: 'screen' },
      { id: 'h5', type: 'blob', x: 90, y: 10, size: 100, color: '#2dd4bf', opacity: 0.4, blur: 100, blendMode: 'screen' },
    ]
  },
  // 3. Warm Sunset (Inviting)
  {
    baseColor: '#2a0a16',
    shapes: [
      { id: 'h6', type: 'blob', x: 20, y: 80, size: 120, color: '#f59e0b', opacity: 0.6, blur: 80, blendMode: 'screen' }, // Amber
      { id: 'h7', type: 'circle', x: 80, y: 20, size: 100, color: '#db2777', opacity: 0.6, blur: 80, blendMode: 'screen' }, // Pink
    ]
  }
];
