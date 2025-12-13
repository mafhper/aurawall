const fs = require('fs');
const path = require('path');

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
    '_desenvolvimento',
    '.github'
];

let hasError = false;

console.log('Checking File Structure...\n');

REQUIRED_FILES.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, '..', file))) {
        console.error(`❌ Missing File: ${file}`);
        hasError = true;
    } else {
        console.log(`✅ Found File: ${file}`);
    }
});

REQUIRED_DIRS.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, '..', dir))) {
        console.error(`❌ Missing Directory: ${dir}`);
        hasError = true;
    } else {
        console.log(`✅ Found Directory: ${dir}`);
    }
});

if (hasError) {
    console.error('\nStructure check failed.');
    process.exit(1);
} else {
    console.log('\nStructure check passed.');
    process.exit(0);
}
