#!/usr/bin/env node
/**
 * Remove `dist/` antes do build.
 *
 * ## Por que isso é necessário
 *
 * O build do site promo tem `outDir: '../dist'` e `emptyOutDir: true`, mas o
 * Vite **não** esvazia um `outDir` que está fora da raiz do projeto. Então
 * `dist/app` é limpo pelo build do editor e `dist/client` pelo do promo — mas a
 * raiz de `dist/` nunca é limpa.
 *
 * O efeito só aparece depois que existe algo na raiz, e o passo de aplanar
 * (`organize-dist.cjs`) é exatamente o que coloca coisas lá. Medido:
 *
 *   npm run build:dist   → raiz com 18 arquivos + about/ assets/ …  (gate: 127)
 *   npm run build        → os 18 continuam lá, e client/ volta         (gate: 184)
 *
 * 184 é lixo da execução anterior contado como se fosse output atual. Isso
 * tornava o gate de performance um número sem significado, e é a mesma classe do
 * bug que a AWR12 veio resolver: o build local e o do Pages partindo de
 * estados diferentes.
 *
 * ## Custo
 *
 * Um `rm -rf` de ~6 MB. Barato comparado com um gate que mede a árvore errada.
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', '..', 'dist');

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('✓ dist/ não existe — nada a limpar.');
    return;
  }

  const antes = fs.readdirSync(DIST_DIR).length;
  fs.rmSync(DIST_DIR, { recursive: true, force: true });

  if (antes === 0) {
    console.log('✓ dist/ estava vazio.');
  } else {
    console.log(`✓ dist/ limpo (${antes} ${antes === 1 ? 'entrada' : 'entradas'} removidas).`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DIST_DIR };
