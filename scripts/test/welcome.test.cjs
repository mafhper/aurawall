/**
 * Testes do cabeçalho de identidade.
 *
 * O critério de aceite da AWR20 é *"em CI (sem TTY) nenhum cabeçalho é impresso"*.
 * É uma propriedade que **não se vê** quando quebra: o script sai 0, o dev sobe, e o
 * ruído aparece no log da CI como uma faixa colorida que ninguém sabe de onde veio.
 *
 * A segunda metade do arquivo fixa as regressões que já aconteceram — cada uma
 * dessas falhas esteve em produção e pode voltar.
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
const A = { reset: ESC + '[0m', dim: ESC + '[2m', muted: ESC + '[90m', name: ESC + '[36m', data: ESC + '[37m', ok: ESC + '[32m', warn: ESC + '[33m' };

/** O módulo é ESM; de um teste .cjs só dá para carregar por import() dinâmico. */
const m = () => import('../welcome.js');

const pkg = { name: 'aurawall', version: '1.0.0', description: 'Vector-first wallpaper generator.', npm: '11' };
const repoLimpo = { branch: 'main', commit: '4ff6020', changes: 0 };
const render = async (p = pkg, r = repoLimpo) => (await m()).render({ pkg: p, repo: r });
const plain = async (p, r) => (await m()).stripAnsi(await render(p, r));

// ── A guarda de TTY, que é o critério de aceite ────────────────────────────

test('sem TTY não produz um único byte em stdout — que é o caso da CI', () => {
  const out = execFileSync(process.execPath, [welcome], { encoding: 'utf-8', cwd: repo });
  assert.equal(out, '', 'sem TTY a saída tem que ser literalmente vazia');
});

test('sem TTY, stderr também fica vazio e o exit code é 0', () => {
  const r = spawnSync(process.execPath, [welcome], { encoding: 'utf-8', cwd: repo });
  assert.equal(r.stdout, '', 'stdout vazio');
  assert.equal(r.stderr, '', 'stderr vazio');
  assert.equal(r.status, 0, 'um cabeçalho nunca bloqueia o dev');
});

test('sem TTY, nada é lido — nem o package.json nem o git', () => {
  // A guarda precisa vir ANTES de qualquer coleta. Se viesse depois, a saída já
  // teria sido preparada; a propriedade seria "saída descartada", não "nenhum output".
  const p = path.join(repo, 'package.json');
  const backup = p + '.welcome-test.bak';
  fs.renameSync(p, backup);
  try {
    const r = spawnSync(process.execPath, [welcome], { encoding: 'utf-8', cwd: repo });
    assert.equal(r.stdout, '', 'sem package.json e sem TTY, continua sem saída');
    assert.equal(r.status, 0, 'e sem quebrar');
  } finally {
    fs.renameSync(backup, p);
  }
});

test('a guarda de TTY vem antes de qualquer leitura, no código', () => {
  // ordem no código, não só comportamento: se alguém mover a guarda para baixo
  // por refatoração, este teste avisa antes do próximo rodar em CI.
  const src = fs.readFileSync(welcome, 'utf-8');
  const main = src.slice(src.indexOf('async function main()'));
  assert.ok(main.indexOf('hasTty()') > -1, 'a guarda está em main()');
  assert.ok(
    main.indexOf('hasTty()') < Math.min(main.indexOf('readPackage'), main.indexOf('readGit')),
    'em main(), a guarda tem que vir antes das leituras'
  );
});

// ── Largura visível: o detalhe que falha na tela, não no teste ────────────

test('visibleWidth conta colunas, não bytes de escape', async () => {
  const mod = await m();
  const colored = A.name + 'AURAWALL' + A.reset;
  assert.equal(colored.length, 17, 'o comprimento bruto inclui os 9 bytes dos escapes');
  assert.equal(mod.visibleWidth(colored), 8, 'a largura visível é só o texto que se vê');
});

test('é um painel fechado: moldura com cantos certainos, todas as linhas com borda', async () => {
  // A versão anterior tinha réguas soltas no topo e embaixo — cercavam o texto
  // sem organizar. Agora é um painel: cantos de cima e de base diferentes, e
  // nenhuma linha interna fica sem as duas bordas.
  const mod = await m();
  const out = mod.stripAnsi(mod.render({ pkg, repo: repoLimpo })).split('\n');
  assert.match(out[0], new RegExp('^' + mod.BOX.tl + '─+' + mod.BOX.tr + '$'), 'topo abre para a direita');
  assert.match(out[out.length - 1], new RegExp('^' + mod.BOX.bl + '─+' + mod.BOX.br + '$'), 'base abre para a esquerda');
  for (const l of out.slice(1, -1)) {
    assert.ok(l.startsWith(mod.BOX.v) && l.endsWith(mod.BOX.v), `linha sem as duas bordas: ${JSON.stringify(l)}`);
  }
  assert.equal(new Set(out.map((l) => l.length)).size, 1, 'todas as linhas têm a mesma largura');
});

test('todas as linhas cabem em 80 colunas visíveis', async () => {
  const mod = await m();
  const out = mod.render({
    pkg: { ...pkg, description: 'Vector-first wallpaper generator. Static editor and promo site, no backend.' },
    repo: { branch: 'feature/uma-branch-bem-comprida-para-teste', commit: 'abcdef1234', changes: 42 },
  });
  for (const l of out.split('\n')) {
    assert.equal(mod.visibleWidth(l), 80, `linha de ${mod.visibleWidth(l)}: ${mod.stripAnsi(l)}`);
  }
});

test('o marcador de estado só aparece onde houve verificação', async () => {
  // ENV e GIT são checados de verdade. STACK e os links são declarados — e a
  // bolinha neles seria enfeite, não informação. A diferença é o que impede a
  // bolinha de virar carnaval.
  const mod = await m();
  const out = mod.render({ pkg, repo: repoLimpo }).split('\n');
  for (const lbl of ['ENV', 'GIT']) {
    const l = out.find((x) => mod.stripAnsi(x).includes(lbl));
    assert.ok(l.includes(A.ok), `${lbl} é verificado e ganha marcador`);
  }
  for (const lbl of ['STACK', 'REPO', 'LIVE']) {
    const l = out.find((x) => mod.stripAnsi(x).includes(lbl));
    assert.ok(!l.includes(A.ok), `${lbl} é declarado e não ganha marcador`);
    assert.ok(mod.stripAnsi(l).includes('  ' + lbl), `${lbl} fica recuado onde o marcador não está`);
  }
});

test('o badge de versão fica à direita, alinhado com a borda', async () => {
  // O olho vai para o canto direito procurando a versão. Se ela encostar no
  // nome, os dois competem; se não alinhar na borda, o alinhamento denuncia.
  const mod = await m();
  const out = mod.stripAnsi(mod.render({ pkg, repo: repoLimpo })).split('\n');
  const titulo = out.find((l) => l.includes('AURAWALL'));
  assert.ok(titulo.includes(mod.HEADER.mode), 'o modo aparece na primeira linha');
  assert.ok(titulo.includes('v' + pkg.version), 'a versão aparece na primeira linha');
  const semBadge = out.find((l) => l.includes(pkg.description));
  assert.ok(titulo.length === semBadge.length, 'a linha do título tem a largura do painel');
  assert.ok(titulo.trimEnd().endsWith('│'), 'e encosta na borda direita');
});

test('a identidade é a única linha com cor de destaque', async () => {
  const mod = await m();
  const out = mod.render({ pkg, repo: repoLimpo }).split('\n');
  const titulo = out.find((l) => mod.stripAnsi(l).includes('AURAWALL'));
  for (const l of out.filter((x) => x !== titulo)) {
    assert.ok(!l.includes(A.name), 'só o nome usa a cor de identidade');
  }
});

test('a linha do git respeita a largura sem perder a ordem', async () => {
  // Bug real: a primeira versão montava a linha do git sem truncar, e a
  // "solução" seguinte removia a peça mais longa e a reinseria no fim — o que
  // invertia a ordem dos campos. Os dois estão fixados aqui.
  const mod = await m();
  const casos = [
    { branch: 'feat/uma-branch-realmente-longa-para-estourar-a-largura', commit: 'abcdef1234', changes: 12 },
    { branch: 'feature/isso-e-absurdo-e-nao-cabe-em-linha-nenhuma-de-80-colunas-de-todo-jeito', commit: 'abcdef1234', changes: 12 },
    { branch: 'x', commit: null, changes: null },
    { branch: 'main', commit: null, changes: 3 },
  ];
  for (const repo of casos) {
    const out = mod.render({ pkg, repo });
    for (const l of out.split('\n')) {
      assert.ok(mod.visibleWidth(l) <= 80, `linha de ${mod.visibleWidth(l)}: ${mod.stripAnsi(l)}`);
    }
    const git = mod.stripAnsi(out).split('\n').find((l) => /GIT/.test(l));
    if (repo.branch.length > 40) {
      // a branch vem antes do estado, mesmo truncada
      assert.ok(git.indexOf(repo.branch.slice(0, 20)) < git.indexOf('uncommitted'), 'a branch continua antes do estado');
    }
  }
});

test('truncate corta por largura visível, não por String.length', async () => {
  const mod = await m();
  const cortado = mod.truncate(A.dim + 'x'.repeat(200) + A.reset, 20);
  assert.equal(mod.visibleWidth(cortado), 20, 'tem que preencher exatamente 20 colunas');
  assert.ok(mod.stripAnsi(cortado).endsWith('…'));
});

test('a coluna de valor alinha em todos os campos', async () => {
  const mod = await m();
  const campos = ['ENV', 'GIT', 'STACK', 'REPO', 'LIVE'];
  const linhas = mod
    .stripAnsi(mod.render({ pkg, repo: repoLimpo }))
    .split('\n');
  const cols = campos.map((c) => {
    const l = linhas.find((x) => x.includes(c));
    assert.ok(l, `a linha do campo ${c} existe`);
    // a coluna do valor é onde o rótulo termina, sem contar o marcador de estado
    return l.replace(new RegExp('^\\s*│\\s*(●\\s)?' + c + '\\s*'), '').length;
  });
  assert.equal(new Set(cols).size, 1, `colunas de valor desalinhadas: ${cols.join(', ')}`);
});

// ── As regressões que já aconteceram ─────────────────────────────────────

test('NÃO mostra URLs das superfícies — o Vite já imprime', async () => {
  const out = await plain();
  assert.ok(!/localhost/.test(out), 'nenhuma URL de superfície');
  assert.ok(!/5173|3000/.test(out), 'nenhuma porta');
});

test('não repete o que o Vite e o concurrently vão dizer', async () => {
  const out = await plain();
  for (const proibido of [/starting vite/i, /watching for file changes/i, /local:/i, /network:/i]) {
    assert.ok(!proibido.test(out), `não deve repetir ${proibido}`);
  }
});

test('não tem etiquetas decorativas', async () => {
  const out = await plain();
  assert.ok(!/\[(web|docs|cli|library)\]/i.test(out), 'etiqueta entre colchetes não diz nada num terminal');
});

test('nada é empurrado para fora do painel, nem com campo enorme', async () => {
  // A primeira versão tinha réguas soltas, e a segunda não tinha moldura nenhuma.
  // O painel é o que dá forma: cada linha precisa caber entre as duas bordas.
  const mod = await m();
  const out = mod.render({
    pkg: { ...pkg, description: 'x'.repeat(200) },
    repo: { branch: 'feature/'.concat('y'.repeat(120)), commit: 'abcdef1234', changes: 999 },
  });
  for (const l of out.split('\n')) {
    assert.equal(mod.visibleWidth(l), 80, `linha de ${mod.visibleWidth(l)}: ${mod.stripAnsi(l).slice(0, 50)}`);
  }
});

test('a identidade é a única linha em caixa alta e acesa', async () => {
  const mod = await m();
  const out = mod.render({ pkg, repo: repoLimpo }).split('\n');
  const titulo = out.find((l) => mod.stripAnsi(l).includes('AURAWALL'));
  assert.ok(titulo.includes(A.name), 'o nome usa a cor de identidade');
  // e nenhuma outra linha grita junto
  for (const l of out.filter((x) => x !== titulo)) {
    assert.ok(!l.includes(A.name) || mod.stripAnsi(l).trim() === '', 'só o nome usa a cor de identidade');
  }
});

test('a descrição é contexto, não manchete: fica apagada', async () => {
  const mod = await m();
  const out = mod.render({ pkg, repo: repoLimpo }).split('\n');
  const desc = out.find((l) => mod.stripAnsi(l).includes(pkg.description));
  assert.ok(desc.includes(A.muted), 'a descrição usa a cor de contexto, não a de dado');
});

test('os rótulos são interface: caixa alta e cor apagada', async () => {
  const mod = await m();
  const out = mod.render({ pkg, repo: repoLimpo }).split('\n');
  for (const lbl of ['GIT', 'STACK', 'ENV', 'REPO', 'LIVE']) {
    // a linha começa pela borda do painel, então o rótulo não é o primeiro texto
    const l = out.find((x) => /│\s*(●\s)?\s?[A-Z]+\s/.test(mod.stripAnsi(x)) && mod.stripAnsi(x).includes(lbl));
    assert.ok(l, `o campo ${lbl} existe`);
    assert.ok(l.includes(A.muted), `${lbl} usa a cor de interface`);
    assert.equal(lbl, lbl.toUpperCase(), `${lbl} é caixa alta`);
  }
});

// ── O conteúdo: o que o cabeçalho promete ─────────────────────────────────

test('mostra o estado do git, que é o que se quer saber ao rodar o dev', async () => {
  const out = await plain();
  assert.match(out, /GIT\s+main/);
  assert.match(out, /4ff6020/);
});

test('o estado do git é colorido: clean verde, uncommitted amarelo', async () => {
  const mod = await m();
  const limpo = mod.render({ pkg, repo: repoLimpo });
  const sujo = mod.render({ pkg, repo: { ...repoLimpo, changes: 3 } });
  assert.ok(limpo.includes(A.ok), 'clean em verde');
  assert.match(mod.stripAnsi(limpo), /clean/);
  assert.ok(sujo.includes(A.warn), 'mudanças pendentes em amarelo, porque pedem atenção');
  assert.match(mod.stripAnsi(sujo), /3 uncommitted/);
});

test('mostra o ambiente: npm, node e plataforma', async () => {
  const out = await plain();
  assert.match(out, /ENV\s+npm 11/);
  assert.match(out, new RegExp('node ' + process.versions.node.replace(/\./g, '\\.')));
  assert.ok(out.includes(process.platform), 'plataforma');
});

test('a stack é declarada, não inferida do node_modules', async () => {
  const out = await plain();
  assert.match(out, /React · TypeScript · Vite/);
  assert.ok(!/sharp|postcss|concurrently/i.test(out), 'não despeja dependências de implementação');
});

// ── Robustez: a coleta é best-effort ──────────────────────────────────────

test('sem git, o bloco GIT some e o resto continua', async () => {
  // Um cabeçalho é conveniência, nunca pré-requisito. Se o projeto estiver fora de
  // um repositório, ou o `git` não existir, o dev sobe igual.
  const mod = await m();
  const out = mod.stripAnsi(mod.render({ pkg, repo: null }));
  assert.ok(!/GIT/.test(out), 'sem git, o bloco some');
  assert.match(out, /AURAWALL/, 'mas a identidade continua');
  assert.match(out, /REPO/, 'e os links continuam');
});

test('campos indefinidos não quebram a renderização', async () => {
  const mod = await m();
  const out = mod.stripAnsi(mod.render({ pkg: { name: 'x', version: '?', description: null, npm: null }, repo: null }));
  assert.match(out, /X\s+.*v\?/, 'sem descricao e sem npm, ainda renderiza');
});

test('sem console.clear — entra no fluxo, não apaga o anterior', () => {
  // Os comentários do arquivo *mencionam* console.clear para explicar por que ele
  // não é usado. Então o teste olha o código, não a palavra.
  const codigo = fs
    .readFileSync(welcome, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  assert.ok(!/console\s*\.\s*clear/.test(codigo), 'console.clear quebra terminal integrado, split e IDE');
});

test('predev existe e prebuild não', () => {
  const p = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf-8'));
  assert.equal(p.scripts.predev, 'node scripts/welcome.js');
  assert.equal(p.scripts.prebuild, undefined, 'prebuild não informa nada de build');
});
