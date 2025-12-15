/**
 * Compare with Baseline
 * Detect regressions (current > baseline * (1 + tolerance))
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_TOLERANCE = 0.05; // 5%

function compareWithBaseline(currentMetrics, baselinePath, tolerance = DEFAULT_TOLERANCE) {
    const absolutePath = path.resolve(baselinePath);

    if (!fs.existsSync(absolutePath)) {
        console.log(`⚠️  Baseline not found: ${baselinePath} - skipping comparison`);
        return [];
    }

    const baseline = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
    const regressions = [];

    for (const [metric, value] of Object.entries(currentMetrics)) {
        const baseValue = baseline.metrics[metric]?.value;
        if (baseValue == null || value == null) continue;

        const delta = value - baseValue;

        // Skip if baseline is 0 to avoid division by zero
        if (baseValue === 0) continue;

        const ratio = delta / baseValue;

        if (ratio > tolerance) {
            regressions.push({
                metric,
                baseline: baseValue,
                current: value,
                delta: Math.round(delta),
                percent: +(ratio * 100).toFixed(2)
            });
        }
    }

    return regressions;
}

module.exports = { compareWithBaseline };
