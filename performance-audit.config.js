/**
 * Configuração do Performance Audit Tool
 * 
 * Este arquivo é opcional. Se não existir, valores padrão serão usados.
 * Coloque na raiz do seu projeto.
 */

module.exports = {
  // URL para análise (opcional - será auto-detectada se omitida)
  // url: 'http://localhost:3000',
  
  // Porta do servidor (opcional - será auto-detectada)
  // port: 3000,
  
  // Diretório onde os relatórios serão salvos
  outputDir: './performance-reports',
  
  // Timeout para aguardar servidor iniciar (em milissegundos)
  serverTimeout: 30000,
  
  // Tentar iniciar servidor automaticamente se não estiver rodando
  autoStartServer: true,
  
  // Comandos npm para tentar iniciar servidor (em ordem de prioridade)
  // O primeiro que funcionar será usado
  serverCommands: [
    ['run', 'preview'],  // Vite preview
    ['run', 'start'],    // Next.js, CRA
    ['run', 'dev'],      // Desenvolvimento geral
    ['run', 'serve'],    // Vue CLI, outros
  ],
  
  // Diretórios onde procurar build para análise
  // O primeiro encontrado será usado
  buildDirs: [
    './dist',      // Vite, Vue CLI
    './build',     // Create React App
    './out',       // Next.js export
    './.next',     // Next.js
    './public',    // Fallback
  ],
  
  // Configuração do Lighthouse
  lighthouse: {
    extends: 'lighthouse:default',
    settings: {
      // Categorias a serem auditadas
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      
      // 'mobile' ou 'desktop'
      formFactor: 'desktop',
      
      // Throttling (simula conexão mais lenta)
      throttling: {
        rttMs: 40,                    // Latência de rede
        throughputKbps: 10240,        // Velocidade de download (10 Mbps)
        cpuSlowdownMultiplier: 1,     // Desaceleração de CPU (1 = sem desaceleração)
      },
      
      // Emulação de tela
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    },
  },
  
  // Thresholds mínimos para aprovação (0-100)
  thresholds: {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 90,
    largeFileSize: 500000, // 500KB - arquivos maiores que isso serão sinalizados
  },
  
  // Flags do Chrome (headless por padrão)
  // Use ['--no-sandbox', '--disable-gpu'] para ver o Chrome em ação
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  
  // Nível de log: 'ERROR', 'WARN', 'INFO', 'DEBUG'
  logLevel: 'INFO',
};

// ============================================================================
// EXEMPLOS DE CONFIGURAÇÕES PERSONALIZADAS
// ============================================================================

// Para Next.js:
/*
module.exports = {
  serverCommands: [
    ['run', 'start'],
    ['run', 'dev'],
  ],
  buildDirs: ['./.next', './out'],
  port: 3000,
};
*/

// Para Vue/Vite:
/*
module.exports = {
  serverCommands: [
    ['run', 'preview'],
    ['run', 'serve'],
  ],
  buildDirs: ['./dist'],
  port: 5173,
};
*/

// Para análise mobile:
/*
module.exports = {
  lighthouse: {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,  // 3G lento
        cpuSlowdownMultiplier: 4,
      },
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        disabled: false,
      },
    },
  },
};
*/

// Para thresholds mais rigorosos:
/*
module.exports = {
  thresholds: {
    performance: 95,
    accessibility: 95,
    'best-practices': 95,
    seo: 95,
    largeFileSize: 250000, // 250KB
  },
};
*/