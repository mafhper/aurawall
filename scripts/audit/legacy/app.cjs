/**
 * Performance Audit Tool - Universal v1.3.0
 * 
 * @deprecated Este script é LEGADO. Use `npm run audit:app` (audit-runner.cjs) em vez disso.
 * Este arquivo será removido em versões futuras.
 *
 * Ferramenta agnóstica para análise de desempenho de aplicações web.
 * Funciona com React, Vue, Angular, Next.js, Vite, etc.
 */

console.warn('\n⚠️  AVISO: Este script (audit-app.cjs) é LEGADO.');
console.warn('   Use `npm run audit:app` (audit-runner.cjs) em vez disso.\n');


// lighthouse is ESM-only, will be imported dynamically
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// ============================================================================ 
// CONFIGURAÇÃO PADRÃO
// ============================================================================ 

const DEFAULT_CONFIG = {
    url: process.env.AUDIT_URL || null,
    port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : null,
    outputDir: './performance-reports',
    serverTimeout: 30000,
    autoStartServer: true,
    serverCommands: [
        ['run', 'dev'],
        ['run', 'start'],
        ['run', 'preview'], // Preview often requires specific base path configurations
        ['run', 'serve'],
    ],
    buildDirs: ['./dist', './build', './out', './.next', './public'],
    lighthouse: {
        extends: 'lighthouse:default',
        settings: {
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            formFactor: 'desktop',
            throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
            screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        },
    },
    thresholds: {
        performance: 90,
        accessibility: 90,
        'best-practices': 95,
        seo: 90,
        largeFileSize: 500000, // 500KB
    },
    chromeFlags: [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--window-size=1350,940'
    ],
    logLevel: process.env.LOG_LEVEL || 'INFO',
};

// Carrega configuração personalizada (opcional)
let CONFIG = { ...DEFAULT_CONFIG };
try {
    const configPath = path.join(process.cwd(), 'performance-audit.config.cjs');
    if (fsSync.existsSync(configPath)) {
        const userConfig = require(configPath);
        CONFIG = { ...DEFAULT_CONFIG, ...userConfig };
        console.log('✓ Configuração personalizada carregada de performance-audit.config.cjs');
    }
} catch (err) {
    console.warn('⚠ Erro ao carregar configuração personalizada, usando padrão');
}

// ============================================================================ 
// UTILITÁRIOS
// ============================================================================ 

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

const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const currentLogLevel = LOG_LEVELS[CONFIG.logLevel.toUpperCase()] || LOG_LEVELS.INFO;

function log(message, color = 'reset', level = 'INFO') {
    const logLevelNum = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    if (logLevelNum > currentLogLevel) return;

    const timestamp = new Date().toISOString().slice(11, 19);
    const prefix = level !== 'INFO' ? `[${level}] ` : '';
    console.log(`${colors.dim}${timestamp}${colors.reset} ${colors[color]}${prefix}${message}${colors.reset}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms) {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms)
        ),
    ]);
}

function loadBaseline(dir) {
    const file = path.join(dir, 'latest.json');
    return fsSync.existsSync(file) ? JSON.parse(fsSync.readFileSync(file)) : null;
}

function delta(current, previous) {
    if (previous == null) return '';
    const d = current - previous;
    return d === 0 ? '(=)' : d > 0 ? `(+${d})` : `(${d})`;
}

function classifyMetric(key, value) {
    if (key === 'lcp') return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
    if (key === 'cls') return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
    if (key === 'tbt') return value < 200 ? 'good' : value < 600 ? 'needs-improvement' : 'poor';
    return 'n/a';
}

// ============================================================================ 
// DETECÇÃO DE AMBIENTE
// ============================================================================ 

async function detectEnvironment() {
    log('Detectando ambiente...', 'cyan');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let packageJson = {};

    if (fsSync.existsSync(packageJsonPath)) {
        try {
            packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        } catch (e) {
            log('Erro ao ler package.json', 'red', 'ERROR');
        }
    } else {
        log('package.json não encontrado', 'yellow', 'WARN');
    }

    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    let framework = 'Desconhecido';
    if (allDeps.react || allDeps['react-dom']) framework = 'React';
    else if (allDeps.vue) framework = 'Vue';
    else if (allDeps['@angular/core']) framework = 'Angular';
    else if (allDeps.svelte) framework = 'Svelte';
    else if (allDeps.next) framework = 'Next.js';
    else if (allDeps.nuxt) framework = 'Nuxt';
    else if (allDeps.gatsby) framework = 'Gatsby';

    let bundler = 'Desconhecido';
    if (allDeps.vite) bundler = 'Vite';
    else if (allDeps.webpack) bundler = 'Webpack';
    else if (allDeps.parcel) bundler = 'Parcel';
    else if (allDeps.rollup) bundler = 'Rollup';
    else if (allDeps.esbuild) bundler = 'esbuild';

    let detectedPort = CONFIG.port;
    if (!detectedPort && packageJson.scripts) {
        const scriptsStr = Object.values(packageJson.scripts).join(' ');
        const match = scriptsStr.match(/--port[=\s]+(\d+)|:(\d+)/);
        if (match) detectedPort = parseInt(match[1] || match[2], 10);
    }

    if (!detectedPort) {
        detectedPort = bundler === 'Vite' ? 5173 : framework === 'Next.js' ? 3000 : 3000;
    }

    log(`Framework: ${framework}`, 'dim');
    log(`Bundler: ${bundler}`, 'dim');
    log(`Porta detectada: ${detectedPort}`, 'dim');

    return { framework, bundler, port: detectedPort, packageJson };
}

// ============================================================================ 
// GERENCIAMENTO DE SERVIDOR
// ============================================================================ 

function waitForServer(url, timeout) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            http.get(url, res => (res.statusCode < 500 ? resolve() : retry())).on('error', retry);
        };
        const retry = () =>
            Date.now() - start > timeout
                ? reject(new Error('Servidor não respondeu'))
                : setTimeout(check, 500);
        check();
    });
}

function checkServer(port) {
    return new Promise(resolve => {
        const req = http.get(`http://127.0.0.1:${port}`, { timeout: 2000 }, res => {
            resolve(res.statusCode >= 200 && res.statusCode < 500);
        }).on('error', () => resolve(false))
            .on('timeout', () => resolve(false));
    });
}

async function findRunningServer() {
    const ports = [4173, 5173, 3000, 8080, 4200, 5000, 8000, 9000, 4174, 4175, 5174, 5175];
    for (const port of ports) {
        if (await checkServer(port)) {
            log(`Servidor encontrado na porta ${port}`, 'green');
            return port;
        }
    }
    return null;
}

async function startServer() {
    log('Tentando iniciar servidor automaticamente...', 'cyan');

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    for (const args of CONFIG.serverCommands) {
        log(`Tentando: npm ${args.join(' ')}`, 'dim', 'DEBUG');
        const proc = spawn(npmCmd, args, { stdio: 'pipe', detached: false, shell: true });

        // Pipe output so we can debug if needed, but we rely on port scanning
        // We catch error events
        proc.on('error', (err) => log(`Erro no processo server: ${err.message}`, 'red', 'ERROR'));

        // Scan for port
        const start = Date.now();
        while (Date.now() - start < CONFIG.serverTimeout) {
            await new Promise(r => setTimeout(r, 1000));
            const port = await findRunningServer();
            if (port) {
                return { process: proc, port };
            }
        }

        // Timeout, kill try next
        await killServer(proc);
    }
    throw new Error('Não foi possível iniciar o servidor');
}

async function killServer(proc) {
    if (!proc) return;
    try {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', proc.pid.toString(), '/f', '/t']);
        } else {
            process.kill(-proc.pid, 'SIGTERM');
        }
    } catch (e) { /* ignore */ }
}

// ============================================================================ 
// ANÁLISES ESTÁTICAS
// ============================================================================ 

async function analyzeBundleSize() {
    log('Analisando tamanho do bundle...', 'cyan');

    let buildDir = null;
    for (const dir of CONFIG.buildDirs) {
        if (fsSync.existsSync(dir)) {
            buildDir = dir;
            log(`Diretório de build encontrado: ${dir}`, 'dim');
            break;
        }
    }

    if (!buildDir) {
        log('Nenhum diretório de build encontrado', 'yellow', 'WARN');
        return null;
    }

    const { totalSize, fileCount, files, byType } = await getDirectoryStats(buildDir);

    const largeFiles = files
        .filter(f => f.size > CONFIG.thresholds.largeFileSize)
        .sort((a, b) => b.size - a.size);

    log(`Tamanho total: ${formatBytes(totalSize)} (${fileCount} arquivos)`, 'dim');

    return { buildDir, totalSize, fileCount, files, byType, largeFiles };
}

async function getDirectoryStats(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    const files = [];

    async function walk(dir) {
        const entries = await fs.readdir(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                await walk(fullPath);
            } else {
                totalSize += stat.size;
                fileCount++;
                files.push({
                    name: path.relative(dirPath, fullPath),
                    size: stat.size,
                    extension: path.extname(entry) || 'other',
                });
            }
        }
    }

    await walk(dirPath);

    const byType = {};
    files.forEach(f => {
        const ext = f.extension;
        byType[ext] = byType[ext] || { count: 0, size: 0 };
        byType[ext].count++;
        byType[ext].size += f.size;
    });

    return { totalSize, fileCount, files, byType };
}

async function analyzeDependencies() {
    log('Analisando dependências...', 'cyan');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fsSync.existsSync(packageJsonPath)) return null;

    const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};

    const heavyPackagesMap = {
        moment: { size: '~70KB', alternative: 'date-fns ou dayjs', reason: 'Bundle grande' },
        lodash: { size: '~70KB', alternative: 'lodash-es (tree-shakable)', reason: 'Use versão ES' },
        jquery: { size: '~90KB', alternative: 'Vanilla JS', reason: 'Desnecessário em apps modernas' },
        axios: { size: '~13KB', alternative: 'fetch nativo', reason: 'API moderna' },
    };

    const foundHeavy = Object.keys(heavyPackagesMap).filter(p => deps[p]);

    return {
        production: Object.keys(deps).length,
        development: Object.keys(devDeps).length,
        heavyPackages: foundHeavy.map(name => ({ name, ...heavyPackagesMap[name] })),
    };
}

// ============================================================================ 
// LIGHTHOUSE
// ============================================================================ 

async function runLighthouse(url, chrome) {
    log(`Executando Lighthouse em ${url}...`, 'cyan');
    const { default: lighthouse } = await import('lighthouse');

    const options = {
        logLevel: 'error',
        output: 'json', // We only use JSON for internal logic, standard output is managed by us
        port: chrome.port,
        onlyCategories: CONFIG.lighthouse.settings.onlyCategories
    };

    return lighthouse(url, options, CONFIG.lighthouse);
}

// ============================================================================ 
// GERAÇÃO DO RELATÓRIO MARKDOWN
// ============================================================================ 

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
    const { url, timestamp, environment, lighthouse: lhr, bundle, dependencies, deltas, baseline } = data;
    const dateStr = new Date(timestamp).toLocaleString('pt-BR');

    let md = `# Relatório de Performance (Universal)\n\n`;
    md += `**Data:** ${dateStr}\n`;
    md += `**URL:** ${url}\n`;
    md += `**Environment:** ${environment.node} / ${environment.os}\n`;
    md += `**Framework:** ${environment.framework}\n`;
    md += `**Bundler:** ${environment.bundler}\n\n`;
    md += `---\n\n`;

    md += `## Scores Lighthouse\n\n`;

    const categories = lhr.categories;
    for (const key of Object.keys(categories)) {
        const cat = categories[key];
        const score = Math.round(cat.score * 100);
        const threshold = CONFIG.thresholds[key] || 90;
        const status = score >= threshold ? 'Aprovado' : 'Reprovado';
        const emoji = score >= 95 ? '✅' : score >= threshold ? '⚠️' : '❌';
        const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
        const deltaStr = deltas ? deltas[key] : '';

        md += `### ${emoji} ${cat.title}: **${score}**/100 (${status}) ${deltaStr}\n\`${bar}\` ${score}%\n\n`;
    }

    // Core Web Vitals
    const metrics = lhr.audits.metrics?.details?.items?.[0] || {};
    if (Object.keys(metrics).length > 0) {
        md += `---\n\n`;
        md += `## Métricas de Performance (Core Web Vitals)\n\n`;
        md += `| Métrica | Valor | Status | Delta |\n`;
        md += `|---|---|---|---|\n`;

        const getMetricStatus = (value, good, ok) => {
            if (value == null) return 'N/A';
            return value <= good ? 'Bom' : value <= ok ? 'Precisa Melhorar' : 'Ruim';
        };

        const rows = [
            { label: 'First Contentful Paint (FCP)', val: metrics.firstContentfulPaint, k: 'fcp', good: 1800, ok: 3000 },
            { label: 'Largest Contentful Paint (LCP)', val: metrics.largestContentfulPaint, k: 'lcp', good: 2500, ok: 4000 },
            { label: 'Total Blocking Time (TBT)', val: metrics.totalBlockingTime, k: 'tbt', good: 200, ok: 600 },
            { label: 'Cumulative Layout Shift (CLS)', val: metrics.cumulativeLayoutShift, k: 'cls', good: 0.1, ok: 0.25, isFloat: true }
        ];

        rows.forEach(r => {
            const valStr = r.isFloat ? (r.val || 0).toFixed(3) : Math.round(r.val || 0) + 'ms';
            const status = r.k === 'cls' ? classifyMetric('cls', r.val) : getMetricStatus(r.val, r.good, r.ok);
            const d = deltas ? deltas[r.k] : '';
            md += `| ${r.label} | ${valStr} | ${status} | ${d} |\n`;
        });
    }

    // ... Opportunities, Bundle, Deps (keep existing logic roughly) ...

    // Opportunities
    const opportunities = Object.values(lhr.audits)
        .filter(a => a.score < 1 && a.details?.type === 'opportunity')
        .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
        .slice(0, 5);

    if (opportunities.length > 0) {
        md += `\n---\n\n## Oportunidades de Melhoria\n\n`;
        opportunities.forEach((opp, i) => {
            md += `### ${i + 1}. ${opp.title}\n`;
            if (opp.details?.overallSavingsMs) {
                md += `**Economia estimada:** ${formatDuration(opp.details.overallSavingsMs)}\n`;
            }
            md += `${opp.description.replace(/<[^>]*>/g, '').trim()}\n\n`;
        });
    }

    // Bundle
    if (bundle) {
        md += `\n---\n\n## Análise de Bundle\n\n`;
        md += `**Diretório:** \`${bundle.buildDir}\`\n`;
        md += `**Tamanho total:** ${formatBytes(bundle.totalSize)}\n`;
        md += `**Arquivos:** ${bundle.fileCount}\n\n`;

        if (bundle.largeFiles.length > 0) {
            md += `### Arquivos grandes\n\n`;
            md += `| Arquivo | Tamanho |\n|---|---|\n`;
            bundle.largeFiles.slice(0, 5).forEach(f => {
                md += `| \`${f.name}\` | ${formatBytes(f.size)} |\n`;
            });
        }
    }

    md += `\n---\n*Gerado por Performance Audit Tool (Universal) v1.4.0*\n`;
    return md;
}

// ... main function update ...

async function main() {
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║     PERFORMANCE AUDIT TOOL - UNIVERSAL v1.4.0 ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

    let serverProcess = null;
    let chrome = null;
    const startTime = Date.now();

    try {
        await fs.mkdir(CONFIG.outputDir, { recursive: true });

        // 1. Analises Estáticas
        const environment = {
            ...(await detectEnvironment()),
            node: process.version,
            os: `${process.platform}-${process.arch}`
        };
        const bundle = await analyzeBundleSize();
        const dependencies = await analyzeDependencies();

        // 2. Setup Server
        let url = CONFIG.url;
        let port = CONFIG.port || environment.port || 5173;

        if (!url) {
            if (CONFIG.autoStartServer) {
                // Tenta iniciar e descobre a porta
                const result = await startServer();
                serverProcess = result.process;
                port = result.port;
            } else {
                // Try to find if one is already running
                port = await findRunningServer(port);
            }

            if (!port) throw new Error('Nenhum servidor encontrado. Inicie manualmente ou configure URL/porta.');
            url = `http://127.0.0.1:${port}`;
        }

        // 3. Wait for Server
        log(`Aguardando servidor em ${url}...`, 'cyan');
        await waitForServer(url, CONFIG.serverTimeout);

        // 4. Lighthouse
        chrome = await chromeLauncher.launch({ chromeFlags: CONFIG.chromeFlags });
        const lhrResult = await withTimeout(
            runLighthouse(url, chrome),
            60000,
            'Lighthouse'
        );
        const lhr = lhrResult.lhr;

        // 5. Compare with Baseline
        const baseline = loadBaseline(CONFIG.outputDir);

        const scores = {
            performance: Math.round(lhr.categories.performance.score * 100),
            accessibility: Math.round(lhr.categories.accessibility.score * 100),
            'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
            seo: Math.round(lhr.categories.seo.score * 100)
        };

        const metrics = lhr.audits.metrics?.details?.items?.[0] || {};
        const timings = {
            fcp: metrics.firstContentfulPaint,
            lcp: metrics.largestContentfulPaint,
            tbt: metrics.totalBlockingTime,
            cls: metrics.cumulativeLayoutShift
        };

        const deltas = {
            performance: delta(scores.performance, baseline?.lighthouse?.performance),
            accessibility: delta(scores.accessibility, baseline?.lighthouse?.accessibility),
            'best-practices': delta(scores['best-practices'], baseline?.lighthouse?.bestPractices),
            seo: delta(scores.seo, baseline?.lighthouse?.seo),
            lcp: delta(timings.lcp, baseline?.metrics?.largestContentfulPaint),
            cls: delta(timings.cls, baseline?.metrics?.cumulativeLayoutShift),
            tbt: delta(timings.tbt, baseline?.metrics?.totalBlockingTime),
        };

        const reportData = {
            timestamp: new Date().toISOString(),
            url,
            environment,
            lighthouse: lhr,
            bundle,
            dependencies,
            deltas,
            baseline
        };

        // 6. Generate Reports (Refactored)
        const { saveReport, minifyMarkdown } = require('./utils/audit-helpers.cjs');

        // Calculate Status
        const failedScores = Object.keys(lhr.categories).filter(key => {
            const s = Math.round(lhr.categories[key].score * 100);
            return s < (CONFIG.thresholds[key] || 90);
        });

        const failCount = failedScores.length;
        let statusTag = 'OK';
        if (failCount > 0) statusTag = 'WARN';
        if (failCount > 2) statusTag = 'FAIL';

        const markdownRaw = await generateMarkdownReport(reportData);
        const markdown = minifyMarkdown(markdownRaw);

        // Save using helper
        // Type: 'app'
        const mdPath = await saveReport('app', reportData, markdown, {
            status: statusTag,
            failCount: failCount,
            json: reportData, // Save full data as JSON
            // html: ... we removed HTML generation from internal runLighthouse previously, 
            // but if we want it, we need to request it from lighthouse. 
            // For now, we save JSON.
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        log(`\nRelatório gerado em ${duration}s`, 'green');
        log(`Arquivo: ${mdPath}`, 'cyan');

        if (failCount > 0) {
            log('Alguns scores abaixo do threshold.', 'yellow', 'WARN');
        }

    } catch (error) {
        log(`Erro: ${error.message}`, 'red', 'ERROR');
        process.exitCode = 1;
    } finally {
        if (chrome) await chrome.kill();
        if (serverProcess) await killServer(serverProcess);
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error('Erro fatal:', err);
        process.exit(1);
    });
}

module.exports = { main };
