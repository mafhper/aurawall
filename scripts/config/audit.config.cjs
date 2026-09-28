
/**
 * Audit Configuration
 * Defines all targets to be audited by the Universal Audit Runner.
 *
 * ATENCAO aos thresholds: os valores abaixo sao calibrados para os SERVIDORES DE
 * DESENVOLVIMENTO (as urls daqui apontam para localhost). O bundle de dev do Vite e
 * maior e nao cacheia, entao `performance` low nao indica problema em producao.
 *
 * Para medir o que o usuario recebe de verdade, use o alvo de producao:
 *     AUDIT_URL=https://mafhper.github.io/aurawall npm run audit
 * e compare com os limites de producao que aparecem no README da camada de auditoria.
 */
module.exports = {
    // Global Settings
    global: {
        maxRetries: 2,
        timeout: 60000,
        outputDir: 'performance-reports',
    },

    // Audit Targets
    targets: [
        {
            id: 'promo',
            name: 'Landing Page (Promo)',
            url: 'http://localhost:5173/', // Vite dev default
            serverCommand: 'npm run promo',
            serverPort: 5173,
            type: 'promo', // Folder name in reports
            thresholds: {
                performance: 20, // Low for dev mode, high for prod
                accessibility: 90,
                'best-practices': 95,
                seo: 90
            }
        },
        {
            id: 'app',
            name: 'Dashboard App',
            url: 'http://localhost:3000/', // Main app default
            serverCommand: 'npm run app',
            serverPort: 3000,
            type: 'app',
            thresholds: {
                performance: 35,
                accessibility: 85,
                'best-practices': 95,
                seo: 85
            }
        }
    ]
};
