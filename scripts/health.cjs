const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// --- Configuration ---
const LOG_DIR = path.join(__dirname, '../performance-reports');

// Helper to generate filename: REMOVED (using shared)
// const generateReportFilename = (status, failCount) => {
//     const now = new Date();
//     const p = n => String(n).padStart(2, '0');
//     const dateStr = `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())}-${p(now.getHours())}.${p(now.getMinutes())}`;

//     // Status normalization
//     const statusStr = status === 'SUCCESS' ? 'OK' : 'FAIL';

//     return `${dateStr}_Health-Check_Status-${statusStr}_Failures-${failCount}-Local_Health.md`;
// };

const PROJECT_ROOT = path.join(__dirname, '..');

// Helper to generate timestamp for filenames
function getFormattedTimestamp() {
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}_${p(now.getHours())}-${p(now.getMinutes())}`;
}

// --- ANSI Colors ---
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const BOLD = "\x1b[1m";

// --- State ---
let tasks = [];
let overallSuccess = true;

// --- Task Definition ---
class Task {
    constructor(name, command, args = []) {
        this.name = name;
        this.command = command;
        this.args = args;
        this.startTime = null;
        this.endTime = null;
        this.duration = 0;
        this.status = 'PENDING'; // PENDING, RUNNING, SUCCESS, FAILED
        this.output = '';
        this.error = null;
    }
}

// --- Helpers ---
function log(msg, type = 'info') {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', header: '🚀' };
    const colors = { info: RESET, success: GREEN, error: RED, warn: YELLOW, header: CYAN + BOLD };
    console.log(`${colors[type] || RESET}${icons[type] || ''}  ${msg}${RESET}`);
}

function hr() {
    console.log(`${MAGENTA}${"-".repeat(50)}${RESET}`);
}

function formatDuration(ms) {
    return (ms / 1000).toFixed(2) + 's';
}

function generateReport(results, duration) {
    const { saveReport, minifyMarkdown } = require('./utils/audit-helpers.cjs');

    const failedTasks = results.filter(r => r.status === 'failed');
    const warningTasks = results.filter(r => r.status === 'warning');

    const issueCount = failedTasks.length + warningTasks.length;
    let specificStatus = 'OK';
    if (results.some(r => r.status === 'failed')) specificStatus = 'FAIL';
    else if (results.some(r => r.status === 'warning')) specificStatus = 'WARN';

    let md = `# Relatório de Saúde do Projeto\n\n`;
    md += `**Data:** ${new Date().toLocaleString('pt-BR')}\n`;
    md += `**Status:** ${specificStatus === 'OK' ? '✅ Aprovado' : (specificStatus === 'WARN' ? '⚠️ Com Avisos' : '❌ Falhou')}\n`;
    md += `**Duração Total:** ${duration}s\n`;
    md += `**Falhas/Avisos:** ${issueCount}\n\n`;

    // 1. Executive Summary Table
    md += `## 📊 Executive Summary\n\n`;
    tasks.forEach(task => {
        const icon = task.status === 'SUCCESS' ? '✅' : (task.status === 'SKIPPED' ? '⏭️' : '❌');
        md += `| **${task.name}** | ${icon} ${task.status} | ${formatDuration(task.duration)} |\n`;
    });
    md += `\n---\n\n`;

    // 2. Detailed Logs
    md += `## 📝 Detailed Logs\n\n`;

    tasks.forEach(task => {
        if (task.status === 'SKIPPED') return;

        const icon = task.status === 'SUCCESS' ? '✅' : '❌';
        md += `### ${icon} ${task.name}\n`;

        if (task.error) {
            md += `**Error:** ${task.error}\n`;
        }

        // Clean output for markdown
        const cleanOutput = task.output.replace(/\x1B\[\d+m/g, '').trim(); // Remove ANSI

        if (cleanOutput) {
            md += `<details>\n<summary>View Output Log</summary>\n\n`;
            md += `${cleanOutput.slice(-10000)}`; // Limit to 10k chars
            if (cleanOutput.length > 10000) md += `\n*(Log truncated)*\n`;
            md += `\n</details>\n\n`;
        } else {
            md += `_No output._\n\n`;
        }
        md += `---\n\n`;
    });

    return md;
}

// --- Runner ---
function runTask(task) {
    return new Promise((resolve) => {
        task.status = 'RUNNING';
        task.startTime = Date.now();

        hr();
        log(`Starting: ${task.name}`, 'header');

        // Special handling for "Clean Environment" which is sync fs operations
        if (task.command === 'INTERNAL_CLEAN') {
            try {
                const nmPath = path.join(PROJECT_ROOT, 'node_modules');
                const plPath = path.join(PROJECT_ROOT, 'package-lock.json');
                if (fs.existsSync(nmPath)) fs.rmSync(nmPath, { recursive: true, force: true });
                if (fs.existsSync(plPath)) fs.unlinkSync(plPath);
                task.output = 'node_modules and package-lock.json removed.';
                task.status = 'SUCCESS';
                log('Clean completed.', 'success');
            } catch (e) {
                task.error = e.message;
                task.status = 'FAILED';
                if (e.code === 'EPERM') {
                    log(`Clean failed: File locked. Please release or close 'npm run dev' / servers.`, 'error');
                    log(`Details: ${e.message}`, 'error');
                } else {
                    log(`Clean failed: ${e.message}`, 'error');
                }
            }
            task.endTime = Date.now();
            task.duration = task.endTime - task.startTime;
            return resolve(task.status === 'SUCCESS');
        }

        // Spawn Process
        const child = spawn(task.command, task.args, {
            cwd: PROJECT_ROOT,
            shell: true, // Needed for npm on Windows
            stdio: ['ignore', 'pipe', 'pipe'] // We handle output manually
        });

        // Stream Output
        child.stdout.on('data', (data) => {
            const str = data.toString();
            process.stdout.write(str); // Stream to console
            task.output += str;       // Buffer for log
        });

        child.stderr.on('data', (data) => {
            const str = data.toString();
            process.stderr.write(str); // Stream to console
            task.output += str;
        });

        child.on('error', (error) => {
            task.error = error.message;
            task.status = 'FAILED';
        });

        child.on('close', (code) => {
            task.endTime = Date.now();
            task.duration = task.endTime - task.startTime;

            if (code === 0) {
                task.status = 'SUCCESS';
                log(`Completed: ${task.name}`, 'success');
                resolve(true);
            } else {
                task.status = 'FAILED';
                log(`Failed: ${task.name} (Exit Code: ${code})`, 'error');
                resolve(false);
            }
        });
    });
}

// --- Main Script ---
(async function main() {
    const args = process.argv.slice(2);
    const isQuick = args.includes('--quick');

    console.clear();
    console.log(`${CYAN}${BOLD}
    ╔════════════════════════════════════════╗
    ║      AURA WALL - SYSTEM HEALTH         ║
    ╚════════════════════════════════════════╝
    ${RESET}`);

    if (isQuick) {
        log('Quick Mode: Skipping Clean & Install', 'info');
    }

    // Ensure log dir
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

    // Define Tasks
    tasks.push(new Task('Clean Environment', 'INTERNAL_CLEAN'));
    tasks.push(new Task('Install Dependencies', 'npm', ['install']));
    tasks.push(new Task('Build: Promo Site', 'npm', ['run', 'build:promo']));
    tasks.push(new Task('Build: Application', 'npm', ['run', 'build:app']));
    tasks.push(new Task('Test: File Structure', 'npm', ['run', 'test:structure']));
    tasks.push(new Task('Test: Security Audit', 'npm', ['run', 'test:security']));
    tasks.push(new Task('Test: i18n Integrity', 'npm', ['run', 'test:i18n']));
    tasks.push(new Task('Test: Linting', 'npm', ['run', 'test:lint'])); // NEW
    tasks.push(new Task('Test: Performance', 'npm', ['run', 'test:perf']));

    // Execute Sequentially
    for (const task of tasks) {
        if (isQuick && (task.name === 'Clean Environment' || task.name === 'Install Dependencies')) {
            task.status = 'SKIPPED';
            continue;
        }

        // Run everything unless it's a critical dependency like 'Install'

        const success = await runTask(task);
        if (!success) {
            overallSuccess = false;
            // We abort immediately only for critical setup steps
            if (task.name === 'Install Dependencies') {
                log('Critical failure. Aborting.', 'error');
                break;
            }
        }
    }

    // Finalize
    hr();
    const finalMsg = overallSuccess ? 'Health Check PASSED' : 'Health Check COMPLETED WITH ERRORS';
    log(finalMsg, overallSuccess ? 'success' : 'warn');

    // Minify Markdown Helper
    function minifyMarkdown(text) {
        return text
            .replace(/[ \t]+$/gm, '') // Remove trailing spaces
            .replace(/\n{3,}/g, '\n\n') // Max 1 blank line
            .trim();
    }

    // ... existing code ...

    // Write Report
    const statusStr = overallSuccess ? 'SUCCESS' : 'FAILED';
    const filename = `Health-Check_${statusStr}_${getFormattedTimestamp()}.md`;
    const logPath = path.join(LOG_DIR, filename);

    const totalTime = (Date.now() - tasks[0].startTime) / 1000;
    fs.writeFileSync(logPath, minifyMarkdown(generateReport(tasks, totalTime.toFixed(2))));
    log(`Report saved to:`, 'info');
    console.log(`${YELLOW}${logPath}${RESET}`);

    process.exit(overallSuccess ? 0 : 1);

})();
