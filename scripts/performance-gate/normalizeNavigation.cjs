/**
 * Normalize Navigation Metrics
 * Extract absolute values (not scores) from Lighthouse audits
 */
function normalizeNavigation(report) {
    const audits = report.audits;

    return {
        lcp: audits['largest-contentful-paint']?.numericValue ?? null,
        fcp: audits['first-contentful-paint']?.numericValue ?? null,
        cls: audits['cumulative-layout-shift']?.numericValue ?? null,
        tbt: audits['total-blocking-time']?.numericValue ?? null,
        si: audits['speed-index']?.numericValue ?? null
    };
}

module.exports = { normalizeNavigation };
