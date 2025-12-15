/**
 * Evaluate Thresholds
 * Check if metrics exceed fail/warn limits for the given formFactor
 */
const fs = require('fs');
const path = require('path');

function evaluateThresholds(metrics, thresholdsPath, formFactor) {
    const absolutePath = path.resolve(thresholdsPath);
    const thresholds = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
    const rules = thresholds.navigation[formFactor];

    if (!rules) {
        throw new Error(`No thresholds defined for formFactor: ${formFactor}`);
    }

    const results = [];

    for (const [metric, rule] of Object.entries(rules)) {
        const value = metrics[metric];
        if (value == null) continue;

        if (value > rule.failAbove) {
            results.push({ metric, status: 'fail', value, limit: rule.failAbove });
        } else if (value > rule.warnAbove) {
            results.push({ metric, status: 'warn', value, limit: rule.warnAbove });
        }
    }

    return results;
}

module.exports = { evaluateThresholds };
