/**
 * Testes do cabeçalho de identidade.
 *
 * O critério de aceite da AWR20 é *"em CI (sem TTY) nenhum cabeçalho é impresso"*.
 * É uma propriedade que **não se vê** quando quebra: o script sai 0, o dev sobe, e o
 * ruído aparece no log da CI como uma faixa colorida que ninguém sabe de onde veio.
 * Por isso ela é testada, e não apenas lembrada.
 *
 * Os testes de largura existem porque o erro é sutil: com ANSI no meio, `String.length`
 * conta os bytes do escape e o padding sai errado **na tela**, não no teste.
 *
 * Roda com: node --test scripts/test/welcome.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { execFileSync, spawnSync } = require('child_process');

const repo = path.join(__dirname, '..', '..');
const welcome = path.join(repo, 'scripts', 'welcome.js');

const ESC = String.fromCharCode(27);
const A = { reset: ESC + '[0m', dim: ESC + '[2m', cyan: ESC + '[36m' };

/** O módulo é ESM; de um teste .cjs só dá para carregar por import() dinâmico. */
const m = () => import('../welcome.js');

const identidade = { name: 'aurawall', version: '1.0.0', description: 'Vector-first wallpaper generator.' };

// ── A guarda de TTY, que é o critério de aceite ────────────────────────────

test('sem TTY não produz um único byte em stdout — que é o caso da CI', () => {
  // execFileSync com pipe: stdout NÃO é TTY, exatamente como na CI.
  const out = execFileSync(process.execPath, [welcome], { encoding: 'utf-8', cwd: repo });
  assert.equal(out, '', 'sem TTY a saída tem que ser literalmente vazia');
});

test('sem TTY, stderr também fica vazio e o exit code é 0', () => {
  // `stderr` não é saída alternativa: usá-lo para "escapar" do teste de stdout
  // continuaria poluindo a CI.
  const r = spawnSync(process.execPath, [welcome], { encoding: 'utf-8', cwd: repo });
  assert.equal(r.stdout, '', 'stdout vazio');
  assert.equal(r.stderr, '', 'stderr vazio');
  assert.equal(r.status, 0, 'e sai com 0 — um cabeçalho nunca bloqueia o dev');
});

test('sem TTY, o package.json nem chega a ser lido', () => {
  // A guarda precisa vir ANTES da leitura. Se viesse depois, o script já teria
  // preparado a saída; a propriedade seria "saída descartada", não "nenhum output".
  // Renomeando o package.json, um script que lesse antes da guarda quebraria.
  const pkg = path.join(repo, 'package.json');
  const backup = pkg + '.welcome-test.bak';
  fs.renameSync(pkg, backup);
  try {
    const r = spawnSync(process.execPath, [welcome], { encoding: 'utf-8', cwd: repo });
    assert.equal(r.stdout, '', 'sem package.json e sem TTY, continua sem saída');
    assert.equal(r.status, 0, 'e sem quebrar');
  } finally {
    fs.renameSync(backup, pkg);
  }
});

// ── Largura visível: o detalhe que falha na tela, não no teste ────────────

test('visibleWidth conta colunas, não bytes de escape', async () => {
  const mod = await m();
  const colored = A.cyan + '[web]' + A.reset;
  // ESC + '[36m' são 5 caracteres, ESC + '[0m' são 4: 9 bytes de escape.
  assert.equal(colored.length, 14, 'o comprimento bruto inclui os 9 bytes dos escapes');
  assert.equal(mod.visibleWidth(colored), 5, 'a largura visível é só o texto que se vê');
});

test('a caixa cabe em 80 colunas visíveis', async () => {
  const mod = await m();
  const out = mod.render({
    ...identidade,
    description:
      'Vector-first wallpaper generator. Editor and promo site are both static, so it runs without a backend.',
  });
  for (const line of out.split('\n')) {
    const w = mod.visibleWidth(line);
    assert.ok(w <= 80, `linha de ${w} colunas excede 80: ${JSON.stringify(mod.stripAnsi(line))}`);
  }
});

test('truncate corta por largura visível, não por String.length', async () => {
  const mod = await m();
  const longo = A.dim + 'x'.repeat(200) + A.reset;
  const cortado = mod.truncate(longo, 20);
  assert.equal(mod.visibleWidth(cortado), 20, 'tem que preencher exatamente 20 colunas');
  assert.ok(mod.stripAnsi(cortado).endsWith('…'), 'terminando em reticência');
  // o erro que este teste existe para pegar: contando bytes, "corta" cedo demais
  // e a linha fica visivelmente mais curta que o orçamento.
});

test('o que já cabe não é cortado', async () => {
  const mod = await m();
  assert.equal(mod.truncate('curto', 20), 'curto');
  const comAnsi = A.dim + 'curto' + A.reset;
  assert.equal(mod.truncate(comAnsi, 20), comAnsi, 'ANSI não conta para o corte');
});

test('o padding é calculado com a largura visível', async () => {
  const mod = await m();
  // Se o padding usasse String.length, um rótulo com ANSI desalinharia a coluna.
  const out = mod.stripAnsi(mod.render(identidade));
  const linhas = out.split('\n');
  const dev = linhas.find((l) => /app\s+editor/.test(l));
  const promo = linhas.find((l) => /promo\s+site/.test(l));
  assert.equal(dev.indexOf('http'), promo.indexOf('http'), 'as URLs alinham entre si');
});

// ── O conteúdo: o que o cabeçalho promete ─────────────────────────────────

test('o cabeçalho declara as duas superfícies deste projeto', async () => {
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.match(out, /app\s+editor\s+http:\/\/localhost:3000/);
  assert.match(out, /promo\s+site\s+http:\/\/localhost:5173/);
});

test('identidade vem do package.json — inclusive a descrição', async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf-8'));
  assert.ok(pkg.description, 'o cabeçalho mostra descrição, então ela tem que existir');
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.ok(out.includes(pkg.name), 'nome');
  assert.ok(out.includes('v' + pkg.version), 'versão');
  assert.ok(out.includes(identidade.description), 'descrição');
});

test('a stack é declarada, não inferida do node_modules', async () => {
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.match(out, /React · TypeScript · Vite/);
  // o antipadrão que a investigação da frota encontrou: despejar dependências
  assert.ok(!/sharp|eslint|postcss/i.test(out), 'não deve listar dependências de implementação');
});

test('não repete o que o Vite e o concurrently vão dizer', async () => {
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.ok(!/starting vite/i.test(out), '"o que está acontecendo agora" é do Vite');
  assert.ok(!/watching for file changes/i.test(out), 'nem o log de watch');
});

test('sem console.clear — entra no fluxo, não apaga o anterior', () => {
  // Os comentários do arquivo *mencionam* console.clear para explicar por que ele
  // não é usado. Então o teste tem que olhar o código, não a palavra.
  const codigo = fs
    .readFileSync(welcome, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '') // comentários de bloco
    .replace(/(^|[^:])\/\/.*$/gm, '$1'); // comentários de linha
  assert.ok(!/console\s*\.\s*clear/.test(codigo), 'console.clear quebra terminal integrado, split e IDE');
});

test('a guarda de TTY vem antes de qualquer leitura', () => {
  // ordem no código, não só comportamento: se alguém mover a guarda para baixo
  // por refatoração, este teste avisa antes do próximo rodar em CI.
  const src = fs.readFileSync(welcome, 'utf-8');
  const guarda = src.indexOf('if (!hasTty())');
  const leitura = src.indexOf('readIdentity()');
  assert.ok(guarda > -1, 'a guarda existe');
  assert.ok(leitura > -1, 'a leitura existe');
  // `readIdentity` é *declarada* antes, então o que importa é o uso em main()
  const main = src.slice(src.indexOf('async function main()'));
  assert.ok(
    main.indexOf('hasTty()') < main.indexOf('readIdentity()'),
    'em main(), a guarda tem que vir antes da leitura'
  );
});

test('predev existe e prebuild não', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf-8'));
  assert.equal(pkg.scripts.predev, 'node scripts/welcome.js');
  // `prebuild` roda ANTES do build, então não poderia informar tempo nem artefatos.
  assert.equal(pkg.scripts.prebuild, undefined, 'prebuild não informa nada de build');
});
