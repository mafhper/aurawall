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

  // ==========================================
  // COLLECTION: MIDNIGHT (Space/Cosmic)
  // ==========================================
  {
    id: 'deep-space',
    name: 'Deep Space',
    collection: 'midnight',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #000000 0%, #0f0c29 100%)',
    config: {
      baseColor: '#020205',
      noise: 10,
      shapes: [
        { id: 'ds1', type: 'blob', x: 50, y: 50, size: 150, color: '#0f0c29', opacity: 0.5, blur: 100, blendMode: 'screen', complexity: 6 },
        { id: 'ds2', type: 'circle', x: 20, y: 20, size: 2, color: '#ffffff', opacity: 1, blur: 1, blendMode: 'normal' },
        { id: 'ds3', type: 'circle', x: 80, y: 80, size: 1, color: '#ffffff', opacity: 0.8, blur: 0, blendMode: 'normal' },
      ]
    }
  },
  {
    id: 'nebula-cloud',
    name: 'Nebula',
    collection: 'midnight',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #240b36 0%, #c31432 100%)',
    config: {
      baseColor: '#1a0515',
      noise: 15,
      shapes: [
        { id: 'neb1', type: 'blob', x: 40, y: 40, size: 120, color: '#c31432', opacity: 0.3, blur: 80, blendMode: 'screen', complexity: 7 },
        { id: 'neb2', type: 'blob', x: 60, y: 60, size: 100, color: '#240b36', opacity: 0.4, blur: 80, blendMode: 'lighten', complexity: 6 },
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
    thumbnail: 'linear-gradient(135deg, #f0f0f0 0%, #e4002b 50%, #1244a4 100%)',
    config: {
      baseColor: '#f0f0f0',
      noise: 8,
      shapes: [
        { id: 'b1', type: 'circle', x: 25, y: 25, size: 50, color: '#e4002b', opacity: 0.9, blur: 0, blendMode: 'multiply' },
        { id: 'b2', type: 'circle', x: 75, y: 75, size: 50, color: '#1244a4', opacity: 0.9, blur: 0, blendMode: 'multiply' },
      ]
    }
  },
  {
    id: 'construct-yellow',
    name: 'Construct Y',
    collection: 'geometrica',
    category: 'Abstract',
    thumbnail: 'linear-gradient(135deg, #101010 0%, #f3a200 100%)',
    config: {
      baseColor: '#101010',
      noise: 10,
      shapes: [
        { id: 'cy1', type: 'circle', x: 50, y: 50, size: 75, color: '#f3a200', opacity: 1, blur: 0, blendMode: 'normal' },
        { id: 'cy2', type: 'circle', x: 50, y: 50, size: 25, color: '#101010', opacity: 1, blur: 0, blendMode: 'normal' },
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
    thumbnail: 'linear-gradient(135deg, #000000 0%, #00ff44 100%)',
    config: {
      baseColor: '#000000',
      noise: 60,
      noiseScale: 4,
      shapes: [
        { id: 'ca1', type: 'circle', x: 50, y: 50, size: 60, color: '#00ff44', opacity: 0.8, blur: 2, blendMode: 'difference' },
        { id: 'ca2', type: 'blob', x: 10, y: 10, size: 20, color: '#ffffff', opacity: 1, blur: 0, blendMode: 'exclusion', complexity: 10 },
      ]
    }
  },
  {
    id: 'system-error',
    name: 'System Error',
    collection: 'glitch',
    category: 'Neon',
    thumbnail: 'linear-gradient(135deg, #2b002b 0%, #ff00ff 100%)',
    config: {
      baseColor: '#0a000a',
      noise: 70,
      noiseScale: 3,
      shapes: [
        { id: 'se1', type: 'circle', x: 45, y: 50, size: 80, color: '#ff00ff', opacity: 0.7, blur: 4, blendMode: 'screen' },
        { id: 'se2', type: 'circle', x: 55, y: 50, size: 80, color: '#00ffff', opacity: 0.7, blur: 4, blendMode: 'screen' },
      ]
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
    thumbnail: 'linear-gradient(135deg, #fff5f7 0%, #fbcfe8 100%)',
    config: {
      baseColor: '#fff5f7',
      noise: 12,
      shapes: [
        { id: 'han1', type: 'blob', x: 20, y: 30, size: 30, color: '#fbcfe8', opacity: 0.8, blur: 5, blendMode: 'multiply', complexity: 3 },
        { id: 'han2', type: 'blob', x: 80, y: 70, size: 25, color: '#f9a8d4', opacity: 0.7, blur: 5, blendMode: 'multiply', complexity: 3 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 8, speed: 1 }
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
        { id: 'nb1', type: 'blob', x: 50, y: 50, size: 60, color: '#be185d', opacity: 0.6, blur: 20, blendMode: 'screen', complexity: 4 },
        { id: 'nb2', type: 'circle', x: 50, y: 50, size: 20, color: '#fce7f3', opacity: 0.9, blur: 10, blendMode: 'screen' },
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
        { id: 'cf1', type: 'blob', x: 50, y: 80, size: 100, color: '#431407', opacity: 0.6, blur: 60, blendMode: 'screen', complexity: 6 },
        { id: 'cf2', type: 'circle', x: 50, y: 60, size: 10, color: '#ea580c', opacity: 1, blur: 5, blendMode: 'screen' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 3, speed: 1 }
    }
  },
  {
    id: 'phoenix-rise',
    name: 'Phoenix',
    collection: 'ember',
    category: 'Aura',
    thumbnail: 'linear-gradient(135deg, #7f1d1d 0%, #fbbf24 100%)',
    config: {
      baseColor: '#450a0a',
      noise: 25,
      shapes: [
        { id: 'ph1', type: 'blob', x: 50, y: 50, size: 120, color: '#dc2626', opacity: 0.5, blur: 80, blendMode: 'screen', complexity: 5 },
        { id: 'ph2', type: 'circle', x: 50, y: 50, size: 60, color: '#fbbf24', opacity: 0.8, blur: 40, blendMode: 'overlay' },
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
      baseColor: '#ecfeff', // Cyan-50
      noise: 15,
      shapes: [
        { id: 'pac1', type: 'blob', x: 50, y: 90, size: 120, color: '#06b6d4', opacity: 0.5, blur: 60, blendMode: 'multiply', complexity: 4 },
        { id: 'pac2', type: 'blob', x: 50, y: 40, size: 80, color: '#3b82f6', opacity: 0.4, blur: 50, blendMode: 'multiply', complexity: 5 },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 5, speed: 2 }
    }
  },
  {
    id: 'the-abyss',
    name: 'The Abyss',
    collection: 'oceanic',
    category: 'Dark',
    thumbnail: 'linear-gradient(135deg, #083344 0%, #172554 100%)',
    config: {
      baseColor: '#020617',
      noise: 30,
      shapes: [
        { id: 'aby1', type: 'blob', x: 50, y: 50, size: 150, color: '#164e63', opacity: 0.4, blur: 100, blendMode: 'screen', complexity: 6 },
        { id: 'aby2', type: 'circle', x: 50, y: 20, size: 50, color: '#22d3ee', opacity: 0.2, blur: 40, blendMode: 'overlay' },
      ],
      animation: { ...DEFAULT_ANIMATION, enabled: true, flow: 2, speed: 1 }
    }
  }
];

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
