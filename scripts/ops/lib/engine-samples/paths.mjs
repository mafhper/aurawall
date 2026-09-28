import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Sobe a árvore até achar o package.json, em vez de contar `../..`.
 *
 * Contar níveis funcionou até a lib descer um nível dentro de
 * `scripts/ops/lib/engine-samples/`, e quebrou em silêncio: o sintoma foi um
 * "Could not resolve ./src/..." do esbuild, a dois arquivos de distância da
 * causa. Achar o package.json não tem como ficar errado quando a pasta se move.
 */
function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Não encontrei o package.json subindo a partir de ' + startDir +
    ' — o gerador precisa rodar de dentro do repositório.'
  );
}

export const repoRoot = findRepoRoot(__dirname);

/**
 * Ferramenta não escreve no workspace privado: `.dev/` é gitignored, então um
 * cache ou saída ali não existe em clone limpo e o comando quebra (ADR-004).
 * `node_modules/.cache/` é ignorado pelo git e se autossustenta.
 */
export const cacheDir = path.join(repoRoot, 'node_modules', '.cache', 'aurawall');
export const defaultOutputRoot = path.join(cacheDir, 'cli-samples');
