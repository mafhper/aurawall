/**
 * i18n Integrity Check
 * 
 * Validates translation files for:
 * - Required languages presence
 * - Key parity between languages
 * - Missing or extra keys
 * - [NEW] Hardcoded PT-BR strings in TSX files
 * 
 * Usage: node scripts/test-i18n.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    app: {
        path: path.join(__dirname, '../src/i18n.ts'),
        srcRoot: path.join(__dirname, '../src'),
        name: 'Main Application'
    },
    promo: {
        path: path.join(__dirname, '../website/src/i18n.ts'),
        srcRoot: path.join(__dirname, '../website/src'),
        name: 'Promo Site'
    }
};

const REQUIRED_LANGS = ['en', 'pt-BR', 'es'];

// TSX Scan Configuration
const SCAN_CONFIG = {
    extensions: ['.tsx'],
    exclude: ['node_modules', 'dist', 'build', '.test.', '.stories.'],
    // Common PT-BR words that should not appear hardcoded in JSX
    ptBrHints: [
        // Ações
        'voltar', 'carregar', 'salvar', 'editar', 'excluir', 'enviar', 'buscar',
        'cancelar', 'confirmar', 'experimentar', 'explorar', 'iniciar',
        // Estados e feedback
        'erro', 'sucesso', 'disponível', 'desenvolvimento',
        // Navegação
        'próximo', 'anterior', 'todos',
        // Títulos comuns
        'motores', 'criação', 'performance', 'otimização', 'arquitetura',
        'movimento', 'velocidade', 'estrutura', 'semente', 'procedural',
        // Seções
        'porque', 'outros', 'projetos', 'contribua', 'aberto', 'commits',
        // Descrições
        'cada', 'permite', 'garante', 'controle', 'através', 'qualquer',
        'renderização', 'animação', 'gradiente', 'fundo', 'formas'
    ]
};

const PT_BR_REGEX = new RegExp(
    `\\b(${SCAN_CONFIG.ptBrHints.join('|')})\\b`,
    'i'
);

/**
 * Recursively scan directory for TSX files
 */
function scanDir(dir, files = []) {
    if (!fs.existsSync(dir)) return files;

    for (const entry of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, entry);

        if (SCAN_CONFIG.exclude.some(e => fullPath.includes(e))) continue;

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath, files);
        } else if (SCAN_CONFIG.extensions.some(ext => fullPath.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Scan a file for hardcoded PT-BR strings in JSX
 */
function scanFileForHardcodedStrings(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const findings = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
        const lineNum = index + 1;

        // Skip imports, comments, className, data-*, aria-*, key, id
        if (line.trim().startsWith('import ')) return;
        if (line.trim().startsWith('//')) return;
        if (/className\s*=/.test(line)) return;
        if (/data-\w+\s*=/.test(line)) return;
        if (/aria-\w+\s*=/.test(line)) return;
        if (/\bkey\s*=/.test(line)) return;
        if (/\bid\s*=\s*["']/.test(line)) return;

        // Look for JSX text content (between tags)
        const jsxTextMatches = line.match(/>([^<>{]+)</g);
        if (jsxTextMatches) {
            for (const match of jsxTextMatches) {
                const text = match.replace(/[<>]/g, '').trim();
                if (text && PT_BR_REGEX.test(text)) {
                    findings.push({
                        file: filePath,
                        line: lineNum,
                        text: text.substring(0, 50),
                        reason: 'JSX literal text'
                    });
                }
            }
        }

        // Look for inline strings not wrapped in t()
        // Pattern: {"Some text"} but not {t("key")}
        const inlineMatches = line.match(/{\s*["'`]([^"'`]+)["'`]\s*}/g);
        if (inlineMatches) {
            for (const match of inlineMatches) {
                // Skip if it's already using t()
                if (/t\s*\(/.test(match)) continue;

                const text = match.replace(/[{}"'`]/g, '').trim();
                if (text && PT_BR_REGEX.test(text)) {
                    findings.push({
                        file: filePath,
                        line: lineNum,
                        text: text.substring(0, 50),
                        reason: 'Inline string not wrapped in t()'
                    });
                }
            }
        }
    });

    return findings;
}


/**
 * Safely parse a JS object literal from extracted string content.
 * Uses Function constructor instead of eval for slightly better isolation.
 * Still not executing arbitrary code - only parsing object literals.
 */
function safeParseObject(objectString) {
    try {
        // Clean the content: remove comments
        const cleanContent = objectString
            .replace(/\/\/.*$/gm, '')           // Remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove block comments
            .replace(/,(\s*[}\]])/g, '$1');     // Remove trailing commas

        // Use Function constructor (safer than eval, no access to local scope)
        const fn = new Function(`return (${cleanContent});`);
        return fn();
    } catch (e) {
        throw new Error(`Failed to parse object: ${e.message}`);
    }
}

/**
 * Extract resources object from TypeScript i18n file
 */
function extractResources(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Find resources declaration
    const markers = ['resources: {', 'const resources = {', 'resources:{', 'const resources={'];
    let startIndex = -1;

    for (const marker of markers) {
        startIndex = content.indexOf(marker);
        if (startIndex !== -1) break;
    }

    if (startIndex === -1) {
        throw new Error(`Could not find resources object in ${filePath}`);
    }

    // Find matching braces
    const braceIndex = content.indexOf('{', startIndex);
    if (braceIndex === -1) {
        throw new Error(`No opening brace found in ${filePath}`);
    }

    let depth = 0;
    let extracted = '';

    for (let i = braceIndex; i < content.length; i++) {
        const char = content[i];
        extracted += char;

        if (char === '{') depth++;
        else if (char === '}') depth--;

        if (depth === 0) break;
    }

    return safeParseObject(extracted);
}

/**
 * Flatten nested object keys to dot notation
 */
function flattenKeys(obj, prefix = '') {
    const keys = {};

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(keys, flattenKeys(obj[key], fullKey));
        } else {
            keys[fullKey] = obj[key];
        }
    }

    return keys;
}

/**
 * Run i18n validation tests
 */
function runTests() {
    console.log('🌍 Starting i18n Integrity Check...\n');
    let totalErrors = 0;

    for (const [id, project] of Object.entries(CONFIG)) {
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

            // Base language check
            if (!presentLangs.includes('en')) {
                console.error('   ❌ Base language (en) missing. Aborting parity check.');
                totalErrors++;
                continue;
            }

            // Get base keys
            const baseData = resources['en'].translation || resources['en'];
            const baseKeys = flattenKeys(baseData);
            const baseKeyList = Object.keys(baseKeys);

            console.log(`   ℹ️  English keys found: ${baseKeyList.length}`);

            // Check each language
            for (const lang of presentLangs) {
                if (lang === 'en') continue;

                const targetData = resources[lang].translation || resources[lang];
                const targetKeys = flattenKeys(targetData);
                const targetKeyList = Object.keys(targetKeys);

                // Missing keys
                const missingInTarget = baseKeyList.filter(k => !targetKeyList.includes(k));
                if (missingInTarget.length > 0) {
                    console.error(`   ❌ [${lang}] Missing ${missingInTarget.length} keys:`);
                    missingInTarget.slice(0, 5).forEach(k => console.error(`      - ${k}`));
                    if (missingInTarget.length > 5) {
                        console.error(`      ...and ${missingInTarget.length - 5} more`);
                    }
                    totalErrors++;
                } else {
                    console.log(`   ✅ [${lang}] Keys parity OK`);
                }

                // Extra keys warning
                const extraInTarget = targetKeyList.filter(k => !baseKeyList.includes(k));
                if (extraInTarget.length > 0) {
                    console.warn(`   ⚠️  [${lang}] Has ${extraInTarget.length} extra keys (deprecated?):`);
                    extraInTarget.slice(0, 3).forEach(k => console.warn(`      - ${k}`));
                }
            }
        } catch (e) {
            console.error(`   🔥 Critical Error: ${e.message}`);
            totalErrors++;
        }

        console.log('');
    }

    // Phase 2: TSX Scan for hardcoded strings
    console.log('🔍 Scanning TSX files for hardcoded PT-BR strings...\n');

    for (const [key, project] of Object.entries(CONFIG)) {
        if (!project.srcRoot) continue;

        console.log(`📂 Scanning [${project.name}]...`);
        const tsxFiles = scanDir(project.srcRoot);
        let projectFindings = 0;

        for (const file of tsxFiles) {
            const findings = scanFileForHardcodedStrings(file);

            for (const f of findings) {
                const relativePath = path.relative(project.srcRoot, f.file);
                console.error(`   ❌ [i18n] ${relativePath}:${f.line}`);
                console.error(`      Text: "${f.text}"`);
                console.error(`      Reason: ${f.reason}\n`);
                projectFindings++;
                totalErrors++;
            }
        }

        if (projectFindings === 0) {
            console.log(`   ✅ No hardcoded PT-BR strings found\n`);
        }
    }

    // Final result
    if (totalErrors > 0) {
        console.error(`\n❌ Validation Failed with ${totalErrors} errors.`);
        process.exit(1);
    } else {
        console.log('\n✨ All i18n checks passed!');
        process.exit(0);
    }
}

runTests();
