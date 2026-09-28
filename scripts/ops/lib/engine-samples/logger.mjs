import ora from 'ora';

let currentSpinner = null;

export function createSpinner(text) {
  if (currentSpinner) currentSpinner.stop();
  currentSpinner = ora(text).start();
  return currentSpinner;
}

export function stopSpinner() {
  if (currentSpinner) {
    currentSpinner.stop();
    currentSpinner = null;
  }
}

export function logInfo(msg)   { console.log(`ℹ️  ${msg}`); }
export function logSuccess(msg){ console.log(`✅ ${msg}`); }
export function logWarning(msg){ console.warn(`⚠️  ${msg}`); }
export function logError(msg)  { console.error(`❌ ${msg}`); }

export function verboseLog(msg, verbose) {
  if (verbose) console.log(`[verbose] ${msg}`);
}

/**
 * Atualiza barra de progresso com um texto de status opcional.
 * @param {number} current      - Passo atual.
 * @param {number} total        - Total de passos.
 * @param {string} label        - Rótulo da tarefa (ex: "Renderizando").
 * @param {number|null} startTime - Timestamp para calcular ETA.
 * @param {string} [statusText] - Texto opcional com a engine/seed atual.
 */
export function updateProgress(current, total, label = '', startTime = null, statusText = '') {
  // Para o spinner se estiver ativo (por segurança)
  if (currentSpinner) stopSpinner();

  const pct = Math.round((current / total) * 100);
  const barLength = 30;
  const filled = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

  let eta = '';
  if (startTime && current > 0 && current < total) {
    const elapsed = (Date.now() - startTime) / 1000;
    const avg = elapsed / current;
    const remain = avg * (total - current);
    const mins = Math.floor(remain / 60);
    const secs = Math.floor(remain % 60);
    eta = ` ⏱️ ETA: ${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  // Monta a parte do status (ex: "boreal seed 83746512")
  const statusPart = statusText ? ` ${statusText}` : '';

  // Linha completa: ⏳ borel seed 123 ██████░░░░ 29% Renderizando (20/70) ETA: ...
  const line = `⏳${statusPart} ${bar} ${pct}% ${label} (${current}/${total})${eta}`;

  process.stdout.write(`\r${line}`);
  if (current === total) process.stdout.write('\n');
}