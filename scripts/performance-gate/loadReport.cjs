/**
 * Load Lighthouse Report (JSON or HTML)
 * Extracts JSON from HTML if needed
 */
const fs = require('fs');
const path = require('path');

function loadReport(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Report file not found: ${absolutePath}`);
    }

    const raw = fs.readFileSync(absolutePath, 'utf-8');

    if (filePath.endsWith('.json')) {
        return JSON.parse(raw);
    }

    if (filePath.endsWith('.html')) {
        // Extract embedded JSON from Lighthouse HTML report
        const match = raw.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*\});/s);
        if (!match) {
            throw new Error('Lighthouse JSON not found in HTML report');
        }
        return JSON.parse(match[1]);
    }

    throw new Error('Unsupported file type. Use .json or .html');
}

module.exports = { loadReport };
