
const fs = require('fs');
const path = require('path');

// Base directory for all reports
const BASE_REPORT_DIR = path.join(__dirname, '../../performance-reports');

/**
 * Creates the directory structure: outputDir/type/YYYY-MM-DD/
 * Returns the full path to today's directory for the given type.
 */
function getReportDirectory(type) {
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    const dateFolder = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;

    // Structure: performance-reports/app/2025-12-14/
    const dir = path.join(BASE_REPORT_DIR, type, dateFolder);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

/**
 * Generates a consistent filename.
 * Format: HH-mm_Status-FAIL_Failures-2.md
 */
function generateFilenameTimestamp() {
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${p(now.getHours())}-${p(now.getMinutes())}`;
}

/**
 * Saves reports (Markdown, JSON, HTML) to the correct folder.
 * 
 * @param {string} type - 'app', 'promo', 'health'
 * @param {object} data - The report data object
 * @param {string} markdownContent - The generated markdown
 * @param {object} options - Extra options: { status: 'OK'|'WARN'|'FAIL', failCount: 0, html: string, json: object }
 */
async function saveReport(type, data, markdownContent, options = {}) {
    const dir = getReportDirectory(type);
    const timestamp = generateFilenameTimestamp();
    const status = options.status || 'OK';
    const failSummary = options.failCount > 0 ? `_Failures-${options.failCount}` : '';

    // Base filename without extension
    const baseName = `Audit_${timestamp}_${status}${failSummary}`;

    const mdPath = path.join(dir, `${baseName}.md`);

    // Save Markdown
    await fs.promises.writeFile(mdPath, markdownContent);

    // Save Raw Data (JSON/HTML) in a subfolder 'raw' to keep things clean? 
    // Or just next to it? User requested "raw-data" folder isolation previously.
    // Let's create a 'raw' folder inside the day folder.
    const rawDir = path.join(dir, 'raw');
    if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir, { recursive: true });

    if (options.json) {
        await fs.promises.writeFile(path.join(rawDir, `${baseName}.json`), JSON.stringify(options.json, null, 2));
    }

    if (options.html) {
        await fs.promises.writeFile(path.join(rawDir, `${baseName}.html`), options.html);
    }

    return mdPath;
}

/**
 * Minifies markdown content
 */
function minifyMarkdown(text) {
    return text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Common formatting helpers
 */
const formatHelpers = {
    // ... existing helpers if needed shared
    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
    },
    formatDuration: (ms) => ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`
};

module.exports = {
    BASE_REPORT_DIR,
    getReportDirectory,
    saveReport,
    minifyMarkdown,
    formatHelpers
};
