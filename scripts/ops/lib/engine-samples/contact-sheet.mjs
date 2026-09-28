import path from 'node:path';
import sharp from 'sharp';

export async function buildContactSheet(title, jpgPaths, sheetPath) {
  if (jpgPaths.length === 0) return;

  const meta = await Promise.all(jpgPaths.map(p => sharp(p).metadata()));
  const cellW = Math.max(...meta.map(m => m.width || 0));
  const cellH = Math.max(...meta.map(m => m.height || 0));
  const cols = Math.min(3, jpgPaths.length);
  const rows = Math.ceil(jpgPaths.length / cols);
  const pad = 28;
  const titleH = 74;
  const capH = 42;
  const w = cols * cellW + (cols + 1) * pad;
  const h = titleH + rows * (cellH + capH) + (rows + 1) * pad;

  const overlays = [];
  const bg = sharp({
    create: {
      width: w, height: h, channels: 4,
      background: { r: 8, g: 8, b: 12, alpha: 1 },
    },
  });

  const esc = v => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

  overlays.push({
    input: Buffer.from(`<svg width="${w}" height="${titleH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#08080c"/>
      <text x="${pad}" y="34" fill="#f5f7fb" font-size="28" font-family="Segoe UI,Arial,sans-serif" font-weight="700">${esc(title)}</text>
      <text x="${pad}" y="58" fill="#a9b0bd" font-size="15" font-family="Segoe UI,Arial,sans-serif">Amostras geradas automaticamente</text>
    </svg>`),
    top: 0, left: 0,
  });

  jpgPaths.forEach((jpg, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const left = pad + col * (cellW + pad);
    const top = titleH + pad + row * (cellH + capH);
    overlays.push({ input: jpg, top, left });
    const fname = path.basename(jpg);
    overlays.push({
      input: Buffer.from(`<svg width="${cellW}" height="${capH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#08080c"/>
        <text x="0" y="24" fill="#dce2ea" font-size="18" font-family="Segoe UI,Arial,sans-serif" font-weight="600">${esc(fname)}</text>
      </svg>`),
      top: top + cellH + 10, left,
    });
  });

  await bg.composite(overlays).jpeg({ quality: 92, mozjpeg: true }).toFile(sheetPath);
}