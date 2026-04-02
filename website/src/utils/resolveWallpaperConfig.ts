import { DEFAULT_ANIMATION, DEFAULT_CONFIG, DEFAULT_VIGNETTE } from '../../../src/constants';
import { WallpaperConfig } from '../../../src/types';

export function resolveWallpaperConfig(
  config: Partial<WallpaperConfig>,
  overrides: Partial<WallpaperConfig> = {}
): WallpaperConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    ...overrides,
    baseColor: overrides.baseColor ?? config.baseColor ?? DEFAULT_CONFIG.baseColor,
    shapes: overrides.shapes ?? config.shapes ?? DEFAULT_CONFIG.shapes,
    animation: {
      ...DEFAULT_ANIMATION,
      ...DEFAULT_CONFIG.animation,
      ...config.animation,
      ...overrides.animation,
    },
    vignette: {
      ...DEFAULT_VIGNETTE,
      ...DEFAULT_CONFIG.vignette,
      ...config.vignette,
      ...overrides.vignette,
    },
  };
}
