
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toAbsolute = (p) => path.resolve(__dirname, '../', p);

const template = fs.readFileSync(toAbsolute('dist/client/index.html'), 'utf-8');

// Determine routes to prerender
const routes = [
    '/',
    '/creation',
    '/creation/engines',
    '/creation/animation',
    '/creation/procedural',
    '/architecture',
    '/changes',
    '/about'
];

(async () => {
    console.log('🏗️  Starting Prerender...');

    // Import the SSR entry point dynamically using file URL
    const entryPath = toAbsolute('dist/server/entry-server.js');
    const { render } = await import(pathToFileURL(entryPath).href);

    for (const url of routes) {
        try {
            const base = '/aurawall';
            // For home, use /aurawall/ (with trailing slash) to properly match basename
            const fullUrl = url === '/' ? base + '/' : base + url;
            const appHtml = await render(fullUrl); // Now async
            const { html, helmet } = appHtml;

            let finalHtml = template.replace('<!--app-html-->', html);

            // Inject Helmet head
            const helmetHead = `
          ${helmet.title ? helmet.title.toString() : ''}
          ${helmet.meta ? helmet.meta.toString() : ''}
          ${helmet.link ? helmet.link.toString() : ''}
        `;
            finalHtml = finalHtml.replace('</head>', `${helmetHead}</head>`);

            const filePath = toAbsolute(`dist/client${url === '/' ? '/index.html' : `${url}/index.html`}`);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filePath, finalHtml);
            console.log(`✅ Prerendered: ${url}`);
        } catch (e) {
            console.error(`❌ Failed to render ${url}:`, e);
            process.exit(1);
        }
    }

    // 404 for GitHub Pages
    fs.copyFileSync(toAbsolute('dist/client/index.html'), toAbsolute('dist/client/404.html'));
    console.log('✅ Created 404.html from index.html');

})();
