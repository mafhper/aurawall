const fs = require('fs');
const path = require('path');

// --- 1. CORE UTILS (Copied from src/utils) ---

const mulberry32 = (a) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

const toRad = (deg) => deg * (Math.PI / 180.0);

const getBlobPath = (width, height, seedStr, complexity = 5, contrast = 0.3) => {
  let seed = 0;
  for(let i=0; i<seedStr.length; i++) seed = (seed + seedStr.charCodeAt(i)) % 2147483647;
  
  const random = mulberry32(seed);
  const size = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const points = [];
  const angleStep = 360 / complexity;

  for (let i = 0; i < complexity; i++) {
    const angle = i * angleStep;
    const radiusVariance = random() * contrast; 
    const r = size * (1 - contrast + radiusVariance); 
    points.push({
      x: centerX + Math.cos(toRad(angle)) * r,
      y: centerY + Math.sin(toRad(angle)) * r
    });
  }

  const p = [...points];
  let d = `M ${p[0].x} ${p[0].y}`;

  for (let i = 0; i < p.length; i++) {
    const p0 = p[i === 0 ? p.length - 1 : i - 1];
    const p1 = p[i];
    const p2 = p[(i + 1) % p.length];
    const p3 = p[(i + 2) % p.length];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d + " Z";
};

const parseHsl = (hsl) => {
  // Robust parsing without complex regex
  // Replace non-digits/dots with space, then split
  const parts = hsl.replace(/[^\d.]/g, ' ').trim().split(/\s+/);
  if (parts.length < 3) return { h: 0, s: 0, l: 0 };
  return { h: parseFloat(parts[0]), s: parseInt(parts[1]), l: parseInt(parts[2]) };
};

const toHslStr = ({ h, s, l }) => {
  return `hsl(${h % 360}, ${Math.max(0, Math.min(100, s))}%, ${Math.max(0, Math.min(100, l))}%)`;
};

const getHSL = (h, s, l) => toHslStr({ h, s, l });

const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else { return { h: 0, s: 0, l: 0 }; } 

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

const jitter = (val, amount) => val + (Math.random() * amount - (amount / 2));
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const shiftColor = (color, dH, dS, dL) => {
    if (typeof color !== 'string') return color; // Simplified for script
    const hsl = color.startsWith('#') ? hexToHsl(color) : parseHsl(color);
    return toHslStr({
        h: hsl.h + dH,
        s: hsl.s + dS,
        l: hsl.l + dL
    });
};

// --- 2. ENGINE LOGIC (Replicated from src/engines/*.ts) ---

const engines = {
    boreal: (config) => {
        const numShapes = Math.floor(Math.random() * 3) + 3;
        const newShapes = [];
        const baseHue = Math.floor(Math.random() * 360);
        const isDarkTheme = Math.random() > 0.4;
        
        const baseColor = isDarkTheme 
            ? getHSL(baseHue, 40, Math.floor(Math.random() * 10) + 5) 
            : getHSL(baseHue, 20, Math.floor(Math.random() * 10) + 88);
        
        const noise = Math.floor(Math.random() * 25) + 20;
        const safeBlendModes = isDarkTheme
            ? ['screen', 'color-dodge', 'normal', 'lighten'] 
            : ['multiply', 'overlay', 'normal', 'difference'];

        for (let i = 0; i < numShapes; i++) {
             const h = (baseHue + (i * 40)) % 360;
             const s = Math.random() * 40 + 60;
             const l = isDarkTheme ? Math.random() * 40 + 50 : Math.random() * 40 + 10;
             newShapes.push({
               id: `rand-b-${Date.now()}-${i}`,
               type: Math.random() > 0.7 ? 'blob' : 'circle',
               x: Math.random() * 100,
               y: Math.random() * 100,
               size: Math.random() * 80 + 60,
               color: getHSL(h, s, l),
               opacity: Math.random() * 0.4 + 0.5,
               blur: Math.random() * 60 + 60,
               blendMode: safeBlendModes[Math.floor(Math.random() * safeBlendModes.length)],
               complexity: Math.floor(Math.random() * 4) + 4
             });
        }
        return { ...config, baseColor, noise, shapes: newShapes };
    },
    chroma: (config) => {
        const numShapes = Math.floor(Math.random() * 3) + 3; 
        const newShapes = [];
        const baseHue = Math.floor(Math.random() * 360);
        const baseColor = getHSL(baseHue, 10, 5);
        const noise = Math.floor(Math.random() * 40) + 30; 
        const noiseScale = Math.random() * 2 + 2; 
        const acidModes = ['difference', 'exclusion', 'hard-light', 'color-dodge', 'overlay'];

        for (let i = 0; i < numShapes; i++) {
           const h = Math.random() * 360; 
           const s = 100; const l = 50; 
           newShapes.push({
             id: `rand-c-${Date.now()}-${i}`,
             type: Math.random() > 0.3 ? 'blob' : 'circle',
             x: Math.random() * 80 + 10,
             y: Math.random() * 80 + 10,
             size: Math.random() * 100 + 50,
             color: getHSL(h, s, l),
             opacity: Math.random() * 0.5 + 0.5,
             blur: Math.random() * 40 + 10,
             blendMode: acidModes[Math.floor(Math.random() * acidModes.length)],
             complexity: Math.floor(Math.random() * 5) + 5
           });
        }
        return { ...config, baseColor, noise, noiseScale, shapes: newShapes };
    },
    lava: (config) => {
        const numShapes = Math.floor(Math.random() * 4) + 3;
        const newShapes = [];
        const palettes = [{ base: 0, range: 60 }, { base: 260, range: 60 }, { base: 120, range: 60 }];
        const palette = palettes[Math.floor(Math.random() * palettes.length)];
        const baseColor = getHSL(palette.base, 20, 10);

        for (let i = 0; i < numShapes; i++) {
             const h = (palette.base + Math.random() * palette.range) % 360;
             const s = 80 + Math.random() * 20;
             const l = 40 + Math.random() * 30;
             newShapes.push({
               id: `lava-${Date.now()}-${i}`,
               type: 'blob',
               x: Math.random() * 60 + 20,
               y: Math.random() * 80 + 10,
               size: Math.random() * 80 + 80,
               color: getHSL(h, s, l),
               opacity: 0.8,
               blur: 40,
               blendMode: 'screen',
               complexity: 3 + Math.floor(Math.random() * 2)
             });
        }
        return { ...config, baseColor, noise: 15, shapes: newShapes, animation: { ...config.animation, enabled: true, flow: 5, speed: 2 } };
    },
    midnight: (config) => {
        const newShapes = [];
        const baseColor = getHSL(240 + Math.random() * 40, 30, 4);
        for (let i = 0; i < 3; i++) {
            newShapes.push({
                id: `nebula-${i}`, type: 'blob', x: Math.random() * 100, y: Math.random() * 100, size: 150,
                color: getHSL(200 + Math.random() * 100, 60, 20), opacity: 0.3, blur: 100, blendMode: 'screen', complexity: 5
            });
        }
        for (let i = 0; i < 15; i++) {
             newShapes.push({
               id: `star-${i}`, type: 'circle', x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 2 + 1,
               color: '#ffffff', opacity: Math.random() * 0.5 + 0.5, blur: Math.random() > 0.8 ? 2 : 0, blendMode: 'normal',
             });
        }
        return { ...config, baseColor, noise: 10, noiseScale: 1, shapes: newShapes };
    },
    geometrica: (config) => {
        const numShapes = Math.floor(Math.random() * 4) + 2;
        const newShapes = [];
        const colors = ['#E4002B', '#1244A4', '#F3A200', '#000000', '#FFFFFF'];
        const baseColor = '#f0f0f0';
        const gridSteps = [0, 25, 50, 75, 100];
        const sizeSteps = [10, 25, 50, 75];

        for (let i = 0; i < numShapes; i++) {
             const color = colors[Math.floor(Math.random() * colors.length)];
             newShapes.push({
               id: `geo-${Date.now()}-${i}`,
               type: 'circle',
               x: gridSteps[Math.floor(Math.random() * gridSteps.length)],
               y: gridSteps[Math.floor(Math.random() * gridSteps.length)],
               size: sizeSteps[Math.floor(Math.random() * sizeSteps.length)],
               color: color,
               opacity: 0.95,
               blur: 0,
               blendMode: color === '#000000' ? 'multiply' : 'normal',
             });
        }
        return { ...config, baseColor, noise: 8, shapes: newShapes, animation: { ...config.animation, enabled: false } };
    },
    glitch: (config) => {
        const numShapes = Math.floor(Math.random() * 6) + 3;
        const newShapes = [];
        const baseColor = '#050505';

        for (let i = 0; i < numShapes; i++) {
             const cx = Math.random() * 100;
             const cy = Math.random() * 100;
             const baseSize = Math.random() * 50 + 10;
             const offset = Math.random() * 4 + 1;
             newShapes.push({ id: `glitch-${i}-r`, type: 'circle', x: clamp(cx - offset, 0, 100), y: cy, size: baseSize, color: '#ff0000', opacity: 0.8, blur: 2, blendMode: 'screen' });
             newShapes.push({ id: `glitch-${i}-g`, type: 'circle', x: cx, y: clamp(cy - offset, 0, 100), size: baseSize, color: '#00ff00', opacity: 0.8, blur: 2, blendMode: 'screen' });
             newShapes.push({ id: `glitch-${i}-b`, type: 'circle', x: clamp(cx + offset, 0, 100), y: cy, size: baseSize, color: '#0000ff', opacity: 0.8, blur: 2, blendMode: 'screen' });
             if (Math.random() > 0.7) {
                  newShapes.push({ id: `artifact-${i}`, type: 'blob', x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 30 + 5, color: '#ffffff', opacity: 1, blur: 0, blendMode: 'difference', complexity: 10 });
             }
        }
        return { ...config, baseColor, noise: 60, noiseScale: 4, shapes: newShapes, animation: { ...config.animation, enabled: true, noiseAnim: 8, speed: 5 } };
    },
    sakura: (config) => {
        const numShapes = 12;
        const newShapes = [];
        const baseColor = getHSL(340 + Math.random() * 20, 30, 90);
        for (let i = 0; i < numShapes; i++) {
             newShapes.push({
               id: `petal-${i}`, type: 'blob', x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 20 + 10,
               color: getHSL(340 + Math.random() * 30, 80, 85), opacity: 0.6, blur: 5, blendMode: 'multiply', complexity: 3
             });
        }
        return { ...config, baseColor, noise: 15, shapes: newShapes, animation: { ...config.animation, enabled: true, flow: 8, speed: 1 } };
    },
    ember: (config) => {
        const newShapes = [];
        const baseColor = '#100502';
        for (let i = 0; i < 3; i++) {
            newShapes.push({ id: `smoke-${i}`, type: 'blob', x: Math.random() * 100, y: Math.random() * 80, size: 100, color: '#302020', opacity: 0.4, blur: 80, blendMode: 'screen', complexity: 6 });
        }
        for (let i = 0; i < 8; i++) {
             newShapes.push({ id: `spark-${i}`, type: 'circle', x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 5 + 2, color: getHSL(10 + Math.random() * 30, 100, 60), opacity: 0.9, blur: 4, blendMode: 'screen' });
        }
        return { ...config, baseColor, noise: 25, shapes: newShapes, animation: { ...config.animation, enabled: true, flow: 2, speed: 0.5 } };
    },
    oceanic: (config) => {
        const numShapes = Math.floor(Math.random() * 4) + 3;
        const newShapes = [];
        const baseHue = 190 + Math.random() * 40;
        const baseColor = getHSL(baseHue, 60, 10);
        for (let i = 0; i < numShapes; i++) {
             const h = (baseHue + Math.random() * 40 - 20) % 360;
             const s = 60 + Math.random() * 30;
             const l = 20 + Math.random() * 40;
             newShapes.push({
               id: `ocean-${Date.now()}-${i}`, type: 'blob', x: Math.random() * 100, y: Math.random() * 80 + 20, size: Math.random() * 100 + 50,
               color: getHSL(h, s, l), opacity: 0.6, blur: 40, blendMode: Math.random() > 0.6 ? 'overlay' : 'screen', complexity: 4 + Math.floor(Math.random() * 3)
             });
        }
        if (Math.random() > 0.3) {
            newShapes.push({ id: `foam-${Date.now()}`, type: 'blob', x: Math.random() * 100, y: Math.random() * 100, size: 40, color: '#ffffff', opacity: 0.3, blur: 20, blendMode: 'overlay', complexity: 6 });
        }
        return { ...config, baseColor, noise: 15, shapes: newShapes, animation: { ...config.animation, enabled: true, flow: 4, speed: 1.5, colorCycle: true, colorCycleSpeed: 2 } };
    }
};

// --- 3. SVG RENDERER (Mimics WallpaperRenderer.tsx) ---

const renderConfigToSVG = (config) => {
    const { width = 1920, height = 1080, shapes, baseColor, noise, noiseScale, animation } = config;
    const anim = animation || { enabled: true, speed: 5, flow: 2, pulse: 2, rotate: 2, noiseAnim: 0, colorCycle: false };
    
    // Animation CSS
    const baseDuration = 20 / (anim.speed || 1); 
    const colorCycleBaseDuration = 60 / (anim.colorCycleSpeed || 1);
    
    let css = `
      @keyframes noise-shift {
        0% { transform: translate(0,0); }
        25% { transform: translate(-1%, 1%); }
        50% { transform: translate(1%, -1%); }
        75% { transform: translate(-1%, -1%); }
        100% { transform: translate(0,0); }
      }
    `;

    shapes.forEach((shape, i) => {
      const r1 = ((i * 13) % 10) / 10;
      const r2 = ((i * 29) % 10) / 10;
      const r3 = ((i * 37) % 10) / 10;
      
      const flowX = (anim.flow || 0) * (r1 > 0.5 ? 5 : -5);
      const flowY = (anim.flow || 0) * (r2 > 0.5 ? 5 : -5);
      const scaleMin = 1 - ((anim.pulse || 0) / 50);
      const scaleMax = 1 + ((anim.pulse || 0) / 50);
      const rotDir = i % 2 === 0 ? 1 : -1;
      const rotDeg = (anim.rotate || 0) * 15 * rotDir;
      const duration = baseDuration * (0.8 + r1 * 0.4); 
      const delay = -1 * (r2 * 10); 
      const colorAnimDuration = colorCycleBaseDuration * (0.8 + r3 * 0.4);
      const colorAnimDelay = -1 * (r1 * 5);

      css += `
        @keyframes move-${shape.id} {
          0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
          33% { transform: translate(${flowX * 0.7}%, ${flowY * 0.5}%) scale(${scaleMax}) rotate(${rotDeg * 0.3}deg); }
          66% { transform: translate(${flowX * -0.5}%, ${flowY * 0.8}%) scale(${scaleMin}) rotate(${rotDeg * 0.6}deg); }
          100% { transform: translate(0%, 0%) scale(1) rotate(${rotDeg}deg); }
        }
        #shape-${shape.id} {
          transform-origin: ${shape.x}% ${shape.y}%;
          animation: move-${shape.id} ${duration}s ease-in-out infinite alternate;
          animation-delay: ${delay}s;
          ${anim.colorCycle ? `filter: hue-rotate(0deg); animation: move-${shape.id} ${duration}s ease-in-out infinite alternate, hue-rotate ${colorAnimDuration}s linear infinite; animation-delay: ${delay}s, ${colorAnimDelay}s;` : ''}
        }
      `;
    });

    // Background Def
    let bgDef = '';
    let bgFill = typeof baseColor === 'string' ? baseColor : 'url(#bgGradient)';
    
    if (typeof baseColor !== 'string') {
        if (baseColor.type === 'linear') {
            bgDef = `<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${baseColor.angle || 0}, 0.5, 0.5)">
                <stop offset="0%" stop-color="${baseColor.color1}" />
                <stop offset="100%" stop-color="${baseColor.color2}" />
            </linearGradient>`;
        } else {
            bgDef = `<radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="${baseColor.color1}" />
                <stop offset="100%" stop-color="${baseColor.color2}" />
            </radialGradient>`;
        }
    }

    // Shapes
    let shapesSVG = shapes.map(shape => {
        const i = shapes.findIndex(s => s.id === shape.id);
        const r1 = ((i * 13) % 10) / 10;
        const r3 = ((i * 37) % 10) / 10;
        const colorAnimDuration = colorCycleBaseDuration * (0.8 + r3 * 0.4);
        const colorAnimDelay = -1 * (r1 * 5);
        const animateTag = anim.colorCycle ? `
            <animate 
                attributeName="fill"
                values="${shape.color};${shiftColor(shape.color, 60, 0, 0)};${shiftColor(shape.color, 120, 0, 0)};${shape.color}"
                dur="${colorAnimDuration}s"
                begin="${colorAnimDelay}s"
                repeatCount="indefinite"
            />` : '';

        if (shape.type === 'blob') {
            const pixelSize = (shape.size / 100) * width;
            const pathData = getBlobPath(pixelSize, pixelSize, shape.id, shape.complexity || 6, 0.4);
            const tx = (shape.x / 100) * width - pixelSize/2;
            const ty = (shape.y / 100) * height - pixelSize/2;
            
            return `<path id="shape-${shape.id}" d="${pathData}" fill="${shape.color}" opacity="${shape.opacity}" filter="url(#blur-${shape.id})" style="mix-blend-mode: ${shape.blendMode}; transform-box: fill-box; transform: translate(${tx}px, ${ty}px)">${animateTag}</path>`;
        }
        return `<circle id="shape-${shape.id}" cx="${shape.x}%" cy="${shape.y}%" r="${shape.size / 2}%" fill="${shape.color}" opacity="${shape.opacity}" filter="url(#blur-${shape.id})" style="mix-blend-mode: ${shape.blendMode}">${animateTag}</circle>`;
    }).join('\n');

    // Filters
    const noiseFilter = `
        <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="${noiseScale / 1000}" numOctaves="3" stitchTiles="stitch">
                ${anim.noiseAnim > 0 ? `<animate attributeName="seed" values="0;100;0" dur="${2 / (anim.noiseAnim/5)}s" repeatCount="indefinite" />` : ''}
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="linear" slope="${noise / 100}" /></feComponentTransfer>
        </filter>`;

    const blurFilters = shapes.map(s => `
        <filter id="blur-${s.id}" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="${s.blur}" result="coloredBlur" />
        </filter>
    `).join('\n');

    return `
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="background-color: ${typeof baseColor === 'string' ? baseColor : 'transparent'}">
    <defs>
        <style>${css}</style>
        ${bgDef}
        ${noiseFilter}
        ${blurFilters}
    </defs>
    <rect width="100%" height="100%" fill="${bgFill}" />
    <g>${shapesSVG}</g>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="1" style="mix-blend-mode: overlay" />
</svg>`;
};

// --- 4. MAIN LOOP ---

const outputDir = path.join(__dirname, '../../public');
const DEFAULT_CONFIG = {
    width: 1920,
    height: 1080,
    noise: 25,
    noiseScale: 1.5,
    baseColor: '#000000',
    shapes: [],
    animation: { enabled: true, speed: 5, flow: 2, pulse: 2, rotate: 2, noiseAnim: 0, colorCycle: false, colorCycleSpeed: 5 }
};

Object.entries(engines).forEach(([id, randomizer]) => {
    console.log(`Generating BG for ${id}...`);
    const config = randomizer(DEFAULT_CONFIG);
    // Force enable animations with generic settings if not set
    if (!config.animation) config.animation = { ...DEFAULT_CONFIG.animation, enabled: true };
    else config.animation.enabled = true;

    const svgContent = renderConfigToSVG(config);
    fs.writeFileSync(path.join(outputDir, `bg-${id}.svg`), svgContent);
    console.log(`Saved public/bg-${id}.svg`);
});

console.log('All backgrounds generated!');
