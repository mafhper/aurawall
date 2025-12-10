/**
 * URL Utilities for AuraWall
 * Uses compact encoding for shorter shareable URLs
 */

import { WallpaperConfig } from '../types';
import { encodeToUrl, decodeFromUrl } from './compactUrlEncoder';

/**
 * Encode configuration to URL hash using compact format
 * Results in ~60% shorter URLs compared to raw JSON
 */
export const encodeConfigToUrl = (config: WallpaperConfig) => {
  encodeToUrl(config);
};

/**
 * Decode configuration from URL
 * Supports both new compact format (#c=) and legacy format (#cfg=)
 */
export const decodeConfigFromUrl = (): WallpaperConfig | null => {
  return decodeFromUrl();
};
