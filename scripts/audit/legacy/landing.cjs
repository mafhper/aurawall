/**
 * Script de Análise de Desempenho Web (CommonJS)
 * 
 * @deprecated Este script é LEGADO. Use `npm run audit:promo` (audit-runner.cjs) em vez disso.
 * Este arquivo será removido em versões futuras.
 *
 * Automatiza a análise de desempenho de aplicações web utilizando Lighthouse
 * e outras ferramentas de auditoria. Gera relatórios detalhados sobre:
 * - Performance, Acessibilidade, SEO e Boas Práticas
 * - Tempos de carregamento e métricas Core Web Vitals
 * - Tamanhos de bundle e recursos carregados
 * - Problemas de segurança e otimizações sugeridas
 *
 * Uso: npm run analyze ou node scripts/performance-audit.cjs
 * 
 * Melhorias implementadas:
 * - Tratamento robusto de erros com try-catch específicos
 * - Validação de entrada de configurações
 * - Verificação automática de servidor com timeout configurável
 * - Limpeza adequada de recursos (Chrome)
 * - Códigos de saída apropriados
 * - Logging estruturado com níveis
 * - Suporte a múltiplos formatos de relatório
 * - Gestão assíncrona de operações de I/O
 */

console.warn('\n⚠️  AVISO: Este script (audit-landing.cjs) é LEGADO.');
console.warn('   Use `npm run audit:promo` (audit-runner.cjs) em vez disso.\n');

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// Configurações
const CONFIG = {
  url: process.env.AUDIT_URL || 'http://localhost:5173',
  outputDir: './performance-reports',
  serverPort: parseInt(process.env.SERVER_PORT || '5173', 10),
  serverTimeout: parseInt(process.env.SERVER_TIMEOUT || '30000', 10),
  autoStartServer: process.env.AUTO_START_SERVER !== 'false',
  chromeFlags: (process.env.AUDIT_HEADLESS === 'false' || process.argv.includes('--visible'))
    ? ['--no-sandbox', '--disable-gpu']
    : ['--headless', '--no-sandbox', '--disable-gpu'],
  lighthouseConfig: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    },
  },
  thresholds: {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 90,
    largeFileSize: 500000, // 500KB
  },
};

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// Níveis de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()]
  : LOG_LEVELS.INFO;

/**
 * Formata e exibe mensagens coloridas no console com níveis
 */
function log(message, color = 'reset', level = 'INFO') {
  const logLevel = LOG_LEVELS[level] || LOG_LEVELS.INFO;

  if (logLevel > currentLogLevel) return;

  const colorCode = colors[color] || colors.reset;
  const timestamp = new Date().toISOString();
  const prefix = level !== 'INFO' ? `[${level}] ` : '';

  console.log(`${colors.dim}${timestamp}${colors.reset} ${colorCode}${prefix}${message}${colors.reset}`);
}

/**
 * Valida configurações antes de iniciar
 */
function validateConfig() {
  const errors = [];

  if (!CONFIG.url || !CONFIG.url.startsWith('http')) {
    errors.push('URL inválida. Deve começar com http:// ou https://');
  }

  if (CONFIG.serverPort < 1 || CONFIG.serverPort > 65535) {
    errors.push('Porta do servidor deve estar entre 1 e 65535');
  }

  if (CONFIG.serverTimeout < 5000 || CONFIG.serverTimeout > 120000) {
    errors.push('Timeout do servidor deve estar entre 5000 e 120000ms');
  }

  if (errors.length > 0) {
    log('Erros de configuração:', 'red', 'ERROR');
    errors.forEach(err => log(`  - ${err}`, 'red', 'ERROR'));
    return false;
  }

  return true;
}

/**
 * Cria o diretório de relatórios se não existir
 */
async function ensureOutputDir() {
  try {
    await fsPromises.access(CONFIG.outputDir);
  } catch {
    await fsPromises.mkdir(CONFIG.outputDir, { recursive: true });
    log(`✓ Diretório criado: ${CONFIG.outputDir}`, 'green');
  }
}

/**
 * Verifica se o servidor está rodando na porta especificada
 */
function checkServer(port, timeout = 5000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout }, (res) => {
      resolve(res.statusCode === 200);
      req.destroy();
    })
      .on('error', () => resolve(false))
      .on('timeout', () => {
        req.destroy();
        resolve(false);
      });
  });
}

/**
 * Inicia o servidor de desenvolvimento/preview se necessário
 */
async function startServer() {
  log('Iniciando servidor automaticamente...', 'cyan');

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  // Tenta primeiro 'preview', depois 'dev'
  const commands = [
    ['run', 'preview'],
    ['run', 'dev'],
  ];

  for (const args of commands) {
    try {
      const serverProcess = spawn(npmCmd, args, {
        stdio: 'pipe',
        detached: false,
        shell: true,
      });

      let serverError = '';
      serverProcess.stderr?.on('data', (data) => {
        serverError += data.toString();
      });

      serverProcess.on('error', (error) => {
        log(`Erro ao iniciar servidor: ${error.message}`, 'red', 'ERROR');
      });

      // Aguarda servidor ficar pronto
      const maxAttempts = Math.floor(CONFIG.serverTimeout / 1000);
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));

        const isUp = await checkServer(CONFIG.serverPort);
        if (isUp) {
          log(`✓ Servidor iniciado com sucesso (comando: npm ${args.join(' ')})!`, 'green');
          return serverProcess;
        }

        attempts++;
        if (attempts % 5 === 0) {
          log(`Aguardando servidor... (${attempts}s/${maxAttempts}s)`, 'cyan', 'DEBUG');
        }
      }

      // Timeout - encerra e tenta próximo comando
      await killProcess(serverProcess);
      log(`Timeout com comando 'npm ${args.join(' ')}', tentando próximo...`, 'yellow', 'DEBUG');

    } catch (error) {
      log(`Falha ao executar 'npm ${args.join(' ')}': ${error.message}`, 'yellow', 'DEBUG');
    }
  }

  throw new Error(`Não foi possível iniciar servidor após ${CONFIG.serverTimeout}ms`);
}

/**
 * Encerra processo de forma multiplataforma
 */
async function killProcess(proc) {
  if (!proc || !proc.pid) return;

  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', proc.pid.toString(), '/f', '/t']);
    } else {
      process.kill(-proc.pid, 'SIGTERM');
    }

    await new Promise(r => setTimeout(r, 1000));
  } catch (error) {
    log(`Aviso: Erro ao encerrar processo: ${error.message}`, 'yellow', 'WARN');
  }
}

/**
 * Executa análise do tamanho do bundle
 */
async function analyzeBundleSize() {
  log('\n📦 Analisando tamanho do bundle...', 'cyan');

  try {
    const buildDirs = ['./dist', './build'];
    let targetDir = null;

    for (const dir of buildDirs) {
      try {
        await fsPromises.access(dir);
        targetDir = dir;
        break;
      } catch {
        // Diretório não existe, tenta próximo
      }
    }

    if (!targetDir) {
      log('⚠ Diretório de build não encontrado. Execute npm run build primeiro.', 'yellow', 'WARN');
      return null;
    }

    const stats = await getDirectorySize(targetDir);

    log(`\n📊 Estatísticas do Bundle:`, 'bright');
    log(`   Tamanho total: ${formatBytes(stats.totalSize)}`);
    log(`   Número de arquivos: ${stats.fileCount}`);

    const largeFiles = stats.files
      .filter(f => f.size > CONFIG.thresholds.largeFileSize)
      .sort((a, b) => b.size - a.size);

    if (largeFiles.length > 0) {
      log(`\n⚠ Arquivos grandes detectados (>${formatBytes(CONFIG.thresholds.largeFileSize)}):`, 'yellow', 'WARN');
      largeFiles.forEach(file => {
        log(`   ${file.name}: ${formatBytes(file.size)}`, 'yellow');
      });
    } else {
      log('   ✓ Nenhum arquivo excessivamente grande detectado', 'green');
    }

    return stats;
  } catch (error) {
    log(`✗ Erro ao analisar bundle: ${error.message}`, 'red', 'ERROR');
    return null;
  }
}

/**
 * Calcula tamanho de um diretório recursivamente (versão async)
 */
async function getDirectorySize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  const files = [];

  async function traverseDir(currentPath) {
    const items = await fsPromises.readdir(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = await fsPromises.stat(fullPath);

      if (stats.isDirectory()) {
        await traverseDir(fullPath);
      } else {
        totalSize += stats.size;
        fileCount++;
        files.push({
          name: path.relative(dirPath, fullPath),
          size: stats.size,
        });
      }
    }
  }

  await traverseDir(dirPath);

  return { totalSize, fileCount, files };
}

/**
 * Formata bytes para formato legível
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Analisa dependências e detecta pacotes problemáticos
 */
async function analyzeDependencies() {
  log('\n📚 Analisando dependências...', 'cyan');

  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = await fsPromises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const depCount = Object.keys(dependencies).length;
    log(`   Total de dependências: ${depCount}`);

    // Pacotes conhecidos por serem pesados com alternativas
    const heavyPackages = {
      'moment': { alternative: 'date-fns ou dayjs', reason: 'Bundle grande (~70KB)' },
      'lodash': { alternative: 'lodash-es (com tree-shaking)', reason: 'Suporte a tree-shaking' },
      'jquery': { alternative: 'vanilla JS ou framework nativo', reason: 'Desnecessário em apps modernas' },
      'axios': { alternative: 'fetch API nativa', reason: 'Fetch nativo é suficiente para maioria dos casos' },
      'core-js': { alternative: 'Polyfills seletivos', reason: 'Muito abrangente' },
      '@babel/polyfill': { alternative: 'core-js com preset-env', reason: 'Deprecated' },
    };

    const foundHeavy = Object.keys(heavyPackages).filter(pkg => dependencies[pkg]);

    if (foundHeavy.length > 0) {
      log(`\n⚠ Pacotes pesados detectados (considere alternativas):`, 'yellow', 'WARN');
      foundHeavy.forEach(pkg => {
        const info = heavyPackages[pkg];
        log(`   ${pkg}`, 'yellow');
        log(`     → Alternativa: ${info.alternative}`, 'yellow');
        log(`     → Razão: ${info.reason}`, 'dim');
      });
    } else {
      log('   ✓ Nenhum pacote pesado conhecido detectado', 'green');
    }

    return { depCount, heavyPackages: foundHeavy };
  } catch (error) {
    log(`✗ Erro ao analisar dependências: ${error.message}`, 'red', 'ERROR');
    return null;
  }
}

/**
 * Executa auditoria com Lighthouse
 */
async function runLighthouseAudit() {
  log('\n🔍 Iniciando auditoria Lighthouse...', 'cyan');

  let chrome;

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: CONFIG.chromeFlags,
    });

    const options = {
      logLevel: currentLogLevel >= LOG_LEVELS.DEBUG ? 'info' : 'error',
      output: ['html', 'json'],
      port: chrome.port,
    };

    log(`   Analisando: ${CONFIG.url}`, 'cyan');

    const runnerResult = await lighthouse(CONFIG.url, options, CONFIG.lighthouseConfig);

    if (!runnerResult) {
      throw new Error('Lighthouse falhou ao executar');
    }

    const { lhr, report } = runnerResult;

    // Salva relatórios
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const timeOnly = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].substring(0, 8);
    const filenamePart = `lighthouse-${timestamp}_${timeOnly}`;

    const reportPathHtml = path.join(CONFIG.outputDir, `${filenamePart}.html`);
    const reportPathJson = path.join(CONFIG.outputDir, `${filenamePart}.json`);

    await fsPromises.writeFile(reportPathHtml, report[0]);
    await fsPromises.writeFile(reportPathJson, report[1]);

    log(`\n✓ Relatórios salvos:`, 'green');
    log(`   HTML: ${reportPathHtml}`, 'green');
    log(`   JSON: ${reportPathJson}`, 'green');

    const allPassed = displayScores(lhr);
    displayMetrics(lhr);
    displayOpportunities(lhr);

    return { lhr, allPassed };
  } catch (error) {
    log(`\n✗ Erro na auditoria: ${error.message}`, 'red', 'ERROR');

    if (error.message.includes('ECONNREFUSED')) {
      log(`   Certifique-se de que o servidor está rodando em ${CONFIG.url}`, 'yellow', 'WARN');
    }

    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Exibe scores das categorias
 */
function displayScores(lhr) {
  log(`\n📊 Scores de Auditoria:`, 'bright');

  const categories = lhr.categories;
  let allPassed = true;

  Object.keys(categories).forEach(categoryId => {
    const category = categories[categoryId];
    const score = Math.round(category.score * 100);
    const threshold = CONFIG.thresholds[categoryId] || 90;

    let color = 'red';
    if (score >= 90) color = 'green';
    else if (score >= 50) color = 'yellow';

    const emoji = score >= 90 ? '✓' : score >= 50 ? '⚠' : '✗';
    const status = score >= threshold ? 'PASSOU' : 'FALHOU';

    log(`   ${emoji} ${category.title}: ${score} [${status}]`, color);

    if (score < threshold) allPassed = false;
  });

  return allPassed;
}

/**
 * Exibe métricas de performance
 */
function displayMetrics(lhr) {
  log(`\n⏱️  Métricas de Performance:`, 'bright');

  const metricsAudit = lhr.audits.metrics;

  if (!metricsAudit?.details?.items?.length) {
    log('   ⚠ Não foi possível coletar métricas detalhadas.', 'yellow', 'WARN');
    if (lhr.runtimeError) {
      log(`   Erro de Runtime: ${lhr.runtimeError.message}`, 'red', 'ERROR');
    }
    return;
  }

  const metrics = metricsAudit.details.items[0];

  const metricsToShow = [
    { key: 'firstContentfulPaint', name: 'First Contentful Paint (FCP)', unit: 'ms' },
    { key: 'largestContentfulPaint', name: 'Largest Contentful Paint (LCP)', unit: 'ms' },
    { key: 'interactive', name: 'Time to Interactive (TTI)', unit: 'ms' },
    { key: 'speedIndex', name: 'Speed Index', unit: 'ms' },
    { key: 'totalBlockingTime', name: 'Total Blocking Time (TBT)', unit: 'ms' },
    { key: 'cumulativeLayoutShift', name: 'Cumulative Layout Shift (CLS)', unit: '' },
  ];

  metricsToShow.forEach(({ key, name, unit }) => {
    const value = metrics[key];
    if (value !== undefined) {
      const formatted = key === 'cumulativeLayoutShift'
        ? value.toFixed(3)
        : `${Math.round(value)}${unit}`;
      log(`   ${name}: ${formatted}`);
    }
  });
}

/**
 * Exibe principais oportunidades de otimização
 */
function displayOpportunities(lhr) {
  const opportunities = Object.values(lhr.audits)
    .filter(audit => audit.details?.type === 'opportunity')
    .filter(audit => audit.score !== null && audit.score < 1)
    .sort((a, b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0))
    .slice(0, 5);

  if (opportunities.length > 0) {
    log(`\n🎯 Principais Oportunidades de Melhoria:`, 'bright');

    opportunities.forEach((audit, index) => {
      const savings = audit.details.overallSavingsMs;
      log(`\n   ${index + 1}. ${audit.title}`, 'yellow');
      if (savings) {
        log(`      Economia estimada: ${Math.round(savings)}ms`, 'yellow');
      }
      if (audit.description) {
        const desc = audit.description.replace(/<[^>]*>/g, '').substring(0, 100);
        log(`      ${desc}...`, 'dim');
      }
    });
  } else {
    log(`\n✓ Nenhuma oportunidade crítica de melhoria encontrada!`, 'green');
  }
}

/**
 * Gera resumo final em JSON
 */
async function generateSummary(lighthouseResults, bundleStats, depsAnalysis) {
  const timestamp = new Date().toISOString();

  const summary = {
    timestamp,
    url: CONFIG.url,
    lighthouse: {
      performance: Math.round(lighthouseResults.categories.performance.score * 100),
      accessibility: Math.round(lighthouseResults.categories.accessibility.score * 100),
      bestPractices: Math.round(lighthouseResults.categories['best-practices'].score * 100),
      seo: Math.round(lighthouseResults.categories.seo.score * 100),
    },
    metrics: lighthouseResults.audits.metrics?.details?.items?.[0] || null,
    bundle: bundleStats,
    dependencies: depsAnalysis,
  };

  const summaryPath = path.join(CONFIG.outputDir, 'latest-summary.json');
  await fsPromises.writeFile(summaryPath, JSON.stringify(summary, null, 2));

  log(`\n✓ Resumo salvo: ${summaryPath}`, 'green');

  return summary;
}

/**
 * Função principal
 */
// ... existing imports ...

// Helper for formatted timestamp
const getFormattedTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year}_${hours}-${minutes}`;
};


async function generateMarkdownReport(data) {
  const { url, timestamp, environment, lighthouse: lhr, bundle, dependencies } = data;
  const dateStr = new Date(timestamp).toLocaleString('pt-BR');

  // Fallback if environment is missing (it is not in the original script)
  const framework = environment?.framework || 'Unknown';
  const bundler = environment?.bundler || 'Unknown';

  let md = `# Relatório de Performance Audit Legacy\n\n`;
  md += `**Data:** ${dateStr}\n`;
  md += `**URL:** ${url}\n`;
  md += `**Framework:** ${framework}\n`;
  md += `**Bundler:** ${bundler}\n\n`;
  md += `---\n\n`;
  md += `## Scores Lighthouse\n\n`;

  const categories = lhr.categories;
  for (const key of Object.keys(categories)) {
    const cat = categories[key];
    const score = Math.round(cat.score * 100);
    const threshold = CONFIG.thresholds[key] || 90;
    const status = score >= threshold ? 'Aprovado' : 'Reprovado';
    const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
    const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));

    md += `### ${emoji} ${cat.title}: **${score}**/100 (${status})\n\`${bar}\` ${score}%\n\n`;
  }

  // Wrap up
  md += `---\n\n`;
  md += `*Gerado por Performance Audit Tool (Legacy)*\n`;
  return md;
}

/**
 * Função principal
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════╗', 'cyan');
  log('║   ANÁLISE DE DESEMPENHO WEB (LEGACY)          ║', 'cyan');
  log('╚═══════════════════════════════════════════════╝', 'cyan');

  if (!validateConfig()) {
    process.exitCode = 1;
    return;
  }

  await ensureOutputDir();

  let serverProcess = null;
  let exitCode = 0;

  try {
    // Análises estáticas (não requerem servidor)
    const bundleStats = await analyzeBundleSize();
    const depsAnalysis = await analyzeDependencies();

    // Verifica se servidor está rodando
    const isServerRunning = await checkServer(CONFIG.serverPort);

    if (!isServerRunning) {
      if (CONFIG.autoStartServer) {
        log('\n⚡ Servidor não detectado. Tentando iniciar automaticamente...', 'yellow');
        try {
          serverProcess = await startServer();
        } catch (error) {
          log(`\n✗ Falha ao iniciar servidor: ${error.message}`, 'red', 'ERROR');
          log(`\n💡 Inicie o servidor manualmente em ${CONFIG.url} e execute novamente.`, 'yellow');
          process.exitCode = 1;
          return;
        }
      } else {
        log(`\n💡 Certifique-se de que a aplicação está rodando em: ${CONFIG.url}`, 'yellow');
        log('   Aguardando 3 segundos...', 'cyan');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verifica novamente
        if (!(await checkServer(CONFIG.serverPort))) {
          throw new Error(`Servidor não está rodando em ${CONFIG.url}`);
        }
      }
    } else {
      log(`\n⚡ Servidor detectado na porta ${CONFIG.serverPort}.`, 'green');
    }

    // Auditoria Lighthouse
    const { lhr, allPassed } = await runLighthouseAudit();

    // Gera resumo
    const summary = await generateSummary(lhr, bundleStats, depsAnalysis);

    // 6. Generate Reports (Refactored)
    const { saveReport, minifyMarkdown } = require('./utils/audit-helpers.cjs');

    // Status Logic
    const failedCategories = Object.keys(lhr.categories).filter(key => {
      const s = Math.round(lhr.categories[key].score * 100);
      return s < (CONFIG.thresholds[key] || 90);
    });

    const failCount = failedCategories.length;
    const statusTag = failCount > 0 ? (failCount > 2 ? 'FAIL' : 'WARN') : 'OK';

    // Quick mocked environment
    const reportData = {
      url: CONFIG.url,
      timestamp: new Date().toISOString(),
      environment: { framework: 'React (Assumido)', bundler: 'Vite (Assumido)' },
      lighthouse: lhr,
      bundle: bundleStats,
      dependencies: depsAnalysis
    };

    const markdownRaw = await generateMarkdownReport(reportData);
    const markdown = minifyMarkdown(markdownRaw);

    const mdPath = await saveReport('promo', reportData, markdown, {
      status: statusTag,
      failCount: failCount,
      json: lhr // Save original LHR
    });

    log(`\n✓ Relatório salvo: ${mdPath}`, 'green');

    // Remove old manual saving logic
    /*
    // Filename Format: AAAA.MM.DD-HH.MM_Promo_Status-OK/FAIL/WARN_Failures-N-Address_Port.md
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())}-${p(now.getHours())}.${p(now.getMinutes())}`;

    // Address part
    const addressStr = CONFIG.url.replace('http://', '').replace('https://', '').replace('127.0.0.1', 'Localhost').replace('localhost', 'Localhost').replace(':', '_');

    const mdFilename = `${dateStr}_Promo-Audit_Status-${statusTag}_Failures-${failCount}-${addressStr}.md`;
    const mdPath = path.join(CONFIG.outputDir, mdFilename);

    // Save Logs (Raw Data)
    const rawDir = path.join(CONFIG.outputDir, 'raw-data');
    await fsPromises.mkdir(rawDir, { recursive: true });

    const reportPathHtml = path.join(rawDir, mdFilename.replace('.md', '.html'));
    const reportPathJson = path.join(rawDir, mdFilename.replace('.md', '.json'));
    // We already have HTML/JSON from Lighthouse run, let's move/save them correctly or just overwrite logic
    // Actually the logic above for html/json was saving to random names. Let's fix that context.
    // Quick Fix: We need to update runLighthouseAudit to return report content or save to generic temp, 
    // but here we are in main. runLighthouseAudit saves files. Let's update it separately later or assume it saves properly.
    // For now, let's focus on Markdown saving.

    // Minify Markdown Helper
    function minifyMarkdown(text) {
      return text
        .replace(/[ \t]+$/gm, '') // Remove trailing spaces
        .replace(/\n{3,}/g, '\n\n') // Max 1 blank line
        .trim();
    }

    const markdownContent = minifyMarkdown(await generateMarkdownReport(reportData));
    await fsPromises.writeFile(mdPath, markdownContent);
    log(`\n✓ Relatório Markdown salvo: ${mdPath}`, 'green');

    // Move Raw Files to correct location
    // const rawDir = path.join(CONFIG.outputDir, 'raw-data'); // Already declared
    await fsPromises.mkdir(rawDir, { recursive: true });

    // We access the recently created files by runLighthouseAudit. 
    // Since we don't have their names here easily without refactoring, we'll save JSON again using `lhr` which we have.
    const jsonPath = path.join(rawDir, mdFilename.replace('.md', '.json'));
    await fsPromises.writeFile(jsonPath, JSON.stringify(lhr, null, 2));
    */

    if (failCount > 0) {
      log('\n⚠ Alguns scores estão abaixo do threshold definido.', 'yellow', 'WARN');
      // exitCode = 1; // Optional strict mode
    }

    log('\n✓ Análise concluída com sucesso!', 'green');
    log(`\nRelatórios disponíveis em: ${CONFIG.outputDir}\n`, 'cyan');

  } catch (error) {
    log(`\n✗ Erro durante análise: ${error.message}`, 'red', 'ERROR');
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.error(error);
    }
    exitCode = 1;
  } finally {
    if (serverProcess) {
      log('Encerrando servidor temporário...', 'cyan', 'DEBUG');
      await killProcess(serverProcess);
    }
    process.exit(exitCode);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log(`Erro fatal: ${error.message}`, 'red', 'ERROR');
    process.exit(1);
  });
}

module.exports = { main, runLighthouseAudit, analyzeBundleSize, analyzeDependencies };