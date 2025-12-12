import { Shape, BackgroundConfig, BlendMode } from '../types';
import { parseHsl, hexToHsl, toHslStr } from './colorUtils';

export const jitter = (val: number, amount: number) => val + (Math.random() * amount - (amount / 2));
export const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

/**
 * DRACONIAN CONTRAST POLICE
 * 
 * Strict rules to prevent "Black on Black" or "White on White" scenarios.
 * If the image is invisible, it overrides the config.
 */
export const ensureVisibility = (shapes: Shape[], baseColor: string | BackgroundConfig): Shape[] => {
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

export function shiftColor(color: string, dH: number, dS: number, dL: number): string;
export function shiftColor(color: BackgroundConfig, dH: number, dS: number, dL: number): BackgroundConfig;
export function shiftColor(color: string | BackgroundConfig, dH: number, dS: number, dL: number): string | BackgroundConfig;
export function shiftColor(color: string | BackgroundConfig, dH: number, dS: number, dL: number): string | BackgroundConfig {
  if (typeof color !== 'string') {
    // If background config, shift the primary color (simplification)
    // Ideally we would shift all colors, but let's start with color1
    return {
      ...color,
      color1: shiftColor(color.color1, dH, dS, dL),
      color2: shiftColor(color.color2, dH, dS, dL),
      color3: color.color3 ? shiftColor(color.color3, dH, dS, dL) : undefined
    };
  }

  const hsl = color.startsWith('#') ? hexToHsl(color) : parseHsl(color);
  return toHslStr({
    h: hsl.h + dH,
    s: hsl.s + dS,
    l: hsl.l + dL
  });
}
