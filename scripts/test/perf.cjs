const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');
const WARNING_THRESHOLD_MB = 5; // Total build size warning
const ERROR_THRESHOLD_MB = 10;  // Total build size error

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

console.log('Checking Build Performance (Bundle Size)...\n');

if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run build first.');
    process.exit(1);
}

const files = getAllFiles(DIST_DIR);
let totalSize = 0;

files.forEach(file => {
    const stats = fs.statSync(file);
    totalSize += stats.size;
});

const totalSizeMB = totalSize / (1024 * 1024);
console.log(`Total Build Size: ${totalSizeMB.toFixed(2)} MB`);
console.log(`File Count: ${files.length}`);

if (totalSizeMB > ERROR_THRESHOLD_MB) {
    console.error(`❌ Build exceeds error threshold (${ERROR_THRESHOLD_MB} MB).`);
    process.exit(1);
} else if (totalSizeMB > WARNING_THRESHOLD_MB) {
    console.warn(`⚠️ Build exceeds warning threshold (${WARNING_THRESHOLD_MB} MB).`);
    process.exit(0); // Pass but warn
} else {
    console.log('✅ Build size is within limits.');
    process.exit(0);
}