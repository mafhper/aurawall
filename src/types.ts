
export interface ColorStop {
  offset: number;
  color: string;
}

export type BlendMode = 
  | 'normal' 
  | 'screen' 
  | 'overlay' 
  | 'multiply' 
  | 'color-dodge' 
  | 'soft-light' 
  | 'difference' 
  | 'lighten' 
  | 'darken' 
  | 'color-burn'
  | 'exclusion'
  | 'hard-light';

export interface Shape {
  id: string;
  type: 'circle' | 'blob';
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  size: number; // Percentage relative to width
  color: string;
  opacity: number;
  blur: number;
  blendMode: BlendMode;
  complexity?: number; // 3 to 10, for blobs
}

export interface AnimationSettings {
  enabled: boolean;
  speed: number; // 0.1-10 (Global time scale)
  flow: number; // 0-10 (Drift/Translate intensity)
  pulse: number; // 0-10 (Scale intensity)
  rotate: number; // 0-10 (Rotation intensity)
  noiseAnim: number; // 0-10 (Grain vibration)
  colorCycle: boolean; // Enable color cycling for shapes
  colorCycleSpeed: number; // Speed of color cycling
}

export interface VignetteSettings {
  enabled: boolean;
  color: string;
  intensity: number; // 0 to 1
  size: number; // 0 to 100 (percentage of clear center)
  offsetX: number; // -50 to 50 (percentage offset from center)
  offsetY: number; // -50 to 50 (percentage offset from center)
  inverted: boolean; // If true, center is opaque, edges are transparent
  shapeX: number; // 0 to 100 (horizontal radius of ellipse)
  shapeY: number; // 0 to 100 (vertical radius of ellipse)
}

export interface BackgroundConfig {
  type: 'solid' | 'linear' | 'radial';
  color1: string;
  color2: string;
  color3?: string;
  angle?: number; // 0-360, used for linear
}

export interface WallpaperConfig {
  width: number;
  height: number;
  noise: number; // 0-100
  noiseScale: number; // 1-100
  baseColor: string | BackgroundConfig;
  shapes: Shape[];
  animation?: AnimationSettings;
  vignette?: VignetteSettings;
}

export type CollectionId = string;

export interface Preset {
  id: string;
  name: string;
  collection: CollectionId; // New field
  category: 'Aura' | 'Neon' | 'Dark' | 'Soft' | 'Abstract' | 'Liquid' | 'Acid';
  thumbnail: string; // CSS Gradient string for UI
  config: Partial<WallpaperConfig>;
}

export interface ExportSize {
  name: string;
  width: number;
  height: number;
}

export interface AppPreferences {
  format: 'jpg' | 'png';
  quality: number; // 0.1 to 1.0
  filenamePrefix: string;
}

export interface VariationRule {
  name: string;
  transform: (config: WallpaperConfig) => WallpaperConfig;
}

export interface EngineDefinition {
  id: string;
  meta: {
    name: string;
    description: string;
    tagline: string;
    promoImage?: string;
  };
  defaults: Partial<WallpaperConfig>;
  randomizer: (currentConfig: WallpaperConfig, options: { isGrainLocked: boolean }) => WallpaperConfig;
  variations: VariationRule[];
}
