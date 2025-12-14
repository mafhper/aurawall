
const fs = require('fs');
const path = require('path');
const { spawn, execSync, exec } = require('child_process');
const http = require('http');
const { saveReport, minifyMarkdown } = require('../utils/audit-helpers.cjs');

// Log Helpers
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
    bold: '\x1b[1m'
};
function log(msg, color = 'reset', style = '') {
    const c = colors[color] || colors.reset;
    const s = colors[style] || '';
    console.log(`${s}${c}${msg}${colors.reset}`);
}

async function findRunningServer(port) {
    const check = (host) => new Promise((resolve) => {
        const req = http.get(`http://${host}:${port}`, (res) => {
            resolve(true);
            req.destroy();
        }).on('error', () => resolve(false));
    });

    // Check both common loopback addresses
    return (await check('127.0.0.1')) || (await check('localhost'));
}

function startServer(command, port, timeout = 60000) {
    log(`Tentando iniciar servidor automaticamente na porta ${port}...`, 'cyan');

    // Parse command
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Windows compatibility
    const npmCmd = process.platform === 'win32' ? `${cmd}.cmd` : cmd;

    const serverProcess = spawn(npmCmd, args, {
        cwd: process.cwd(),
        stdio: 'inherit', // Show output to debug
        env: { ...process.env, PORT: port, BROWSER: 'none' },
        detached: false,
        shell: true // Required for npm on Windows to parse arguments correctly
    });

    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(async () => {
            if (await findRunningServer(port)) {
                clearInterval(checkInterval);
                log(`✓ Servidor iniciado com sucesso!`, 'green');
                resolve(serverProcess);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                serverProcess.kill();
                reject(new Error(`Timeout aguardando servidor na porta ${port}`));
            }
        }, 1000);

        serverProcess.on('error', (err) => {
            clearInterval(checkInterval);
            reject(err);
        });
    });
}

async function runLighthouse(url, thresholds, type) {
    try {
        const lighthouseParams = await import('lighthouse');
        const lighthouse = lighthouseParams.default;
        const chromeLauncher = await import('chrome-launcher');

        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });

        const options = {
            logLevel: 'error',
            output: 'json',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            port: chrome.port
        };

        const runnerResult = await lighthouse(url, options);
        const lhr = runnerResult.lhr;

        await chrome.kill();
        return lhr;
    } catch (e) {
        throw new Error(`Running Lighthouse failed: ${e.message}`);
    }
}

/**
 * Main Audit Runner Function
 * @param {object} target - Configuration object for the target
 */
async function runAudit(target) {
    log(`\n▶ Iniciando Auditoria: ${target.name}`, 'cyan', 'bold');

    let serverProcess = null;
    let didStartServer = false;

    try {
        // 1. Check/Start Server
        const isRunning = await findRunningServer(target.serverPort);
        if (!isRunning) {
            serverProcess = await startServer(target.serverCommand, target.serverPort);
            didStartServer = true;
        } else {
            log(`Servidor encontrado na porta ${target.serverPort}`, 'green');
        }

        // 2. Run Lighthouse
        log(`Executando Lighthouse em ${target.url}...`, 'cyan');
        const lhr = await runLighthouse(target.url, target.thresholds, target.type);

        // 3. Process Results
        const scores = {};
        const failedItems = [];

        Object.keys(lhr.categories).forEach(key => {
            const score = Math.round(lhr.categories[key].score * 100);
            scores[key] = score;

            const threshold = target.thresholds[key] || 90;
            if (score < threshold) {
                failedItems.push({ category: key, score, threshold });
            }
        });

        // 4. Generate Report Data
        const reportData = {
            target: target.name,
            url: target.url,
            timestamp: new Date().toISOString(),
            scores,
            failedItems,
            metrics: lhr.audits.metrics?.details?.items?.[0] || {},
            lhr: lhr // Full data
        };

        // 5. Generate Markdown
        let md = `# Relatório de Performance: ${target.name}\n\n`;
        md += `**Data:** ${new Date().toLocaleString()}\n`;
        md += `**URL:** ${target.url}\n\n`;
        md += `## Scores\n\n`;

        Object.keys(scores).forEach(key => {
            const score = scores[key];
            const icon = score >= 90 ? '✅' : (score >= 50 ? '⚠️' : '❌');
            md += `*   **${key}:** ${icon} ${score}/100\n`;
        });

        if (failedItems.length > 0) {
            md += `\n## 🚨 Falhas (Abaixo do Threshold)\n\n`;
            failedItems.forEach(fail => {
                md += `*   **${fail.category}:** ${fail.score} (Meta: ${fail.threshold})\n`;
            });
        }

        md += `\n## Métricas Principais\n\n`;
        md += `| Métrica | Valor |\n|---|---|\n`;
        md += `| FCP | ${reportData.metrics.firstContentfulPaint}ms |\n`;
        md += `| LCP | ${reportData.metrics.largestContentfulPaint}ms |\n`;
        md += `| TBT | ${reportData.metrics.totalBlockingTime}ms |\n`;
        md += `| CLS | ${reportData.metrics.cumulativeLayoutShift} |\n`;

        const markdown = minifyMarkdown(md);

        // 6. Save Report
        const failCount = failedItems.length;
        let status = 'OK';
        if (failCount > 0) status = 'WARN';
        if (failCount > 2) status = 'FAIL';

        const mdPath = await saveReport(target.type, reportData, markdown, {
            status,
            failCount,
            json: lhr
        });

        log(`✓ Relatório salvo: ${mdPath}`, 'green');

        return { success: true, path: mdPath, scores };

    } catch (error) {
        log(`Erro na auditoria de ${target.name}: ${error.message}`, 'red');
        return { success: false, error: error.message };
    } finally {
        if (didStartServer && serverProcess) {
            log('Parando servidor temporário...', 'dim');
            if (process.platform === 'win32') {
                try { execSync(`taskkill /pid ${serverProcess.pid} /T /F`); } catch (e) { }
            } else {
                serverProcess.kill();
            }
        }
    }
}

module.exports = { runAudit };
