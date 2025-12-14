
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_DIR = path.join(__dirname, '../performance-reports');
const RAW_DIR = path.join(REPORT_DIR, 'raw-data');

// Ensure directories exist
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR);

const now = new Date();
const p = n => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())}-${p(now.getHours())}.${p(now.getMinutes())}`;

function runCommand(cmd, name) {
    console.log(`\n▶ Executando: ${name} (${cmd})...`);
    try {
        execSync(cmd, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log(`✓ ${name} concluído.`);
    } catch (e) {
        console.error(`✗ ${name} falhou (mas continuaremos o relatório consolidado).`);
    }
}

async function main() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║        GERADOR DE RELATÓRIO CONSOLIDADO       ║');
    console.log('╚═══════════════════════════════════════════════╝');

    // 1. Run All Audits
    runCommand('npm run audit:promo', 'Audit Landing Page');
    runCommand('npm run audit:app', 'Audit Dashboard App');
    runCommand('npm run health', 'Health Check');
    runCommand('npm run test:lint', 'Lint Check');
    runCommand('npm run test:i18n', 'I18n Check');
    runCommand('npm run test:structure', 'Structure Check');

    // 2. Consolidate Reports
    console.log('\n📄 Consolidando relatórios...');

    let summaryContent = `# Relatório Geral do Sistema - AuraWall\n\n`;
    summaryContent += `**Data:** ${new Date().toLocaleString('pt-BR')}\n`;
    summaryContent += `**Versão Node:** ${process.version}\n`;
    summaryContent += `**Plataforma:** ${process.platform}\n\n`;
    summaryContent += `---\n\n`;

    // Scan for all .md files in subdirectories (excluding Previous SYSTEM_SUMMARY)
    // Pattern: performance-reports/**/*.md
    const files = glob.sync('**/*.md', { cwd: REPORT_DIR })
        .filter(f => !f.includes('SYSTEM_SUMMARY') && !f.includes('latest-') && !f.includes('old/'));

    if (files.length === 0) {
        summaryContent += `*Nenhum relatório individual encontrado para esta sessão.*\n`;
    } else {
        files.forEach(file => {
            // Read content
            const content = fs.readFileSync(path.join(REPORT_DIR, file), 'utf8');
            summaryContent += `## 📄 Relatório: ${path.basename(file)}\n`;
            summaryContent += `*(Caminho: ${file})*\n\n`;
            summaryContent += content + `\n\n---\n\n`;
        });
    }

    // 3. Save Summary (Root of Performance Reports)
    // We keep summary in root for easy access
    const summaryFilename = `${dateStr}_SYSTEM_SUMMARY.md`;
    const summaryPath = path.join(REPORT_DIR, summaryFilename);
    const minifyMarkdown = (text) => text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

    fs.writeFileSync(summaryPath, minifyMarkdown(summaryContent));
    console.log(`\n✓ Relatório Consolidado Criado: ${summaryFilename}`);

    // 4. Cleanup (Optional - Raw data is already organized by individual scripts now)
    console.log('\n✓ Estrutura organizada: Relatórios salvos em subpastas por tipo/data.');
    // We don't need to move files anymore as scripts do it themselves.
}

main();
