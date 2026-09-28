/**
 * Testes do próprio gate de contraste.
 *
 * Um gate que só passa não gate nada — e a versão anterior deste arquivo era
 * exatamente isso: comparava uma lista de pares consigo mesma, dava `exit 1`
 * com uma recomendação que não vinha de lugar nenhum, e nunca via um arquivo do
 * projeto. Ninguém sabia que ele media alguma coisa, porque ele não media.
 *
 * Estes testes injetam violações conhecidas e conferem que o gate as acusa, e
 * injetam_usage conforming e conferem que ele as deixa passar. Sem isto, um
 * `if (false)` no fim do contrast.cjs passaria a suíte inteira.
 *
 * Roda com: node --test scripts/test/contrast.test.cjs
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.join(__dirname, '..', '..');
const checker = path.join(__dirname, 'contrast.cjs');
const probe = path.join(repoRoot, 'src', '__contrast-probe__.tsx');

/** Roda o gate contra um conteúdo de arquivo e devolve {saida, status}. */
function runGate(linhas) {
  fs.writeFileSync(probe, linhas.join('\n') + '\n', 'utf-8');
  try {
    const stdout = execFileSync(process.execPath, [checker], { encoding: 'utf-8', cwd: repoRoot });
    return { stdout, status: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', status: e.status };
  } finally {
    if (fs.existsSync(probe)) fs.unlinkSync(probe);
  }
}

/** Extrai as classes reprovadas da seção de violações. */
function violacoes(stdout) {
  const linhas = stdout
    .split(/\r?\n/)
    .map((l) => l.replace(/\x1b\[[0-9;]*m/g, ''))
    .filter((l) => l.trim().startsWith('✗'));
  return linhas.map((l) => {
    const m = /✗\s+(\S+)\s+([\d.]+):1\s+abaixo de ([\d.]+):1\s+(\d+) usos/.exec(l);
    return m ? { classe: m[1], ratio: parseFloat(m[2]), exigido: parseFloat(m[3]), usos: parseInt(m[4]) } : null;
  }).filter(Boolean);
}

// ── A paleta é lida do pacote instalado, não de um arquivo morto ──────────

test('a paleta vem do Tailwind instalado, e converte oklch() corretamente', () => {
  const { loadPalette, contrastRatio, hexToRgb } = require(checker);
  const { palette, error } = loadPalette();
  assert.equal(error, null, 'a paleta deve carregar sem erro');
  assert.ok(palette.size > 200, `esperava mais de 200 cores, veio ${palette.size}`);

  // Valores conhecidos da paleta padrão do Tailwind v4. Se a conversão de
  // oklch perder a curva gama, zinc-400 sai #585865 e o contraste cai de
  // 7.5:1 para 2.8:1 — o gate reprovaria texto correto e aprovaria errado.
  assert.equal(palette.get('zinc-300').hex, '#d4d4d8', 'zinc-300');
  assert.equal(palette.get('zinc-500').hex, '#71717b', 'zinc-500');

  const fundo = hexToRgb('#0a0a0b');
  const zinc400 = contrastRatio(palette.get('zinc-400'), fundo);
  const zinc500 = contrastRatio(palette.get('zinc-500'), fundo);
  assert.ok(zinc400 > 7 && zinc400 < 8, `zinc-400 deveria dar ~7.5:1, deu ${zinc400.toFixed(2)}`);
  assert.ok(zinc500 > 4 && zinc500 < 4.5, `zinc-500 deveria dar ~4.1:1, deu ${zinc500.toFixed(2)}`);
});

// ── O gate reprova o que deve reprovar ─────────────────────────────────────

test('reprova texto normal abaixo de 4.5:1', () => {
  const { stdout, status } = runGate([
    'export const A = () => <p className="text-zinc-500">normal</p>;',
  ]);
  assert.equal(status, 1, 'deve sair com código 1');
  const v = violacoes(stdout);
  assert.equal(v.length, 1);
  assert.equal(v[0].classe, 'text-zinc-500');
  assert.equal(v[0].exigido, 4.5);
  assert.equal(v[0].usos, 1);
});

test('reprova zinc-600 e zinc-700, inclusive em text-xs', () => {
  const { stdout, status } = runGate([
    'export const B = () => <p className="text-zinc-700">a</p>;',
    'export const C = () => <p className="text-zinc-600 text-xs">b</p>;',
  ]);
  assert.equal(status, 1);
  const classes = violacoes(stdout).map((v) => v.classe).sort();
  assert.deepEqual(classes, ['text-zinc-600', 'text-zinc-700']);
});

// ── O gate deixa passar o que deve passar ──────────────────────────────────

test('não reprova texto que cumpre o limiar', () => {
  const { status, stdout } = runGate([
    'export const F = () => <p className="text-zinc-400">a</p>;',
    'export const G = () => <p className="text-white">b</p>;',
    'export const H = () => <p className="text-zinc-300 text-xs">c</p>;',
  ]);
  assert.equal(status, 0, 'nenhuma violação esperada:\n' + stdout);
});

// ── Texto grande tem limiar menor, e isso tem que valer ───────────────────

test('texto grande aceita 3:1 — zinc-500 a 4.10:1 passa em text-2xl', () => {
  const { status, stdout } = runGate([
    'export const I = () => <p className="text-zinc-500 text-2xl">grande</p>;',
  ]);
  assert.equal(status, 0, '4.10:1 passa do limiar de 3:1 para texto grande:\n' + stdout);
});

test('texto grande NÃO absolve quem continua abaixo de 3:1', () => {
  const { status, stdout } = runGate([
    'export const J = () => <p className="text-zinc-700 text-2xl">grande</p>;',
  ]);
  assert.equal(status, 1, 'zinc-700 a 1.89:1 reprova mesmo em texto grande');
  const v = violacoes(stdout);
  assert.equal(v[0].exigido, 3.0, 'o limiar exigido deve ser o de texto grande');
});

test('text-xl só é texto grande com peso — 20px normal não é', () => {
  // 20px sem negrito fica abaixo de 18.66px-bold e de 24px: limiar 4.5.
  const semNegrito = runGate(['export const K = () => <p className="text-xl text-zinc-500">x</p>;']);
  assert.equal(semNegrito.status, 1, 'text-xl sem font-bold exige 4.5:1');

  const comNegrito = runGate(['export const L = () => <p className="text-xl font-bold text-zinc-500">x</p>;']);
  assert.equal(comNegrito.status, 0, 'text-xl com font-bold é texto grande e aceita 3:1');
});

// ── O gate não pode confundir classes diferentes ──────────────────────────

test('conta os usos por classe, sem misturar o que passa com o que reprova', () => {
  const { stdout, status } = runGate([
    'export const M = () => <p className="text-zinc-500">reprova</p>;',
    'export const N = () => <p className="text-zinc-500 text-2xl">passa</p>;',
  ]);
  assert.equal(status, 1);
  const v = violacoes(stdout);
  assert.equal(v.length, 1);
  assert.equal(v[0].usos, 1, 'o uso em texto grande não deve contar como violação');
});

// ── classes de fundo não são texto ────────────────────────────────────────

test('ignora classes de fundo, borda e gradiente', () => {
  const { status, stdout } = runGate([
    'export const O = () => <div className="bg-zinc-700 text-zinc-400 border-zinc-600 from-zinc-500" />;',
  ]);
  assert.equal(status, 0, 'só text-* mede contraste de texto:\n' + stdout);
});

// ── o arquivo de verdade está limpo ───────────────────────────────────────

test('o projeto inteiro passa no gate', () => {
  const stdout = execFileSync(process.execPath, [checker], { encoding: 'utf-8', cwd: repoRoot });
  assert.ok(stdout.includes('Nenhuma violação'), stdout);
  // o teste precisa ter lido os arquivos de verdade, não uma lista
  const m = /(\d+) arquivos, (\d+) linhas/.exec(stdout.replace(/\x1b\[[0-9;]*m/g, ''));
  assert.ok(m, 'o relatório deve informar quantos arquivos varreu');
  assert.ok(parseInt(m[1], 10) > 50, `esperava varrer o projeto inteiro, varreu ${m[1]} arquivos`);
});
