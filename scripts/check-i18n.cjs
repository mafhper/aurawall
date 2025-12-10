
const fs = require('fs');
const path = require('path');

const I18N_PATH = path.join(__dirname, '../website/src/i18n.ts');

function checkI18n() {
    console.log('🔍 Checking i18n consistency...');

    if (!fs.existsSync(I18N_PATH)) {
        console.error('❌ i18n file not found at:', I18N_PATH);
        process.exit(1);
    }

    const content = fs.readFileSync(I18N_PATH, 'utf-8');

    // Extract resources object using regex - looking for "const resources = { ... };"
    // We'll capture everything between the first { after resources = and the last }; before i18n.use
    const resourceMatch = content.match(/const resources = ({[\s\S]*?});\s*i18n/);

    if (!resourceMatch) {
        console.error('❌ Could not extract resources object from i18n.ts');
        process.exit(1);
    }

    let resources;
    try {
        // Dangerous eval but acceptable for this local maintenance script on own code
        // We wrap it in parenthesis to ensure it evaluates as an expression
        resources = eval('(' + resourceMatch[1] + ')');
    } catch (e) {
        console.error('❌ Failed to parse resources object:', e.message);
        process.exit(1);
    }

    const languages = Object.keys(resources);
    const baseLang = 'en';

    if (!languages.includes(baseLang)) {
        console.error(`❌ Base language '${baseLang}' not found in resources.`);
        process.exit(1);
    }

    console.log(`📝 Found languages: ${languages.join(', ')}`);
    let hasErrors = false;

    // Helper to flatten object keys
    function flattenKeys(obj, prefix = '') {
        let keys = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(keys, flattenKeys(obj[key], prefix + key + '.'));
            } else {
                keys[prefix + key] = obj[key];
            }
        }
        return keys;
    }

    const baseKeys = flattenKeys(resources[baseLang]);

    languages.filter(l => l !== baseLang).forEach(lang => {
        console.log(`\n🔎 Checking '${lang}'...`);
        const targetKeys = flattenKeys(resources[lang]);

        // Check missing keys
        const missing = Object.keys(baseKeys).filter(k => !(k in targetKeys));
        if (missing.length > 0) {
            console.error(`  ❌ Missing ${missing.length} keys:`);
            missing.slice(0, 5).forEach(k => console.error(`     - ${k}`));
            if (missing.length > 5) console.error(`     ...and ${missing.length - 5} more.`);
            hasErrors = true;
        }

        // Check untranslated values (identical to English)
        // Ignore short values or common words causing false positives (like project names)
        const untranslated = Object.keys(targetKeys).filter(k => {
            const val = targetKeys[k];
            const baseVal = baseKeys[k];
            return val === baseVal && typeof val === 'string' && val.length > 3 && !k.includes('brand') && !k.includes('name');
        });

        if (untranslated.length > 0) {
            console.warn(`  ⚠️  ${untranslated.length} values identical to English (check if translation needed):`);
            untranslated.slice(0, 5).forEach(k => console.warn(`     - ${k}: "${targetKeys[k]}"`));
            if (untranslated.length > 5) console.warn(`     ...and ${untranslated.length - 5} more.`);
        }

        if (missing.length === 0 && untranslated.length === 0) {
            console.log(`  ✅ All good.`);
        }
    });

    if (hasErrors) {
        console.log('\n❌ Verification failed with errors.');
        process.exit(1);
    } else {
        console.log('\n✅ Verification passed! (Warnings may exist)');
    }
}

checkI18n();
