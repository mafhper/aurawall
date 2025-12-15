/**
 * Contrast Checker Script
 * 
 * Verifica o contraste de cores em arquivos CSS/TSX do projeto
 * seguindo as diretrizes WCAG 2.1 AA (4.5:1 para texto normal, 3:1 para texto grande)
 * 
 * Usage: node scripts/check-contrast.cjs [--fix]
 */

const fs = require('fs');
const path = require('path');

// ANSI Colors
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

// Common color pairs to check (foreground on background)
const KNOWN_PAIRS = [
    // Text colors on dark backgrounds
    { fg: '#71717a', bg: '#000000', name: 'zinc-500 on black' },           // text-zinc-500
    { fg: '#a1a1aa', bg: '#000000', name: 'zinc-400 on black' },           // text-zinc-400
    { fg: '#d4d4d8', bg: '#000000', name: 'zinc-300 on black' },           // text-zinc-300
    { fg: '#ffffff', bg: '#000000', name: 'white on black' },              // text-white
    { fg: '#a855f7', bg: '#000000', name: 'purple-400 on black' },         // text-purple-400
    { fg: '#3b82f6', bg: '#000000', name: 'blue-400 on black' },           // text-blue-400
    { fg: '#ec4899', bg: '#000000', name: 'pink-400 on black' },           // text-pink-400
    { fg: '#22c55e', bg: '#000000', name: 'green-400 on black' },          // text-green-400

    // Text on overlays (semi-transparent black approximations)
    { fg: '#71717a', bg: '#1a1a1a', name: 'zinc-500 on dark overlay' },
    { fg: '#a1a1aa', bg: '#1a1a1a', name: 'zinc-400 on dark overlay' },
    { fg: '#d4d4d8', bg: '#1a1a1a', name: 'zinc-300 on dark overlay' },

    // Cards with bg-zinc-900
    { fg: '#71717a', bg: '#18181b', name: 'zinc-500 on zinc-900' },
    { fg: '#a1a1aa', bg: '#18181b', name: 'zinc-400 on zinc-900' },
];

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Calculate relative luminance (WCAG formula)
function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio
function getContrastRatio(fg, bg) {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);

    if (!fgRgb || !bgRgb) return null;

    const L1 = getLuminance(fgRgb);
    const L2 = getLuminance(bgRgb);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return (lighter + 0.05) / (darker + 0.05);
}

// Check if ratio passes WCAG AA
function checkWcagAA(ratio, isLargeText = false) {
    const threshold = isLargeText ? 3 : 4.5;
    return {
        passes: ratio >= threshold,
        threshold,
        level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA-Large' : 'FAIL'
    };
}

// Find problematic color patterns in file content
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = [];

    // Pattern: text-zinc-500 or similar low-contrast grays without proper background
    const lowContrastPatterns = [
        { pattern: /text-zinc-500/g, color: '#71717a', name: 'zinc-500' },
        { pattern: /text-zinc-600/g, color: '#52525b', name: 'zinc-600' },
        { pattern: /text-gray-500/g, color: '#6b7280', name: 'gray-500' },
    ];

    lowContrastPatterns.forEach(({ pattern, color, name }) => {
        const matches = content.match(pattern);
        if (matches) {
            const ratio = getContrastRatio(color, '#000000');
            const check = checkWcagAA(ratio);
            if (!check.passes) {
                issues.push({
                    file: filePath,
                    color: name,
                    ratio: ratio.toFixed(2),
                    level: check.level,
                    count: matches.length
                });
            }
        }
    });

    return issues;
}

// Main execution
function main() {
    console.log(`\n${CYAN}${BOLD}═══════════════════════════════════════${RESET}`);
    console.log(`${CYAN}${BOLD}       WCAG Contrast Checker           ${RESET}`);
    console.log(`${CYAN}${BOLD}═══════════════════════════════════════${RESET}\n`);

    // Check known color pairs
    console.log(`${BOLD}Known Color Pairs:${RESET}\n`);

    let failCount = 0;
    let passCount = 0;

    KNOWN_PAIRS.forEach(pair => {
        const ratio = getContrastRatio(pair.fg, pair.bg);
        const check = checkWcagAA(ratio);

        const status = check.passes
            ? `${GREEN}✓ PASS${RESET}`
            : `${RED}✗ FAIL${RESET}`;

        const ratioStr = ratio.toFixed(2) + ':1';
        const levelStr = check.level;

        console.log(`  ${status} ${pair.name.padEnd(25)} ${ratioStr.padStart(7)} (${levelStr})`);

        if (check.passes) passCount++;
        else failCount++;
    });

    console.log(`\n${BOLD}Summary:${RESET}`);
    console.log(`  ${GREEN}Passed: ${passCount}${RESET}`);
    console.log(`  ${RED}Failed: ${failCount}${RESET}`);

    // Recommendations for common issues
    if (failCount > 0) {
        console.log(`\n${YELLOW}${BOLD}Recommendations:${RESET}`);
        console.log(`  • Use ${CYAN}text-zinc-400${RESET} instead of ${RED}text-zinc-500${RESET} for better contrast`);
        console.log(`  • Use ${CYAN}text-zinc-300${RESET} for descriptions on dark backgrounds`);
        console.log(`  • Minimum ratio: ${YELLOW}4.5:1${RESET} for normal text, ${YELLOW}3:1${RESET} for large text (18px+)`);
    }

    console.log(`\n${CYAN}═══════════════════════════════════════${RESET}\n`);

    return failCount === 0 ? 0 : 1;
}

// Export for use in health check
module.exports = {
    getContrastRatio,
    checkWcagAA,
    hexToRgb,
    KNOWN_PAIRS
};

// Run if called directly
if (require.main === module) {
    process.exit(main());
}
