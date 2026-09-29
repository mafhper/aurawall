/**
 * Cabeçalho de identidade do `npm run dev`.
 *
 * ## O que este script responde — e o que não responde
 *
 * Responde **"o que é este projeto e onde estão as suas superfícies"**. Não responde
 * "o que está acontecendo agora" — isso é do Vite e do `concurrently`, e repetir a saída
 * deles aqui seria duplicar log, não informar.
 *
 * ## Por que é específico deste projeto
 *
 * Aqui existem **duas frentes** de desenvolvimento: o editor e o site promo. Um cabeçalho
 * genérico, gerado a partir de dependências, não saberia disso — e varrer o `node_modules`
 * produziria uma lista de implementação em vez de uma linha útil.
 *
 * ## Guardrails (da crítica à AWR20, ver `.dev/docs/critica-AWR20.md`)
 *
 * - **A guarda de TTY vem antes de qualquer leitura**, inclusive do `package.json`. A
 *   propriedade precisa ser "sem TTY → nenhum output", não "saída preparada e descartada".
 * - **`stderr` não é saída alternativa.** Se `stdout` não tem TTY, o script não imprime nada.
 * - **Sem `console.clear()`.** Este projeto convive com terminal integrado, split terminal,
 *   IDE e log de CI. O cabeçalho entra no fluxo; não apaga o que veio antes.
 * - **A largura conta coluna visível, não `String.length`.** Com ANSI no meio, `.length`
 *   erraria o padding — e o erro apareceria na tela, não no teste.
 * - **Stack, tags e links são declarados**, não inferidos. Só `name`, `version` e `description`
 *   vêm do `package.json`, porque a fonte deles é inequívoca.
 */

// ── Configuração local ─────────────────────────────────────────────────────
// Declarado aqui, não deduzido. Um detector universal de stack é o antipadrão que
// a investigação da frota encontrou; cada projeto conhece a sua arquitetura melhor
// do que qualquer heurística.

import { pathToFileURL } from 'node:url';

const HEADER = {
  tags: ['web', 'docs'],
  stack: ['React', 'TypeScript', 'Vite'],
  surfaces: [
    { name: 'app', label: 'editor', url: 'http://localhost:3000' },
    { name: 'promo', label: 'site', url: 'http://localhost:5173' },
  ],
  links: [
    { label: 'repo', url: 'https://github.com/mafhper/aurawall' },
    { label: 'demo', url: 'https://mafhper.github.io/aurawall' },
  ],
  width: 80,
};

// ── Cores ──────────────────────────────────────────────────────────────────

const A = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
};

// Remove os códigos ANSI de uma string, para medir a largura que a pessoa vê.
const ANSI_RE = /\x1b\[[0-9;]*m/g;

/** Largura visível: o que ocupa coluna no terminal, depois de remover o ANSI. */
function visibleWidth(text) {
  return stripAnsi(text).length;
}

function stripAnsi(text) {
  return text.replace(ANSI_RE, '');
}

/** Corta por largura visível, preservando a sequência ANSI de abertura. */
function truncate(text, max) {
  if (visibleWidth(text) <= max) return text;
  const open = text.match(/^(\x1b\[[0-9;]*m)*/)[0];
  const body = stripAnsi(text);
  const room = Math.max(0, max - 1);
  return open + body.slice(0, room) + '…';
}

const padTo = (text, width) => text + ' '.repeat(Math.max(0, width - visibleWidth(text)));

// ── Guarda de TTY: antes de tudo ───────────────────────────────────────────

/**
 * `stdout` sem TTY significa que ninguém está olhando: CI, pipe, redirecionamento.
 * Aí este script não produz **nenhum** byte. E `stderr` não é saída alternativa —
 * isso imprimiria em CI só escapando do teste de stdout.
 */
function hasTty() {
  return process.stdout.isTTY === true;
}

// ── Leitura do package.json ────────────────────────────────────────────────
// Só é chamado depois da guarda passar, então em CI nem o arquivo é lido.

async function readIdentity() {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const path = await import('node:path');

  const here = path.dirname(fileURLToPath(import.meta.url));
  const raw = await readFile(path.join(here, '..', 'package.json'), 'utf-8');
  const pkg = JSON.parse(raw);

  return { name: pkg.name, version: pkg.version, description: pkg.description };
}

// ── Renderização ───────────────────────────────────────────────────────────

function render({ name, version, description }) {
  const W = HEADER.width;
  const rule = (ch) => ch.repeat(W);
  const out = [];

  out.push(`${A.dim}${rule('─')}${A.reset}`);

  const tags = HEADER.tags.map((t) => `${A.cyan}[${t}]${A.reset}`).join(' ');
  const title = `${A.bold}${name}${A.reset} ${A.dim}v${version}${A.reset}`;
  out.push(` ${title}  ${tags}`);

  if (description) {
    out.push(` ${truncate(description, W - 1)}`);
  }

  out.push(` ${A.dim}${HEADER.stack.join(' · ')}${A.reset}`);
  out.push('');

  out.push(` ${A.dim}DEV${A.reset}`);
  for (const s of HEADER.surfaces) {
    out.push(` ${padTo(s.name, 6)} ${A.dim}${s.label.padEnd(7)}${A.reset} ${truncate(s.url, W - 14)}`);
  }
  out.push('');

  for (const l of HEADER.links) {
    out.push(` ${A.dim}${l.label.padEnd(5)}${A.reset} ${truncate(l.url, W - 6)}`);
  }

  out.push(`${A.dim}${rule('─')}${A.reset}`);
  return out.join('\n');
}

// ── Entrada ────────────────────────────────────────────────────────────────

async function main() {
  // Primeira decisão do processo. Antes de importar o fs, antes de ler o
  // package.json, antes de formatar qualquer coisa.
  if (!hasTty()) {
    process.exit(0);
  }

  let identity;
  try {
    identity = await readIdentity();
  } catch {
    // Um cabeçalho é conveniência, nunca pré-requisito: se o package.json não
    // estiver legível, o dev server sobe igual.
    identity = { name: 'aurawall', version: '?', description: null };
  }

  process.stdout.write(render(identity) + '\n');
}

// `import.meta.main` não existe no Node 24 de forma estável, e comparar
// `import.meta.url` com uma string montada à mão quebra no Windows — o
// pathToFileURL normaliza os dois lados.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { visibleWidth, truncate, stripAnsi, hasTty, render, HEADER };
