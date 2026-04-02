
/**
 * Audit Configuration
 * Defines all targets to be audited by the Universal Audit Runner.
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
