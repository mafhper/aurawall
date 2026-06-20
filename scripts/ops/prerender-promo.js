
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseFragment, serializeOuter } from 'parse5';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toAbsolute = (p) => path.resolve(__dirname, '../../', p);

const template = fs.readFileSync(toAbsolute('dist/client/index.html'), 'utf-8');
const headElementNames = new Set([
    'base',
    'link',
    'meta',
    'noscript',
    'script',
    'style',
    'template',
    'title'
]);

const createDocument = (renderedHtml) => {
    const fragment = parseFragment(renderedHtml);
    const headNodes = [];
    const appNodes = [];
    let appContentStarted = false;

    for (const node of fragment.childNodes) {
        const isEmptyText = node.nodeName === '#text' && !node.value.trim();
        const isHeadElement = node.tagName && headElementNames.has(node.tagName);

        if (!appContentStarted && (isEmptyText || isHeadElement)) {
            if (isHeadElement) {
                headNodes.push(node);
            }
            continue;
        }

        appContentStarted = true;
        appNodes.push(node);
    }

    const headHtml = headNodes.map((node) => serializeOuter(node)).join('');
    const appHtml = appNodes.map((node) => serializeOuter(node)).join('');

    return template
        .replace('<!--app-html-->', appHtml)
        .replace('</head>', `${headHtml}</head>`);
};

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
            const { html } = await render(fullUrl);
            const finalHtml = createDocument(html);

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

    // 404 for GitHub Pages - prerender the catch-all route
    try {
        const base = '/aurawall';
        const notFoundUrl = base + '/not-found-page'; // Any non-existent route triggers catch-all
        const { html } = await render(notFoundUrl);
        const finalHtml = createDocument(html);

        fs.writeFileSync(toAbsolute('dist/client/404.html'), finalHtml);
        console.log('✅ Prerendered: 404.html (NotFound page)');
    } catch (e) {
        console.error('❌ Failed to render 404.html:', e);
        // Fallback to copying index.html
        fs.copyFileSync(toAbsolute('dist/client/index.html'), toAbsolute('dist/client/404.html'));
        console.log('⚠️  Created 404.html from index.html (fallback)');
    }

})();
