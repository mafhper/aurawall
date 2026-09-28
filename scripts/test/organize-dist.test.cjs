/**
 * Testes do passo de aplanar `dist/`.
 *
 * O passo saiu do `deploy.yml` (`cp -r dist/client/* dist/`) para o manifesto,
 * onde passou a ser rodável localmente. Re-run de deploy é o caminho normal de
 * recovery do Pages, então idempotência não é propriedade opcional — é requisito.
 *
 * Estes testes usam uma árvore de `dist/` sintética em vez do build real: são
 * rápidos, e não dependem do resultado do Vite para provar o comportamento do
 * script.
 *
 * Roda com: node --test scripts/test/organize-dist.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const organize = path.join(__dirname, '..', 'ops', 'organize-dist.cjs');

/** Árvore de dist/ sintética que imita o build real: app, client, server. */
function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awr12-'));
  const dist = path.join(root, 'dist');

  const write = (rel, content) => {
    const full = path.join(dist, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };

  // o editor
  write('app/index.html', '<html>app</html>');
  write('app/assets/editor.js', 'editor');
  write('app/README.md', 'app readme');

  // o site promo
  write('client/index.html', '<html>promo</html>');
  write('client/404.html', '<html>404</html>');
  write('client/bg-midnight.svg', '<svg/>');
  write('client/assets/main.js', 'main');
  write('client/about/index.html', '<html>about</html>');
  write('client/creation/index.html', '<html>creation</html>');

  // o bundle SSR
  write('server/entry.mjs', 'ssr');

  return { root, dist };
}

const listAll = (dir, base = dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listAll(full, base, acc);
    else acc.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return acc;
};

// O script resolve dist/ a partir do próprio __dirname. Para testar com uma
// árvore sintética, rodamos uma cópia do script com o caminho reescrito — é o
// jeito de não depender de CWD nem sujar o dist/ real.
function runOn(dist) {
  const src = fs.readFileSync(organize, 'utf-8');
  const patched = src.replace(
    "path.join(__dirname, '..', '..', 'dist')",
    `path.join(${JSON.stringify(dist).replace(/"/g, "'")})`
  );
  const tmpScript = path.join(path.dirname(dist), 'organize-patched.cjs');
  fs.writeFileSync(tmpScript, patched);
  try {
    return execFileSync(process.execPath, [tmpScript], { encoding: 'utf-8' });
  } finally {
    fs.unlinkSync(tmpScript);
  }
}

test('move o conteúdo do client para a raiz e remove dist/client', () => {
  const { dist } = makeFixture();
  runOn(dist);

  assert.ok(fs.existsSync(path.join(dist, 'index.html')), 'index.html deve estar na raiz');
  assert.ok(fs.existsSync(path.join(dist, 'bg-midnight.svg')), 'os bg-*.svg vão para a raiz');
  assert.ok(fs.existsSync(path.join(dist, 'about', 'index.html')), 'o prerender sobe inteiro');
  assert.ok(fs.existsSync(path.join(dist, 'creation', 'index.html')), 'subpágina de prerender sobe');
  assert.ok(fs.existsSync(path.join(dist, 'assets', 'main.js')), 'os assets sobem');
  assert.ok(!fs.existsSync(path.join(dist, 'client')), 'dist/client é removido');
});

test('não toca em dist/app nem em dist/server', () => {
  const { dist } = makeFixture();
  runOn(dist);

  assert.ok(fs.existsSync(path.join(dist, 'app', 'index.html')), 'o editor fica onde estava');
  assert.ok(fs.existsSync(path.join(dist, 'app', 'assets', 'editor.js')), 'os assets do editor ficam');
  assert.ok(fs.existsSync(path.join(dist, 'server', 'entry.mjs')), 'o bundle SSR fica');
  assert.equal(fs.readFileSync(path.join(dist, 'app', 'index.html'), 'utf-8'), '<html>app</html>');
});

test('é idempotente: a segunda execução não muda nada', () => {
  const { dist } = makeFixture();
  runOn(dist);
  const antes = listAll(dist).sort();
  const mtime = fs.statSync(path.join(dist, 'index.html')).mtimeMs;

  const saida = runOn(dist);
  const depois = listAll(dist).sort();

  assert.deepEqual(depois, antes, 'a lista de arquivos não pode mudar');
  assert.equal(fs.statSync(path.join(dist, 'index.html')).mtimeMs, mtime, 'nada pode ser reescrito');
  assert.match(saida, /já está aplanado/, 'a segunda execução deve dizer que não há o que fazer');
});

test('não duplica quando rodar muitas vezes', () => {
  const { dist } = makeFixture();
  for (let i = 0; i < 5; i++) runOn(dist);
  const arquivos = listAll(dist);
  assert.equal(new Set(arquivos).size, arquivos.length, 'não pode haver caminho repetido');
  assert.equal(arquivos.length, 10, 'o total tem que ser o mesmo da primeira execução');
});

test('preserva o conteúdo, não só o nome do arquivo', () => {
  const { dist } = makeFixture();
  runOn(dist);
  assert.equal(fs.readFileSync(path.join(dist, 'index.html'), 'utf-8'), '<html>promo</html>');
  assert.equal(fs.readFileSync(path.join(dist, 'assets', 'main.js'), 'utf-8'), 'main');
  assert.equal(fs.readFileSync(path.join(dist, 'about', 'index.html'), 'utf-8'), '<html>about</html>');
});

test('falha com mensagem clara quando dist/ não existe', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awr12-'));
  const dist = path.join(root, 'dist');
  const src = fs.readFileSync(organize, 'utf-8');
  const patched = src.replace(
    "path.join(__dirname, '..', '..', 'dist')",
    `path.join(${JSON.stringify(dist).replace(/"/g, "'")})`
  );
  const tmpScript = path.join(root, 'organize-patched.cjs');
  fs.writeFileSync(tmpScript, patched);

  assert.throws(
    () => execFileSync(process.execPath, [tmpScript], { encoding: 'utf-8', stdio: 'pipe' }),
    (e) => e.status === 1 && /dist/.test(e.stderr),
    'deve sair com código 1 e falar de dist/'
  );
  fs.unlinkSync(tmpScript);
});

test('o pacote tem o alvo build:dist e o deploy usa ele', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
  assert.equal(pkg.scripts['build:dist'], 'npm run build && node scripts/ops/organize-dist.cjs');
  assert.ok(pkg.scripts.build.includes('clean-dist'), 'o build tem que limpar dist/ antes');

  const deploy = fs.readFileSync(
    path.join(__dirname, '..', '..', '.github', 'workflows', 'deploy.yml'),
    'utf-8'
  );
  assert.match(deploy, /npm run build:dist/, 'o deploy tem que usar build:dist');
  assert.ok(!/cp -r dist\/client/.test(deploy), 'o passo de shell não pode continuar no workflow');
});
