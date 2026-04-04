import { EngineDefinition, Shape } from '../types';
import { ensureVisibility, applyGrainLock } from '../utils/engineUtils';
import { toHslStr } from '../utils/colorUtils';

const getHSL = (h: number, s: number, l: number) => toHslStr({ h, s, l });
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const quad = (p0: number, p1: number, p2: number, t: number) => {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
};
const petalLike = (id: string, type: Shape['type']) => type === 'blob' || /petal|scatter|han|pd|bb|nb/i.test(id);
const createPetal = (id: string, x: number, y: number, color: string, rotation: number, scaleX: number, scaleY: number, opacity: number, blur: number, size: number): Shape => ({
  id,
  type: 'blob',
  x: clamp(x, 4, 96),
  y: clamp(y, 4, 96),
  size,
  color,
  opacity,
  blur,
  blendMode: 'multiply',
  complexity: 4,
  rotation,
  scaleX,
  scaleY
});
const createBloom = (id: string, x: number, y: number, size: number, color: string, opacity: number, blur: number): Shape => ({
  id,
  type: 'circle',
  x,
  y,
  size,
  color,
  opacity,
  blur,
  blendMode: 'overlay'
});

export const sakuraEngine: EngineDefinition = {
  id: 'sakura',
  meta: {
    name: 'Sakura',
    description: 'A delicadeza da primavera japonesa. Pétalas dançantes, tons pastéis e brisas suaves.',
    tagline: 'Pétalas ao vento e serenidade.',
    promoImage: '/bg-sakura.svg'
  },
  defaults: {},
  randomizer: (config, { isGrainLocked }) => {
    const newShapes: Shape[] = [];
    const baseColor = {
      type: 'radial' as const,
      color1: getHSL(350 + rand(-6, 6), 40, 98),
      color2: getHSL(340 + rand(-8, 8), 28, 90)
    };
    const windAngle = rand(-28, 28);
    const layouts = [
      () => ({
        startX: rand(-10, 8),
        startY: rand(18, 44),
        controlX: rand(34, 50),
        controlY: rand(4, 26),
        endX: rand(82, 108),
        endY: rand(36, 72)
      }),
      () => ({
        startX: rand(-6, 22),
        startY: rand(72, 108),
        controlX: rand(36, 58),
        controlY: rand(26, 52),
        endX: rand(76, 102),
        endY: rand(-4, 30)
      }),
      () => ({
        startX: rand(78, 106),
        startY: rand(16, 48),
        controlX: rand(42, 64),
        controlY: rand(26, 52),
        endX: rand(-10, 20),
        endY: rand(52, 92)
      }),
      () => ({
        startX: rand(10, 30),
        startY: rand(-8, 16),
        controlX: rand(44, 62),
        controlY: rand(32, 56),
        endX: rand(64, 92),
        endY: rand(82, 108)
      })
    ];
    const streamCount = Math.floor(rand(4, 7));
    const streams = Array.from({ length: streamCount }, () => layouts[Math.floor(Math.random() * layouts.length)]());

    streams.forEach((stream, streamIndex) => {
      const petalsInStream = Math.floor(rand(6, 11));
      const sway = rand(4, 10);
      const arc = rand(4, 16);

      for (let i = 0; i < petalsInStream; i++) {
        const progress = i / Math.max(1, petalsInStream - 1);
        const wave = Math.sin(progress * Math.PI * 2 + streamIndex) * sway;
        const lift = Math.cos(progress * Math.PI * 1.4 + streamIndex) * arc;
        const petalX = clamp(quad(stream.startX, stream.controlX, stream.endX, progress) + wave + rand(-5, 5), 4, 96);
        const petalY = clamp(quad(stream.startY, stream.controlY, stream.endY, progress) + lift + rand(-5, 5), 4, 96);

        newShapes.push({
          id: `petal-${streamIndex}-${i}`,
          type: 'blob',
          x: petalX,
          y: petalY,
          size: rand(5, 12.5),
          color: getHSL(338 + rand(-10, 18), rand(60, 86), rand(74, 89)),
          opacity: rand(0.28, 0.62),
          blur: rand(0.2, 1.8),
          blendMode: Math.random() > 0.7 ? 'soft-light' : 'multiply',
          complexity: 4,
          rotation: windAngle + rand(-40, 40),
          scaleX: rand(2.1, 4),
          scaleY: rand(0.18, 0.46)
        });
      }
    });

    for (let i = 0; i < 16; i++) {
      newShapes.push({
        id: `scatter-${i}`,
        type: 'blob',
        x: rand(6, 94),
        y: rand(6, 94),
        size: rand(4, 9.5),
        color: getHSL(342 + rand(-8, 16), rand(58, 82), rand(76, 92)),
        opacity: rand(0.18, 0.42),
        blur: rand(0.2, 1.8),
        blendMode: 'multiply',
        complexity: 4,
        rotation: rand(-42, 42),
        scaleX: rand(2, 3.2),
        scaleY: rand(0.24, 0.54)
      });
    }

    for (let i = 0; i < 5; i++) {
      newShapes.push({
        id: `bloom-${i}`,
        type: 'circle',
        x: rand(16, 84),
        y: rand(16, 84),
        size: rand(20, 44),
        color: getHSL(334 + rand(-10, 12), rand(54, 70), rand(86, 94)),
        opacity: rand(0.1, 0.22),
        blur: rand(20, 42),
        blendMode: 'overlay'
      });
    }

    for (let i = 0; i < 3; i++) {
      newShapes.push({
        id: `mist-${i}`,
        type: 'rect',
        x: rand(30, 74),
        y: rand(28, 70),
        size: rand(44, 68),
        color: getHSL(344 + rand(-10, 10), rand(26, 40), rand(88, 94)),
        opacity: rand(0.12, 0.18),
        blur: rand(20, 34),
        blendMode: 'soft-light',
        rotation: rand(-14, 14),
        scaleX: rand(1.8, 2.6),
        scaleY: rand(0.16, 0.24)
      });
    }

    const grain = applyGrainLock(config, isGrainLocked, 12, 0.9);

    return {
        ...config,
        baseColor,
        ...grain,
        shapes: ensureVisibility(newShapes, baseColor),
        animation: {
            ...config.animation,
            enabled: true,
            flow: 5,
            speed: 0.8,
            pulse: 1.4,
            rotate: 1.2
        }
    };
  },
  variations: [
      {
          name: 'Night Blossom',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              const petalBases = cfg.shapes.filter(shape => petalLike(shape.id, shape.type));
              const nightPetals = petalBases.flatMap((shape, index) => ([
                createPetal(
                  `night-main-${index}`,
                  shape.x + 4 + index * 3,
                  shape.y - 4 + (index % 3) * 5,
                  getHSL(332 + index * 3, 58, 48),
                  (shape.rotation || 0) - 8,
                  Math.max(2.2, (shape.scaleX || 2) * 1.08),
                  Math.min(0.52, Math.max(0.22, (shape.scaleY || 0.4) * 0.96)),
                  0.44,
                  2.4,
                  Math.max(8, shape.size * 0.92)
                ),
                createPetal(
                  `night-shadow-${index}`,
                  shape.x - 8 - index * 1.2,
                  shape.y + 10 - (index % 2) * 4,
                  getHSL(324 + index * 2, 24, 26),
                  (shape.rotation || 0) + 18,
                  Math.max(2.4, (shape.scaleX || 2) * 1.26),
                  Math.min(0.42, Math.max(0.2, (shape.scaleY || 0.4) * 0.9)),
                  0.34,
                  5,
                  Math.max(10, shape.size * 1.08)
                )
              ]));

              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#170a11',
                  shapes: ensureVisibility([
                    ...nightPetals,
                    createBloom('night-bloom-core', 62, 34, 24, '#ffe9f4', 0.18, 18),
                    createBloom('night-bloom-halo', 58, 48, 42, '#ad4a78', 0.12, 36)
                  ], '#170a11')
              };
          }
      },
      {
          name: 'Morning Mist',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, 10, 0.8);
              const petalBases = cfg.shapes.filter(shape => petalLike(shape.id, shape.type));
              const mistPetals = petalBases.flatMap((shape, index) => ([
                createPetal(
                  `mist-main-${index}`,
                  16 + index * 16,
                  26 + (index % 3) * 10,
                  getHSL(336 + index * 2, 56, 82),
                  -22 + index * 8,
                  2.6,
                  0.24,
                  0.22,
                  5.4,
                  Math.max(8, shape.size * 0.9)
                ),
                createPetal(
                  `mist-trail-${index}`,
                  42 + index * 11,
                  48 + (index % 2) * 8,
                  getHSL(346 + index * 2, 42, 88),
                  -10 + index * 6,
                  2.2,
                  0.28,
                  0.18,
                  8,
                  Math.max(10, shape.size)
                )
              ]));

              return {
                  ...cfg,
                  ...grain,
                  baseColor: {
                    type: 'radial' as const,
                    color1: '#fffaf8',
                    color2: '#f8e7ed'
                  },
                  shapes: ensureVisibility([
                    ...mistPetals,
                    {
                      id: 'mist-band-1',
                      type: 'rect',
                      x: 46,
                      y: 32,
                      size: 68,
                      color: '#fff7fb',
                      opacity: 0.16,
                      blur: 26,
                      blendMode: 'soft-light',
                      rotation: -10,
                      scaleX: 2.8,
                      scaleY: 0.18
                    },
                    {
                      id: 'mist-band-2',
                      type: 'rect',
                      x: 58,
                      y: 58,
                      size: 60,
                      color: '#fff7fb',
                      opacity: 0.14,
                      blur: 22,
                      blendMode: 'soft-light',
                      rotation: 12,
                      scaleX: 2.4,
                      scaleY: 0.16
                    },
                    createBloom('mist-bloom', 74, 28, 28, '#fff8fb', 0.14, 26)
                  ], '#fffaf8')
              };
          }
      },
      {
          name: 'Warm Breeze',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise);
              const petalBases = cfg.shapes.filter(shape => petalLike(shape.id, shape.type));
              const warmPetals = petalBases.flatMap((shape, index) => ([
                createPetal(
                  `warm-main-${index}`,
                  14 + index * 14,
                  70 - (index % 4) * 10,
                  getHSL(18 + index * 3, 78, 78),
                  -30 + index * 7,
                  2.8,
                  0.24,
                  0.3,
                  2.6,
                  Math.max(10, shape.size * 1.04)
                ),
                createPetal(
                  `warm-glow-${index}`,
                  32 + index * 12,
                  42 - (index % 3) * 6,
                  getHSL(354 + index * 2, 68, 84),
                  -18 + index * 6,
                  2.3,
                  0.3,
                  0.2,
                  6.4,
                  Math.max(9, shape.size * 0.92)
                )
              ]));

              return {
                  ...cfg,
                  ...grain,
                  baseColor: {
                    type: 'radial' as const,
                    color1: '#fff4ee',
                    color2: '#f8ddd8'
                  },
                  shapes: ensureVisibility([
                    ...warmPetals,
                    createBloom('warm-core', 70, 62, 24, '#ffd1b0', 0.16, 24),
                    createBloom('warm-sun', 18, 22, 32, '#fff1e8', 0.12, 28)
                  ], '#fff4ee')
              };
          }
      },
      {
          name: 'Petal Rain',
          transform: (cfg, { isGrainLocked } = { isGrainLocked: false }) => {
              const grain = applyGrainLock(cfg, isGrainLocked, cfg.noise + 2);
              const petalBases = cfg.shapes.filter(shape => petalLike(shape.id, shape.type));
              const rainPetals = petalBases.flatMap((shape, index) => {
                const laneX = 18 + index * 14;
                return [
                  createPetal(
                    `rain-top-${index}`,
                    laneX,
                    12 + (index % 3) * 6,
                    getHSL(338 + index * 2, 70, 76),
                    74 + index * 3,
                    2.8,
                    0.2,
                    0.28,
                    2,
                    Math.max(9, shape.size)
                  ),
                  createPetal(
                    `rain-mid-${index}`,
                    laneX + 8,
                    36 + (index % 4) * 8,
                    getHSL(346 + index * 2, 62, 82),
                    82 + index * 2,
                    2.4,
                    0.22,
                    0.24,
                    2.8,
                    Math.max(8, shape.size * 0.94)
                  ),
                  createPetal(
                    `rain-low-${index}`,
                    laneX - 4,
                    62 + (index % 3) * 10,
                    getHSL(330 + index * 3, 52, 70),
                    86 + index * 2,
                    2.2,
                    0.24,
                    0.22,
                    3.4,
                    Math.max(8, shape.size * 0.9)
                  )
                ];
              });
              return {
                  ...cfg,
                  ...grain,
                  baseColor: '#fff6fa',
                  shapes: ensureVisibility([
                    ...rainPetals,
                    {
                      id: 'rain-mist',
                      type: 'rect',
                      x: 58,
                      y: 54,
                      size: 54,
                      color: '#fff1f5',
                      opacity: 0.1,
                      blur: 24,
                      blendMode: 'soft-light',
                      rotation: 12,
                      scaleX: 2.1,
                      scaleY: 0.18
                    }
                  ], '#fff6fa')
              };
          }
      }
  ]
};
