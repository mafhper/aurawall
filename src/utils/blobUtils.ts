
// Simple Pseudo-Random Number Generator (PRNG) to ensure blobs look the same every render
// based on their ID, rather than jittering frantically.
const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

// Convert degrees to radians
const toRad = (deg: number) => deg * (Math.PI / 180.0);

interface Point { x: number; y: number; }

// Catmull-Rom to Cubic Bezier conversion for smooth SVG paths
export const getBlobPath = (
  width: number, 
  height: number, 
  seedStr: string, 
  complexity: number = 5, 
  contrast: number = 0.3 // How much the radius varies (0 to 1)
): string => {
  // Hash the seed string to an integer
  let seed = 0;
  for(let i=0; i<seedStr.length; i++) seed = (seed + seedStr.charCodeAt(i)) % 2147483647;
  
  const random = mulberry32(seed);
  
  const size = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const points: Point[] = [];
  const angleStep = 360 / complexity;

  // Generate points
  for (let i = 0; i < complexity; i++) {
    const angle = i * angleStep;
    // Randomize radius for "blobbiness"
    // We maintain at least (1-contrast) of the size so it doesn't collapse to center
    const radiusVariance = random() * contrast; 
    const r = size * (1 - contrast + radiusVariance); 
    
    points.push({
      x: centerX + Math.cos(toRad(angle)) * r,
      y: centerY + Math.sin(toRad(angle)) * r
    });
  }

  // Close the loop for the spline math
  // We wrap around the array to calculate tangents for start/end points correctly
  const p = [...points];

  // Build SVG Path Command
  // Using a simplified smoothing technique where control points are calculated from neighbors
  let d = `M ${p[0].x} ${p[0].y}`;

  for (let i = 0; i < p.length; i++) {
    const p0 = p[i === 0 ? p.length - 1 : i - 1];
    const p1 = p[i];
    const p2 = p[(i + 1) % p.length];
    const p3 = p[(i + 2) % p.length];

    // Catmull-Rom to Bezier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }

  return d + " Z";
};
