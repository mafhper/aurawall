const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Configuration ---
const LOG_DIR = path.join(__dirname, '../_desenvolvimento/logs');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = path.join(LOG_DIR, `health-report-${TIMESTAMP}.md`);
const PROJECT_ROOT = path.join(__dirname, '..');

// --- ANSI Colors ---
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const BOLD = "\x1b[1m";

// --- State ---
let reportContent = `# Health Check Report\n**Date:** ${new Date().toLocaleString()}\n**OS:** ${process.platform}\n\n`;
let hasCriticalErrors = false;

// --- Helpers ---
function log(msg, type = 'info') {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', header: '🚀' };
    const colors = { info: RESET, success: GREEN, error: RED, warn: YELLOW, header: CYAN + BOLD };
    console.log(`${colors[type] || RESET}${icons[type] || ''}  ${msg}${RESET}`);
}

function hr() {
    console.log(`${MAGENTA}${"-".repeat(50)}${RESET}`);
}

function appendToReport(title, output, error = null) {
    const status = error ? '❌ FAILED' : '✅ SUCCESS';
    reportContent += `## ${title}\n\n**Status:** ${status}\n\n`;
    
    if (error) {
        reportContent += `### Error Details\n\
```text\
${error.message}\n\
```\n\n`;
    }
    
    if (output) {
        const cleanOutput = output.toString().replace(/\x1B\[\d+m/g, ''); // Strip ANSI codes
        reportContent += `### Output Log\n\
```bash\
${cleanOutput.trim().slice(-5000)}\
```\n_(Output truncated to last 5000 chars)_\n\n`;
        
        if (error || cleanOutput.toLowerCase().includes('error')) {
            analyzeErrors(cleanOutput);
        }
    }
    reportContent += `---\n\n`;
}

function analyzeErrors(logText) {
    reportContent += `### 🔍 Automated Diagnostic\n\n`;
    const lines = logText.split('\n');
    let found = false;

    // Regex strategies for common build tools
    const strategies = [
        { name: 'TypeScript/Vite', regex: /([a-zA-Z0-9_\-\/\]+\.(ts|tsx|js|jsx|css|scss|html))(:(\d+))?/ },
        { name: 'General Error', regex: /Error:\s(.+)/i }
    ];

    lines.forEach(line => {
        if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) {
             strategies.forEach(strat => {
                 const match = line.match(strat.regex);
                 if (match) {
                     reportContent += `- **Issue detected:** 
```${line.trim()}
```\n`;
                     if (match[1]) reportContent += `  - **File:** 
```${match[1]}
```\n`;
                     found = true;
                 }
             });
        }
    });

    if (!found) {
        reportContent += `No specific file associations detected, but errors were logged. Please review the full log above.\n`;
    }
    reportContent += `\n`;
}

function runCommand(name, cmd) {
    hr();
    log(`Starting: ${name}`, 'header');
    const start = Date.now();
    try {
        // Run command and capture output
        const output = execSync(cmd, { 
            cwd: PROJECT_ROOT, 
            encoding: 'utf8', 
            stdio: 'pipe' // Pipe to capture, but we might want to stream to console too? execSync blocks.
        });
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        log(`Completed: ${name} in ${duration}s`, 'success');
        appendToReport(name, output);
        return true;
    } catch (e) {
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        log(`Failed: ${name} in ${duration}s`, 'error');
        const output = (e.stdout || '') + '\n' + (e.stderr || '');
        appendToReport(name, output, e);
        hasCriticalErrors = true;
        return false;
    }
}

// --- Main Script ---
(function main() {
    console.clear();
    console.log(`${CYAN}${BOLD}
    ╔════════════════════════════════════════╗
    ║      AURA WALL - SYSTEM HEALTH         ║
    ╚════════════════════════════════════════╝
    ${RESET}`);

    // Ensure log dir
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

    // 1. Clean Environment
    hr();
    log('Cleaning environment...', 'header');
    try {
        const nmPath = path.join(PROJECT_ROOT, 'node_modules');
        const plPath = path.join(PROJECT_ROOT, 'package-lock.json');
        
        if (fs.existsSync(nmPath)) {
            fs.rmSync(nmPath, { recursive: true, force: true });
            log('Deleted node_modules', 'success');
        }
        if (fs.existsSync(plPath)) {
            fs.unlinkSync(plPath);
            log('Deleted package-lock.json', 'success');
        }
        reportContent += `## Environment Clean\n\n✅ node_modules and package-lock.json removed.\n\n---\n\n`;
    } catch (e) {
        log(`Clean failed: ${e.message}`, 'error');
        reportContent += `## Environment Clean\n\n❌ Failed: ${e.message}\n\n---\n\n`;
        // We might continue even if clean fails? No, clean install relies on it.
    }

    // 2. Install
    if (!runCommand('Install Dependencies', 'npm install')) {
        log('Critical: Installation failed. Aborting.', 'error');
        fs.writeFileSync(LOG_FILE, reportContent);
        process.exit(1);
    }

    // 3. Build Promo Site
    // Note: referencing the NEW script names defined in the plan
    runCommand('Build: Promo Site', 'npm run build-promo');

    // 4. Build App
    runCommand('Build: Application', 'npm run build-app');

    // Finish
    hr();
    const finalMsg = hasCriticalErrors ? 'Health Check Completed with ERRORS' : 'Health Check PASSED';
    log(finalMsg, hasCriticalErrors ? 'warn' : 'success');
    
    fs.writeFileSync(LOG_FILE, reportContent);
    log(`Report saved to:`, 'info');
    console.log(`${YELLOW}${LOG_FILE}${RESET}`);
    
})();
