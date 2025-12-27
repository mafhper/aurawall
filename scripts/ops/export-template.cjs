const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const TEMPLATE_DIR = path.join(PROJECT_ROOT, '_template');

// Configuration: Files and Directories to Copy
// relative to PROJECT_ROOT
const FILES_TO_COPY = [
    '.gitignore',
    'package.json',
    // Add other root files as needed, e.g., 'tsconfig.json', 'vite.config.ts' if generic
];

const DIRS_TO_COPY = [
    'scripts',
    '.github',
    'docs',
    'website', // Assuming this is the core app structure source
];

console.log(`Starting Template Export...`);
console.log(`Source: ${PROJECT_ROOT}`);
console.log(`Target: ${TEMPLATE_DIR}`);

// 1. Clean / Create Target Directory
if (fs.existsSync(TEMPLATE_DIR)) {
    console.log(`Cleaning existing template directory...`);
    fs.rmSync(TEMPLATE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TEMPLATE_DIR);


// 2. Copy Files
FILES_TO_COPY.forEach(file => {
    const src = path.join(PROJECT_ROOT, file);
    const dest = path.join(TEMPLATE_DIR, file);
    if (fs.existsSync(src)) {
        console.log(`Copying file: ${file}`);
        fs.copyFileSync(src, dest);
    } else {
        console.warn(`Warning: Source file not found: ${file}`);
    }
});

// 3. Copy Directories (Recursive)
DIRS_TO_COPY.forEach(dir => {
    const src = path.join(PROJECT_ROOT, dir);
    const dest = path.join(TEMPLATE_DIR, dir);
    if (fs.existsSync(src)) {
        console.log(`Copying directory: ${dir}`);
        fs.cpSync(src, dest, {
            recursive: true,
            filter: (source, destination) => {
                // Exclude node_modules, dist, .git, etc.
                if (source.includes('node_modules') || source.includes('dist') || source.includes('.git')) {
                    return false;
                }
                return true;
            }
        });
    } else {
        console.warn(`Warning: Source directory not found: ${dir}`);
    }
});

const readmeContent = `# Project Template (Core Export)

Este repositório contém o núcleo técnico exportado do projeto original, preservando a automação, scripts, workflows e estrutura base.

## 📂 Estrutura de Arquivos

Abaixo, a descrição funcional dos principais diretórios e arquivos:

### \`scripts/\` - Automação Centralizada
O "cérebro" do projeto. Scripts em Node.js para manutenção, auditoria e testes.

- **\`scripts/audit/\`**: Ferramentas de verificação de qualidade.
  - \`audit-runner.cjs\`: Core que executa o Lighthouse CI e valida métricas de performance/SEO.
  - \`runner-scheduler.js\`: Orquestrador para auditorias periódicas ou em batch.
- **\`scripts/ops/\`**: Operações de sistema e DevOps.
  - \`export-template.cjs\`: O script que gerou esta pasta.
- **\`scripts/test/\`**: Testes de integridade.
  - \`test-i18n.cjs\`: Valida chaves de tradução faltantes ou duplicadas.
  - \`health.cjs\`: Quick check do ambiente local.
- **\`scripts/core/\`**: Bibliotecas compartilhadas pelos scripts (logging, paths, utils).

### \`website/\` - Aplicação Front-end
O código-fonte da aplicação (Site Promo / Web App).
*(Estrutura típica Vite/React)*
- \`src/\`: Componentes, páginas e ganchos.
- \`public/\`: Assets estáticos.
- \`index.html\`: Ponto de entrada.

### \`.github/workflows/\` - CI/CD
Automação do GitHub Actions.
- \`deploy.yml\`: Workflow de build e deploy (geralmente para GitHub Pages). valida o build antes de publicar.

### \`docs/\` - Memória do Projeto
Documentação técnica e registros de decisão.
- \`docs/tasks.md\`: Controle de tarefas e backlog.
- \`docs/change.log\`: Histórico de mudanças.

---

## 🚀 Como Iniciar

### 1. Instalação
Este projeto utiliza scripts customizados na raiz que dependem de pacotes npm.
\`\`\`bash
# 1. Instale as dependências da RAIZ (scripts de automação)
npm install

# 2. Instale as dependências da APLICAÇÃO (website)
cd website
npm install
cd ..
\`\`\`

### 2. Verificação de Saúde
Rode o checklist rápido para garantir que o ambiente está pronto:
\`\`\`bash
npm run health:fast
\`\`\`

### 3. Desenvolvimento
Para rodar a aplicação localmente:
\`\`\`bash
# Inicia o servidor de desenvolvimento (Vite)
npm run dev
\`\`\`
*(Nota: verifique se o comando \`dev\` no \`package.json\` da raiz aponta para o workspace correto, ex: \`npm run dev --prefix website\`)*

---

## 🛠 Workflows e Padrões

### Repositório Unificado
Mantemos código da aplicação e scripts de automação no mesmo repo para facilitar a manutenção e CI/CD.

### Regras de Commit
- Use **Conventional Commits** (ex: \`feat: add new logo\`, \`fix: typo in readme\`).
- O workflow de deploy só é acionado em pushes para a branch \`main\` (configure no \`.yml\`).

### Performance Gate
Antes de commitar, é recomendado rodar:
\`\`\`bash
npm run audit
\`\`\`
Isso gera um relatório Lighthouse e avisa se a performance cair abaixo dos limites estabelecidos em \`scripts/config/audit-config.json\`.
`;

fs.writeFileSync(path.join(TEMPLATE_DIR, 'README.md'), readmeContent);
console.log(`Generated README.md`);

console.log(`\nTemplate export completed successfully at: ${TEMPLATE_DIR}`);
