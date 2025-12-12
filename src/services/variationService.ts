import { WallpaperConfig, CollectionId } from '../types';
import { getEngine } from '../engines';

export const generateVariations = (baseConfig: WallpaperConfig, collection: CollectionId | string = 'boreal'): WallpaperConfig[] => {
  const engine = getEngine(collection);
  if (!engine) {
    console.warn(`Engine ${collection} not found`);
    return [];
  }

  return engine.variations.map(rule => rule.transform(baseConfig));
};