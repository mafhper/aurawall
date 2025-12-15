/**
 * Get Form Factor from Lighthouse Report
 * Source of truth: configSettings.formFactor
 */
function getFormFactor(report) {
    if (report.configSettings?.formFactor) {
        return report.configSettings.formFactor;
    }

    if (report.environment?.hostFormFactor) {
        return report.environment.hostFormFactor;
    }

    throw new Error('Unable to determine formFactor (mobile/desktop) from report');
}

module.exports = { getFormFactor };
