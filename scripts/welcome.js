/**
 * Cabeçalho de identidade do `npm run dev`.
 *
 * ## O princípio
 *
 * **Cada pedaço de informação recebe um espaço semântico.** Uma régua horizontal
 * separa; um painel dá forma. Isso veio de `.dev/docs/better-tui-critic.md`, e é a
 * diferença entre um cabeçalho e uma lista de texto com linhas em volta.
 *
 * ## O que este cabeçalho responde
 *
 * *"Em que projeto estou, em que estado ele está, e em que ambiente?"* — o que se
 * responde **antes** de qualquer servidor subir, e que o Vite não diz.
 *
 * ## O que ele NÃO faz, e por quê
 *
 * Cada item abaixo já esteve aqui e foi removido porque era falso ruído:
 *
 * - **URLs das superfícies.** O Vite imprime `→ Local:` de cada uma segundos depois.
 *   Na primeira versão apareciam **duas vezes em quinze linhas**.
 * - **Etiquetas decorativas** como `[web] [docs]`. Copiadas de uma convenção web; num
 *   terminal não há link, não há clique, e nada as explica.
 * - **A lista de dependências** como "stack". Varrer `node_modules` produz inventário
 *   de implementação, não informação.
 * - **Log do Vite e do `concurrently`.** "O que está acontecendo agora" é deles.
 *
 * ## O que este cabeçalho não pode fazer
 *
 * Ele é **estático**: roda uma vez, antes do `concurrently`. Não tem estado de serviço,
 * não tem uptime, não acompanha HMR. Um cabeçalho que não pode mudar é um documento, não
 * um runtime — e por isso ele não mostra serviço. service state, eventos e navegação por
 * tecla exigiriam um processo **vivo**, que é o `dev-console` que o documento propõe como
 * ferramenta de frota. Esse é o teto deste formato, e ele não se resolve com mais cor.
 *
 * ## Guardrails
 *
 * - **A guarda de TTY vem antes de qualquer leitura**, inclusive do `package.json`: a
 *   propriedade é "sem TTY → nenhum output", não "saída preparada e descartada".
 * - **`stderr` não é saída alternativa.**
 * - **Sem `console.clear()`** — convive com terminal integrado, split e IDE.
 * - **A largura conta coluna visível, não `String.length`.** Com ANSI no meio, `.length`
 *   conta os bytes do escape e o alinhamento sai errado **na tela**, não no teste.
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
  labelWidth: 6,
  // Onde o git é lido. O repo pode estar em submodules, e aí `git` no diretório
  // de execução não é o mesmo repositório.
  git: { cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') },
};

// ── Cor ─────────────────────────────────────────────────────────────────────
// Semântica, não enumerate-cores. A distinção que carrega o significado é
// rótulo apagado contra dado aceso; a cor, cada papel tem uma.

const A = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  muted: '\x1b[90m',   // rótulo, régua, metadado
  name: '\x1b[36m',    // identidade
  data: '\x1b[37m',    // dado primário
  clean: '\x1b[32m',   // estado bom
  dirty: '\x1b[33m',   // estado de atenção
};

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
// Tudo aqui é best-effort: um `git` ausente ou um `package.json` ilegível não
// podem impedir o dev de subir. Falha vira campo omitido, nunca exceção.

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
  const changes = changed === null ? null : changed === '' ? 0 : changed.split('\n').length;
  return { branch, commit, changes };
}

async function readPackage() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const raw = await readFile(path.join(here, '..', 'package.json'), 'utf-8');
  const pkg = JSON.parse(raw);
  const m = /^npm@(\d+)\.(\d+)\.(\d+)/.exec(pkg.packageManager || '');
  return { name: pkg.name, version: pkg.version, description: pkg.description, npm: m ? m[1] : null };
}

// ── Renderização ───────────────────────────────────────────────────────────

/** Uma linha rótulo/valor, na mesma coluna para todas. */
function field(label, value, valueColor = A.data) {
  const L = HEADER.labelWidth;
  return `  ${A.muted}${padTo(label, L)}${A.reset} ${valueColor}${truncate(value, HEADER.width - L - 2)}${A.reset}`;
}

const SEP = ' · ';

/**
 * Junta peças coloridas respeitando a largura — e sem perder o ANSI nem a ordem.
 *
 * Cortar a string já montada mediria certo, mas a reticência ficaria com a cor da
 * última peça e o restante perderia o reset. Então o corte é por peça:
 *
 * 1. se passar, cai primeiro a peça marcada como descartável (o commit);
 * 2. se ainda passar, a peça mais longa é truncada **no lugar** — remover e
 *    reinserir mudaria a ordem, que foi exatamente o bug da primeira versão.
 */
function joinParts(partes, coluna) {
  const orcamento = HEADER.width - coluna;
  const sep = visibleWidth(SEP);

  const medir = (ps) => ps.reduce((t, p) => t + visibleWidth(p.plain), 0) + sep * Math.max(0, ps.length - 1);

  let lista = partes.slice();
  if (medir(lista) > orcamento) {
    const semDescartavel = lista.filter((p) => !p.drop);
    if (semDescartavel.length > 0 && medir(semDescartavel) <= orcamento) {
      lista = semDescartavel;
    } else if (lista.some((p) => p.drop)) {
      lista = lista.filter((p) => !p.drop);
    }
  }

  if (medir(lista) > orcamento) {
    // A sobra é descontada da peça mais longa, em posição.
    const maior = lista.reduce((a, b) => (visibleWidth(a.plain) >= visibleWidth(b.plain) ? a : b));
    const folga = medir(lista) - orcamento;
    lista = lista.map((p) => (p === maior ? { ...p, plain: p.plain.slice(0, Math.max(0, p.plain.length - folga - 1)) + '…' } : p));
  }

  return lista.map((p, i) => (i ? A.muted + SEP + A.reset : '') + p.color + p.plain + A.reset).join('');
}

function render({ pkg, repo }) {
  const out = [];

  // ── identidade: a única linha que compete por atenção ──
  out.push('');
  out.push(
    `  ${A.bold}${A.name}${pkg.name.toUpperCase()}${A.reset}` +
      `  ${A.dim}v${pkg.version}${A.reset}` +
      `  ${A.muted}${HEADER.mode}${A.reset}`
  );
  // A descrição fica apagada de propósito: ela é contexto, e contexto em branco
  // compete com a única linha que deveria competir — o nome.
  if (pkg.description) out.push(`  ${A.muted}${truncate(pkg.description, HEADER.width - 2)}${A.reset}`);

  // ── estado do repositório ──
  if (repo) {
    out.push('');
    const partes = [{ plain: repo.branch, color: A.data, drop: false }];
    if (repo.commit) partes.push({ plain: repo.commit, color: A.muted, drop: true });
    if (repo.changes !== null) {
      partes.push({
        plain: repo.changes === 0 ? 'clean' : `${repo.changes} uncommitted`,
        color: repo.changes === 0 ? A.clean : A.dirty,
        drop: false,
      });
    }
    out.push(`  ${A.muted}${padTo('GIT', HEADER.labelWidth)}${A.reset} ${joinParts(partes, 2 + HEADER.labelWidth + 1)}`);
  }

  // ── ambiente ──
  out.push('');
  out.push(field('STACK', HEADER.stack, A.muted));
  const env = [];
  if (pkg.npm) env.push('npm ' + pkg.npm);
  env.push('node ' + process.versions.node);
  if (repo) env.push(process.platform);
  out.push(field('ENV', env.join(' · '), A.muted));

  // ── para onde ir ──
  out.push('');
  out.push(field('REPO', 'github.com/mafhper/aurawall'));
  out.push(field('LIVE', 'mafhper.github.io/aurawall'));

  out.push('');
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

export { visibleWidth, truncate, stripAnsi, hasTty, render, readGit, HEADER };
