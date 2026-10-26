const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REQUIRED_FILES = [
    'README.md',
    'package.json',
    'vite.config.ts',
    'tailwind.config.js',
    'src/App.tsx',
    'src/components/WallpaperRenderer.tsx',
    'docs/TECHNICAL_GUIDE.md'
];

const REQUIRED_DIRS = [
    'src',
    'public',
    'website',
    '.github'
];

// Os configs do Vite sao o unico lugar onde um import sem extensao funciona no dev
// e quebra no build (ou pior: funciona aqui e falha no clone limpo, quando o arquivo
// importado esta no .gitignore). Por isso os dois sao medidos: o arquivo precisa
// existir E o git precisa enxerga-lo.
const VITE_CONFIGS = [
    'vite.config.ts',
    'website/vite.config.ts'
];

// Extensoes que um import relativo pode omitir. `.ts` primeiro porque e' o que este
// projeto usa; o resto cobre a variacao comum do ecossistema.
const IMPORT_EXTENSIONS = ['.ts', '.js', '.mjs', '.cjs', '/index.ts', '/index.js'];

const RELATIVE_IMPORT = /\bfrom\s+['"](\.[^'"]*)['"]/g;

const ROOT = path.join(__dirname, '../..');

let hasError = false;
let gitUnavailable = false;

console.log('Checking File Structure...\n');

REQUIRED_FILES.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, '../../', file))) {
        console.error(`❌ Missing File: ${file}`);
        hasError = true;
    } else {
        console.log(`✅ Found File: ${file}`);
    }
});

REQUIRED_DIRS.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, '../../', dir))) {
        console.error(`❌ Missing Directory: ${dir}`);
        hasError = true;
    } else {
        console.log(`✅ Found Directory: ${dir}`);
    }
});

function resolveImport(configFile, specifier) {
    const base = path.resolve(path.dirname(path.join(ROOT, configFile)), specifier);
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
    for (const extension of IMPORT_EXTENSIONS) {
        const candidate = base + extension;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
}

// `git check-ignore -q` responde pelo exit code: 0 = ignorado, 1 = nao ignorado.
// Qualquer outro desfecho (git ausente, diretorio que nao e' repo) e' "nao medido",
// e nao "ignorado": o gate nunca reprova por falta de instrumento.
function checkGitIgnored(absolutePath) {
    const relativePath = path.relative(ROOT, absolutePath).split(path.sep).join('/');
    try {
        execFileSync('git', ['check-ignore', '-q', relativePath], { cwd: ROOT, stdio: 'ignore' });
        return { ignored: true, relativePath };
    } catch (error) {
        if (error.status === 1) return { ignored: false, relativePath };
        return { ignored: null, relativePath };
    }
}

console.log('Checking Vite Config Imports...\n');

VITE_CONFIGS.forEach(configFile => {
    if (!fs.existsSync(path.join(ROOT, configFile))) {
        console.error(`❌ Missing Vite Config: ${configFile}`);
        hasError = true;
        return;
    }

    const source = fs.readFileSync(path.join(ROOT, configFile), 'utf8');
    const specifiers = [...source.matchAll(RELATIVE_IMPORT)].map(match => match[1]);

    if (specifiers.length === 0) {
        console.log(`✅ No Relative Import: ${configFile}`);
        return;
    }

    specifiers.forEach(specifier => {
        const resolved = resolveImport(configFile, specifier);

        if (!resolved) {
            console.error(`❌ Unresolved Import: ${configFile} imports '${specifier}' but no file matches`);
            hasError = true;
            return;
        }

        const { ignored, relativePath } = checkGitIgnored(resolved);

        if (ignored === null) {
            gitUnavailable = true;
            return;
        }

        if (ignored) {
            console.error(`❌ Git Ignored Import: ${configFile} imports '${specifier}' but git ignores ${relativePath}`);
            hasError = true;
            return;
        }

        console.log(`✅ Resolved Import: ${configFile} imports '${specifier}' -> ${relativePath}`);
    });
});

if (gitUnavailable) {
    console.warn('⚠️  git unavailable: ignore check skipped (existence was still checked).');
}

if (hasError) {
    console.error('\nStructure check failed.');
    process.exit(1);
} else {
    console.log('\nStructure check passed.');
    process.exit(0);
}
