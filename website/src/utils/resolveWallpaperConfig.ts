import { DEFAULT_ANIMATION, DEFAULT_CONFIG, DEFAULT_VIGNETTE } from '../../../src/constants';
import { WallpaperConfig } from '../../../src/types';

// Os overrides são parciais por definição — quem chama quer mudar 2 campos de
// um bloco de 8 sem reescrever o resto. Deep-partial só no animation e no
// vignette, que são os dois blocos aninhados.
// ESTE CONSTRUTOR É A FONTE DA VERDADE DO PROMO. Todo preset que chega ao
// WallpaperRenderer passa por aqui.
//
// Ele não é cosmeticamente igual ao que o app faz a mão em
// src/Controls.tsx:165-173 — é o MESMO. Os dois terminam em
// `noiseScale: preset.config.noiseScale ?? DEFAULT_CONFIG.noiseScale`.
//
// Efeito colateral que vale saber: 14 dos 30 presets não declaram noiseScale.
// Antes desta fusão eles caíam no fallback do renderer (linha 16:
// `noiseScale = 1`) e renderizavam com 1. Agora recebem 1.5, que é o que o
// app já desenhava para os mesmos presets. Ou seja: o promo parou de divergir
// do app — mas a grão desses 14 vai mudar, porque passou a ser o valor certo.
type ConfigOverrides = Omit<Partial<WallpaperConfig>, 'animation' | 'vignette'> & {
  animation?: Partial<WallpaperConfig['animation']>;
  vignette?: Partial<WallpaperConfig['vignette']>;
};

export function resolveWallpaperConfig(
  config: Partial<WallpaperConfig>,
  overrides: ConfigOverrides = {}
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
