const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    app: {
        path: path.join(__dirname, '../src/i18n.ts'),
        name: 'Main Application'
    },
    promo: {
        path: path.join(__dirname, '../website/src/i18n.ts'),
        name: 'Promo Site'
    }
};

const REQUIRED_LANGS = ['en', 'pt-BR', 'es'];

// Helper to extract JSON-like object from TS file
function extractResources(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Improve extraction to handle both "resources: {" and "const resources = {"
    const markers = ['resources: {', 'const resources = {', 'resources:{', 'const resources={'];
    let startMarker = '';
    let startIndex = -1;

    for (const m of markers) {
        startIndex = content.indexOf(m);
        if (startIndex !== -1) {
            startMarker = m;
            break;
        }
    }

    if (startIndex === -1) {
        throw new Error(`Could not find resources object declaration in ${filePath}`);
    }

    let openBraces = 0;
    let extracted = '';
    let started = false;
    let endIndex = -1;

    // Start scanning from the opening brace
    // We find the first { after the start index to account for the marker itself
    let braceIndex = content.indexOf('{', startIndex);

    if (braceIndex === -1) {
        throw new Error(`Found marker '${startMarker}' but no opening brace following it.`);
    }

    for (let i = braceIndex; i < content.length; i++) {
        const char = content[i];

        if (char === '{') {
            openBraces++;
            started = true;
        } else if (char === '}') {
            openBraces--;
        }

        extracted += char;

        if (started && openBraces === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) {
        throw new Error('Could not find closing brace for resources object');
    }

    try {
        // Evaluate as a JS object
        // Note: This relies on the file content being valid JS syntax readable by eval
        // We might need to handle comments if they exist inside the object
        const cleanContent = extracted
            .replace(/\/\/.*/g, '') // Remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments

        return eval(`(${cleanContent})`);
    } catch (e) {
        throw new Error(`Failed to parse extracted resources: ${e.message}`);
    }
}

// Helper to flatten object keys to "key.subkey" format
function flattenKeys(obj, prefix = '') {
    let keys = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(keys, flattenKeys(obj[key], prefix + key + '.'));
        } else {
            keys[prefix + key] = obj[key];
        }
    }
    return keys;
}

function runTests() {
    console.log('🌍 Starting i18n Integrity Check...\n');
    let totalErrors = 0;

    Object.values(CONFIG).forEach(project => {
        console.log(`📦 checking [${project.name}]...`);
        try {
            const resources = extractResources(project.path);
            const presentLangs = Object.keys(resources);

            // Check required languages
            const missingLangs = REQUIRED_LANGS.filter(l => !presentLangs.includes(l));
            if (missingLangs.length > 0) {
                console.error(`   ❌ Missing required languages: ${missingLangs.join(', ')}`);
                totalErrors++;
            }

            // If EN is missing, we can't proceed with parity check
            if (!presentLangs.includes('en')) {
                console.error('   ❌ Base language (en) missing. Aborting parity check.');
                totalErrors++;
                return;
            }

            const baseKeys = flattenKeys(resources['en'].translation || resources['en']); // Handle nesting if 'translation' subkey exists
            const baseKeyList = Object.keys(baseKeys);

            console.log(`   ℹ️  English keys found: ${baseKeyList.length}`);

            presentLangs.forEach(lang => {
                if (lang === 'en') return;

                const targetData = resources[lang].translation || resources[lang];
                const targetKeys = flattenKeys(targetData);
                const targetKeyList = Object.keys(targetKeys);

                // Check for Missing Keys (in Target but not in Base) - strictly enforcing sync
                const missingInTarget = baseKeyList.filter(k => !targetKeyList.includes(k));

                if (missingInTarget.length > 0) {
                    console.error(`   ❌ [${lang}] Missing ${missingInTarget.length} keys:`);
                    missingInTarget.slice(0, 5).forEach(k => console.error(`      - ${k}`));
                    if (missingInTarget.length > 5) console.error(`      ...and ${missingInTarget.length - 5} more`);
                    totalErrors++;
                } else {
                    console.log(`   ✅ [${lang}] Keys parity OK`);
                }

                // Warn about Extra Keys (in Target but not in Base)
                const extraInTarget = targetKeyList.filter(k => !baseKeyList.includes(k));
                if (extraInTarget.length > 0) {
                    console.warn(`   ⚠️  [${lang}] Has ${extraInTarget.length} extra keys (deprecated?):`);
                    extraInTarget.slice(0, 3).forEach(k => console.warn(`      - ${k}`));
                }
            });

        } catch (e) {
            console.error(`   🔥 Critical Error: ${e.message}`);
            totalErrors++;
        }
        console.log(''); // spacer
    });

    if (totalErrors > 0) {
        console.error(`\n❌ Validation Failed with ${totalErrors} errors.`);
        process.exit(1);
    } else {
        console.log('\n✨ All i18n checks passed!');
        process.exit(0);
    }
}

runTests();
