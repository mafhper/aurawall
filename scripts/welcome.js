/**
 * Cabeçalho de identidade do `npm run dev`.
 *
 * ## O que este script responde
 *
 * *"Que projeto é este, e onde eu acho o código."* E só.
 *
 * ## O que ele NÃO faz, e por quê
 *
 * **Não mostra as URLs das superfícies.** O Vite imprime `→ Local: http://localhost:3000/`
 * e `http://localhost:5173/` alguns segundos depois. A primeira versão deste cabeçalho
 * mostrava as duas, e na tela elas apareciam **duas vezes em quinze linhas**. Isso
 * contrariava a regra que o próprio cabeçalho.following: não repetir o que os programas
 * que ele inicia vão dizer.
 *
 * **Não mostra etiquetas decorativas.** Houve uma versão com `[web] [docs]`, copiada de
 * uma convenção web. Num terminal não há link, não há clique, e nada as explica — eram
 * três caracteres ocupando largura sem transmitir nada.
 *
 * **Não repete o log do Vite e do `concurrently`.** "O que está acontecendo agora" é
 * deles. Este cabeçalho é o cenário fixo: identidade e para onde ir.
 *
 * ## Guardrails (de `.dev/docs/critica-AWR20.md`)
 *
 * - **A guarda de TTY vem antes de qualquer leitura**, inclusive do `package.json`: a
 *   propriedade é "sem TTY → nenhum output", não "saída preparada e descartada".
 * - **`stderr` não é saída alternativa.**
 * - **Sem `console.clear()`** — convive com terminal integrado, split e IDE.
 * - **A largura conta coluna visível, não `String.length`** — com ANSI no meio, `.length`
 *   contaria os bytes do escape e o alinhamento sairia errado **na tela**, não no teste.
 */

// ── Configuração local ─────────────────────────────────────────────────────
// Declarado, não deduzido. Varrer `node_modules` produz inventário de implementação
// em vez de linha útil.

import { pathToFileURL } from 'node:url';

const HEADER = {
  // Lista de rótulo/valor. Tudo na mesma forma, na mesma coluna, pela mesma
  // regra de cor — é isso que faz o olho ler "rótulo" e "dado" sem precisar ler.
  fields: [
    { label: 'STACK', value: 'React · TypeScript · Vite' },
    { label: 'REPO', value: 'github.com/mafhper/aurawall' },
    { label: 'LIVE', value: 'mafhper.github.io/aurawall' },
  ],
  width: 80,
  labelWidth: 7,
};

// ── Cor ─────────────────────────────────────────────────────────────────────
// Cada cor tem um trabalho. A mais importante é a que separa rótulo de valor:
// cinza-escuro é interface, cor é dado. Sem isso, `REPO` e a URL nele pesam igual.

const A = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  label: '\x1b[90m',   // cinza: rótulo de interface
  name: '\x1b[36m',    // ciano: identidade do projeto
  value: '\x1b[37m',   // branco brilhante: dado
  rule: '\x1b[90m',    // régua
};

const ANSI_RE = /\x1b\[[0-9;]*m/g;

function stripAnsi(text) {
  return text.replace(ANSI_RE, '');
}

/** Largura visível: o que ocupa coluna no terminal, depois de remover o ANSI. */
function visibleWidth(text) {
  return stripAnsi(text).length;
}

function truncate(text, max) {
  if (visibleWidth(text) <= max) return text;
  const open = text.match(/^(\x1b\[[0-9;]*m)*/)[0];
  const body = stripAnsi(text);
  return open + body.slice(0, Math.max(0, max - 1)) + '…';
}

const padTo = (text, width) => text + ' '.repeat(Math.max(0, width - visibleWidth(text)));

// ── Guarda de TTY: antes de tudo ───────────────────────────────────────────

/** Sem TTY significa que ninguém está olhando: CI, pipe, redirecionamento. */
function hasTty() {
  return process.stdout.isTTY === true;
}

// ── Leitura ────────────────────────────────────────────────────────────────
// Só depois da guarda passar, então em CI nem o arquivo é aberto.

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
  const L = HEADER.labelWidth;
  const rule = `${A.rule}${'─'.repeat(W)}${A.reset}`;
  const out = [];

  // Identidade: nome em destaque, versão como dado secundário.
  out.push(rule);
  out.push(` ${A.bold}${A.name}${name.toUpperCase()}${A.reset}  ${A.dim}v${version}${A.reset}`);
  if (description) out.push(` ${A.value}${truncate(description, W - 1)}${A.reset}`);

  // Régua interna: separa o bloco de identidade do bloco de metadados. Sem ela,
  // os dois se leem como um muro de texto.
  out.push('');
  out.push(` ${A.rule}${'─'.repeat(W - 2)}${A.reset}`);
  out.push('');

  // Metadados: rótulo em cinza caixa alta, valor em branco. A diferença de cor é
  // o que faz o olho ler "rótulo" e "dado" sem precisar ler.
  for (const f of HEADER.fields) {
    out.push(` ${A.label}${padTo(f.label, L)}${A.reset} ${A.value}${truncate(f.value, W - L - 1)}${A.reset}`);
  }

  out.push(rule);
  return out.join('\n');
}

// ── Entrada ────────────────────────────────────────────────────────────────

async function main() {
  if (!hasTty()) {
    process.exit(0);
  }

  let identity;
  try {
    identity = await readIdentity();
  } catch {
    // Cabeçalho é conveniência, nunca pré-requisito: se o package.json não estiver
    // legível, o dev server sobe igual.
    identity = { name: 'aurawall', version: '?', description: null };
  }

  process.stdout.write(render(identity) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { visibleWidth, truncate, stripAnsi, hasTty, render, HEADER };
