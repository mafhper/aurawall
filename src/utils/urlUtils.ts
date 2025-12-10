import LZString from 'lz-string';
import { WallpaperConfig } from '../types';
import { PRESETS } from '../constants';

export const encodeConfigToUrl = (config: WallpaperConfig) => {
  try {
    const json = JSON.stringify(config);
    const compressed = LZString.compressToEncodedURIComponent(json);
    window.location.hash = `cfg=${compressed}`;
  } catch (e) {
    console.error('Failed to encode config', e);
  }
};

export const decodeConfigFromUrl = (): WallpaperConfig | null => {
  try {
    // 1. Check for Query Param (Preset ID) - Priority for deep links
    const searchParams = new URLSearchParams(window.location.search);
    const presetId = searchParams.get('preset');

    if (presetId) {
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        // Ensure dimensions are set (default to FHD if missing in preset partial config)
        return {
          width: 1920,
          height: 1080,
          ...preset.config
        } as WallpaperConfig;
      }
    }

    // 2. Check for Hash (Compressed Config) - Persistence
    const hash = window.location.hash;
    if (!hash.startsWith('#cfg=')) return null;

    const compressed = hash.substring(5); // Remove '#cfg='
    const json = LZString.decompressFromEncodedURIComponent(compressed);

    if (!json) return null;
    return JSON.parse(json) as WallpaperConfig;
  } catch (e) {
    console.error('Failed to decode config', e);
    return null;
  }
};
