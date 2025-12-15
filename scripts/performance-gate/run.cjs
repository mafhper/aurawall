#!/usr/bin/env node
/**
 * Performance Gate - Main Runner
 * 
 * Usage:
 *   node scripts/performance-gate/run.cjs <lighthouse-report.json>
 *   node scripts/performance-gate/run.cjs _desenvolvimento/lighthouse-reports-live/report.json
 * 
 * Exit codes:
 *   0 = PASS or WARN
 *   1 = FAIL (threshold violation)
 */
const path = require('path');
const { loadReport } = require('./loadReport.cjs');
const { getFormFactor } = require('./getFormFactor.cjs');
const { normalizeNavigation } = require('./normalizeNavigation.cjs');
const { evaluateThresholds } = require('./evaluateThresholds.cjs');
const { compareWithBaseline } = require('./compareWithBaseline.cjs');
const { decideOutcome } = require('./decideOutcome.cjs');

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

function formatMs(value) {
    if (value == null) return 'N/A';
    if (value < 1000) return `${Math.round(value)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
}

function main() {
    const reportPath = process.argv[2];

    if (!reportPath) {
        console.error(`${colors.red}Usage: node run.cjs <lighthouse-report.json>${colors.reset}`);
        console.error('');
        console.error('Examples:');
        console.error('  node scripts/performance-gate/run.cjs _desenvolvimento/lighthouse-reports-live/report.json');
        process.exit(1);
    }

    try {
        // 1. Load report
        const report = loadReport(reportPath);

        // 2. Get form factor
        const formFactor = getFormFactor(report);

        // 3. Normalize metrics
        const metrics = normalizeNavigation(report);

        // 4. Evaluate thresholds
        const thresholdResults = evaluateThresholds(
            metrics,
            path.join(__dirname, '../../performance/thresholds.json'),
            formFactor
        );

        // 5. Compare with baseline
        const regressions = compareWithBaseline(
            metrics,
            path.join(__dirname, `../../performance/baseline/navigation.${formFactor}.json`)
        );

        // 6. Decide outcome
        const decision = decideOutcome(thresholdResults, regressions);

        // Output
        console.log('');
        console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}`);
        console.log(`${colors.cyan}${colors.bold}  Performance Gate (${formFactor.toUpperCase()})${colors.reset}`);
        console.log(`${colors.cyan}${colors.bold}═══════════════════════════════════════${colors.reset}`);
        console.log('');

        // Metrics summary
        console.log(`${colors.bold}Current Metrics:${colors.reset}`);
        console.log(`  FCP: ${formatMs(metrics.fcp)}`);
        console.log(`  LCP: ${formatMs(metrics.lcp)}`);
        console.log(`  TBT: ${formatMs(metrics.tbt)}`);
        console.log(`  CLS: ${metrics.cls?.toFixed(3) || 'N/A'}`);
        console.log(`  SI:  ${formatMs(metrics.si)}`);
        console.log('');

        // Threshold violations
        if (thresholdResults.length > 0) {
            console.log(`${colors.bold}Threshold Violations:${colors.reset}`);
            thresholdResults.forEach(r => {
                const statusColor = r.status === 'fail' ? colors.red : colors.yellow;
                const statusIcon = r.status === 'fail' ? '✗' : '⚠';
                console.log(`  ${statusColor}${statusIcon}${colors.reset} ${r.metric}: ${formatMs(r.value)} (limit: ${formatMs(r.limit)})`);
            });
            console.log('');
        }

        // Regressions
        if (regressions.length > 0) {
            console.log(`${colors.bold}Regressions vs Baseline:${colors.reset}`);
            regressions.forEach(r => {
                console.log(`  ${colors.yellow}↑${colors.reset} ${r.metric}: +${r.percent}% (${formatMs(r.baseline)} → ${formatMs(r.current)})`);
            });
            console.log('');
        }

        // Decision
        const decisionColor = decision.status === 'fail' ? colors.red :
            decision.status === 'warn' ? colors.yellow :
                colors.green;
        const decisionIcon = decision.status === 'fail' ? '❌' :
            decision.status === 'warn' ? '⚠️' :
                '✅';

        console.log(`${colors.cyan}───────────────────────────────────────${colors.reset}`);
        console.log(`${colors.bold}Decision: ${decisionColor}${decision.status.toUpperCase()}${colors.reset} ${decisionIcon}`);
        if (decision.reason) {
            console.log(`${colors.dim}Reason: ${decision.reason}${colors.reset}`);
        }
        console.log('');

        // Exit code
        if (decision.status === 'fail') {
            process.exit(1);
        }
        process.exit(0);

    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

main();
