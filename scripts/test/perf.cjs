const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');
const CLIENT_CODE_WARNING_THRESHOLD_MB = 1.5;
const CLIENT_CODE_ERROR_THRESHOLD_MB = 2.5;
const STATIC_ASSET_WARNING_THRESHOLD_MB = 6;
const STATIC_ASSET_ERROR_THRESHOLD_MB = 10;
const CLIENT_DIRS = ['app', 'client'].map(dir => path.join(DIST_DIR, dir));
const SERVER_DIR = path.join(DIST_DIR, 'server');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
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

const clientFiles = CLIENT_DIRS.flatMap(dir => (fs.existsSync(dir) ? getAllFiles(dir) : []));
const serverFiles = fs.existsSync(SERVER_DIR) ? getAllFiles(SERVER_DIR) : [];
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
