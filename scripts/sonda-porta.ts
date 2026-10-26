// sonda-porta.mjs — a fonte unica da sonda de porta da frota.
//
// ============================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ============================================================================
//
// Ate 2026-10-01 a mesma ideia vivia em TRES lugares, e nenhum deles era completo:
//
//   icon-core/scripts/dev-port.mjs   sonda no loopback. Sem lista de portas ruins.
//   imaginizim/scripts/net-port.mjs   sonda + BAD_PORTS (WHATWG). Nao ligada ao dev.
//   Dinopad/scripts/dev/serve.ts      as duas coisas, em TypeScript.
//
// Nenhum dos tres e shared, e nenhum dos tres e wired em tudo. Esta e a fonte;
// `replicar-sonda.mjs` copia o CORPO para cada repo da lista de adocao e
// compara as copias com `--check`.
//
// O cabecalho e' do projeto, nao da fonte: e' onde o repo escreve o que so ele
// sabe (de onde o config importa, se o arquivo e' versionado). Uma melhoria no
// texto desta fonte NAO se propaga sozinha — por desenho, para nao apagar o que o
// projeto mediu. O que se propaga sozinho e' o corpo, que e' a sonda.
//
// ============================================================================
// A PERGUNTA QUE A SONDA FAZ
// ============================================================================
//
// "Um cliente consegue alcancar esta porta no endereco de loopback?"
//
// E a pergunta certa, e a intuição errada e breve: sondar "posso bindar?" nao
// basta. No Windows, bindar `0.0.0.0:P` TEM SUCESSO mesmo com `127.0.0.1:P`
// ocupado -- sao enderecos distintos. Medido em 2026-09-30 (icon-core): os dois
// servidores subiram, ambos anunciaram `localhost:5173`, nenhum reportou erro,
// e o navegador foi servido pelo PROJETO ERRADO (404).
//
// Repetido em 2026-10-01 para `::` (IPv6 comescado, usado por push_,
// mark-lee/apps/site e personalnews/quality-core/dashboard): o mesmo defeito.
// Ver `.dev/scripts/medir-host-duplo.mjs`.
//
// Conclusao: qualquer host NAO-loopback (`0.0.0.0`, `::`, `true`) precisa de
// sonda, e `strictPort: true` para que a corrida entre a sonda e o bind falhe
// alto em vez de voltar a mentir.
//
// ============================================================================
// AS DUAS METADES
// ============================================================================
//
// A sonda tem que responder a DUAS perguntas, e as tres copias antigas respondiam
// a uma cada:
//
//   1. A porta esta LIVRE no loopback?        -> `net.listen` e o teste
//   2. A porta e USAVEL por um cliente HTTP?  -> a lista BAD_PORTS
//
// A segunda importa porque WHATWG URL marca certas portas como "bad port" e o
// `fetch` REJEITA antes de tentar conectar. `net.listen(1719)` tem sucesso --
// o SO aceita -- mas `fetch('http://127.0.0.1:1719/')` lanca. Uma porta
// bindavel nao e necessariamente usavel, e o `net` e o `fetch` discordam.
//
// ============================================================================
// USO
// ============================================================================
//
//   // vite.config.js  (top-level await, dentro de defineConfig async)
//   import { findSafePort, formatPortFallback } from './scripts/sonda-porta.mjs';
//
//   export default defineConfig(async () => {
//     const preferida = Number(process.env.PORT) || 5173;
//     const porta = await findSafePort(preferida, { rotulo: 'web app' });
//     if (porta !== preferida) console.warn(formatPortFallback(preferida, porta, 'web app'));
//     return { server: { host: '0.0.0.0', port: porta, strictPort: true } };
//   });
//
// PROJETO TAURI: nao realoca. O `devUrl` do `tauri.conf.json` e lido ANTES do
// servidor subir, entao realocar deixaria o app apontando para porta vazia.
// Use `strictPort: true` e deixe a falha dizer quem segura -- ver `describePortTaken`.
// ============================================================================

import { createServer } from 'node:net';

// Portas que o cliente HTTP recusa, mesmo com algo escutando nelas.
// Lista normativa do padrao WHATWG URL ("bad port"): um numero nela e
// rejeitado por `fetch` antes de qualquer tentativa de conexao. `net`/`http` do
// Node nao tem essa restricao -- e por isso os dois discordam.
export const BAD_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95, 101, 102,
  103, 104, 109, 110, 111, 113, 115, 117, 119, 135, 139, 143, 161, 179, 185, 389, 427, 465, 512,
  513, 514, 515, 526, 530, 531, 532, 540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995,
  1719, 1720, 1723, 2049, 3659, 4045, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669, 6697,
  10080
]);

/** Uma porta e usavel so se for inteira, no rango valido e nao for "bad port". */
export function isPortUsable(port: number): boolean {
  if (!Number.isInteger(port)) return false;
  if (port < 1 || port > 65535) return false;
  return !BAD_PORTS.has(port);
}

/**
 * Tenta bindar `port` em `host` e responde se deu certo.
 * Resolve `true` = livre, `false` = ocupada. Nunca lanca.
 */
export function isPortFree(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createServer();
    let jaRespondeu = false;

    const responder = (livre: boolean): void => {
      if (jaRespondeu) return;
      jaRespondeu = true;
      probe.removeAllListeners();
      if (probe.listening) probe.close(() => resolve(livre));
      else resolve(livre);
    };

    probe.once('error', () => responder(false));
    probe.once('listening', () => responder(true));

    try {
      probe.listen(port, host);
    } catch {
      responder(false);
    }
  });
}

/**
 * Pede ao SO uma porta efemera (`listen(0)`) e devolve o NUMERO, se ela for
 * utilizavel por um cliente HTTP. `isPortFree` nao serve aqui: ele so responde
 * se o bind tem sucesso, e nao qual numero o SO escolheu.
 */
function portaEfemeraUtilizavel(host: string): Promise<number | null> {
  return new Promise((resolve) => {
    const probe = createServer();
    let jaRespondeu = false;
    const responder = (porta: number | null): void => {
      if (jaRespondeu) return;
      jaRespondeu = true;
      probe.removeAllListeners();
      if (probe.listening) probe.close(() => resolve(porta));
      else resolve(porta);
    };
    probe.once('error', () => responder(null));
    probe.once('listening', () => {
      const addr = probe.address();
      const numero = addr && typeof addr === 'object' ? addr.port : 0;
      responder(isPortUsable(numero) ? numero : null);
    });
    try {
      probe.listen(0, host);
    } catch {
      responder(null);
    }
  });
}

/**
 * Primeira porta utilizavel a partir de `preferida`, sondando o LOOPBACK.
 *
 * A varredura e SEQUENCIAL (preferida, preferida+1, ...) e nao efemera: um numero
 * que ninguem le de relance nao serve, e quem viu "5565" nao sabe o que fazer.
 *
 * @param {number} preferida
 * @param {{ host?: string, tentativas?: number, rotulo?: string }} [opcoes]
 * @returns {Promise<number>}
 */
export async function findSafePort(preferida: number, opcoes: { host?: string; tentativas?: number; rotulo?: string } = {}): Promise<number> {
  const { host = '127.0.0.1', tentativas = 20, rotulo = 'dev server' } = opcoes;

  for (let i = 0; i < tentativas; i += 1) {
    const candidata = preferida + i;
    if (!isPortUsable(candidata)) continue;
    if (await isPortFree(candidata, host)) return candidata;
  }

  // Ultimo recurso: porta efemera pedida ao SO.
  // `isPortFree` so responde se o BIND tem sucesso — nao devolve o numero. Para
  // obter o numero da efemera, eu mesmo capturo a porta atribuida pelo SO.
  for (let i = 0; i < tentativas; i += 1) {
    const efemera = await portaEfemeraUtilizavel(host);
    if (efemera !== null) return efemera;
  }

  throw new Error(
    `nenhuma porta utilizavel para "${rotulo}" em ${preferida}..${preferida + tentativas - 1} (em ${host})`
  );
}

/**
 * A mensagem de fallback tem que dizer a porta antiga, a nova e O MOTIVO.
 * Um dev que ve "5174" sem saber por que reinicia o terminal achando que
 * algo quebrou.
 */
export function formatPortFallback(de: number, para: number, rotulo: string = 'dev server'): string {
  return (
    `\n  Porta ${de} ja esta servindo outra coisa em 127.0.0.1 ` +
    `(outro projeto da frota, ou um servico local).\n` +
    `  O ${rotulo} vai usar ${para} — abra a URL anunciada.\n`
  );
}

/**
 * Para projeto com porta FIXA (Tauri): nao realoca, descreve o conflito.
 *
 * O `devUrl` do `tauri.conf.json` e lido antes do servidor subir. Realocar a
 * porta deixaria o app apontando para uma porta onde nada escuta — um erro
 * silencioso e pior do que a falha.
 */
export function describePortTaken(port: number, host: string = '127.0.0.1'): string {
  return (
    `porta ${port} ocupada em ${host}. Este projeto usa porta fixa (Tauri le o ` +
    `devUrl antes de subir o servidor), entao ela nao pode ser realocada.\n` +
    `  Para ver quem esta segurando:\n` +
    `    Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq ${port} } |\n` +
    `      ForEach-Object { "$($_.LocalAddress):$($_.LocalPort) pid=$($_.OwningProcess) $((Get-Process -Id $_.OwningProcess).Name)" }\n` +
    `  Depois libere essa porta e rode de novo.`
  );
}

/**
 * VERIFICA, nao realoca. Para porta que e contrato (Tauri, `devUrl` fixo).
 *
 * Por que `strictPort: true` sozinho NAO resolve, e isto e o ponto:
 * `strictPort` so dispara quando o BIND falha. Com host nao-loopback
 * (`0.0.0.0`, `::`, `true`) o bind NAO falha mesmo com `127.0.0.1` ocupado --
 * medido em 2026-09-30 no icon-core e em 2026-10-01 para `::`. Entao
 * `strictPort` nunca chega a ser exercitado, e o defeito silencioso continua.
 *
 * Para host nao-loopback, a unica defesa e sondar ANTES do bind. Aqui a sonda
 * aborta em vez de procurar a seguinte, porque a porta nao pode mudar.
 *
 * @throws {Error} com a mensagem de `describePortTaken`
 */
export async function assertPortFree(port: number, options: { host?: string } = {}): Promise<number> {
  const { host = '127.0.0.1' } = options;
  if (!isPortUsable(port)) {
    throw new Error(
      `porta ${port} esta na lista de "bad ports" do padrao WHATWG: o fetch rejeita ` +
      `antes de conectar. Escolha outra.`
    );
  }
  if (!(await isPortFree(port, host))) {
    throw new Error(describePortTaken(port, host));
  }
  return port;
}