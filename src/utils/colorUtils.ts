
// Helper: HSL String to Object
export const parseHsl = (hsl: string) => {
  const match = hsl.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return { h: 0, s: 0, l: 0 };
  return { h: parseFloat(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
};

// Helper: Object to HSL String
export const toHslStr = ({ h, s, l }: { h: number, s: number, l: number }) => {
  return `hsl(${h % 360}, ${Math.max(0, Math.min(100, s))}%, ${Math.max(0, Math.min(100, l))}%)`;
};

// Helper: Hex to HSL
export const hexToHsl = (hex: string) => {
  let r = 0, g = 0, b = 0;
  // Handle #RGB format
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } 
  // Handle #RRGGBB format
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    // Default to black if format is unknown
    return { h: 0, s: 0, l: 0 };
  }

  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Helper: HSL to Hex
export const hslToHex = (hslString: string) => {
    const hsl = parseHsl(hslString);
    let h = hsl.h;
    let s = hsl.s / 100;
    let l = hsl.l / 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
