/**
 * Cabeçalho de identidade do `npm run dev`.
 *
 * ## O formato, e o teto dele
 *
 * Isto é um **painel estático**: roda uma vez, antes do `concurrently`, e sai.
 * Ele tem vocabulário de painel — moldura, badge alinhado à direita, marcadores de
 * estado, colunas — mas não tem o que o torna um runtime: nada de estado que
 * atualiza, navegação por tecla, log rolável ou layout que reage ao resize.
 *
 * Nada aqui é decoração. Cada elemento carrega informação:
 *
 * - **Moldura** — diz que o bloco é uma unidade, não texto solto.
 * - **Badge à direita** — `development` e a versão, o que a pessoa procura
 *   olhando o canto, e por isso não compete com o nome.
 * - **Marcador de estado** — só onde algo foi **verificado**, nunca como enfeite.
 *   `GIT` e `ENV` são checados; `STACK` e os links são declarados, e por isso
 *   não ganham marcador. A diferença é o que impede a bolinha de virar carnaval.
 * - **Coluna de rótulo** — cinza, caixa alta; coluna de valor — branco. É a
 *   distinção interface/dado que faz o bloco varrível num olhar.
 *
 * ## O que ele NÃO faz, e por quê
 *
 * Cada item abaixo já esteve aqui e saiu por ser falso ruído:
 *
 * - **URLs das superfícies.** O Vite imprime `→ Local:` de cada uma segundos
 *   depois. Na primeira versão apareciam **duas vezes em quinze linhas**.
 * - **Etiquetas decorativas** como `[web] [docs]` — convenção web, sem clique
 *   e sem explicação num terminal.
 * - **A lista de dependências** como "stack": varrer `node_modules` produz
 *   inventário de implementação, não informação.
 * - **Log do Vite e do `concurrently`.** "O que está acontecendo agora" é deles.
 *
 * ## Guardrails
 *
 * - **A guarda de TTY vem antes de qualquer coleta**, inclusive do `package.json`
 *   e do `git`: a propriedade é "sem TTY → nenhum output", não "saída preparada
 *   e descartada".
 * - **`stderr` não é saída alternativa.**
 * - **Sem `console.clear()`** — convive com terminal integrado, split e IDE.
 * - **A largura conta coluna visível, não `String.length`.** Com ANSI no meio,
 *   `.length` conta os bytes do escape e o alinhamento sai errado **na tela**,
 *   não no teste.
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// ── Configuração local ─────────────────────────────────────────────────────

const HEADER = {
  stack: 'React · TypeScript · Vite',
  mode: 'development',
  width: 80,
  labelWidth: 8,
  git: { cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') },
};

// ── Cor ─────────────────────────────────────────────────────────────────────
// Semântica, não enumerate-cores. A distinção que carrega o significado é
// rótulo apagado contra dado aceso; cada cor tem um papel.

const A = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  muted: '\x1b[90m',   // rótulo, moldura, contexto
  name: '\x1b[36m',    // identidade
  data: '\x1b[37m',    // dado primário
  ok: '\x1b[32m',      // verificado e bom
  warn: '\x1b[33m',    // verificado e pede atenção
};

const BOX = { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' };
const DOT = '●';

const ANSI_RE = /\x1b\[[0-9;]*m/g;

const stripAnsi = (t) => t.replace(ANSI_RE, '');
const visibleWidth = (t) => stripAnsi(t).length;

function truncate(text, max) {
  if (visibleWidth(text) <= max) return text;
  const open = text.match(/^(\x1b\[[0-9;]*m)*/)[0];
  return open + stripAnsi(text).slice(0, Math.max(0, max - 1)) + '…';
}

const padTo = (text, width) => text + ' '.repeat(Math.max(0, width - visibleWidth(text)));

// ── Guarda de TTY ──────────────────────────────────────────────────────────

const hasTty = () => process.stdout.isTTY === true;

// ── Coleta ─────────────────────────────────────────────────────────────────
// Best-effort por construção: um `git` ausente ou um `package.json` ilegível
// omitem um campo e nunca lançam. Cabeçalho não pode impedir o dev de subir.

function git(...args) {
  try {
    return execFileSync('git', args, {
      cwd: HEADER.git.cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 2000,
    }).trim();
  } catch {
    return null;
  }
}

function readGit() {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (branch === null) return null; // fora de um repositório
  const commit = git('rev-parse', '--short', 'HEAD');
  const changed = git('status', '--porcelain');
  return { branch, commit, changes: changed === null ? null : changed === '' ? 0 : changed.split('\n').length };
}

async function readPackage() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(await readFile(path.join(here, '..', 'package.json'), 'utf-8'));
  const m = /^npm@(\d+)\.(\d+)\.(\d+)/.exec(pkg.packageManager || '');
  return { name: pkg.name, version: pkg.version, description: pkg.description, npm: m ? m[1] : null };
}

// ── Painel ─────────────────────────────────────────────────────────────────

/** Uma linha interna, já com as bordas. `conteudo` nunca é cortado com ANSI solto. */
function row(conteudo, cor = A.data) {
  const L = HEADER.width;
  const interno = L - 4; // │ + espaço + espaço + │
  if (visibleWidth(conteudo) > interno) {
    conteudo = truncate(cor + conteudo, interno);
  }
  return `${A.muted}${BOX.v}${A.reset} ${conteudo}${' '.repeat(Math.max(0, interno - visibleWidth(conteudo)))} ${A.muted}${BOX.v}${A.reset}`;
}

/** Régua de topo ou de base, com os cantos certos. */
const borda = (topo) =>
  `${A.muted}${topo ? BOX.tl : BOX.bl}${BOX.h.repeat(HEADER.width - 2)}${topo ? BOX.tr : BOX.br}${A.reset}`;

/**
 * Uma linha rótulo/valor dentro do painel, com marcador onde houve verificação.
 *
 * `valor` pode ser texto simples ou **peças com prioridade**. Isso importa: quando
 * a linha não cabe, o que tem de sobreviver é o estado — `3 uncommitted` é o que
 * pede ação, e o commit é o que se perde. A versão anterior cortava pela direita e
 * apagava justamente o pedaço actionable.
 */
function field(label, valor, { verificado = false, corValor = A.data, corEstado = A.ok } = {}) {
  const marca = verificado ? `${corEstado}${DOT}${A.reset} ` : '  ';
  const L = HEADER.labelWidth;
  const orcamento = HEADER.width - 4 - 2 - L - 2; // bordas, marcador, rótulo

  let texto;
  if (typeof valor === 'string') {
    texto = `${corValor}${truncate(valor, orcamento)}${A.reset}`;
  } else {
    const sep = ' · ';
    const medir = (ps) => ps.reduce((t, p) => t + visibleWidth(p.text), 0) + sep.length * (ps.length - 1);
    let ps = valor.slice();
    if (medir(ps) > orcamento) {
      const semDrop = ps.filter((p) => !p.drop);
      ps = medir(semDrop) <= orcamento ? semDrop : ps.filter((p) => !p.drop);
    }
    if (medir(ps) > orcamento) {
      // o que sobra é descontado da peça MAIOR, em posição — nunca do fim
      const maior = ps.reduce((a, b) => (visibleWidth(a.text) >= visibleWidth(b.text) ? a : b));
      const folga = medir(ps) - orcamento;
      ps = ps.map((p) =>
        p === maior ? { ...p, text: p.text.slice(0, Math.max(0, p.text.length - folga - 1)) + '…' } : p
      );
    }
    texto = ps
      .map((p, i) => (i ? A.muted + sep + A.reset : '') + (p.color || corValor) + p.text + A.reset)
      .join('');
  }

  const conteudo = `${marca}${A.muted}${padTo(label, L)}${A.reset} ${texto}`;
  return row(conteudo);
}

// ── Renderização ───────────────────────────────────────────────────────────

function render({ pkg, repo }) {
  const out = [borda(true)];

  // Cabeçalho: nome à esquerda, badge à direita. O olho vai para o canto
  // direito procurando versão, então não compete com a identidade.
  const esquerda = `${A.bold}${A.name}${pkg.name.toUpperCase()}${A.reset}`;
  const direita = `${A.muted}${HEADER.mode}${A.reset}  ${A.dim}v${pkg.version}${A.reset}`;
  const folga = HEADER.width - 4 - visibleWidth(esquerda) - visibleWidth(direita);
  out.push(row(esquerda + ' '.repeat(Math.max(1, folga)) + direita));

  if (pkg.description) out.push(row(A.muted + pkg.description + A.reset));

  // Ambiente: verificado, então ganha marcador.
  const env = [];
  if (pkg.npm) env.push('npm ' + pkg.npm);
  env.push('node ' + process.versions.node);
  if (repo) env.push(process.platform);
  out.push(field('ENV', env.join(' · '), { verificado: true }));

  // Git: verificado. A cor do estado é informação, não enfeite — e o estado é a
  // peça que tem de sobreviver quando a linha não cabe; o commit é o descartável.
  if (repo) {
    const partes = [{ text: repo.branch }];
    if (repo.commit) partes.push({ text: repo.commit, color: A.muted, drop: true });
    if (repo.changes !== null) {
      partes.push(
        repo.changes === 0
          ? { text: 'clean', color: A.ok }
          : { text: `${repo.changes} uncommitted`, color: A.warn }
      );
    }
    out.push(field('GIT', partes, { verificado: true }));
  }

  // Stack e links: declarados, não verificados. Sem marcador.
  out.push(field('STACK', HEADER.stack));
  out.push(field('REPO', 'github.com/mafhper/aurawall'));
  out.push(field('LIVE', 'mafhper.github.io/aurawall'));

  out.push(borda(false));
  return out.join('\n');
}

// ── Entrada ────────────────────────────────────────────────────────────────

async function main() {
  if (!hasTty()) process.exit(0);

  let pkg;
  try {
    pkg = await readPackage();
  } catch {
    pkg = { name: 'aurawall', version: '?', description: null, npm: null };
  }
  const repo = readGit();

  process.stdout.write(render({ pkg, repo }) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { visibleWidth, truncate, stripAnsi, hasTty, render, readGit, row, field, BOX, DOT, HEADER };
