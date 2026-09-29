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
  // Se o padding usasse String.length, um rótulo com ANSI desalinharia a coluna
  // de valores. Este é o teste do erro que só apareceria na tela.
  const sem = mod.render(identidade).split('\n').map((l) => mod.stripAnsi(l));
  const cols = sem
    .filter((l) => mod.HEADER.fields.some((f) => l.includes(f.label)))
    .map((l) => l.indexOf(mod.HEADER.fields.find((f) => l.includes(f.label)).value));
  assert.ok(cols.every((c) => c === cols[0]), `colunas de valor desalinhadas: ${cols.join(', ')}`);
});

// ── O conteúdo: o que o cabeçalho promete ─────────────────────────────────

test('NÃO mostra as URLs das superfícies — o Vite já imprime', async () => {
  // A primeira versão mostrava as duas, e na tela elas apareciam duas vezes em
  // quinze linhas. O Vite imprime `→ Local: http://localhost:3000/` logo abaixo.
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.ok(!/localhost/.test(out), 'nenhuma URL de superfície: o Vite já mostra');
  assert.ok(!/5173|3000/.test(out), 'nenhuma porta: o Vite já mostra');
});

test('não repete o que o Vite e o concurrently vão dizer', async () => {
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.ok(!/starting vite/i.test(out), '"o que está acontecendo agora" é do Vite');
  assert.ok(!/watching for file changes/i.test(out), 'nem o log de watch');
  assert.ok(!/local:|network:/i.test(out), 'nem as linhas de Local/Network');
});

test('não tem etiquetas decorativas', async () => {
  // Houve uma versão com `[web] [docs]`, copiada de uma convenção web. Num terminal
  // não há link, não há clique, e nada as explica.
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.ok(!/\[(web|docs|cli|library)\]/i.test(out), 'etiqueta entre colchetes não diz nada aqui');
});

test('rótulos em caixa alta, valores não', async () => {
  // Interface que se confunde com dado é o que torna um cabeçalho ilegível.
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  for (const f of mod.HEADER.fields) {
    assert.equal(f.label, f.label.toUpperCase(), `rótulo ${f.label} deveria estar em caixa alta`);
  }
  const linha = out.split('\n').find((l) => /REPO/.test(l));
  assert.match(linha, /REPO\s+github\.com/, 'rótulo alto, valor em minúsculas preservado');
});

test('interface e dado são visualmente distintos, e a coluna de valores alinha', async () => {
  const mod = await m();
  const comAnsi = mod.render(identidade).split('\n');
  const sem = comAnsi.map((l) => mod.stripAnsi(l));

  // Coluna de valor: a posição do PRÓPRIO valor de cada campo, não "a primeira
  // letra minúscula" — que em "React" seria o 'e', uma coluna à direita.
  const cols = [];
  for (const f of mod.HEADER.fields) {
    const linha = sem.find((l) => l.includes(f.label));
    assert.ok(linha, `a linha do campo ${f.label} existe`);
    cols.push(linha.indexOf(f.value));
  }
  assert.equal(new Set(cols).size, 1, `valores desalinhados: ${cols.join(', ')}`);

  // E a distinção é de cor, não de sortimento: o rótulo carrega o código de
  // interface; se alguém o tirar, o cabeçalho perde a leitura rótulo/dado.
  for (const f of mod.HEADER.fields) {
    const linha = comAnsi.find((l) => mod.stripAnsi(l).includes(f.label));
    assert.ok(linha.includes('\x1b[90m'), `${f.label} deveria usar a cor de interface`);
  }
});

test('tem régua separando os blocos, não só uma caixa em volta', async () => {
  const mod = await m();
  const out = mod.render(identidade);
  const reguas = out.split('\n').filter((l) => /─/.test(l));
  assert.equal(reguas.length, 3, 'régua de topo, régua interna e régua de base');
  // a régua interna é menor que as externas: é divisória, não borda
  const larguras = reguas.map((l) => mod.visibleWidth(l));
  assert.ok(larguras[1] < larguras[0], 'a régua interna é mais curta que a de topo');
});

test('a descrição vem do package.json e cabe inteira', async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf-8'));
  const mod = await m();
  const out = mod.stripAnsi(mod.render({ ...identidade, description: pkg.description }));
  assert.ok(out.includes(pkg.description), 'a descrição aparece inteira, sem reticência');
});

test('o nome do projeto vai em caixa alta', async () => {
  const mod = await m();
  const out = mod.stripAnsi(mod.render(identidade));
  assert.match(out, /AURAWALL/, 'identidade em destaque, como nome de projeto');
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
