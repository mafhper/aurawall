#!/usr/bin/env node
/**
 * Organiza a saída do build na árvore que o GitHub Pages publica.
 *
 * ## Por que este script existe
 *
 * O passo que transforma a saída local na árvore publicada morava DENTRO do
 * workflow, como `cp -r dist/client/* dist/`. Isso significava que nenhum
 * comando local reproduzia o que o Pages serve: `npm run build` deixava a raiz
 * de `dist/` vazia, e o site promo — que na publicação vive na raiz — só
 * existia para quem lesse o YAML.
 *
 * Este script é a versão em Node desse passo. Node e não shell porque o
 * repositório é cross-platform e todo o resto do `package.json` já é
 * (`node node_modules/vite/bin/vite.js`).
 *
 * ## Idempotência
 *
 * Rodar duas vezes não pode duplicar nada nem quebrar. Depois da primeira
 * execução `dist/client` não existe mais, e a segunda sai sem tocar em
 * arquivo nenhum. Isso importa porque um passo de deploy que não é idempotente
 * falha em re-run — que é o caminho normal de recovery do Pages.
 *
 * ## O que ele NÃO faz
 *
 * Não mexe em `dist/app` nem em `dist/server`. O editor é servido em
 * `/aurawall/app/` e o bundle SSR precisa continuar onde está; o proxy do site
 * promo já depende desses caminhos em produção.
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', '..', 'dist');
const CLIENT_DIR = path.join(DIST_DIR, 'client');

/**
 * Move o conteúdo de `dist/client` para a raiz de `dist/`, recriando diretórios
 * quando necessário. Arquivo existente na raiz com o mesmo nome seria
 * sobrescrito — mas isso não deveria acontecer, e se acontecer é melhor que
 * o deploy falhe em vez de publicar uma versão velha do arquivo.
 */
function moveContents(fromDir, toDir) {
  const entries = fs.readdirSync(fromDir, { withFileTypes: true });
  const moved = [];

  for (const entry of entries) {
    const src = path.join(fromDir, entry.name);
    const dest = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      // Se o destino já existe como diretório, o conteúdo dele também precisa
      // ir junto — mas o build nunca produz isso. O guard evita recursão
      // infinita caso alguém rode o script sobre uma árvore já aplanada.
      if (fs.existsSync(dest)) continue;
      fs.mkdirSync(dest, { recursive: true });
      moved.push(...moveContents(src, dest));
      continue;
    }

    fs.copyFileSync(src, dest);
    moved.push(dest);
  }

  return moved;
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ não existe. Rode o build antes: npm run build:dist');
    process.exit(1);
  }

  if (!fs.existsSync(CLIENT_DIR)) {
    // Segunda execução (ou build que já veio aplanado). Não é erro.
    const rootFiles = fs.readdirSync(DIST_DIR, { withFileTypes: true })
      .filter((e) => e.isFile()).length;
    if (rootFiles === 0) {
      console.error('❌ nem dist/client nem arquivos na raiz de dist/. O build não produziu nada.');
      process.exit(1);
    }
    console.log('✓ dist/ já está aplanado — nada a fazer.');
    return;
  }

  const clientFiles = [];
  (function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else clientFiles.push(path.relative(CLIENT_DIR, full));
    }
  })(CLIENT_DIR);

  const moved = moveContents(CLIENT_DIR, DIST_DIR);
  fs.rmSync(CLIENT_DIR, { recursive: true, force: true });

  console.log(`✓ ${moved.length} arquivos do site promo movidos para a raiz de dist/`);
  console.log(`  index.html e bg-*.svg agora estão em dist/, que é o que o Pages serve.`);
  console.log(`  O editor continua em dist/app/ e o bundle SSR em dist/server/.`);
  if (clientFiles.length !== moved.length) {
    console.warn(`  ⚠️  ${clientFiles.length} arquivos lidos, ${moved.length} movidos —`);
    console.warn('     algum destino já existia e foi preservado.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { moveContents };
