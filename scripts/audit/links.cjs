/**
 * Link Audit Script for AuraWall
 * 
 * Scans all TSX/HTML files in app and promo site to find:
 * - All links (href, to, Link components)
 * - Which page/file they are in
 * - Associated text/labels
 * 
 * Usage: node scripts/audit-links.cjs
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const SCAN_DIRS = [
    'src',
    'website/src'
];

// File extensions to scan
const EXTENSIONS = ['.tsx', '.ts', '.html', '.jsx', '.js'];

// Results storage
const results = [];

/**
 * Recursively get all files in directory
 */
function getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
                getAllFiles(fullPath, files);
            }
        } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Extract links from file content
 */
function extractLinks(filePath, content) {
    const links = [];
    const lines = content.split('\n');

    // Patterns to match
    const patterns = [
        // React Router Link: <Link to="/path">text</Link>
        /<Link\s+[^>]*to=["']([^"']+)["'][^>]*>([^<]*)/g,
        // Anchor href: <a href="/path">text</a>
        /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]*)/g,
        // href={url}: href={`${base}/path`} or href="/path"
        /href=\{?["'`]([^"'`}]+)["'`]?\}/g,
        // to={url}: to="/path" or to={`/path`}
        /to=\{?["'`]([^"'`}]+)["'`]?\}/g,
    ];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];

        for (const pattern of patterns) {
            pattern.lastIndex = 0; // Reset regex
            let match;
            while ((match = pattern.exec(line)) !== null) {
                const url = match[1];
                const text = match[2] || '';

                // Skip empty or invalid URLs
                if (!url || url.includes('${') && !url.includes('/')) continue;

                links.push({
                    file: filePath,
                    line: lineNum + 1,
                    url: url.trim(),
                    text: text.trim() || '[dynamic/icon]',
                    rawMatch: match[0].substring(0, 100)
                });
            }
        }
    }

    return links;
}

/**
 * Categorize URL type
 */
function categorizeUrl(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
    if (url.startsWith('/')) return 'internal-absolute';
    if (url.startsWith('#')) return 'anchor';
    if (url.startsWith('${') || url.includes('getAppUrl')) return 'dynamic';
    if (url.startsWith('mailto:')) return 'email';
    return 'relative';
}

/**
 * Get section from surrounding context
 */
function getSection(content, lineNum) {
    const lines = content.split('\n');
    // Look backwards for section comments or headings
    for (let i = lineNum - 1; i >= Math.max(0, lineNum - 20); i--) {
        const line = lines[i];
        // Match {/* Section Name */} or /* Section */
        const commentMatch = line.match(/\{?\/\*\s*(.+?)\s*\*\/\}?/);
        if (commentMatch) {
            return commentMatch[1].replace(/^[\s-]+|[\s-]+$/g, '').substring(0, 50);
        }
        // Match <section id="name"> or similar
        const sectionMatch = line.match(/<section[^>]*id=["']([^"']+)["']/);
        if (sectionMatch) {
            return sectionMatch[1];
        }
    }
    return '-';
}

/**
 * Main function
 */
function main() {
    console.log('🔍 AuraWall Link Audit\n');
    console.log('Scanning directories:', SCAN_DIRS.join(', '));
    console.log('');

    // Get all files
    const allFiles = [];
    for (const dir of SCAN_DIRS) {
        getAllFiles(dir, allFiles);
    }

    console.log(`Found ${allFiles.length} files to scan\n`);

    // Process each file
    for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const links = extractLinks(filePath, content);

        for (const link of links) {
            link.section = getSection(content, link.line);
            link.type = categorizeUrl(link.url);
            results.push(link);
        }
    }

    // Sort by file
    results.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

    // Generate Markdown report
    let report = '# Link Audit Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Total Links Found: **${results.length}**\n\n`;

    // Summary by type
    const byType = {};
    for (const r of results) {
        byType[r.type] = (byType[r.type] || 0) + 1;
    }
    report += '## Summary by Type\n\n';
    report += '| Type | Count |\n|------|-------|\n';
    for (const [type, count] of Object.entries(byType)) {
        report += `| ${type} | ${count} |\n`;
    }
    report += '\n';

    // Links by file
    report += '## Links by File\n\n';

    let currentFile = '';
    for (const r of results) {
        if (r.file !== currentFile) {
            currentFile = r.file;
            const shortPath = currentFile.replace(/\\/g, '/');
            report += `\n### ${shortPath}\n\n`;
            report += '| Line | Section | Type | URL | Text |\n';
            report += '|------|---------|------|-----|------|\n';
        }

        const url = r.url.length > 50 ? r.url.substring(0, 47) + '...' : r.url;
        const text = r.text.length > 30 ? r.text.substring(0, 27) + '...' : r.text;
        report += `| ${r.line} | ${r.section} | ${r.type} | \`${url}\` | ${text} |\n`;
    }

    // Write report
    const reportPath = 'docs/link-audit-report.md';
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync(reportPath, report);

    console.log(`✅ Report written to: ${reportPath}`);
    console.log(`   Total links found: ${results.length}`);
    console.log('');

    // Also output to console
    console.log('='.repeat(80));
    console.log('QUICK SUMMARY');
    console.log('='.repeat(80));
    for (const [type, count] of Object.entries(byType)) {
        console.log(`  ${type}: ${count}`);
    }
}

main();
