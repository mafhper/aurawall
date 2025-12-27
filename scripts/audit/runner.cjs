/**
 * Universal Audit Runner
 * 
 * Orquestra a execução de auditorias (Lighthouse, OWASP ZAP, etc.) para múltiplos targets.
 * Suporta filtragem por ID ou tipo de target via argumentos de linha de comando.
 * 
 * Uso:
 *   node audit-runner.cjs                    # Executa todos os targets
 *   node audit-runner.cjs --filter=web       # Filtra por tipo
 *   node audit-runner.cjs -f=my-target-id    # Filtra por ID
 *   node audit-runner.cjs --verbose          # Modo detalhado
 * 
 * @requires ./config/audit.config.cjs
 * @requires ./core/run-audit.cjs
 */

const config = require('../config/audit.config.cjs');
const { runAudit } = require('../core/run-audit.cjs');

/**
 * Função principal que orquestra a execução das auditorias
 */
async function main() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║           UNIVERSAL AUDIT RUNNER              ║');
    console.log('╚═══════════════════════════════════════════════╝');

    // Parse de argumentos
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose') || args.includes('-v');
    const filterArg = args.find(a => a.startsWith('--filter=') || a.startsWith('-f='));
    const filter = filterArg ? filterArg.split('=')[1]?.trim() : null;

    // Validação de configuração
    if (!config.targets || !Array.isArray(config.targets)) {
        throw new Error('Configuração inválida: config.targets deve ser um array');
    }

    if (config.targets.length === 0) {
        console.warn('\n⚠️  Nenhum target configurado em audit.config.cjs');
        return;
    }

    // Validação de estrutura dos targets
    const invalidTargets = config.targets.filter(t => !t.id || !t.name || !t.type);
    if (invalidTargets.length > 0) {
        throw new Error(
            `Configuração inválida: ${invalidTargets.length} target(s) sem propriedades obrigatórias (id, name, type)`
        );
    }

    // Validação de filtro vazio
    if (filterArg && !filter) {
        console.error('\n❌ Erro: filtro vazio. Use --filter=VALOR ou -f=VALOR');
        process.exit(1);
    }

    // Aplicação de filtro
    let targetsToRun = config.targets;
    if (filter) {
        targetsToRun = config.targets.filter(t => t.id === filter || t.type === filter);
        console.log(`\nFiltro aplicado: "${filter}"`);

        if (targetsToRun.length === 0) {
            console.error(`\n❌ Nenhum target encontrado com filtro "${filter}"`);
            console.log('\nTargets disponíveis:');
            config.targets.forEach(t => console.log(` - ${t.id} (tipo: ${t.type})`));
            process.exit(1);
        }
    }

    console.log(`\nTargets encontrados: ${targetsToRun.length}`);
    if (verbose) {
        targetsToRun.forEach(t => console.log(` - ${t.name} (${t.type}) [${t.id}]`));
    } else {
        targetsToRun.forEach(t => console.log(` - ${t.name} (${t.type})`));
    }

    const results = [];
    const startTime = Date.now();
    const AUDIT_TIMEOUT = 300000; // 5 minutes per audit

    // Executa sequencialmente para evitar conflitos de porta e esgotamento de recursos
    for (let i = 0; i < targetsToRun.length; i++) {
        const target = targetsToRun[i];
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        console.log(`\n[${i + 1}/${targetsToRun.length}] [${timestamp}] Executando: ${target.name}...`);

        try {
            // Timeout wrapper para evitar travamentos
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout: auditoria excedeu ${AUDIT_TIMEOUT / 1000}s`)), AUDIT_TIMEOUT)
            );

            const result = await Promise.race([
                runAudit(target),
                timeoutPromise
            ]);
            results.push({ name: target.name, result });

            if (verbose && result.success) {
                console.log(`   ✓ Concluído`);
            }
        } catch (error) {
            // Captura erros individuais para não interromper outras auditorias
            const errorMessage = error.message || String(error);
            results.push({
                name: target.name,
                result: {
                    success: false,
                    error: errorMessage
                }
            });

            console.error(`   ✗ Falha: ${errorMessage}`);
        }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Resumo final
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║               RESUMO FINAL                    ║');
    console.log('╚═══════════════════════════════════════════════╝');

    let hasErrors = false;
    let successCount = 0;

    results.forEach(({ name, result }) => {
        if (result.success) {
            successCount++;
            console.log(`\n✅ ${name}`);
            console.log(`   Relatório: ${result.path}`);

            // Resumo de scores se disponível
            if (result.scores && Object.keys(result.scores).length > 0) {
                if (verbose) {
                    console.log('   Scores:');
                    Object.entries(result.scores).forEach(([k, v]) => {
                        console.log(`     • ${k}: ${v}`);
                    });
                } else {
                    const scores = Object.entries(result.scores)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                    console.log(`   Scores: ${scores}`);
                }
            }
        } else {
            hasErrors = true;
            console.log(`\n❌ ${name}`);

            // Limita tamanho da mensagem de erro (exceto em verbose)
            const errorMsg = (!verbose && result.error && result.error.length > 200)
                ? result.error.substring(0, 197) + '...'
                : result.error;
            console.log(`   Erro: ${errorMsg}`);
        }
    });

    // Estatísticas finais
    console.log(`\n${'='.repeat(49)}`);
    console.log(`Total: ${results.length} | Sucesso: ${successCount} | Falhas: ${results.length - successCount}`);
    console.log(`Tempo total: ${totalDuration}s`);
    console.log('═'.repeat(49));

    if (hasErrors) {
        process.exit(1);
    }
}

// Execução com tratamento de erros global
main().catch(error => {
    console.error('\n❌ Erro fatal na execução:');
    console.error(error);
    process.exit(1);
});
