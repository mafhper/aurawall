import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Gera um arquivo index.html para visualização das amostras.
 * @param {string} outputDir - Diretório onde as imagens estão.
 * @param {object[]} samples - Array do manifesto com informações das amostras.
 * @param {object} options - Configurações (nested, formats, etc.)
 */
export async function generateHtmlGallery(outputDir, samples, options) {
  const images = samples.filter(s => s.files.jpg || s.files.svg);
  if (images.length === 0) return;

  const htmlParts = [];
  htmlParts.push(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Amostras Aurawall</title>
<style>
  body { background: #0a0a0f; color: #ddd; font-family: system-ui, sans-serif; padding: 2rem; }
  h1 { color: #f5f7fb; }
  .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
  .card { background: #1a1a24; border-radius: 12px; overflow: hidden; }
  .card img { width: 100%; display: block; }
  .card .info { padding: 0.75rem 1rem; font-size: 0.85rem; }
  .tag { background: #2d2d3a; padding: 0.15rem 0.5rem; border-radius: 4px; margin-right: 0.25rem; }
</style></head><body>
<h1>🎨 Aurawall – Amostras</h1>
<div class="gallery">`);

  for (const sample of images) {
    const imgSrc = sample.files.jpg || sample.files.svg;
    const relativeSrc = path.relative(outputDir, imgSrc).replace(/\\/g, '/');
    const meta = sample.meta || sample;
    htmlParts.push(`
  <div class="card">
    <img src="${relativeSrc}" alt="${meta.engineId || meta.presetId}">
    <div class="info">
      <span class="tag">engine: ${meta.engineId || meta.presetId}</span>
      ${meta.seed !== undefined ? `<span class="tag">seed ${meta.seed}</span>` : ''}
      ${meta.presetName ? `<span class="tag">${meta.presetName}</span>` : ''}
      ${meta.category ? `<span class="tag">${meta.category}</span>` : ''}
    </div>
  </div>`);
  }

  htmlParts.push(`</div></body></html>`);
  await fs.writeFile(path.join(outputDir, 'index.html'), htmlParts.join('\n'));
}