import React, { useState, useMemo, useEffect } from 'react';
import { WallpaperConfig, BackgroundConfig } from '../types';
import { hexToHsl, hslToHex, parseHsl, toHslStr } from '../utils/colorUtils';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ColorPaletteExtractorProps {
  config: WallpaperConfig;
}

const ColorPaletteExtractor: React.FC<ColorPaletteExtractorProps> = ({ config }) => {
  const { t } = useTranslation();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const extractColors = useMemo(() => {
    const uniqueColors = new Set<string>();

    // Extract colors from baseColor
    if (typeof config.baseColor === 'string') {
      uniqueColors.add(config.baseColor);
    } else {
      uniqueColors.add(config.baseColor.color1);
      if (config.baseColor.color2) uniqueColors.add(config.baseColor.color2);
      if (config.baseColor.color3) uniqueColors.add(config.baseColor.color3);
    }

    // Extract colors from shapes
    config.shapes.forEach(shape => uniqueColors.add(shape.color));

    // Convert all to HEX for display and ensure unique hex values
    const hexColors = new Set<string>();
    uniqueColors.forEach(color => {
      // Ensure it's a valid color string before converting
      if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
        hexColors.add(color.toUpperCase());
      } else if (color.startsWith('hsl(')) {
        try {
          hexColors.add(hslToHex(color).toUpperCase());
        } catch (e) {
          console.warn("Invalid HSL color in config:", color, e);
        }
      }
    });

    return Array.from(hexColors);
  }, [config]);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
  };

  useEffect(() => {
    if (copiedColor) {
      const timer = setTimeout(() => setCopiedColor(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedColor]);

  return (
    <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5 space-y-3">
      {extractColors.length === 0 ? (
        <p className="text-zinc-500 text-xs">{t('palette_empty_desc', 'Nenhuma cor detectada na configuração atual.')}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {extractColors.map(color => (
            <div key={color} className="flex flex-col items-center gap-1">
              <div 
                className="w-full h-12 rounded-lg border border-white/10 cursor-pointer relative flex items-center justify-center"
                style={{ backgroundColor: color }}
                onClick={() => handleCopy(color)}
              >
                {copiedColor === color && (
                  <Check size={20} className="text-white drop-shadow-md" />
                )}
              </div>
              <button 
                onClick={() => handleCopy(color)}
                className="text-[10px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                title={t('copy_hex', 'Copiar código HEX')}
              >
                {color} <Copy size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPaletteExtractor;
