
import { WallpaperConfig, Shape, BlendMode, CollectionId, BackgroundConfig } from '../types';
import { parseHsl, hexToHsl, toHslStr } from '../utils/colorUtils'; // Import from centralized utility

export const shiftColor = (color: string | BackgroundConfig, dH: number, dS: number, dL: number): string | BackgroundConfig => {
  if (typeof color !== 'string') {
    // If background config, shift the primary color (simplification)
    // Ideally we would shift all colors, but let's start with color1
    return {
      ...color,
      color1: shiftColor(color.color1, dH, dS, dL) as string,
      color2: shiftColor(color.color2, dH, dS, dL) as string,
      color3: color.color3 ? shiftColor(color.color3, dH, dS, dL) as string : undefined
    };
  }

  const hsl = color.startsWith('#') ? hexToHsl(color) : parseHsl(color);
  return toHslStr({
    h: hsl.h + dH,
    s: hsl.s + dS,
    l: hsl.l + dL
  });
};

const jitter = (val: number, amount: number) => val + (Math.random() * amount - (amount / 2));
const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

/**
 * DRACONIAN CONTRAST POLICE
 * 
 * Strict rules to prevent "Black on Black" or "White on White" scenarios.
 * If the image is invisible, it overrides the config.
 */
const ensureVisibility = (shapes: Shape[], baseColor: string | BackgroundConfig): Shape[] => {
  // Use primary color as reference for contrast if gradient
  const refColor = typeof baseColor === 'string' ? baseColor : baseColor.color1;
  const baseHsl = refColor.startsWith('#') ? hexToHsl(refColor) : parseHsl(refColor);

  // --- STRICT SAFEGUARDS FOR RENDERABLE OUTPUT ---

  // 1. Cap Opacity and Size to avoid "Whiteout"
  shapes.forEach(s => {
    s.opacity = Math.min(s.opacity, 0.9);
    // If screen mode and high opacity, reduce it
    if (s.blendMode === 'screen' && s.opacity > 0.6) s.opacity = 0.5;
  });

  // 2. Luminance Clamp for Base Color (Avoid Pitch Black / Pure White)
  if (baseHsl.l < 5) baseHsl.l = 5;
  if (baseHsl.l > 95) baseHsl.l = 95;

  // Restore Background Depth Categorization for Logic
  const isPitchBlack = baseHsl.l < 10;
  const isDarkBase = baseHsl.l < 40;
  const isLightBase = baseHsl.l > 60;

  return shapes.map(s => {
    let shapeHsl = s.color.startsWith('#') ? hexToHsl(s.color) : parseHsl(s.color);
    let newBlend = s.blendMode;
    let newOpacity = Math.max(0.4, s.opacity); // Increase opacity floor
    let newSize = Math.max(30, s.size);

    // --- PITCH BLACK BACKGROUND RULES (Risk Level: HIGH) ---
    if (isPitchBlack) {
      // 1. Forbidden Modes: Overlay, Soft-light, Multiply do NOTHING on black.
      // Force them to emit light.
      // Difference/Exclusion are allowed as they create visibility on black
      if (!['screen', 'lighten', 'color-dodge', 'normal', 'difference', 'exclusion'].includes(newBlend)) {
        newBlend = Math.random() > 0.4 ? 'screen' : 'difference';
      }

      // 2. Force High Luminance
      // Even with Screen mode, dark colors won't show up well.
      if (shapeHsl.l < 40) {
        shapeHsl.l = 40 + Math.random() * 50;
      }

      // 3. Force Saturation
      if (shapeHsl.s < 50) {
        shapeHsl.s = 50 + Math.random() * 50;
      }
    }

    // --- DARK MODE RULES (Risk Level: MEDIUM) ---
    else if (isDarkBase) {
      // 1. Forbid Darkening
      if (['multiply', 'darken', 'color-burn'].includes(newBlend)) {
        newBlend = Math.random() > 0.5 ? 'overlay' : 'screen';
      }

      // 2. Overlay Safety Check
      // Overlay darkens the darks. If shape is dark on dark bg, it vanishes.
      if (['overlay', 'soft-light'].includes(newBlend) && shapeHsl.l < 60) {
        shapeHsl.l = 60 + Math.random() * 30; // Bump lightness if using overlay
      }

      // 3. General Visibility
      if (shapeHsl.l < 30) {
        shapeHsl.l = 40 + Math.random() * 40;
      }
    }

    // --- LIGHT MODE RULES (Risk Level: MEDIUM) ---
    else if (isLightBase) {
      // 1. Forbid Lightening
      if (['screen', 'lighten', 'color-dodge', 'plus'].includes(newBlend)) {
        newBlend = Math.random() > 0.5 ? 'multiply' : 'difference';
      }

      // 2. Force Darker Colors
      if (shapeHsl.l > 60) {
        shapeHsl.l = Math.random() * 50; // 0% - 50%
      }

      // 3. Normal Mode Contrast
      // If color is too close to white bg, darken it
      if (newBlend === 'normal' && shapeHsl.l > baseHsl.l - 20) {
        shapeHsl.l = Math.max(0, baseHsl.l - 40);
      }
    }

    return {
      ...s,
      color: toHslStr(shapeHsl),
      opacity: newOpacity,
      size: newSize,
      blendMode: newBlend
    };
  });
};

export const generateVariations = (baseConfig: WallpaperConfig, collection: CollectionId = 'boreal'): WallpaperConfig[] => {
  const variations: WallpaperConfig[] = [];

  // Common visibility check
  const safeBase = (cfg: WallpaperConfig) => ({
    ...cfg,
    shapes: ensureVisibility(cfg.shapes, cfg.baseColor)
  });

  if (collection === 'boreal') {
    // --- BOREAL STRATEGY (Soft, Ethereal, Smooth) ---

    // 1. "Composition Remix"
    variations.push(safeBase({
      ...baseConfig,
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        x: clamp(jitter(s.x, 40), 0, 100),
        y: clamp(jitter(s.y, 40), 0, 100),
        size: clamp(jitter(s.size, 30), 25, 150),
        id: s.id + '-remix'
      }))
    }));

    // 2. "Atmosphere Shift"
    let atmosBase = shiftColor(baseConfig.baseColor, 10, -5, 5);
    variations.push(safeBase({
      ...baseConfig,
      baseColor: atmosBase,
      noise: clamp(baseConfig.noise - 10, 10, 50),
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        blur: Math.min(150, s.blur * 1.3),
        blendMode: Math.random() > 0.5 ? 'screen' : 'soft-light',
        opacity: clamp(s.opacity * 0.9, 0.4, 0.9),
        id: s.id + '-atmos'
      }))
    }));

    // 3. "Deep Contrast"
    const contrastBase = shiftColor(baseConfig.baseColor, 0, 10, -10);
    variations.push(safeBase({
      ...baseConfig,
      baseColor: contrastBase,
      noise: clamp(baseConfig.noise + 15, 20, 80),
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        color: shiftColor(s.color, 0, 20, 5),
        blendMode: Math.random() > 0.5 ? 'color-dodge' : 'normal',
        opacity: clamp(s.opacity + 0.2, 0.6, 1),
        id: s.id + '-deep'
      }))
    }));

    // 4. "Analogous Flow"
    const hueShift = 30 + Math.random() * 30;
    const flowBase = shiftColor(baseConfig.baseColor, hueShift, 0, 0);
    variations.push(safeBase({
      ...baseConfig,
      baseColor: flowBase,
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        color: shiftColor(s.color, hueShift, 0, 0),
        x: clamp(jitter(s.x, 15), -10, 110),
        y: clamp(jitter(s.y, 15), -10, 110),
        id: s.id + '-flow'
      }))
    }));

    // 5. "Vibrant Pop"
    const popBase = shiftColor(baseConfig.baseColor, 180, 0, 0);
    variations.push(safeBase({
      ...baseConfig,
      baseColor: popBase,
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        color: shiftColor(s.color, 180, 20, 0),
        blendMode: 'normal',
        id: s.id + '-pop'
      }))
    }));

  } else {
    // --- CHROMA STRATEGY (Sharp, Acid, Liquid, Distortion) ---

    // 1. "Liquid Distort" - Tighter clusters, exclusion modes
    variations.push(safeBase({
      ...baseConfig,
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        x: clamp(jitter(s.x, 20), 20, 80), // Keep centered
        y: clamp(jitter(s.y, 20), 20, 80),
        size: clamp(jitter(s.size, 40), 50, 150),
        blur: clamp(jitter(s.blur, 20), 10, 60), // Lower blur
        blendMode: Math.random() > 0.5 ? 'difference' : 'exclusion',
        id: s.id + '-chroma-distort'
      }))
    }));

    // 2. "Acid Wash" - Neon colors shift
    const acidBase = shiftColor(baseConfig.baseColor, 120, 20, 0);
    variations.push(safeBase({
      ...baseConfig,
      baseColor: acidBase,
      noise: 60, // High grain
      noiseScale: 4, // Coarse grain
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        color: shiftColor(s.color, 120, 40, 0), // Shift hue + boost sat
        blendMode: 'difference',
        id: s.id + '-chroma-acid'
      }))
    }));

    // 3. "Thermal Shift" - Inverted Look
    const thermalBase = shiftColor(baseConfig.baseColor, 180, 0, 10);
    variations.push(safeBase({
      ...baseConfig,
      baseColor: thermalBase,
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        color: shiftColor(s.color, 180, 0, 0),
        blur: Math.max(20, s.blur - 30), // Sharper
        blendMode: 'hard-light',
        id: s.id + '-chroma-thermal'
      }))
    }));

    // 4. "Glass Shards" - Sharp overlay
    variations.push(safeBase({
      ...baseConfig,
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        blur: 10, // Very sharp
        opacity: 0.4,
        size: s.size * 1.2,
        blendMode: 'overlay',
        id: s.id + '-chroma-glass'
      }))
    }));

    // 5. "Dark Matter" - Exclusion on dark
    variations.push(safeBase({
      ...baseConfig,
      baseColor: '#000000',
      shapes: baseConfig.shapes.map(s => ({
        ...s,
        blur: 80,
        opacity: 1,
        color: '#ffffff', // White on black exclusion = inversion
        blendMode: 'exclusion',
        id: s.id + '-chroma-dark'
      }))
    }));
  }

  return variations;
};
