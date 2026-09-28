/**
 * Executa um array de tarefas assíncronas com um limite de concorrência.
 * @param {Array<() => Promise<any>>} tasks - Funções que retornam Promises.
 * @param {number} limit - Número máximo de tarefas simultâneas.
 * @returns {Promise<Array<any>>} Resultados na ordem original.
 */
export async function runWithConcurrency(tasks, limit = 4) {
  const results = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}