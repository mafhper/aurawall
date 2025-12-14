
const config = require('./config/audit.config.cjs');
const { runAudit } = require('./core/run-audit.cjs');

async function main() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║           UNIVERSAL AUDIT RUNNER              ║');
    console.log('╚═══════════════════════════════════════════════╝');

    // Filter logic
    const args = process.argv.slice(2);
    const filterArg = args.find(a => a.startsWith('--filter=') || a.startsWith('-f='));
    const filter = filterArg ? filterArg.split('=')[1] : null;

    let targetsToRun = config.targets;
    if (filter) {
        targetsToRun = config.targets.filter(t => t.id === filter || t.type === filter);
        console.log(`\nFiltro aplicado: "${filter}"`);
    }

    console.log(`\nTargets encontrados: ${targetsToRun.length}`);
    targetsToRun.forEach(t => console.log(` - ${t.name} (${t.type})`));

    const results = [];

    // Run sequentially to avoid port conflicts and resource exhaustion
    for (const target of targetsToRun) {
        const result = await runAudit(target);
        results.push({ name: target.name, result });
    }

    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║               RESUMO FINAL                    ║');
    console.log('╚═══════════════════════════════════════════════╝');

    let hasErrors = false;
    results.forEach(({ name, result }) => {
        if (result.success) {
            console.log(`\n✅ ${name}`);
            console.log(`   Relatório: ${result.path}`);
            // Simple score summary
            const scores = Object.entries(result.scores)
                .map(([k, v]) => `${k}:${v}`)
                .join(', ');
            console.log(`   Scores: ${scores}`);
        } else {
            hasErrors = true;
            console.log(`\n❌ ${name}`);
            console.log(`   Erro: ${result.error}`);
        }
    });

    if (hasErrors) {
        process.exit(1);
    }
}

main();
