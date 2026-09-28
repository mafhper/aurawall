const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');
const CLIENT_CODE_WARNING_THRESHOLD_MB = 1.5;
const CLIENT_CODE_ERROR_THRESHOLD_MB = 2.5;
const STATIC_ASSET_WARNING_THRESHOLD_MB = 6;
const STATIC_ASSET_ERROR_THRESHOLD_MB = 10;

// O que o Pages publica é a RAIZ de dist/ (ver upload-pages-artifact no
// deploy.yml), e não `dist/app` + `dist/client`.
//
// Medir as subpastas era medir um shape que ninguém publica: o passo de
// flatten apagava `dist/client` depois da medição, de modo que 57 arquivos e
// 0,69 MB do payload do promo deixavam de ser contados — e o gate continuava
// verde nos dois casos. Além disso, o output do prerender (as páginas
// `about/`, `architecture/`, `changes/`, `creation/` e os `bg-*.svg`) vive na
// raiz e nunca foi medido por ninguém.
//
// Por isso o gate mede a raiz INTEIRA menos `dist/server`, que é o bundle SSR
// e vai para o Node, não para o navegador.
const SERVER_SUBDIR = 'server';
const EXCLUDED_TOP_LEVEL = new Set([SERVER_SUBDIR]);

function getAllFiles(dirPath, arrayOfFiles, excludeTopLevel) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const full = path.join(dirPath, file);
        if (fs.statSync(full).isDirectory()) {
            // `excludeTopLevel` só vale na raiz de dist/: dentro dela,
            // `server/` é o único diretório a pular.
            if (excludeTopLevel && excludeTopLevel.has(file)) return;
            arrayOfFiles = getAllFiles(full, arrayOfFiles, null);
        } else {
            arrayOfFiles.push(full);
        }
    });

    return arrayOfFiles;
}

function sumFiles(files) {
    return files.reduce((total, file) => total + fs.statSync(file).size, 0);
}

console.log('Checking Build Performance (Bundle Size)...\n');

if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run build first.');
    process.exit(1);
}

const clientFiles = getAllFiles(DIST_DIR, [], EXCLUDED_TOP_LEVEL);
const serverDir = path.join(DIST_DIR, SERVER_SUBDIR);
const serverFiles = fs.existsSync(serverDir) ? getAllFiles(serverDir) : [];
const clientCodeFiles = clientFiles.filter(file => ['.js', '.css'].includes(path.extname(file)));
const clientStaticFiles = clientFiles.filter(file => !['.js', '.css', '.html'].includes(path.extname(file)));

const clientCodeSizeMB = sumFiles(clientCodeFiles) / (1024 * 1024);
const clientStaticSizeMB = sumFiles(clientStaticFiles) / (1024 * 1024);
const serverSizeMB = sumFiles(serverFiles) / (1024 * 1024);

console.log(`Client Code Size: ${clientCodeSizeMB.toFixed(2)} MB`);
console.log(`Static Asset Size: ${clientStaticSizeMB.toFixed(2)} MB`);
console.log(`Server Bundle Size: ${serverSizeMB.toFixed(2)} MB`);
console.log(`Client File Count: ${clientFiles.length}`);
console.log(`Server File Count: ${serverFiles.length}`);
console.log(`Measured: everything in dist/ except dist/${SERVER_SUBDIR}/ (what Pages actually serves)`);

if (clientCodeSizeMB > CLIENT_CODE_ERROR_THRESHOLD_MB || clientStaticSizeMB > STATIC_ASSET_ERROR_THRESHOLD_MB) {
    console.error('❌ Build exceeds error thresholds.');
    process.exit(1);
} else if (clientCodeSizeMB > CLIENT_CODE_WARNING_THRESHOLD_MB || clientStaticSizeMB > STATIC_ASSET_WARNING_THRESHOLD_MB) {
    console.warn('⚠️ Build exceeds warning thresholds.');
    process.exit(0); // Pass but warn
} else {
    console.log('✅ Client bundle sizes are within limits.');
    process.exit(0);
}
