import { useState, useEffect, useCallback } from 'react';
import { WallpaperConfig } from '../types';

export interface FavoriteItem {
  id: string;
  timestamp: number;
  config: WallpaperConfig;
}

export const useFavorites = () => {
  // Initialize state directly from localStorage to prevent overwriting on mount
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const stored = localStorage.getItem('aurawall_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load favorites', e);
      return [];
    }
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('aurawall_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Helper to compare configs (ignoring irrelevant diffs if necessary, but strict for now)
  const isFavorite = useCallback((config: WallpaperConfig) => {
    const configStr = JSON.stringify(config);
    return favorites.some(f => JSON.stringify(f.config) === configStr);
  }, [favorites]);

  const toggleFavorite = useCallback((config: WallpaperConfig) => {
    setFavorites(prev => {
      const configStr = JSON.stringify(config);
      const exists = prev.find(f => JSON.stringify(f.config) === configStr);

      if (exists) {
        // Remove if exists
        return prev.filter(f => f.id !== exists.id);
      } else {
        // Add if new
        const newItem: FavoriteItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          config
        };
        return [newItem, ...prev];
      }
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
};