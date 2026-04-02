const { spawn } = require('child_process');

console.log('Checking Code Quality (Linting)...\n');

const child = process.platform === 'win32'
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', 'run', 'lint'], {
        stdio: 'inherit',
        shell: false,
        windowsVerbatimArguments: true,
    })
    : spawn('npm', ['run', 'lint'], {
        stdio: 'inherit',
        shell: false,
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
