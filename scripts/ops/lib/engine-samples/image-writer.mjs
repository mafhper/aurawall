import fs from 'node:fs/promises';
import sharp from 'sharp';

export async function writeVariants(formats, svg, basePath, quality) {
  const buf = Buffer.from(svg);
  if (formats.includes('svg')) {
    await fs.writeFile(`${basePath}.svg`, buf);
  }
  if (formats.includes('jpg') || formats.includes('jpeg')) {
    await sharp(buf)
      .flatten({ background: '#000' })
      .jpeg({ quality, mozjpeg: true })
      .toFile(`${basePath}.jpg`);
  }
}