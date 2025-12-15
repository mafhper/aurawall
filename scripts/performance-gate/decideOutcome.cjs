/**
 * Decide Outcome
 * FAIL if any threshold violation, WARN if regressions, PASS otherwise
 */
function decideOutcome(thresholdResults, regressions) {
    if (thresholdResults.some(r => r.status === 'fail')) {
        return { status: 'fail', reason: 'threshold' };
    }

    if (regressions.length > 0) {
        return { status: 'warn', reason: 'regression' };
    }

    return { status: 'pass' };
}

module.exports = { decideOutcome };
