const { spawn } = require('child_process');

console.log('Checking Code Quality (Linting)...\n');

const child = spawn('npm', ['run', 'lint'], {
    stdio: 'inherit',
    shell: true
});

child.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ Linting passed.');
        process.exit(0);
    } else {
        console.error('\n❌ Linting failed.');
        process.exit(1);
    }
});