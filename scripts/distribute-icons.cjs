/**
 * Icon Forge Assets Distribution Script
 * 
 * Automatically distributes icon assets from the icon-forge output folder
 * to all required locations in the project.
 * 
 * Usage: node scripts/distribute-icons.js
 * 
 * Source: _desenvolvimento/img/icon-forge-assets/
 * Destinations: public/, website/public/
 * 
 * Features:
 * - Automatic file mapping based on naming convention
 * - Detailed logging with status for each operation
 * - Error handling with descriptive messages
 * - Summary report at the end
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, '_desenvolvimento', 'img', 'icon-forge-assets');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Destination mappings
// Each source file maps to an array of destination paths (relative to PROJECT_ROOT)
const FILE_MAPPINGS = {
    // Favicons
    'favicon.ico': ['public/favicon.ico', 'website/public/favicon.ico'],
    'favicon.svg': ['public/favicon.svg'],
    'favicon-dark.ico': ['public/favicon-dark.ico'],
    'favicon-dark.svg': ['public/favicon-dark.svg'],
    'favicon-16x16.png': ['public/favicon-16x16.png'],
    'favicon-16x16-dark.png': ['public/favicon-16x16-dark.png'],
    'favicon-32x32.png': ['public/favicon-32x32.png'],
    'favicon-32x32-dark.png': ['public/favicon-32x32-dark.png'],

    // Apple Touch Icons
    'apple-touch-icon.png': ['public/apple-touch-icon.png'],
    'apple-touch-icon-dark.png': ['public/apple-touch-icon-dark.png'],

    // PWA Icons
    'pwa-192x192.png': ['public/pwa-192x192.png'],
    'pwa-192x192-dark.png': ['public/pwa-192x192-dark.png'],
    'pwa-512x512.png': ['public/pwa-512x512.png'],
    'pwa-512x512-dark.png': ['public/pwa-512x512-dark.png'],
    'pwa-maskable-192x192.png': ['public/pwa-maskable-192x192.png'],
    'pwa-maskable-192x192-dark.png': ['public/pwa-maskable-192x192-dark.png'],
    'pwa-maskable-512x512.png': ['public/pwa-maskable-512x512.png'],
    'pwa-maskable-512x512-dark.png': ['public/pwa-maskable-512x512-dark.png'],

    // Microsoft Tiles
    'mstile-150x150.png': ['public/mstile-150x150.png'],
    'mstile-150x150-dark.png': ['public/mstile-150x150-dark.png'],

    // Open Graph Images
    'og-image.jpg': ['public/og-image.jpg'],
    'og-image-dark.jpg': ['public/og-image-dark.jpg'],

    // Platform-specific logos
    'logo-linux-48x48.png': ['public/logo-linux-48x48.png'],
    'logo-linux-48x48-dark.png': ['public/logo-linux-48x48-dark.png'],
    'logo-linux-512x512.png': ['public/logo-linux-512x512.png'],
    'logo-linux-512x512-dark.png': ['public/logo-linux-512x512-dark.png'],
    'logo-mac-512x512.png': ['public/logo-mac-512x512.png'],
    'logo-mac-512x512-dark.png': ['public/logo-mac-512x512-dark.png'],
    'logo-mac-1024x1024.png': ['public/logo-mac-1024x1024.png'],
    'logo-mac-1024x1024-dark.png': ['public/logo-mac-1024x1024-dark.png'],
    'logo-win-150x150.png': ['public/logo-win-150x150.png'],
    'logo-win-150x150-dark.png': ['public/logo-win-150x150-dark.png'],
    'logo-win-310x310.png': ['public/logo-win-310x310.png'],
    'logo-win-310x310-dark.png': ['public/logo-win-310x310-dark.png'],

    // Website-specific icons (icon-light.svg is used as the navbar logo)
    // This maps favicon.svg to icon-light.svg for the website
};

// Special mappings where source name differs from destination name
const RENAMED_MAPPINGS = {
    'favicon.svg': [
        { dest: 'public/icon-light.svg', rename: true },
        { dest: 'website/public/icon-light.svg', rename: true },
    ],
};

// Statistics
const stats = {
    success: 0,
    failed: 0,
    skipped: 0,
    notFound: 0,
};

// Results log
const results = [];

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logResult(sourceFile, destPath, status, message = '') {
    const statusColors = {
        'OK': colors.green,
        'FAIL': colors.red,
        'SKIP': colors.yellow,
        'NOT_FOUND': colors.magenta,
    };

    const statusSymbols = {
        'OK': '✓',
        'FAIL': '✗',
        'SKIP': '○',
        'NOT_FOUND': '?',
    };

    const color = statusColors[status] || colors.reset;
    const symbol = statusSymbols[status] || '-';
    const msgPart = message ? ` (${message})` : '';

    console.log(`  ${color}${symbol}${colors.reset} ${sourceFile} → ${destPath}${colors.dim}${msgPart}${colors.reset}`);

    results.push({ sourceFile, destPath, status, message });
}

function copyFile(sourcePath, destPath) {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy file
        fs.copyFileSync(sourcePath, destPath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function main() {
    console.log('');
    log('╔════════════════════════════════════════════════════════════════╗', colors.cyan);
    log('║          ICON FORGE - Asset Distribution Script                ║', colors.cyan);
    log('╚════════════════════════════════════════════════════════════════╝', colors.cyan);
    console.log('');

    // Check if source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
        log(`ERROR: Source directory not found!`, colors.red);
        log(`Expected: ${SOURCE_DIR}`, colors.dim);
        log('', colors.reset);
        log('Please ensure icon-forge assets are placed in:', colors.yellow);
        log('  _desenvolvimento/img/icon-forge-assets/', colors.reset);
        process.exit(1);
    }

    // List source files
    const sourceFiles = fs.readdirSync(SOURCE_DIR);
    log(`Source: ${SOURCE_DIR}`, colors.dim);
    log(`Found ${sourceFiles.length} files in source directory`, colors.blue);
    console.log('');

    log('─── Standard Mappings ───────────────────────────────────────────', colors.dim);
    console.log('');

    // Process standard mappings
    for (const [sourceFile, destinations] of Object.entries(FILE_MAPPINGS)) {
        const sourcePath = path.join(SOURCE_DIR, sourceFile);

        if (!fs.existsSync(sourcePath)) {
            stats.notFound++;
            logResult(sourceFile, '(not in source)', 'NOT_FOUND', 'file missing');
            continue;
        }

        const fileSize = getFileSize(sourcePath);

        for (const dest of destinations) {
            const destPath = path.join(PROJECT_ROOT, dest);
            const result = copyFile(sourcePath, destPath);

            if (result.success) {
                stats.success++;
                logResult(sourceFile, dest, 'OK', formatBytes(fileSize));
            } else {
                stats.failed++;
                logResult(sourceFile, dest, 'FAIL', result.error);
            }
        }
    }

    // Process renamed mappings
    console.log('');
    log('─── Renamed Mappings ────────────────────────────────────────────', colors.dim);
    console.log('');

    for (const [sourceFile, mappings] of Object.entries(RENAMED_MAPPINGS)) {
        const sourcePath = path.join(SOURCE_DIR, sourceFile);

        if (!fs.existsSync(sourcePath)) {
            stats.notFound++;
            logResult(sourceFile, '(not in source)', 'NOT_FOUND', 'file missing');
            continue;
        }

        const fileSize = getFileSize(sourcePath);

        for (const mapping of mappings) {
            const destPath = path.join(PROJECT_ROOT, mapping.dest);
            const result = copyFile(sourcePath, destPath);
            const destName = path.basename(mapping.dest);

            if (result.success) {
                stats.success++;
                logResult(sourceFile, `${mapping.dest}`, 'OK', `renamed to ${destName}, ${formatBytes(fileSize)}`);
            } else {
                stats.failed++;
                logResult(sourceFile, mapping.dest, 'FAIL', result.error);
            }
        }
    }

    // Check for unmapped source files
    console.log('');
    log('─── Unmapped Files ──────────────────────────────────────────────', colors.dim);
    console.log('');

    const mappedFiles = new Set([
        ...Object.keys(FILE_MAPPINGS),
        ...Object.keys(RENAMED_MAPPINGS),
    ]);

    const unmappedFiles = sourceFiles.filter(f => !mappedFiles.has(f) && !f.startsWith('.'));

    if (unmappedFiles.length === 0) {
        log('  All source files are mapped!', colors.green);
    } else {
        log(`  ${unmappedFiles.length} unmapped file(s):`, colors.yellow);
        for (const file of unmappedFiles) {
            console.log(`    ${colors.dim}○${colors.reset} ${file}`);
            stats.skipped++;
        }
    }

    // Summary
    console.log('');
    log('═══════════════════════════════════════════════════════════════════', colors.dim);
    console.log('');
    log('Distribution Summary:', colors.bright);
    console.log('');
    log(`  ${colors.green}✓ Success:${colors.reset}    ${stats.success} file(s) copied`);
    log(`  ${colors.red}✗ Failed:${colors.reset}     ${stats.failed} file(s)`);
    log(`  ${colors.magenta}? Not Found:${colors.reset}  ${stats.notFound} source file(s) missing`);
    log(`  ${colors.yellow}○ Skipped:${colors.reset}    ${stats.skipped} unmapped file(s)`);
    console.log('');

    if (stats.failed > 0) {
        log('Some files failed to copy. Check the errors above.', colors.red);
        process.exit(1);
    } else if (stats.notFound > 0) {
        log('Some expected source files were not found.', colors.yellow);
        log('This may be normal if using a partial icon set.', colors.dim);
    } else {
        log('All icons distributed successfully!', colors.green);
    }

    console.log('');

    // Write log file
    const logPath = path.join(PROJECT_ROOT, '_desenvolvimento', 'img', 'icon-distribution-log.json');
    const logData = {
        timestamp: new Date().toISOString(),
        sourceDir: SOURCE_DIR,
        stats: stats,
        results: results,
    };

    try {
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
        log(`Log saved to: ${logPath}`, colors.dim);
    } catch (error) {
        log(`Could not save log: ${error.message}`, colors.yellow);
    }

    console.log('');
}

// Run
main();
