/**
 * Compact URL Encoder v2 for AuraWall
 * 
 * ULTRA COMPACT: Uses array notation for shapes, removes IDs,
 * strips # from colors, and omits default values.
 * 
 * Target: ~400 chars (down from ~1100)
 */

import LZString from 'lz-string';
import { WallpaperConfig, Shape, BlendMode, AnimationSettings, VignetteSettings, BackgroundConfig } from '../types';
import { PRESETS, DEFAULT_ANIMATION, DEFAULT_VIGNETTE } from '../constants';

// ============================================
// VALUE MAPS - Single character codes
// ============================================

const BLEND_MAP: Record<BlendMode, number> = {
  'normal': 0, 'screen': 1, 'overlay': 2, 'multiply': 3,
  'color-dodge': 4, 'soft-light': 5, 'difference': 6, 'lighten': 7,
  'darken': 8, 'color-burn': 9, 'exclusion': 10, 'hard-light': 11
};

const BLEND_REVERSE: BlendMode[] = [
  'normal', 'screen', 'overlay', 'multiply',
  'color-dodge', 'soft-light', 'difference', 'lighten',
  'darken', 'color-burn', 'exclusion', 'hard-light'
];

// ============================================
// COLOR HELPERS - Handle both HEX and HSL
// ============================================

function isHslColor(color: string): boolean {
  return color.startsWith('hsl(') || color.startsWith('hsla(');
}

function stripHash(color: string): string {
  // HSL colors: keep as-is
  if (isHslColor(color)) return color;

  // Not a hex color: keep as-is
  if (!color.startsWith('#')) return color;

  const h = color.slice(1).toLowerCase();
  // Shorten if possible: aabbcc -> abc
  if (h.length === 6 && h[0] === h[1] && h[2] === h[3] && h[4] === h[5]) {
    return h[0] + h[2] + h[4];
  }
  return h;
}

function addHash(color: string): string {
  // HSL colors: keep as-is
  if (isHslColor(color)) return color;

  // Already has hash: keep as-is
  if (color.startsWith('#')) return color;

  // Expand short hex: abc -> #aabbcc
  if (color.length === 3 && /^[0-9a-fA-F]{3}$/.test(color)) {
    return '#' + color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  // Regular hex: add #
  if (/^[0-9a-fA-F]{6}$/.test(color)) {
    return '#' + color;
  }

  // Unknown format: return as-is (safety)
  return color;
}

// ============================================
// ARRAY NOTATION FOR SHAPES
// Format: [type, x, y, size, color, opacity, blur, blendMode, complexity?]
// Example: [0, 20, 20, 120, "d8b4fe", 60, 100, 3]
// ============================================

type ShapeArray = [number, number, number, number, string, number, number, number, number?];

function encodeShapeArray(shape: Shape): ShapeArray {
  const arr: ShapeArray = [
    shape.type === 'circle' ? 0 : 1,
    Math.round(shape.x),
    Math.round(shape.y),
    Math.round(shape.size),
    stripHash(shape.color),
    Math.round(shape.opacity * 100), // Store as 0-100 int
    Math.round(shape.blur),
    BLEND_MAP[shape.blendMode] ?? 0
  ];
  if (shape.complexity !== undefined) {
    arr.push(shape.complexity);
  }
  return arr;
}

function decodeShapeArray(arr: ShapeArray, index: number): Shape {
  return {
    id: `s${index}`, // Generate ID from index
    type: arr[0] === 0 ? 'circle' : 'blob',
    x: arr[1],
    y: arr[2],
    size: arr[3],
    color: addHash(arr[4]),
    opacity: arr[5] / 100, // Convert back to 0-1
    blur: arr[6],
    blendMode: BLEND_REVERSE[arr[7]] || 'normal',
    ...(arr[8] !== undefined && { complexity: arr[8] })
  };
}

// ============================================
// BACKGROUND ENCODING
// String: just color (solid)
// Array: [type, color1, color2?, angle?]
// ============================================

type BgCompact = string | [number, string, string?, number?];

function encodeBackground(bg: string | BackgroundConfig): BgCompact {
  if (typeof bg === 'string') {
    return stripHash(bg);
  }
  if (bg.type === 'solid') {
    return stripHash(bg.color1);
  }
  const arr: [number, string, string?, number?] = [
    bg.type === 'linear' ? 1 : 2,
    stripHash(bg.color1),
    stripHash(bg.color2)
  ];
  if (bg.angle !== undefined && bg.angle !== 135) {
    arr.push(bg.angle);
  }
  return arr;
}

function decodeBackground(compact: BgCompact): string | BackgroundConfig {
  if (typeof compact === 'string') {
    return addHash(compact);
  }
  const type = compact[0] === 1 ? 'linear' : 'radial';
  return {
    type,
    color1: addHash(compact[1]),
    color2: addHash(compact[2] || '000'),
    ...(compact[3] !== undefined && { angle: compact[3] })
  };
}

// ============================================
// ANIMATION - Only encode if enabled or non-default
// [enabled, speed, flow, pulse, rotate, noiseAnim, colorCycle, colorCycleSpeed]
// ============================================

type AnimCompact = [number, ...number[]] | undefined;

function encodeAnimation(anim: AnimationSettings | undefined): AnimCompact {
  if (!anim || (!anim.enabled &&
    anim.speed === DEFAULT_ANIMATION.speed &&
    anim.flow === DEFAULT_ANIMATION.flow &&
    anim.pulse === DEFAULT_ANIMATION.pulse &&
    anim.rotate === DEFAULT_ANIMATION.rotate &&
    anim.noiseAnim === DEFAULT_ANIMATION.noiseAnim &&
    !anim.colorCycle)) {
    return undefined;
  }

  return [
    anim.enabled ? 1 : 0,
    anim.speed,
    anim.flow,
    anim.pulse,
    anim.rotate,
    anim.noiseAnim,
    anim.colorCycle ? 1 : 0,
    anim.colorCycleSpeed
  ];
}

function decodeAnimation(arr: AnimCompact): AnimationSettings {
  if (!arr) return { ...DEFAULT_ANIMATION };
  return {
    enabled: arr[0] === 1,
    speed: arr[1] ?? DEFAULT_ANIMATION.speed,
    flow: arr[2] ?? DEFAULT_ANIMATION.flow,
    pulse: arr[3] ?? DEFAULT_ANIMATION.pulse,
    rotate: arr[4] ?? DEFAULT_ANIMATION.rotate,
    noiseAnim: arr[5] ?? DEFAULT_ANIMATION.noiseAnim,
    colorCycle: arr[6] === 1,
    colorCycleSpeed: arr[7] ?? DEFAULT_ANIMATION.colorCycleSpeed
  };
}

// ============================================
// VIGNETTE - Only encode if enabled or non-default
// [enabled, color, intensity*100, size, offsetX, offsetY, inverted, shapeX, shapeY]
// ============================================

type VigCompact = [number, string, ...number[]] | undefined;

function encodeVignette(vig: VignetteSettings | undefined): VigCompact {
  if (!vig || (!vig.enabled &&
    vig.color === DEFAULT_VIGNETTE.color &&
    vig.intensity === DEFAULT_VIGNETTE.intensity &&
    vig.size === DEFAULT_VIGNETTE.size)) {
    return undefined;
  }

  return [
    vig.enabled ? 1 : 0,
    stripHash(vig.color),
    Math.round(vig.intensity * 100),
    vig.size,
    vig.offsetX,
    vig.offsetY,
    vig.inverted ? 1 : 0,
    vig.shapeX,
    vig.shapeY
  ];
}

function decodeVignette(arr: VigCompact): VignetteSettings {
  if (!arr) return { ...DEFAULT_VIGNETTE };
  return {
    enabled: arr[0] === 1,
    color: addHash(arr[1]),
    intensity: (arr[2] ?? 60) / 100,
    size: arr[3] ?? DEFAULT_VIGNETTE.size,
    offsetX: arr[4] ?? DEFAULT_VIGNETTE.offsetX,
    offsetY: arr[5] ?? DEFAULT_VIGNETTE.offsetY,
    inverted: arr[6] === 1,
    shapeX: arr[7] ?? DEFAULT_VIGNETTE.shapeX,
    shapeY: arr[8] ?? DEFAULT_VIGNETTE.shapeY
  };
}

// ============================================
// COMPACT CONFIG FORMAT
// [width, height, noise, noiseScale, background, shapes[], animation?, vignette?]
// ============================================

type CompactConfigV2 = [
  number,           // 0: width
  number,           // 1: height
  number,           // 2: noise
  number,           // 3: noiseScale
  BgCompact,        // 4: background
  ShapeArray[],     // 5: shapes
  AnimCompact?,     // 6: animation (optional)
  VigCompact?       // 7: vignette (optional)
];

// ============================================
// MAIN ENCODE/DECODE API
// ============================================

export function encodeConfigCompact(config: WallpaperConfig): string {
  const compact: CompactConfigV2 = [
    config.width,
    config.height,
    Math.round(config.noise),
    Math.round(config.noiseScale * 10) / 10, // 1 decimal place
    encodeBackground(config.baseColor),
    config.shapes.map(encodeShapeArray)
  ];

  const anim = encodeAnimation(config.animation);
  const vig = encodeVignette(config.vignette);

  // Only add if defined
  if (anim || vig) {
    compact.push(anim);
    if (vig) compact.push(vig);
  }

  // Compact JSON (no spaces)
  const json = JSON.stringify(compact);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeConfigCompact(compressed: string): WallpaperConfig | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const arr = JSON.parse(json);

    // Handle both V1 (object) and V2 (array) formats
    if (!Array.isArray(arr)) {
      // V1 format (object with keys)
      return decodeV1(arr);
    }

    // V2 format (array)
    const compact = arr as CompactConfigV2;
    return {
      width: compact[0],
      height: compact[1],
      noise: compact[2],
      noiseScale: compact[3],
      baseColor: decodeBackground(compact[4]),
      shapes: compact[5].map((s, i) => decodeShapeArray(s, i)),
      animation: decodeAnimation(compact[6]),
      vignette: decodeVignette(compact[7])
    };
  } catch (e) {
    console.error('Failed to decode compact config', e);
    return null;
  }
}

// V1 decoder for backward compatibility
function decodeV1(obj: Record<string, unknown>): WallpaperConfig {
  const shapes = (obj.s as Array<Record<string, unknown>>).map((s, idx) => ({
    id: (s.i as string) || `s${idx}`,
    type: s.t === 'c' ? 'circle' : 'blob',
    x: s.x as number,
    y: s.y as number,
    size: s.z as number,
    color: addHash(s.c as string),
    opacity: s.o as number,
    blur: s.u as number,
    blendMode: BLEND_REVERSE[s.b as number] || (s.b as BlendMode) || 'normal',
    ...(s.p !== undefined && { complexity: s.p as number })
  })) as Shape[];

  const bgRaw = obj.g;
  let baseColor: string | BackgroundConfig;
  if (typeof bgRaw === 'string') {
    baseColor = addHash(bgRaw);
  } else if (Array.isArray(bgRaw)) {
    baseColor = decodeBackground(bgRaw as BgCompact);
  } else {
    const bgObj = bgRaw as Record<string, unknown>;
    baseColor = {
      type: bgObj.t === 'l' ? 'linear' : bgObj.t === 'r' ? 'radial' : 'solid',
      color1: addHash(bgObj.a as string),
      color2: addHash((bgObj.b as string) || '000'),
      ...(bgObj.g !== undefined && { angle: bgObj.g as number })
    } as BackgroundConfig;
  }

  return {
    width: obj.w as number,
    height: obj.h as number,
    noise: obj.n as number,
    noiseScale: obj.l as number,
    baseColor,
    shapes,
    animation: obj.a ? decodeAnimation(obj.a as AnimCompact) : { ...DEFAULT_ANIMATION },
    vignette: obj.v ? decodeVignette(obj.v as VigCompact) : { ...DEFAULT_VIGNETTE }
  };
}

// ============================================
// URL HELPERS
// ============================================

export function encodeToUrl(config: WallpaperConfig): void {
  try {
    const compressed = encodeConfigCompact(config);
    window.location.hash = `c=${compressed}`;
  } catch (e) {
    console.error('Failed to encode config to URL', e);
  }
}

export function decodeFromUrl(): WallpaperConfig | null {
  try {
    // 1. Preset ID query param
    const searchParams = new URLSearchParams(window.location.search);
    const presetId = searchParams.get('preset');
    if (presetId) {
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        return { width: 1920, height: 1080, ...preset.config } as WallpaperConfig;
      }
    }

    const hash = window.location.hash;

    // 2. New compact format: #c=...
    if (hash.startsWith('#c=')) {
      return decodeConfigCompact(hash.substring(3));
    }

    // 3. Legacy format: #cfg=...
    if (hash.startsWith('#cfg=')) {
      const json = LZString.decompressFromEncodedURIComponent(hash.substring(5));
      if (!json) return null;
      return JSON.parse(json) as WallpaperConfig;
    }

    return null;
  } catch (e) {
    console.error('Failed to decode config from URL', e);
    return null;
  }
}
