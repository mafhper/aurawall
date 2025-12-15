#!/usr/bin/env node
/**
 * Performance Gate - Batch Analyzer
 * 
 * Analyzes all Lighthouse reports in a directory and provides:
 * - Summary statistics (mean, min, max)
 * - Trend analysis
 * - Comparison with thresholds
 * - Generates Markdown report
 * 
 * Usage:
 *   node scripts/performance-gate/analyze-batch.cjs <directory> [--output <path>]
 *   node scripts/performance-gate/analyze-batch.cjs _desenvolvimento/lighthouse-reports-live/dados
 */
const fs = require('fs');
const path = require('path');
const { loadReport } = require('./loadReport.cjs');
const { getFormFactor } = require('./getFormFactor.cjs');
const { normalizeNavigation } = require('./normalizeNavigation.cjs');

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

// Thresholds for status evaluation
const THRESHOLDS = {
    mobile: {
        fcp: { warn: 1000, fail: 1800 },
        lcp: { warn: 1800, fail: 2500 },
        tbt: { warn: 200, fail: 300 },
        cls: { warn: 0.05, fail: 0.1 },
        si: { warn: 2000, fail: 3000 }
    },
    desktop: {
        fcp: { warn: 800, fail: 1200 },
        lcp: { warn: 1200, fail: 2000 },
        tbt: { warn: 100, fail: 200 },
        cls: { warn: 0.05, fail: 0.1 },
        si: { warn: 1500, fail: 2000 }
    }
};

function formatMs(value) {
    if (value == null || isNaN(value)) return 'N/A';
    if (value < 1000) return `${Math.round(value)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
}

function calcStats(values) {
    const valid = values.filter(v => v != null && !isNaN(v));
    if (valid.length === 0) return { mean: null, min: null, max: null, count: 0 };

    const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
    const min = Math.min(...valid);
    const max = Math.max(...valid);

    return { mean, min, max, count: valid.length };
}

function getStatus(value, metric, formFactor) {
    const t = THRESHOLDS[formFactor]?.[metric];
    if (!t || value == null) return '❓';
    if (value > t.fail) return '❌ FAIL';
    if (value > t.warn) return '⚠️ WARN';
    return '✅ OK';
}

function generateMarkdownReport(analysis) {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');

    let md = `# Relatório de Análise - Performance Gate\n\n`;
    md += `**Data:** ${timestamp}\n`;
    md += `**Diretório:** ${analysis.directory}\n`;
    md += `**Total de Relatórios:** ${analysis.totalReports}\n\n`;
    md += `---\n\n`;

    // Desktop analysis
    if (analysis.desktop.reports.length > 0) {
        const d = analysis.desktop;
        md += `## 📊 Desktop (${d.reports.length} reports)\n\n`;
        md += `### Estatísticas\n\n`;
        md += `| Métrica | Média | Mín | Máx | Status Atual |\n`;
        md += `|---------|-------|-----|-----|-------------|\n`;

        for (const [metric, stats] of Object.entries(d.stats)) {
            const isCLS = metric === 'cls';
            const formatFn = isCLS ? v => v?.toFixed(3) || 'N/A' : formatMs;
            const currentVal = d.reports[d.reports.length - 1]?.metrics[metric];
            const status = getStatus(currentVal, metric, 'desktop');
            md += `| ${metric.toUpperCase()} | ${formatFn(stats.mean)} | ${formatFn(stats.min)} | ${formatFn(stats.max)} | ${status} |\n`;
        }

        if (d.trend) {
            md += `\n### Tendência (${d.trend.first} → ${d.trend.last})\n\n`;
            for (const t of d.trend.items) {
                const icon = t.delta > 0 ? '📈' : t.delta < 0 ? '📉' : '➡️';
                const sign = t.delta > 0 ? '+' : '';
                md += `- ${icon} **${t.metric.toUpperCase()}**: ${t.oldFormatted} → ${t.newFormatted} (${sign}${t.pct}%)\n`;
            }
        }
        md += `\n`;
    }

    // Mobile analysis
    if (analysis.mobile.reports.length > 0) {
        const m = analysis.mobile;
        md += `## 📱 Mobile (${m.reports.length} reports)\n\n`;
        md += `### Estatísticas\n\n`;
        md += `| Métrica | Média | Mín | Máx | Status Atual |\n`;
        md += `|---------|-------|-----|-----|-------------|\n`;

        for (const [metric, stats] of Object.entries(m.stats)) {
            const isCLS = metric === 'cls';
            const formatFn = isCLS ? v => v?.toFixed(3) || 'N/A' : formatMs;
            const currentVal = m.reports[m.reports.length - 1]?.metrics[metric];
            const status = getStatus(currentVal, metric, 'mobile');
            md += `| ${metric.toUpperCase()} | ${formatFn(stats.mean)} | ${formatFn(stats.min)} | ${formatFn(stats.max)} | ${status} |\n`;
        }

        if (m.trend) {
            md += `\n### Tendência (${m.trend.first} → ${m.trend.last})\n\n`;
            for (const t of m.trend.items) {
                const icon = t.delta > 0 ? '📈' : t.delta < 0 ? '📉' : '➡️';
                const sign = t.delta > 0 ? '+' : '';
                md += `- ${icon} **${t.metric.toUpperCase()}**: ${t.oldFormatted} → ${t.newFormatted} (${sign}${t.pct}%)\n`;
            }
        }
        md += `\n`;
    }

    // Snapshots
    if (analysis.snapshots > 0) {
        md += `## 📸 Snapshots\n\n`;
        md += `${analysis.snapshots} relatórios de snapshot (sem métricas de performance)\n\n`;
    }

    // Attention points
    md += `---\n\n`;
    md += `## 🚨 Pontos de Atenção\n\n`;

    const attentionPoints = [];

    // Check desktop
    if (analysis.desktop.reports.length > 0) {
        const last = analysis.desktop.reports[analysis.desktop.reports.length - 1].metrics;
        if (last.tbt > THRESHOLDS.desktop.tbt.warn) attentionPoints.push(`- Desktop TBT (${formatMs(last.tbt)}) acima do limite de warning`);
        if (last.cls > THRESHOLDS.desktop.cls.fail) attentionPoints.push(`- Desktop CLS (${last.cls.toFixed(3)}) acima do limite de falha`);
    }

    // Check mobile
    if (analysis.mobile.reports.length > 0) {
        const last = analysis.mobile.reports[analysis.mobile.reports.length - 1].metrics;
        if (last.tbt > THRESHOLDS.mobile.tbt.fail) attentionPoints.push(`- ❌ **Mobile TBT (${formatMs(last.tbt)})** CRÍTICO - acima do limite de falha (${THRESHOLDS.mobile.tbt.fail}ms)`);
        if (last.lcp > THRESHOLDS.mobile.lcp.fail) attentionPoints.push(`- ❌ **Mobile LCP (${formatMs(last.lcp)})** CRÍTICO - acima do limite de falha (${THRESHOLDS.mobile.lcp.fail}ms)`);
        if (last.cls > THRESHOLDS.mobile.cls.fail) attentionPoints.push(`- ❌ **Mobile CLS (${last.cls.toFixed(3)})** ESTRUTURAL - layout shift persistente`);
        if (last.si > THRESHOLDS.mobile.si.fail) attentionPoints.push(`- ❌ **Mobile Speed Index (${formatMs(last.si)})** acima do limite de falha`);
    }

    if (attentionPoints.length === 0) {
        md += `✅ Nenhum problema crítico detectado.\n`;
    } else {
        md += attentionPoints.join('\n') + '\n';
    }

    md += `\n---\n\n`;
    md += `*Relatório gerado automaticamente pelo Performance Gate*\n`;

    return md;
}

function main() {
    const dirPath = process.argv[2];
    const outputArg = process.argv.indexOf('--output');
    const outputDir = outputArg !== -1 ? process.argv[outputArg + 1] : null;

    if (!dirPath) {
        console.error(`${colors.red}Usage: node analyze-batch.cjs <directory> [--output <path>]${colors.reset}`);
        console.error('');
        console.error('Example:');
        console.error('  node scripts/performance-gate/analyze-batch.cjs _desenvolvimento/lighthouse-reports-live/dados');
        process.exit(1);
    }

    const absolutePath = path.resolve(dirPath);

    if (!fs.existsSync(absolutePath)) {
        console.error(`${colors.red}Directory not found: ${absolutePath}${colors.reset}`);
        process.exit(1);
    }

    // Find all JSON reports
    const files = fs.readdirSync(absolutePath)
        .filter(f => f.endsWith('.json'))
        .sort();

    if (files.length === 0) {
        console.error(`${colors.yellow}No JSON reports found in ${dirPath}${colors.reset}`);
        process.exit(0);
    }

    console.log('');
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}  Performance Gate - Batch Analysis${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}`);
    console.log('');
    console.log(`${colors.dim}Directory: ${dirPath}${colors.reset}`);
    console.log(`${colors.dim}Reports found: ${files.length}${colors.reset}`);
    console.log('');

    // Separate by form factor
    const byFormFactor = { mobile: [], desktop: [], snapshot: [] };

    for (const file of files) {
        try {
            const report = loadReport(path.join(absolutePath, file));

            const gatherMode = report.gatherMode || 'navigation';
            if (gatherMode === 'snapshot') {
                byFormFactor.snapshot.push({ file, report });
                continue;
            }

            const formFactor = getFormFactor(report);
            const metrics = normalizeNavigation(report);
            const timestamp = report.fetchTime || file;

            byFormFactor[formFactor]?.push({ file, metrics, timestamp });
        } catch (err) {
            console.log(`${colors.yellow}⚠ Skipped ${file}: ${err.message}${colors.reset}`);
        }
    }

    // Build analysis object
    const analysis = {
        directory: dirPath,
        totalReports: files.length,
        desktop: { reports: byFormFactor.desktop, stats: {}, trend: null },
        mobile: { reports: byFormFactor.mobile, stats: {}, trend: null },
        snapshots: byFormFactor.snapshot.length
    };

    // Analyze each form factor
    for (const [formFactor, reports] of Object.entries(byFormFactor)) {
        if (reports.length === 0) continue;

        if (formFactor === 'snapshot') {
            console.log(`${colors.bold}📸 Snapshots: ${reports.length} reports${colors.reset}`);
            console.log(`${colors.dim}   (Snapshots don't have performance metrics)${colors.reset}`);
            console.log('');
            continue;
        }

        console.log(`${colors.bold}📊 ${formFactor.toUpperCase()} (${reports.length} reports)${colors.reset}`);
        console.log('');

        // Collect all metric values
        const metricValues = {
            fcp: reports.map(r => r.metrics.fcp),
            lcp: reports.map(r => r.metrics.lcp),
            tbt: reports.map(r => r.metrics.tbt),
            cls: reports.map(r => r.metrics.cls),
            si: reports.map(r => r.metrics.si)
        };

        // Calculate stats
        console.log(`   ${'Metric'.padEnd(8)} ${'Mean'.padStart(10)} ${'Min'.padStart(10)} ${'Max'.padStart(10)}`);
        console.log(`   ${'-'.repeat(38)}`);

        for (const [metric, values] of Object.entries(metricValues)) {
            const stats = calcStats(values);
            analysis[formFactor].stats[metric] = stats;

            const isCLS = metric === 'cls';
            const formatFn = isCLS ? v => v?.toFixed(3) || 'N/A' : formatMs;

            console.log(`   ${metric.toUpperCase().padEnd(8)} ${formatFn(stats.mean).padStart(10)} ${formatFn(stats.min).padStart(10)} ${formatFn(stats.max).padStart(10)}`);
        }
        console.log('');

        // Show trend (first vs last report)
        if (reports.length >= 2) {
            const first = reports[0];
            const last = reports[reports.length - 1];

            analysis[formFactor].trend = {
                first: first.file.slice(-18, -5),
                last: last.file.slice(-18, -5),
                items: []
            };

            console.log(`   ${colors.bold}Trend (oldest → newest):${colors.reset}`);

            for (const metric of ['fcp', 'lcp', 'tbt', 'si']) {
                const oldVal = first.metrics[metric];
                const newVal = last.metrics[metric];

                if (oldVal == null || newVal == null) continue;

                const delta = newVal - oldVal;
                const pct = ((delta / oldVal) * 100).toFixed(1);
                const direction = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
                const color = delta > 0 ? colors.red : delta < 0 ? colors.green : colors.dim;

                analysis[formFactor].trend.items.push({
                    metric,
                    oldVal,
                    newVal,
                    delta,
                    pct,
                    oldFormatted: formatMs(oldVal),
                    newFormatted: formatMs(newVal)
                });

                console.log(`   ${color}${direction} ${metric.toUpperCase()}: ${formatMs(oldVal)} → ${formatMs(newVal)} (${pct}%)${colors.reset}`);
            }
            console.log('');
        }
    }

    // Generate and save Markdown report
    const defaultOutputDir = path.resolve(path.dirname(absolutePath), 'resultado-analise-relatorios');
    const finalOutputDir = outputDir ? path.resolve(outputDir) : defaultOutputDir;

    if (!fs.existsSync(finalOutputDir)) {
        fs.mkdirSync(finalOutputDir, { recursive: true });
    }

    const reportFilename = `analise_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 5).replace(':', 'h')}m.md`;
    const reportPath = path.join(finalOutputDir, reportFilename);

    const markdown = generateMarkdownReport(analysis);
    fs.writeFileSync(reportPath, markdown, 'utf-8');

    console.log(`${colors.cyan}───────────────────────────────────────${colors.reset}`);
    console.log(`${colors.green}✓ Batch analysis complete${colors.reset}`);
    console.log(`${colors.green}✓ Report saved: ${reportPath}${colors.reset}`);
    console.log('');
}

main();
