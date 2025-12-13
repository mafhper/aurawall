## 1. **Sistema de Links Curtos com GitHub Pages + JSON estático**
Você pode criar um sistema de "banco de dados" usando arquivos JSON no próprio repositório:
````js
/**
* Sistema de Links Curtos para AuraWall
*
* Utiliza arquivos JSON estáticos no GitHub Pages para armazenar configurações.
* Links curtos: https://mafhper.github.io/aurawall/app/#abc123
*
* Estrutura de pastas:
* /configs/
*   - index.json (índice de IDs)
*   - a/abc123.json (configurações divididas por primeira letra)
*
* Como funciona:
* 1. Usuário gera link compartilhável
* 2. Sistema cria hash único da configuração
* 3. Configuração é salva localmente (usuário faz commit manual ou via GitHub API)
* 4. Link curto usa apenas o hash
*/
class ShortURLSystem {
constructor(baseURL = 'https://mafhper.github.io/aurawall/configs/') {
this.baseURL = baseURL;
this.cache = new Map();
}
/**
* Gera ID curto a partir da configuração
* @param {Object} config - Objeto de configuração
* @returns {string} ID único de 6-8 caracteres
*/
generateShortID(config) {
const str = JSON.stringify(config);
let hash = 0;
for (let i = 0; i < str.length; i++) {
const char = str.charCodeAt(i);
hash = ((hash << 5) - hash) + char;
hash = hash & hash; // Convert to 32bit integer
}
// Converter para base36 e pegar primeiros 7 caracteres
const id = Math.abs(hash).toString(36).substring(0, 7);
return id;
}
/**
* Carrega configuração do servidor
* @param {string} shortID - ID curto
* @returns {Promise<Object|null>} Configuração ou null
*/
async loadConfig(shortID) {
// Verificar cache primeiro
if (this.cache.has(shortID)) {
return this.cache.get(shortID);
}
try {
const firstChar = shortID[0];
const url = `${this.baseURL}${firstChar}/${shortID}.json`;
const response = await fetch(url);
if (!response.ok) {
throw new Error(`Config not found: ${shortID}`);
}
const config = await response.json();
this.cache.set(shortID, config);
return config;
} catch (error) {
console.warn(`Falha ao carregar config ${shortID}:`, error);
return null;
}
}
/**
* Prepara JSON para salvar (usuário fará commit)
* @param {Object} config - Configuração
* @returns {Object} Objeto com ID e JSON formatado
*/
prepareForSave(config) {
const shortID = this.generateShortID(config);
const firstChar = shortID[0];
return {
shortID,
path: `configs/${firstChar}/${shortID}.json`,
content: JSON.stringify(config, null, 2),
url: this.generateURL(shortID)
};
}
/**
* Gera URL curta
* @param {string} shortID - ID curto
* @returns {string} URL completa
*/
generateURL(shortID) {
const baseURL = window.location.origin + window.location.pathname;
return `${baseURL}#${shortID}`;
}
/**
* Extrai ID da URL atual
* @returns {string|null} ID curto ou null
*/
getIDFromURL() {
const hash = window.location.hash.substring(1);
// Se tiver "cfg=", é URL antiga (LZ-String)
if (hash.includes('cfg=')) {
return null;
}
// Se for curto (6-8 chars), é novo sistema
if (hash.length >= 6 && hash.length <= 8 && /^[a-z0-9]+$/.test(hash)) {
return hash;
}
return null;
}
/**
* Carrega configuração da URL (suporta ambos formatos)
* @returns {Promise<Object|null>} Configuração ou null
*/
async loadFromURL() {
const shortID = this.getIDFromURL();
if (shortID) {
// Novo sistema (link curto)
return await this.loadConfig(shortID);
}
// Sistema antigo (LZ-String) - fallback
const hash = window.location.hash;
if (hash.includes('cfg=')) {
const compressed = hash.split('cfg=')[1].split('&')[0];
try {
const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
return decompressed ? JSON.parse(decompressed) : null;
} catch (e) {
console.error('Erro ao descomprimir URL antiga:', e);
return null;
}
}
return null;
}
}
// Interface para o usuário
class URLShareUI {
constructor() {
this.urlSystem = new ShortURLSystem();
}
/**
* Gera link compartilhável com UI
* @param {Object} config - Configuração atual
*/
async shareConfig(config) {
const saveData = this.urlSystem.prepareForSave(config);
// Mostrar instruções para o usuário
const instructions = `
📋 Link curto gerado: ${saveData.url}
⚠️ IMPORTANTE: Para ativar este link, você precisa:
1. Criar o arquivo: ${saveData.path}
2. Com o conteúdo abaixo
3. Fazer commit no seu repositório GitHub
Conteúdo do arquivo:
${saveData.content}
💡 Dica: Você pode automatizar isso com GitHub Actions!
`.trim();
console.log(instructions);
// Copiar URL para clipboard
try {
await navigator.clipboard.writeText(saveData.url);
alert('✅ Link curto copiado!\n\nVeja o console para instruções de como ativá-lo.');
} catch (e) {
alert(instructions);
}
return saveData;
}
/**
* Carrega configuração ao iniciar app
* @returns {Promise<Object|null>}
*/
async loadOnStart() {
const config = await this.urlSystem.loadFromURL();
if (config) {
console.log('✅ Configuração carregada do link');
return config;
}
console.log('ℹ️ Nenhuma configuração na URL');
return null;
}
}
// Uso no seu app:
const shareUI = new URLShareUI();
// Ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
const config = await shareUI.loadOnStart();
if (config) {
// Aplicar configuração carregada
applyConfig(config);
}
});
// Ao compartilhar
async function handleShare(currentConfig) {
const saveData = await shareUI.shareConfig(currentConfig);
// Opcionalmente, baixar o arquivo JSON automaticamente
downloadJSON(saveData.path, saveData.content);
}
/**
* Baixa arquivo JSON para o usuário fazer upload manual
*/
function downloadJSON(filename, content) {
const blob = new Blob([content], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
}
// Exportar
if (typeof module !== 'undefined' && module.exports) {
module.exports = { ShortURLSystem, URLShareUI };
}
````
## 2. **Solução Híbrida: GitHub Gists (Mais Automática)**## Comparação das Soluções:
````js
/**
* Sistema de Links Curtos usando GitHub Gists
*
* Permite salvar configurações automaticamente em Gists públicos.
* O usuário precisa fornecer um Personal Access Token (apenas uma vez).
*
* Vantagens:
* - Totalmente automático
* - Gratuito
* - Hospedado pelo GitHub
* - Sem limite de armazenamento
*
* Links ficam: https://mafhper.github.io/aurawall/app/#g:abc123def
*/
class GistURLSystem {
constructor() {
this.apiBase = 'https://api.github.com';
this.token = this.loadToken();
}
/**
* Salva token no localStorage
* @param {string} token - GitHub Personal Access Token
*/
saveToken(token) {
localStorage.setItem('github_token', token);
this.token = token;
}
/**
* Carrega token do localStorage
* @returns {string|null}
*/
loadToken() {
return localStorage.getItem('github_token');
}
/**
* Verifica se tem token configurado
* @returns {boolean}
*/
hasToken() {
return !!this.token;
}
/**
* Cria um Gist público com a configuração
* @param {Object} config - Configuração
* @param {string} description - Descrição opcional
* @returns {Promise<Object>} Objeto com gistId e URL
*/
async createGist(config, description = 'AuraWall Configuration') {
if (!this.hasToken()) {
throw new Error('GitHub token não configurado');
}
const filename = `aurawall-${Date.now()}.json`;
const content = JSON.stringify(config, null, 2);
try {
const response = await fetch(`${this.apiBase}/gists`, {
method: 'POST',
headers: {
'Authorization': `token ${this.token}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
description,
public: true,
files: {
[filename]: {
content
}
}
})
});
if (!response.ok) {
throw new Error(`GitHub API error: ${response.status}`);
}
const gist = await response.json();
const gistId = gist.id;
return {
gistId,
url: this.generateURL(gistId),
gistURL: gist.html_url,
rawURL: gist.files[filename].raw_url
};
} catch (error) {
console.error('Erro ao criar Gist:', error);
throw error;
}
}
/**
* Carrega configuração de um Gist
* @param {string} gistId - ID do Gist
* @returns {Promise<Object>} Configuração
*/
async loadGist(gistId) {
try {
const response = await fetch(`${this.apiBase}/gists/${gistId}`);
if (!response.ok) {
throw new Error(`Gist not found: ${gistId}`);
}
const gist = await response.json();
const firstFile = Object.values(gist.files)[0];
if (!firstFile) {
throw new Error('Gist vazio');
}
// Carregar conteúdo raw
const rawResponse = await fetch(firstFile.raw_url);
const config = await rawResponse.json();
return config;
} catch (error) {
console.error('Erro ao carregar Gist:', error);
throw error;
}
}
/**
* Gera URL curta com Gist ID
* @param {string} gistId - ID do Gist
* @returns {string} URL completa
*/
generateURL(gistId) {
const baseURL = window.location.origin + window.location.pathname;
return `${baseURL}#g:${gistId}`;
}
/**
* Extrai Gist ID da URL
* @returns {string|null}
*/
getGistIDFromURL() {
const hash = window.location.hash.substring(1);
if (hash.startsWith('g:')) {
return hash.substring(2);
}
return null;
}
/**
* Carrega configuração da URL
* @returns {Promise<Object|null>}
*/
async loadFromURL() {
const gistId = this.getGistIDFromURL();
if (gistId) {
try {
return await this.loadGist(gistId);
} catch (error) {
console.error('Falha ao carregar da URL:', error);
return null;
}
}
return null;
}
}
/**
* Interface completa com UI
*/
class GistShareUI {
constructor() {
this.gistSystem = new GistURLSystem();
this.setupUI();
}
/**
* Configura interface de token
*/
setupUI() {
// Criar modal para configurar token (primeira vez)
if (!this.gistSystem.hasToken()) {
this.showTokenSetup();
}
}
/**
* Mostra modal para configurar token
*/
showTokenSetup() {
const hasToken = this.gistSystem.hasToken();
if (!hasToken) {
console.log(`
⚙️ CONFIGURAÇÃO NECESSÁRIA
Para usar links curtos automáticos, você precisa:
1. Criar um Personal Access Token no GitHub:
https://github.com/settings/tokens/new
2. Permissões necessárias: apenas "gist"
3. Salvar o token usando:
shareUI.gistSystem.saveToken('seu_token_aqui')
💡 O token fica salvo localmente no seu navegador.
`);
}
}
/**
* Compartilha configuração criando Gist
* @param {Object} config - Configuração atual
* @returns {Promise<Object>}
*/
async shareConfig(config) {
if (!this.gistSystem.hasToken()) {
throw new Error('Configure o GitHub token primeiro');
}
try {
console.log('🔄 Criando link curto...');
const result = await this.gistSystem.createGist(config);
// Copiar para clipboard
await navigator.clipboard.writeText(result.url);
console.log('✅ Link criado e copiado!');
console.log('Link curto:', result.url);
console.log('Gist público:', result.gistURL);
return result;
} catch (error) {
console.error('❌ Erro ao compartilhar:', error);
throw error;
}
}
/**
* Carrega configuração ao iniciar
* @returns {Promise<Object|null>}
*/
async loadOnStart() {
try {
const config = await this.gistSystem.loadFromURL();
if (config) {
console.log('✅ Configuração carregada do Gist');
return config;
}
} catch (error) {
console.error('❌ Erro ao carregar configuração:', error);
}
return null;
}
}
// Exemplo de uso completo:
// Inicializar
const shareUI = new GistShareUI();
// Configurar token (apenas primeira vez)
// shareUI.gistSystem.saveToken('ghp_seu_token_aqui');
// Carregar ao iniciar página
window.addEventListener('DOMContentLoaded', async () => {
const config = await shareUI.loadOnStart();
if (config) {
applyConfig(config);
}
});
// Compartilhar configuração
async function handleShare(currentConfig) {
try {
const result = await shareUI.shareConfig(currentConfig);
alert(`Link copiado: ${result.url}`);
} catch (error) {
if (error.message.includes('token')) {
alert('Configure seu GitHub token primeiro. Veja o console.');
shareUI.showTokenSetup();
} else {
alert('Erro ao criar link: ' + error.message);
}
}
}
// Exportar
if (typeof module !== 'undefined' && module.exports) {
module.exports = { GistURLSystem, GistShareUI };
}
````
| Solução | Tamanho do Link | Automático | Complexidade |
|---------|----------------|------------|--------------|
| **LZ-String atual** | ~200 chars | ✅ Sim | Baixa |
| **JSON estático** | ~15 chars | ❌ Manual | Média |
| **GitHub Gists** | ~20 chars | ✅ Sim | Média |
## Recomendação:
Para o seu caso, sugiro **usar GitHub Gists** porque:
- ✅ Links ficam 90% menores (`#g:abc123def` vs `#cfg=N4Ig7glg...`)
- ✅ Totalmente automático para o usuário
- ✅ Gratuito e hospedado pelo GitHub
- ✅ Você mantém controle total
- ✅ Compatível com o sistema atual (pode manter LZ-String como fallback)
Segue uma sugestão de integração:
````js
/**
* AuraWall - Sistema Completo de Links Curtos
*
* Integração híbrida que suporta:
* 1. Links curtos via GitHub Gists (automático)
* 2. Links comprimidos via LZ-String (fallback)
*
* Arquitetura:
* - Detecta automaticamente o tipo de link na URL
* - Prioriza Gists para novos compartilhamentos
* - Mantém compatibilidade com links antigos LZ-String
*
* @author AuraWall Team
* @version 2.0.0
*/
class AuraWallURLManager {
constructor() {
this.gistAPI = 'https://api.github.com';
this.token = this.loadToken();
this.cache = new Map();
// Configuração
this.config = {
useGists: true, // Preferir Gists se token disponível
cacheDuration: 3600000, // 1 hora em ms
maxCacheSize: 50
};
}
// ============================================
// GERENCIAMENTO DE TOKEN
// ============================================
/**
* Salva GitHub token localmente
* @param {string} token - Personal Access Token
*/
saveToken(token) {
if (!token || token.length < 20) {
throw new Error('Token inválido');
}
localStorage.setItem('aurawall_github_token', token);
this.token = token;
console.log('✅ Token salvo com sucesso');
}
/**
* Carrega token do localStorage
* @returns {string|null}
*/
loadToken() {
return localStorage.getItem('aurawall_github_token');
}
/**
* Remove token
*/
clearToken() {
localStorage.removeItem('aurawall_github_token');
this.token = null;
console.log('🗑️ Token removido');
}
/**
* Verifica se tem token válido
* @returns {boolean}
*/
hasToken() {
return !!this.token && this.token.length > 20;
}
// ============================================
// SISTEMA DE GISTS (LINKS CURTOS)
// ============================================
/**
* Cria Gist público com configuração
* @param {Object} config - Configuração do wallpaper
* @returns {Promise<Object>} Dados do link criado
*/
async createGist(config) {
if (!this.hasToken()) {
throw new Error('TOKEN_REQUIRED');
}
const timestamp = Date.now();
const filename = `aurawall-${timestamp}.json`;
const content = JSON.stringify(config, null, 2);
try {
const response = await fetch(`${this.gistAPI}/gists`, {
method: 'POST',
headers: {
'Authorization': `token ${this.token}`,
'Content-Type': 'application/json',
'Accept': 'application/vnd.github.v3+json'
},
body: JSON.stringify({
description: `AuraWall Configuration - ${new Date().toISOString()}`,
public: true,
files: {
[filename]: { content }
}
})
});
if (!response.ok) {
const error = await response.json();
throw new Error(`GitHub API: ${error.message || response.status}`);
}
const gist = await response.json();
return {
type: 'gist',
gistId: gist.id,
shortURL: this.generateGistURL(gist.id),
gistURL: gist.html_url,
rawURL: gist.files[filename].raw_url,
timestamp
};
} catch (error) {
console.error('Erro ao criar Gist:', error);
throw error;
}
}
/**
* Carrega configuração de um Gist
* @param {string} gistId - ID do Gist
* @returns {Promise<Object>} Configuração
*/
async loadGist(gistId) {
// Verificar cache primeiro
const cached = this.getFromCache(`gist:${gistId}`);
if (cached) {
return cached;
}
try {
const response = await fetch(`${this.gistAPI}/gists/${gistId}`, {
headers: {
'Accept': 'application/vnd.github.v3+json'
}
});
if (!response.ok) {
throw new Error(`Gist não encontrado: ${gistId}`);
}
const gist = await response.json();
const firstFile = Object.values(gist.files)[0];
if (!firstFile) {
throw new Error('Gist vazio');
}
// Carregar conteúdo
const rawResponse = await fetch(firstFile.raw_url);
const config = await rawResponse.json();
// Adicionar ao cache
this.addToCache(`gist:${gistId}`, config);
return config;
} catch (error) {
console.error('Erro ao carregar Gist:', error);
throw error;
}
}
/**
* Gera URL curta com Gist ID
* @param {string} gistId - ID do Gist
* @returns {string}
*/
generateGistURL(gistId) {
const base = window.location.origin + window.location.pathname;
return `${base}#g:${gistId}`;
}
// ============================================
// SISTEMA LZ-STRING (FALLBACK)
// ============================================
/**
* Cria link comprimido com LZ-String
* @param {Object} config - Configuração
* @returns {Object}
*/
createCompressedURL(config) {
const compressed = LZString.compressToEncodedURIComponent(
JSON.stringify(config)
);
const base = window.location.origin + window.location.pathname;
const url = `${base}#cfg=${compressed}`;
return {
type: 'compressed',
compressedURL: url,
size: url.length,
timestamp: Date.now()
};
}
/**
* Descomprime configuração LZ-String
* @param {string} compressed - String comprimida
* @returns {Object|null}
*/
decompressConfig(compressed) {
try {
const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
if (!decompressed) return null;
return JSON.parse(decompressed);
} catch (error) {
console.error('Erro ao descomprimir:', error);
return null;
}
}
// ============================================
// GERENCIAMENTO DE CACHE
// ============================================
/**
* Adiciona item ao cache
* @param {string} key - Chave
* @param {Object} value - Valor
*/
addToCache(key, value) {
// Limpar cache se estiver cheio
if (this.cache.size >= this.config.maxCacheSize) {
const firstKey = this.cache.keys().next().value;
this.cache.delete(firstKey);
}
this.cache.set(key, {
value,
timestamp: Date.now()
});
}
/**
* Recupera item do cache
* @param {string} key - Chave
* @returns {Object|null}
*/
getFromCache(key) {
const cached = this.cache.get(key);
if (!cached) return null;
// Verificar expiração
const age = Date.now() - cached.timestamp;
if (age > this.config.cacheDuration) {
this.cache.delete(key);
return null;
}
return cached.value;
}
/**
* Limpa cache
*/
clearCache() {
this.cache.clear();
console.log('🗑️ Cache limpo');
}
// ============================================
// INTERFACE PÚBLICA
// ============================================
/**
* Cria link compartilhável (escolhe melhor método)
* @param {Object} config - Configuração
* @returns {Promise<Object>}
*/
async createShareLink(config) {
// Tentar Gist primeiro se token disponível
if (this.config.useGists && this.hasToken()) {
try {
const result = await this.createGist(config);
console.log('✅ Link curto criado:', result.shortURL);
return result;
} catch (error) {
console.warn('⚠️ Falha ao criar Gist, usando compressão:', error.message);
// Fallback para compressão
}
}
// Fallback: usar LZ-String
const result = this.createCompressedURL(config);
console.log('✅ Link comprimido criado:', result.compressedURL);
return result;
}
/**
* Carrega configuração da URL atual
* @returns {Promise<Object|null>}
*/
async loadFromURL() {
const hash = window.location.hash.substring(1);
if (!hash) {
return null;
}
// Detectar tipo de link
if (hash.startsWith('g:')) {
// Link Gist
const gistId = hash.substring(2).split('&')[0];
console.log('📥 Carregando do Gist:', gistId);
try {
return await this.loadGist(gistId);
} catch (error) {
console.error('❌ Erro ao carregar Gist:', error);
return null;
}
}
else if (hash.startsWith('cfg=')) {
// Link comprimido
const compressed = hash.split('cfg=')[1].split('&')[0];
console.log('📥 Carregando link comprimido');
return this.decompressConfig(compressed);
}
return null;
}
/**
* Copia link para área de transferência
* @param {string} url - URL para copiar
* @returns {Promise<boolean>}
*/
async copyToClipboard(url) {
try {
await navigator.clipboard.writeText(url);
return true;
} catch (error) {
console.error('Erro ao copiar:', error);
return false;
}
}
// ============================================
// UTILITÁRIOS
// ============================================
/**
* Retorna estatísticas do sistema
* @returns {Object}
*/
getStats() {
return {
hasToken: this.hasToken(),
cacheSize: this.cache.size,
usingGists: this.config.useGists && this.hasToken()
};
}
/**
* Exibe instruções de configuração
*/
showSetupInstructions() {
console.log(`
╔════════════════════════════════════════════════════════════╗
║          AURAWALL - CONFIGURAÇÃO DE LINKS CURTOS           ║
╚════════════════════════════════════════════════════════════╝
🎯 Para usar links curtos automáticos:
1️⃣ Crie um Personal Access Token no GitHub:
https://github.com/settings/tokens/new
2️⃣ Permissões necessárias: apenas "gist"
3️⃣ Salve o token no console:
urlManager.saveToken('ghp_seu_token_aqui')
✅ Pronto! Seus próximos compartilhamentos usarão links curtos.
💡 Sem token? O sistema usa compressão automática (links maiores).
📊 Status atual: ${this.hasToken() ? '✅ Token configurado' : '⚠️ Sem token'}
`);
}
}
// ============================================
// INSTÂNCIA GLOBAL
// ============================================
const urlManager = new AuraWallURLManager();
// ============================================
// INTEGRAÇÃO COM SEU APP
// ============================================
/**
* Inicialização automática ao carregar página
*/
window.addEventListener('DOMContentLoaded', async () => {
console.log('🎨 AuraWall - Sistema de URLs carregado');
// Mostrar instruções se não tiver token
if (!urlManager.hasToken()) {
console.log('ℹ️ Links curtos disponíveis! Use urlManager.showSetupInstructions()');
}
// Tentar carregar configuração da URL
try {
const config = await urlManager.loadFromURL();
if (config) {
console.log('✅ Configuração carregada da URL');
// Aplicar configuração no seu app
if (typeof applyConfiguration === 'function') {
applyConfiguration(config);
} else if (typeof window.applyConfig === 'function') {
window.applyConfig(config);
} else {
console.warn('⚠️ Função applyConfiguration não encontrada');
console.log('Configuração carregada:', config);
}
}
} catch (error) {
console.error('❌ Erro ao carregar configuração:', error);
}
});
/**
* Função auxiliar para compartilhar
* @param {Object} config - Configuração atual
* @returns {Promise<string>} URL criada
*/
async function shareAuraWall(config) {
try {
const result = await urlManager.createShareLink(config);
const url = result.shortURL || result.compressedURL;
// Copiar para clipboard
const copied = await urlManager.copyToClipboard(url);
if (copied) {
console.log('✅ Link copiado para área de transferência!');
// Mostrar notificação visual se disponível
if (typeof showNotification === 'function') {
showNotification('Link copiado!', 'success');
}
}
return url;
} catch (error) {
console.error('❌ Erro ao compartilhar:', error);
if (error.message === 'TOKEN_REQUIRED') {
urlManager.showSetupInstructions();
}
throw error;
}
}
// Exportar para uso global
window.urlManager = urlManager;
window.shareAuraWall = shareAuraWall;
// Exportar módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
module.exports = { AuraWallURLManager, urlManager, shareAuraWall };
}
````
Arquivo HTML de exemplo para integração:
````html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AuraWall - Sistema de Links Curtos</title>
<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}
body {
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
padding: 20px;
color: #fff;
}
.container {
max-width: 800px;
width: 100%;
}
.header {
text-align: center;
margin-bottom: 40px;
}
.header h1 {
font-size: 3em;
margin-bottom: 10px;
text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
.header p {
font-size: 1.2em;
opacity: 0.9;
}
.card {
background: rgba(255, 255, 255, 0.95);
border-radius: 20px;
padding: 30px;
margin-bottom: 20px;
box-shadow: 0 20px 60px rgba(0,0,0,0.3);
color: #333;
}
.card h2 {
color: #667eea;
margin-bottom: 20px;
font-size: 1.8em;
}
.status {
display: flex;
align-items: center;
gap: 10px;
padding: 15px;
background: #f5f5f5;
border-radius: 10px;
margin-bottom: 20px;
}
.status-indicator {
width: 12px;
height: 12px;
border-radius: 50%;
animation: pulse 2s infinite;
}
.status-indicator.active {
background: #22c55e;
}
.status-indicator.inactive {
background: #ef4444;
}
@keyframes pulse {
0%, 100% { opacity: 1; }
50% { opacity: 0.5; }
}
.button {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
border: none;
padding: 15px 30px;
border-radius: 10px;
font-size: 1.1em;
cursor: pointer;
transition: all 0.3s ease;
margin: 5px;
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
.button:hover {
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
.button:active {
transform: translateY(0);
}
.button.secondary {
background: #6b7280;
}
.input-group {
margin-bottom: 20px;
}
.input-group label {
display: block;
margin-bottom: 8px;
font-weight: 600;
color: #374151;
}
.input-group input {
width: 100%;
padding: 12px;
border: 2px solid #e5e7eb;
border-radius: 8px;
font-size: 1em;
transition: border-color 0.3s;
}
.input-group input:focus {
outline: none;
border-color: #667eea;
}
.demo-config {
background: #f9fafb;
padding: 15px;
border-radius: 8px;
border-left: 4px solid #667eea;
font-family: 'Courier New', monospace;
font-size: 0.9em;
overflow-x: auto;
margin: 15px 0;
}
.notification {
position: fixed;
top: 20px;
right: 20px;
padding: 15px 25px;
border-radius: 10px;
background: white;
box-shadow: 0 10px 30px rgba(0,0,0,0.3);
display: none;
animation: slideIn 0.3s ease;
z-index: 1000;
}
@keyframes slideIn {
from {
transform: translateX(400px);
opacity: 0;
}
to {
transform: translateX(0);
opacity: 1;
}
}
.notification.success {
border-left: 4px solid #22c55e;
color: #166534;
}
.notification.error {
border-left: 4px solid #ef4444;
color: #991b1b;
}
.notification.show {
display: block;
}
.stats {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 15px;
margin-top: 20px;
}
.stat-card {
background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
padding: 15px;
border-radius: 10px;
text-align: center;
}
.stat-card .number {
font-size: 2em;
font-weight: bold;
color: #667eea;
}
.stat-card .label {
font-size: 0.9em;
color: #6b7280;
margin-top: 5px;
}
.instructions {
background: #fef3c7;
border: 2px solid #fbbf24;
border-radius: 10px;
padding: 20px;
margin-top: 20px;
}
.instructions h3 {
color: #92400e;
margin-bottom: 10px;
}
.instructions ol {
margin-left: 20px;
color: #78350f;
}
.instructions li {
margin: 8px 0;
}
.instructions a {
color: #667eea;
text-decoration: none;
font-weight: 600;
}
.instructions a:hover {
text-decoration: underline;
}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>🎨 AuraWall</h1>
<p>Sistema de Links Curtos para Compartilhamento</p>
</div>
<!-- Status Card -->
<div class="card">
<h2>📊 Status do Sistema</h2>
<div class="status">
<div class="status-indicator" id="statusIndicator"></div>
<span id="statusText">Verificando...</span>
</div>
<div class="stats">
<div class="stat-card">
<div class="number" id="cacheSize">0</div>
<div class="label">Items em Cache</div>
</div>
<div class="stat-card">
<div class="number" id="linkType">-</div>
<div class="label">Tipo de Link</div>
</div>
</div>
</div>
<!-- Token Configuration -->
<div class="card" id="tokenCard">
<h2>🔑 Configuração de Token</h2>
<div class="input-group">
<label for="tokenInput">GitHub Personal Access Token</label>
<input
type="password"
id="tokenInput"
placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
>
</div>
<button class="button" onclick="saveToken()">💾 Salvar Token</button>
<button class="button secondary" onclick="clearToken()">🗑️ Remover Token</button>
<div class="instructions">
<h3>📝 Como obter o token:</h3>
<ol>
<li>Acesse: <a href="https://github.com/settings/tokens/new" target="_blank">GitHub Tokens</a></li>
<li>Dê um nome (ex: "AuraWall Links")</li>
<li>Selecione apenas a permissão: <strong>gist</strong></li>
<li>Clique em "Generate token"</li>
<li>Copie e cole o token acima</li>
</ol>
</div>
</div>
<!-- Demo Share -->
<div class="card">
<h2>🚀 Testar Compartilhamento</h2>
<p style="margin-bottom: 15px;">Configuração de exemplo:</p>
<div class="demo-config" id="demoConfig">
{
"colors": ["#667eea", "#764ba2", "#f093fb"],
"pattern": "gradient",
"resolution": { "width": 1920, "height": 1080 }
}
</div>
<button class="button" onclick="testShare()">🔗 Gerar Link de Teste</button>
<button class="button secondary" onclick="clearCache()">🗑️ Limpar Cache</button>
</div>
<!-- Output -->
<div class="card" id="outputCard" style="display: none;">
<h2>✅ Link Gerado</h2>
<div class="demo-config" id="generatedLink"></div>
<button class="button" onclick="copyGeneratedLink()">📋 Copiar Link</button>
</div>
</div>
<!-- Notification -->
<div class="notification" id="notification"></div>
<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
<script src="aurawall-url-system.js"></script>
<script>
// Atualizar UI
function updateStatus() {
const stats = urlManager.getStats();
const indicator = document.getElementById('statusIndicator');
const text = document.getElementById('statusText');
const linkType = document.getElementById('linkType');
const cacheSize = document.getElementById('cacheSize');
if (stats.hasToken) {
indicator.className = 'status-indicator active';
text.textContent = '✅ Links curtos habilitados (GitHub Gists)';
linkType.textContent = 'Curto';
} else {
indicator.className = 'status-indicator inactive';
text.textContent = '⚠️ Usando compressão (links maiores)';
linkType.textContent = 'Comprimido';
}
cacheSize.textContent = stats.cacheSize;
}
// Salvar token
function saveToken() {
const input = document.getElementById('tokenInput');
const token = input.value.trim();
if (!token) {
showNotification('Por favor, insira um token', 'error');
return;
}
try {
urlManager.saveToken(token);
input.value = '';
showNotification('Token salvo com sucesso!', 'success');
updateStatus();
} catch (error) {
showNotification('Erro: ' + error.message, 'error');
}
}
// Remover token
function clearToken() {
if (confirm('Tem certeza que deseja remover o token?')) {
urlManager.clearToken();
showNotification('Token removido', 'success');
updateStatus();
}
}
// Testar compartilhamento
async function testShare() {
const config = {
colors: ["#667eea", "#764ba2", "#f093fb"],
pattern: "gradient",
resolution: { width: 1920, height: 1080 },
timestamp: Date.now()
};
try {
showNotification('Gerando link...', 'success');
const url = await shareAuraWall(config);
document.getElementById('generatedLink').textContent = url;
document.getElementById('outputCard').style.display = 'block';
showNotification('Link gerado e copiado!', 'success');
updateStatus();
} catch (error) {
showNotification('Erro: ' + error.message, 'error');
}
}
// Copiar link gerado
function copyGeneratedLink() {
const link = document.getElementById('generatedLink').textContent;
navigator.clipboard.writeText(link).then(() => {
showNotification('Link copiado!', 'success');
});
}
// Limpar cache
function clearCache() {
urlManager.clearCache();
showNotification('Cache limpo', 'success');
updateStatus();
}
// Mostrar notificação
function showNotification(message, type = 'success') {
const notification = document.getElementById('notification');
notification.textContent = message;
notification.className = `notification ${type} show`;
setTimeout(() => {
notification.classList.remove('show');
}, 3000);
}
// Aplicar configuração carregada (exemplo)
function applyConfiguration(config) {
console.log('Aplicando configuração:', config);
showNotification('Configuração carregada da URL!', 'success');
// Aqui você aplicaria a config no seu gerador de wallpapers
}
// Inicializar
window.addEventListener('DOMContentLoaded', () => {
updateStatus();
// Verificar se carregou config da URL
setTimeout(() => {
updateStatus();
}, 1000);
});
</script>
</body>
</html>
````
# guia de integração completo:
````
# 🎨 AuraWall - Guia de Integração do Sistema de Links Curtos
## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Uso Básico](#uso-básico)
5. [Integração com seu App](#integração-com-seu-app)
6. [Comparação de Tamanhos](#comparação-de-tamanhos)
7. [FAQ](#faq)
---
## 🎯 Visão Geral
O sistema oferece duas formas de compartilhamento:
| Método | Tamanho do Link | Requer Token | Automático |
|--------|----------------|--------------|------------|
| **GitHub Gists** | ~40 chars | ✅ Sim | ✅ Sim |
| **LZ-String** | ~200 chars | ❌ Não | ✅ Sim |
**Links de exemplo:**
```
Gist:       https://seu-site.com/app/#g:abc123def456
LZ-String:  https://seu-site.com/app/#cfg=N4IgdghgtgpiBc... (muito longo)
```
---
## 📦 Instalação
### Passo 1: Adicione os arquivos ao seu projeto
```
seu-projeto/
├── app/
│   ├── index.html
│   ├── aurawall-url-system.js  ← Novo arquivo
│   └── seu-app.js
```
### Passo 2: Inclua as dependências no HTML
```html
<!-- LZ-String (CDN) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
<!-- Sistema de URLs -->
<script src="aurawall-url-system.js"></script>
<!-- Seu app -->
<script src="seu-app.js"></script>
```
---
## ⚙️ Configuração
### 1. Criar GitHub Personal Access Token
1. Acesse: https://github.com/settings/tokens/new
2. Dê um nome: "AuraWall Links"
3. Expira em: 90 dias (ou o que preferir)
4. Selecione **apenas** a permissão: `gist`
5. Clique em "Generate token"
6. **Copie o token** (você só verá uma vez!)
### 2. Configurar no seu app
**Opção A: Via Console (desenvolvimento)**
```javascript
// No console do navegador
urlManager.saveToken('ghp_seu_token_aqui');
```
**Opção B: Via UI (produção)**
Adicione um campo de input no seu app:
```html
<input type="password" id="githubToken" placeholder="Cole seu token aqui">
<button onclick="configureToken()">Salvar</button>
<script>
function configureToken() {
const token = document.getElementById('githubToken').value;
urlManager.saveToken(token);
alert('Token configurado!');
}
</script>
```
---
## 🚀 Uso Básico
### Compartilhar configuração
```javascript
// Sua configuração atual do wallpaper
const config = {
colors: ['#667eea', '#764ba2', '#f093fb'],
pattern: 'gradient',
resolution: { width: 1920, height: 1080 },
blur: 10
};
// Gerar link compartilhável
const url = await shareAuraWall(config);
console.log('Link criado:', url);
// Com token: https://seu-site.com/app/#g:abc123
// Sem token: https://seu-site.com/app/#cfg=N4Igdgh... (comprimido)
```
### Carregar configuração da URL
```javascript
// Ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
const config = await urlManager.loadFromURL();
if (config) {
// Aplicar configuração carregada
aplicarConfiguracao(config);
}
});
```
---
## 🔗 Integração com seu App
### Exemplo completo de integração
```javascript
// ============================================
// SALVAR E COMPARTILHAR
// ============================================
// Botão de compartilhar no seu app
document.getElementById('shareButton').addEventListener('click', async () => {
// Obter configuração atual do seu app
const currentConfig = getWallpaperConfig();
try {
// Gerar e copiar link
const url = await shareAuraWall(currentConfig);
// Mostrar notificação
showNotification('Link copiado! 🎉');
// Opcional: mostrar em um modal
showShareModal(url);
} catch (error) {
if (error.message === 'TOKEN_REQUIRED') {
// Mostrar modal de configuração do token
showTokenConfigModal();
} else {
showNotification('Erro ao gerar link ❌');
}
}
});
// ============================================
// CARREGAR DA URL
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
// Tentar carregar configuração da URL
const loadedConfig = await urlManager.loadFromURL();
if (loadedConfig) {
console.log('✅ Configuração carregada:', loadedConfig);
// Aplicar no seu gerador de wallpapers
applyWallpaperConfig(loadedConfig);
// Mostrar mensagem
showNotification('Wallpaper carregado! 🎨');
} else {
// Carregar configuração padrão
loadDefaultConfig();
}
});
// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function getWallpaperConfig() {
// Retorna a configuração atual do seu app
return {
colors: getSelectedColors(),
pattern: getSelectedPattern(),
resolution: getResolution(),
effects: getEffects()
};
}
function applyWallpaperConfig(config) {
// Aplica a configuração no seu app
setColors(config.colors);
setPattern(config.pattern);
setResolution(config.resolution);
setEffects(config.effects);
// Regenerar wallpaper
generateWallpaper();
}
function showNotification(message) {
// Sua implementação de notificação
console.log(message);
}
```
### Integração com botões do seu UI
```html
<!-- Botão de compartilhar -->
<button onclick="handleShare()">
🔗 Compartilhar
</button>
<!-- Botão de copiar link -->
<button onclick="handleCopyLink()">
📋 Copiar Link
</button>
<script>
async function handleShare() {
const config = getWallpaperConfig();
const url = await shareAuraWall(config);
// Opcional: abrir dialog de compartilhamento nativo
if (navigator.share) {
navigator.share({
title: 'Meu AuraWall',
text: 'Confira este wallpaper!',
url: url
});
}
}
async function handleCopyLink() {
const config = getWallpaperConfig();
const result = await urlManager.createShareLink(config);
const url = result.shortURL || result.compressedURL;
await navigator.clipboard.writeText(url);
showNotification('Link copiado!');
}
</script>
```
---
## 📊 Comparação de Tamanhos
### Exemplo real de redução:
```javascript
const config = {
colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
pattern: 'gradient',
resolution: { width: 3840, height: 2160 },
effects: {
blur: 15,
noise: 0.1,
vignette: true
}
};
// LZ-String (sem token)
// https://seu-site.com/app/#cfg=N4IgdghgtgpiBcIAqA...
// ~180-250 caracteres
// GitHub Gists (com token)
// https://seu-site.com/app/#g:a1b2c3d4e5f
// ~40 caracteres
// 🎉 Redução de ~85% no tamanho!
```
---
## ❓ FAQ
### Como funciona o sistema híbrido?
O sistema tenta usar Gists automaticamente se houver token configurado. Se não houver token ou der erro, usa LZ-String como fallback. **Ambos funcionam perfeitamente!**
### O token é seguro?
Sim! O token:
- Fica salvo apenas no **seu navegador** (localStorage)
- Tem permissão **apenas para criar Gists**
- Não dá acesso a repos ou dados privados
- Pode ser revogado a qualquer momento
### E se eu não quiser configurar token?
Sem problemas! O sistema funciona perfeitamente sem token, usando compressão LZ-String. Os links ficam maiores (~200 chars), mas ainda compartilháveis.
### Como revogar um token?
1. Acesse: https://github.com/settings/tokens
2. Encontre o token "AuraWall Links"
3. Clique em "Delete"
4. No seu app: `urlManager.clearToken()`
### Os links expiram?
- **Gists**: Não expiram (ficam no GitHub para sempre)
- **LZ-String**: Não expiram (dados estão na própria URL)
### Como deletar um Gist?
1. Acesse: https://gist.github.com/[seu-usuario]
2. Encontre o Gist
3. Clique em "Delete"
### Posso usar sem GitHub Pages?
Sim! Funciona em qualquer hospedagem estática: Netlify, Vercel, etc.
### Quantos links posso criar?
Com Gists: praticamente ilimitado (GitHub não tem limite de Gists públicos)
Sem token: ilimitado (dados estão na URL)
---
## 🎨 Customização
### Alterar prefixo dos links Gist
```javascript
// No arquivo aurawall-url-system.js, linha ~185
generateGistURL(gistId) {
const base = window.location.origin + window.location.pathname;
return `${base}#g:${gistId}`;  // Mude 'g:' para o que quiser
}
```
### Alterar duração do cache
```javascript
// No construtor da classe
this.config = {
useGists: true,
cacheDuration: 7200000, // 2 horas (em ms)
maxCacheSize: 100
};
```
### Desabilitar Gists (só usar LZ-String)
```javascript
urlManager.config.useGists = false;
```
---
## 🐛 Troubleshooting
### Erro: "TOKEN_REQUIRED"
**Solução**: Configure o token ou desabilite Gists:
```javascript
urlManager.config.useGists = false;
```
### Erro: "GitHub API: 401"
**Solução**: Token inválido ou expirado. Gere um novo.
### Link não carrega
**Solução**: Verifique o console do navegador para erros. O sistema mostra logs detalhados.
### Cache não limpa
**Solução**:
```javascript
urlManager.clearCache();
// ou
localStorage.clear();
```
---
## 📞 Suporte
- Issues: https://github.com/seu-usuario/aurawall/issues
- Documentação completa: Veja os comentários no código
- Logs: Abra o console (F12) para ver mensagens detalhadas
---
## ✅ Checklist de Integração
- [ ] Arquivos adicionados ao projeto
- [ ] LZ-String incluído no HTML
- [ ] Sistema de URLs incluído no HTML
- [ ] Token configurado (opcional)
- [ ] Função `applyConfiguration()` implementada
- [ ] Botão de compartilhar integrado
- [ ] Sistema de notificações implementado
- [ ] Testado com e sem token
- [ ] Links testados em diferentes navegadores
---
**Pronto!** 🎉 Seu sistema de links curtos está configurado!
````
# exemplos práticos de integração específicos para o projeto:
````js
/**
* Exemplos Práticos de Integração - AuraWall
*
* Este arquivo contém exemplos prontos para copiar e colar
* no seu projeto AuraWall existente.
*
* @author AuraWall Team
*/
// ============================================
// EXEMPLO 1: INTEGRAÇÃO BÁSICA
// ============================================
/**
* Adicione este código no final do seu script principal
*/
(function initAuraWallSharing() {
console.log('🔗 Sistema de compartilhamento inicializado');
// Aguardar página carregar
window.addEventListener('DOMContentLoaded', async () => {
// Tentar carregar configuração da URL
const config = await urlManager.loadFromURL();
if (config) {
console.log('✅ Configuração carregada da URL');
// IMPORTANTE: Substitua esta função pelo nome da sua função
if (typeof applyConfig === 'function') {
applyConfig(config);
}
}
});
})();
// ============================================
// EXEMPLO 2: BOTÃO DE COMPARTILHAR
// ============================================
/**
* Adicione um botão no seu HTML:
* <button id="shareBtn" class="share-button">🔗 Compartilhar</button>
*/
function setupShareButton() {
const shareBtn = document.getElementById('shareBtn');
if (!shareBtn) {
console.warn('Botão de compartilhar não encontrado');
return;
}
shareBtn.addEventListener('click', async () => {
// Desabilitar botão temporariamente
shareBtn.disabled = true;
shareBtn.textContent = '⏳ Gerando...';
try {
// Obter configuração atual
// ADAPTE para pegar a config do seu app
const currentConfig = getCurrentWallpaperConfig();
// Gerar link
const url = await shareAuraWall(currentConfig);
// Feedback visual
shareBtn.textContent = '✅ Copiado!';
setTimeout(() => {
shareBtn.textContent = '🔗 Compartilhar';
shareBtn.disabled = false;
}, 2000);
// Mostrar modal com o link (opcional)
showLinkModal(url);
} catch (error) {
console.error('Erro ao compartilhar:', error);
shareBtn.textContent = '❌ Erro';
setTimeout(() => {
shareBtn.textContent = '🔗 Compartilhar';
shareBtn.disabled = false;
}, 2000);
// Se for erro de token, mostrar configuração
if (error.message === 'TOKEN_REQUIRED') {
showTokenSetupModal();
}
}
});
}
// Chamar quando página carregar
window.addEventListener('DOMContentLoaded', setupShareButton);
// ============================================
// EXEMPLO 3: MODAL DE COMPARTILHAMENTO
// ============================================
/**
* Cria um modal bonito para mostrar o link gerado
*/
function showLinkModal(url) {
// Remover modal existente se houver
const existingModal = document.getElementById('linkModal');
if (existingModal) {
existingModal.remove();
}
// Criar modal
const modal = document.createElement('div');
modal.id = 'linkModal';
modal.innerHTML = `
<div class="modal-overlay" onclick="closeLinkModal()">
<div class="modal-content" onclick="event.stopPropagation()">
<h2>🎉 Link Criado!</h2>
<p>Seu wallpaper está pronto para compartilhar:</p>
<div class="link-display">
<input type="text" value="${url}" readonly id="linkInput">
<button onclick="copyFromModal()" class="copy-btn">📋</button>
</div>
<div class="modal-actions">
<button onclick="shareNative('${url}')" class="btn-primary">
📱 Compartilhar
</button>
<button onclick="closeLinkModal()" class="btn-secondary">
Fechar
</button>
</div>
</div>
</div>
`;
// Adicionar estilos
const style = document.createElement('style');
style.textContent = `
.modal-overlay {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.7);
display: flex;
align-items: center;
justify-content: center;
z-index: 9999;
animation: fadeIn 0.3s;
}
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}
.modal-content {
background: white;
padding: 30px;
border-radius: 15px;
max-width: 500px;
width: 90%;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
animation: slideUp 0.3s;
}
@keyframes slideUp {
from {
transform: translateY(50px);
opacity: 0;
}
to {
transform: translateY(0);
opacity: 1;
}
}
.modal-content h2 {
margin: 0 0 10px 0;
color: #333;
}
.modal-content p {
margin: 0 0 20px 0;
color: #666;
}
.link-display {
display: flex;
gap: 10px;
margin-bottom: 20px;
}
.link-display input {
flex: 1;
padding: 12px;
border: 2px solid #e5e7eb;
border-radius: 8px;
font-size: 14px;
font-family: monospace;
}
.copy-btn {
padding: 12px 20px;
background: #667eea;
color: white;
border: none;
border-radius: 8px;
cursor: pointer;
font-size: 16px;
transition: all 0.3s;
}
.copy-btn:hover {
background: #5568d3;
transform: scale(1.05);
}
.modal-actions {
display: flex;
gap: 10px;
}
.modal-actions button {
flex: 1;
padding: 12px;
border: none;
border-radius: 8px;
cursor: pointer;
font-size: 14px;
transition: all 0.3s;
}
.btn-primary {
background: #667eea;
color: white;
}
.btn-primary:hover {
background: #5568d3;
}
.btn-secondary {
background: #e5e7eb;
color: #333;
}
.btn-secondary:hover {
background: #d1d5db;
}
`;
document.head.appendChild(style);
document.body.appendChild(modal);
// Selecionar texto automaticamente
document.getElementById('linkInput').select();
}
// Fechar modal
function closeLinkModal() {
const modal = document.getElementById('linkModal');
if (modal) {
modal.remove();
}
}
// Copiar do modal
async function copyFromModal() {
const input = document.getElementById('linkInput');
input.select();
try {
await navigator.clipboard.writeText(input.value);
// Feedback visual
const btn = event.target;
btn.textContent = '✅';
setTimeout(() => {
btn.textContent = '📋';
}, 1500);
} catch (err) {
console.error('Erro ao copiar:', err);
}
}
// Compartilhamento nativo (mobile)
async function shareNative(url) {
if (navigator.share) {
try {
await navigator.share({
title: 'Meu AuraWall',
text: 'Confira este wallpaper incrível!',
url: url
});
} catch (err) {
console.log('Compartilhamento cancelado');
}
} else {
// Fallback: copiar link
await navigator.clipboard.writeText(url);
alert('Link copiado!');
}
}
// ============================================
// EXEMPLO 4: MODAL DE CONFIGURAÇÃO DE TOKEN
// ============================================
function showTokenSetupModal() {
// Remover modal existente
const existing = document.getElementById('tokenModal');
if (existing) existing.remove();
const modal = document.createElement('div');
modal.id = 'tokenModal';
modal.innerHTML = `
<div class="modal-overlay" onclick="closeTokenModal()">
<div class="modal-content" onclick="event.stopPropagation()">
<h2>🔑 Configure Links Curtos</h2>
<p>Para usar links curtos automáticos, configure um GitHub token:</p>
<div class="token-input-group">
<input
type="password"
id="tokenModalInput"
placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
>
<button onclick="saveTokenFromModal()" class="btn-primary">
💾 Salvar
</button>
</div>
<div class="token-instructions">
<h3>📝 Como obter:</h3>
<ol>
<li>Acesse: <a href="https://github.com/settings/tokens/new" target="_blank">GitHub Tokens</a></li>
<li>Selecione apenas: <strong>gist</strong></li>
<li>Copie o token gerado</li>
</ol>
<p class="note">💡 Sem token? Clique em "Usar Compressão" abaixo.</p>
</div>
<div class="modal-actions">
<button onclick="useCompressionMode()" class="btn-secondary">
Usar Compressão
</button>
<button onclick="closeTokenModal()" class="btn-secondary">
Fechar
</button>
</div>
</div>
</div>
`;
// Adicionar estilos adicionais
const style = document.createElement('style');
style.textContent = `
.token-input-group {
display: flex;
gap: 10px;
margin: 20px 0;
}
.token-input-group input {
flex: 1;
padding: 12px;
border: 2px solid #e5e7eb;
border-radius: 8px;
font-size: 14px;
font-family: monospace;
}
.token-instructions {
background: #fef3c7;
padding: 15px;
border-radius: 8px;
margin: 15px 0;
}
.token-instructions h3 {
margin: 0 0 10px 0;
color: #92400e;
font-size: 16px;
}
.token-instructions ol {
margin: 10px 0 10px 20px;
color: #78350f;
}
.token-instructions li {
margin: 5px 0;
}
.token-instructions a {
color: #667eea;
font-weight: bold;
}
.note {
margin: 10px 0 0 0;
font-size: 14px;
color: #92400e;
}
`;
document.head.appendChild(style);
document.body.appendChild(modal);
}
// Salvar token do modal
async function saveTokenFromModal() {
const input = document.getElementById('tokenModalInput');
const token = input.value.trim();
if (!token) {
alert('Por favor, insira um token válido');
return;
}
try {
urlManager.saveToken(token);
alert('✅ Token salvo! Agora você pode usar links curtos.');
closeTokenModal();
} catch (error) {
alert('❌ Erro: ' + error.message);
}
}
// Usar modo compressão
async function useCompressionMode() {
urlManager.config.useGists = false;
alert('✅ Usando modo de compressão (links maiores)');
closeTokenModal();
// Tentar gerar link novamente
const config = getCurrentWallpaperConfig();
const url = await shareAuraWall(config);
showLinkModal(url);
}
// Fechar modal de token
function closeTokenModal() {
const modal = document.getElementById('tokenModal');
if (modal) modal.remove();
}
// ============================================
// EXEMPLO 5: OBTER CONFIGURAÇÃO DO SEU APP
// ============================================
/**
* ADAPTE ESTA FUNÇÃO para o seu app específico
*
* Exemplo de estrutura de config que você deve retornar:
*/
function getCurrentWallpaperConfig() {
// SUBSTITUA pelo código real do seu app
return {
// Cores selecionadas
colors: getSelectedColors(), // Ex: ['#667eea', '#764ba2']
// Padrão/estilo
pattern: getPatternType(), // Ex: 'gradient', 'noise', 'geometric'
// Resolução
resolution: {
width: getCanvasWidth(),
height: getCanvasHeight()
},
// Efeitos aplicados
effects: {
blur: getBlurValue(),
noise: getNoiseValue(),
vignette: isVignetteEnabled()
},
// Outras configurações específicas do seu app
customSettings: getCustomSettings(),
// Timestamp
timestamp: Date.now()
};
}
// ============================================
// EXEMPLO 6: APLICAR CONFIGURAÇÃO CARREGADA
// ============================================
/**
* ADAPTE ESTA FUNÇÃO para aplicar a config no seu app
*/
function applyConfig(config) {
console.log('Aplicando configuração:', config);
// SUBSTITUA pelo código real do seu app
// Aplicar cores
if (config.colors) {
setColors(config.colors);
}
// Aplicar padrão
if (config.pattern) {
setPattern(config.pattern);
}
// Aplicar resolução
if (config.resolution) {
setResolution(config.resolution.width, config.resolution.height);
}
// Aplicar efeitos
if (config.effects) {
if (config.effects.blur !== undefined) {
setBlur(config.effects.blur);
}
if (config.effects.noise !== undefined) {
setNoise(config.effects.noise);
}
if (config.effects.vignette !== undefined) {
setVignette(config.effects.vignette);
}
}
// Aplicar configurações customizadas
if (config.customSettings) {
applyCustomSettings(config.customSettings);
}
// Regenerar wallpaper com nova config
generateWallpaper();
// Feedback visual
showNotification('✅ Configuração carregada!');
}
// ============================================
// EXEMPLO 7: NOTIFICAÇÃO TOAST SIMPLES
// ============================================
function showNotification(message, duration = 3000) {
// Remover notificação existente
const existing = document.getElementById('toast');
if (existing) existing.remove();
// Criar toast
const toast = document.createElement('div');
toast.id = 'toast';
toast.textContent = message;
// Adicionar estilo inline
toast.style.cssText = `
position: fixed;
bottom: 20px;
right: 20px;
background: rgba(0, 0, 0, 0.9);
color: white;
padding: 15px 25px;
border-radius: 8px;
font-size: 14px;
z-index: 10000;
animation: slideInUp 0.3s ease;
`;
// Adicionar animação
const style = document.createElement('style');
style.textContent = `
@keyframes slideInUp {
from {
transform: translateY(100px);
opacity: 0;
}
to {
transform: translateY(0);
opacity: 1;
}
}
`;
document.head.appendChild(style);
document.body.appendChild(toast);
// Remover após duração
setTimeout(() => {
toast.style.animation = 'slideInUp 0.3s ease reverse';
setTimeout(() => toast.remove(), 300);
}, duration);
}
// ============================================
// EXEMPLO 8: ADICIONAR ATALHOS DE TECLADO
// ============================================
function setupKeyboardShortcuts() {
document.addEventListener('keydown', async (e) => {
// Ctrl/Cmd + S = Compartilhar
if ((e.ctrlKey || e.metaKey) && e.key === 's') {
e.preventDefault();
const config = getCurrentWallpaperConfig();
await shareAuraWall(config);
showNotification('🔗 Link copiado!');
}
// Ctrl/Cmd + K = Configurar token
if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
e.preventDefault();
showTokenSetupModal();
}
});
console.log('⌨️ Atalhos: Ctrl+S (compartilhar) | Ctrl+K (config)');
}
// Inicializar atalhos
window.addEventListener('DOMContentLoaded', setupKeyboardShortcuts);
// ============================================
// EXEMPLO 9: HISTÓRICO DE LINKS
// ============================================
class LinkHistory {
constructor(maxItems = 10) {
this.maxItems = maxItems;
this.storageKey = 'aurawall_link_history';
}
add(url, config) {
const history = this.getAll();
const item = {
url,
preview: this.generatePreview(config),
timestamp: Date.now(),
config
};
// Adicionar no início
history.unshift(item);
// Limitar tamanho
if (history.length > this.maxItems) {
history.pop();
}
localStorage.setItem(this.storageKey, JSON.stringify(history));
}
getAll() {
const data = localStorage.getItem(this.storageKey);
return data ? JSON.parse(data) : [];
}
clear() {
localStorage.removeItem(this.storageKey);
}
generatePreview(config) {
return {
colors: config.colors?.slice(0, 3) || [],
pattern: config.pattern || 'unknown'
};
}
}
const linkHistory = new LinkHistory();
// Modificar shareAuraWall para salvar histórico
const originalShare = window.shareAuraWall;
window.shareAuraWall = async function(config) {
const url = await originalShare(config);
linkHistory.add(url, config);
return url;
};
// ============================================
// EXPORTAR FUNÇÕES GLOBAIS
// ============================================
window.showLinkModal = showLinkModal;
window.closeLinkModal = closeLinkModal;
window.showTokenSetupModal = showTokenSetupModal;
window.closeTokenModal = closeTokenModal;
window.showNotification = showNotification;
window.getCurrentWallpaperConfig = getCurrentWallpaperConfig;
window.applyConfig = applyConfig;
window.linkHistory = linkHistory;
console.log('✅ Exemplos de integração carregados');
console.log('📚 Funções disponíveis:', {
showLinkModal: 'Mostrar modal com link',
showTokenSetupModal: 'Configurar token',
showNotification: 'Mostrar notificação',
getCurrentWallpaperConfig: 'Obter config atual (ADAPTAR)',
applyConfig: 'Aplicar config (ADAPTAR)',
linkHistory: 'Histórico de links'
});
````
# checklist de implementação passo a passo:
````
# ✅ Checklist de Implementação - AuraWall Links Curtos
## 📦 Fase 1: Preparação (5 minutos)
### Arquivos Necessários
- [ ] **Baixar** `aurawall-url-system.js` (sistema principal)
- [ ] **Baixar** `practical-examples.js` (exemplos prontos)
- [ ] **Verificar** se LZ-String já está incluído
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
```
### Estrutura de Pastas
```
seu-projeto/
├── app/
│   ├── index.html
│   ├── aurawall-url-system.js    ← Adicionar aqui
│   ├── practical-examples.js     ← Adicionar aqui
│   └── seu-app-atual.js
```
---
## 🔧 Fase 2: Integração Básica (10 minutos)
### No seu `index.html`
- [ ] **Adicionar** scripts antes do `</body>`:
```html
<!-- LZ-String (se ainda não tiver) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
<!-- Sistema de URLs -->
<script src="aurawall-url-system.js"></script>
<!-- Exemplos práticos -->
<script src="practical-examples.js"></script>
<!-- Seu app -->
<script src="seu-app.js"></script>
```
- [ ] **Adicionar** botão de compartilhar no HTML:
```html
<button id="shareBtn" class="share-button">
🔗 Compartilhar
</button>
```
### Teste Básico
- [ ] **Abrir** o site no navegador
- [ ] **Abrir** o console (F12)
- [ ] **Verificar** se aparece: `🎨 AuraWall - Sistema de URLs carregado`
- [ ] **Testar** no console:
```javascript
urlManager.getStats()
```
---
## 🎨 Fase 3: Adaptação ao Seu App (20 minutos)
### Funções a Adaptar
#### 1. **getCurrentWallpaperConfig()**
Localize no `practical-examples.js` e adapte:
```javascript
function getCurrentWallpaperConfig() {
return {
// SUBSTITUA com os valores reais do seu app
colors: ['#667eea', '#764ba2'], // ← Suas cores
pattern: 'gradient',            // ← Seu padrão
resolution: {
width: 1920,                  // ← Sua largura
height: 1080                  // ← Sua altura
}
};
}
```
**Como encontrar os valores:**
- [ ] Abra o console do seu app
- [ ] Inspecione os elementos do DOM
- [ ] Veja quais variáveis guardam as configurações
- [ ] Adapte a função para retornar esses valores
**Exemplo prático:**
```javascript
// Se seu app tem um objeto global 'state'
function getCurrentWallpaperConfig() {
return {
colors: state.selectedColors,
pattern: state.currentPattern,
resolution: {
width: canvas.width,
height: canvas.height
}
};
}
```
#### 2. **applyConfig(config)**
Localize no `practical-examples.js` e adapte:
```javascript
function applyConfig(config) {
// SUBSTITUA com as funções reais do seu app
if (config.colors) {
// Como você aplica cores no seu app?
setColors(config.colors);
}
if (config.pattern) {
// Como você muda o padrão?
changePattern(config.pattern);
}
// Regenerar o wallpaper
generateWallpaper();
}
```
**Teste:**
- [ ] No console, testar:
```javascript
const testConfig = {
colors: ['#FF0000', '#00FF00'],
pattern: 'gradient'
};
applyConfig(testConfig);
```
- [ ] Verificar se o wallpaper mudou
---
## 🚀 Fase 4: Teste de Compartilhamento (10 minutos)
### Teste SEM Token (Compressão LZ-String)
- [ ] **Clicar** no botão "Compartilhar"
- [ ] **Verificar** se:
- ✅ Modal apareceu
- ✅ Link foi copiado
- ✅ Link tem formato: `#cfg=N4Igdgh...`
- ✅ Link é ~200 caracteres
- [ ] **Copiar** o link e abrir em nova aba
- [ ] **Verificar** se a configuração foi aplicada
### Teste COM Token (GitHub Gists)
- [ ] **Obter token**:
1. Acessar: https://github.com/settings/tokens/new
2. Nome: "AuraWall Links"
3. Permissão: apenas `gist`
4. Copiar token gerado
- [ ] **Configurar** no console:
```javascript
urlManager.saveToken('ghp_seu_token_aqui')
```
- [ ] **Verificar** status:
```javascript
urlManager.getStats()
// Deve mostrar: hasToken: true
```
- [ ] **Clicar** no botão "Compartilhar" novamente
- [ ] **Verificar** se:
- ✅ Link tem formato: `#g:abc123def`
- ✅ Link é ~40 caracteres
- ✅ Console mostra: "✅ Link curto criado"
- [ ] **Abrir** link em nova aba
- [ ] **Verificar** se configuração foi aplicada
---
## 🎯 Fase 5: Recursos Extras (Opcional)
### Modal de Compartilhamento
- [ ] Testar se o modal aparece corretamente
- [ ] Testar botão "📋 Copiar"
- [ ] Testar botão "📱 Compartilhar" (mobile)
- [ ] Verificar se fecha ao clicar fora
### Modal de Configuração
- [ ] Clicar em compartilhar SEM token
- [ ] Verificar se modal de config aparece
- [ ] Testar salvar token pelo modal
- [ ] Verificar botão "Usar Compressão"
### Notificações Toast
- [ ] Verificar se aparecem no canto inferior direito
- [ ] Verificar se desaparecem automaticamente
- [ ] Testar diferentes mensagens
### Atalhos de Teclado
- [ ] **Ctrl+S** (ou Cmd+S): compartilhar
- [ ] **Ctrl+K** (ou Cmd+K): configurar token
### Histórico de Links
- [ ] Abrir console e verificar:
```javascript
linkHistory.getAll()
```
- [ ] Criar 3-4 links diferentes
- [ ] Verificar se histórico mantém os últimos 10
---
## 🐛 Fase 6: Troubleshooting
### Problema: "urlManager is not defined"
**Solução:**
- [ ] Verificar se `aurawall-url-system.js` está incluído
- [ ] Verificar se está ANTES do seu app.js
- [ ] Recarregar a página (Ctrl+Shift+R)
### Problema: "LZString is not defined"
**Solução:**
- [ ] Adicionar script do LZ-String:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
```
### Problema: Link não carrega configuração
**Solução:**
- [ ] Abrir console e verificar erros
- [ ] Verificar se função `applyConfig` foi adaptada
- [ ] Testar manualmente:
```javascript
urlManager.loadFromURL().then(config => {
console.log('Config carregada:', config);
});
```
### Problema: Token não funciona
**Solução:**
- [ ] Verificar se token é válido (começa com `ghp_`)
- [ ] Verificar permissão `gist` no GitHub
- [ ] Testar no console:
```javascript
urlManager.hasToken() // deve retornar true
```
### Problema: Botão não faz nada
**Solução:**
- [ ] Verificar ID do botão (`shareBtn`)
- [ ] Verificar se `setupShareButton()` foi chamado
- [ ] Ver erros no console
---
## 📊 Fase 7: Validação Final
### Checklist de Funcionalidades
- [ ] ✅ Compartilhamento funciona
- [ ] ✅ Links são copiados automaticamente
- [ ] ✅ Links carregam corretamente
- [ ] ✅ Configuração é aplicada ao carregar
- [ ] ✅ Modal aparece corretamente
- [ ] ✅ Notificações funcionam
- [ ] ✅ Token pode ser configurado
- [ ] ✅ Funciona COM e SEM token
- [ ] ✅ Histórico salva links
- [ ] ✅ Cache funciona
### Teste em Diferentes Navegadores
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (Chrome/Safari)
### Teste de Performance
- [ ] Links curtos (~40 chars) ✅
- [ ] Links comprimidos (~200 chars) ✅
- [ ] Carregamento rápido (< 1s) ✅
- [ ] Sem lag ao compartilhar ✅
---
## 🎉 Fase 8: Deploy
### Antes de Publicar
- [ ] Remover console.logs desnecessários
- [ ] Testar em produção (GitHub Pages)
- [ ] Verificar HTTPS funcionando
- [ ] Testar compartilhamento entre dispositivos
### Após Publicar
- [ ] Criar 3-5 links de teste
- [ ] Compartilhar com amigos
- [ ] Verificar analytics (se tiver)
- [ ] Monitorar erros
---
## 📝 Notas Importantes
### ⚠️ Limitações
- Gists são públicos (qualquer um pode ver)
- Token deve ser renovado periodicamente
- Cache tem limite de 50 items
- Links LZ-String não funcionam em SMS (muito longos)
### 💡 Dicas
- **Sempre teste** sem token primeiro
- **Configure token** só quando estiver tudo funcionando
- **Use console** para debugging
- **Mantenha backups** dos tokens
### 🔒 Segurança
- ✅ Token fica apenas no navegador
- ✅ Token tem permissão apenas de Gist
- ✅ Pode ser revogado a qualquer momento
- ✅ Sem acesso a repos ou dados privados
---
## 🎯 Resultado Esperado
### Antes (LZ-String original):
```
https://seu-site.com/app/#cfg=N4IgdghgtgpiBcIDKBXATgQwLaQEYBsAThAJYwAmCAJjhAM4IAuA...
```
**~250 caracteres** 😰
### Depois (Com Gist):
```
https://seu-site.com/app/#g:a1b2c3d
```
**~40 caracteres** 🎉
### Redução:
**~85% menor!** 🚀
---
## ✅ Checklist Final
### Implementação Completa:
- [ ] Sistema instalado e funcionando
- [ ] Adaptado para seu app específico
- [ ] Testado com e sem token
- [ ] Modal e notificações funcionando
- [ ] Histórico implementado (opcional)
- [ ] Atalhos de teclado funcionando (opcional)
- [ ] Testado em múltiplos navegadores
- [ ] Deploy feito com sucesso
### Documentação:
- [ ] README atualizado
- [ ] Instruções para usuários finais
- [ ] Exemplos de uso documentados
### Manutenção:
- [ ] Token salvo em local seguro
- [ ] Procedimento de renovação definido
- [ ] Plano de backup implementado
---
## 🎊 Parabéns!
Se você marcou todos os items acima, seu sistema de links curtos está **100% funcional**!
Agora seus usuários podem compartilhar wallpapers com links **~85% menores**! 🚀
---
## 📞 Suporte
Problemas? Verifique:
1. Console do navegador (F12)
2. Guia de integração completa
3. Exemplos práticos
4. FAQ no guia principal
**Boa sorte!** 🎨✨# ✅ Checklist de Implementação - AuraWall Links Curtos
## 📦 Fase 1: Preparação (5 minutos)
### Arquivos Necessários
- [ ] **Baixar** `aurawall-url-system.js` (sistema principal)
- [ ] **Baixar** `practical-examples.js` (exemplos prontos)
- [ ] **Verificar** se LZ-String já está incluído
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
```
### Estrutura de Pastas
```
seu-projeto/
├── app/
│   ├── index.html
│   ├── aurawall-url-system.js    ← Adicionar aqui
│   ├── practical-examples.js     ← Adicionar aqui
│   └── seu-app-atual.js
```
---
## 🔧 Fase 2: Integração Básica (10 minutos)
### No seu `index.html`
- [ ] **Adicionar** scripts antes do `</body>`:
```html
<!-- LZ-String (se ainda não tiver) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
<!-- Sistema de URLs -->
<script src="aurawall-url-system.js"></script>
<!-- Exemplos práticos -->
<script src="practical-examples.js"></script>
<!-- Seu app -->
<script src="seu-app.js"></script>
```
- [ ] **Adicionar** botão de compartilhar no HTML:
```html
<button id="shareBtn" class="share-button">
🔗 Compartilhar
</button>
```
### Teste Básico
- [ ] **Abrir** o site no navegador
- [ ] **Abrir** o console (F12)
- [ ] **Verificar** se aparece: `🎨 AuraWall - Sistema de URLs carregado`
- [ ] **Testar** no console:
```javascript
urlManager.getStats()
```
---
## 🎨 Fase 3: Adaptação ao Seu App (20 minutos)
### Funções a Adaptar
#### 1. **getCurrentWallpaperConfig()**
Localize no `practical-examples.js` e adapte:
```javascript
function getCurrentWallpaperConfig() {
return {
// SUBSTITUA com os valores reais do seu app
colors: ['#667eea', '#764ba2'], // ← Suas cores
pattern: 'gradient',            // ← Seu padrão
resolution: {
width: 1920,                  // ← Sua largura
height: 1080                  // ← Sua altura
}
};
}
```
**Como encontrar os valores:**
- [ ] Abra o console do seu app
- [ ] Inspecione os elementos do DOM
- [ ] Veja quais variáveis guardam as configurações
- [ ] Adapte a função para retornar esses valores
**Exemplo prático:**
```javascript
// Se seu app tem um objeto global 'state'
function getCurrentWallpaperConfig() {
return {
colors: state.selectedColors,
pattern: state.currentPattern,
resolution: {
width: canvas.width,
height: canvas.height
}
};
}
```
#### 2. **applyConfig(config)**
Localize no `practical-examples.js` e adapte:
```javascript
function applyConfig(config) {
// SUBSTITUA com as funções reais do seu app
if (config.colors) {
// Como você aplica cores no seu app?
setColors(config.colors);
}
if (config.pattern) {
// Como você muda o padrão?
changePattern(config.pattern);
}
// Regenerar o wallpaper
generateWallpaper();
}
```
**Teste:**
- [ ] No console, testar:
```javascript
const testConfig = {
colors: ['#FF0000', '#00FF00'],
pattern: 'gradient'
};
applyConfig(testConfig);
```
- [ ] Verificar se o wallpaper mudou
---
## 🚀 Fase 4: Teste de Compartilhamento (10 minutos)
### Teste SEM Token (Compressão LZ-String)
- [ ] **Clicar** no botão "Compartilhar"
- [ ] **Verificar** se:
- ✅ Modal apareceu
- ✅ Link foi copiado
- ✅ Link tem formato: `#cfg=N4Igdgh...`
- ✅ Link é ~200 caracteres
- [ ] **Copiar** o link e abrir em nova aba
- [ ] **Verificar** se a configuração foi aplicada
### Teste COM Token (GitHub Gists)
- [ ] **Obter token**:
1. Acessar: https://github.com/settings/tokens/new
2. Nome: "AuraWall Links"
3. Permissão: apenas `gist`
4. Copiar token gerado
- [ ] **Configurar** no console:
```javascript
urlManager.saveToken('ghp_seu_token_aqui')
```
- [ ] **Verificar** status:
```javascript
urlManager.getStats()
// Deve mostrar: hasToken: true
```
- [ ] **Clicar** no botão "Compartilhar" novamente
- [ ] **Verificar** se:
- ✅ Link tem formato: `#g:abc123def`
- ✅ Link é ~40 caracteres
- ✅ Console mostra: "✅ Link curto criado"
- [ ] **Abrir** link em nova aba
- [ ] **Verificar** se configuração foi aplicada
---
## 🎯 Fase 5: Recursos Extras (Opcional)
### Modal de Compartilhamento
- [ ] Testar se o modal aparece corretamente
- [ ] Testar botão "📋 Copiar"
- [ ] Testar botão "📱 Compartilhar" (mobile)
- [ ] Verificar se fecha ao clicar fora
### Modal de Configuração
- [ ] Clicar em compartilhar SEM token
- [ ] Verificar se modal de config aparece
- [ ] Testar salvar token pelo modal
- [ ] Verificar botão "Usar Compressão"
### Notificações Toast
- [ ] Verificar se aparecem no canto inferior direito
- [ ] Verificar se desaparecem automaticamente
- [ ] Testar diferentes mensagens
### Atalhos de Teclado
- [ ] **Ctrl+S** (ou Cmd+S): compartilhar
- [ ] **Ctrl+K** (ou Cmd+K): configurar token
### Histórico de Links
- [ ] Abrir console e verificar:
```javascript
linkHistory.getAll()
```
- [ ] Criar 3-4 links diferentes
- [ ] Verificar se histórico mantém os últimos 10
---
## 🐛 Fase 6: Troubleshooting
### Problema: "urlManager is not defined"
**Solução:**
- [ ] Verificar se `aurawall-url-system.js` está incluído
- [ ] Verificar se está ANTES do seu app.js
- [ ] Recarregar a página (Ctrl+Shift+R)
### Problema: "LZString is not defined"
**Solução:**
- [ ] Adicionar script do LZ-String:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
```
### Problema: Link não carrega configuração
**Solução:**
- [ ] Abrir console e verificar erros
- [ ] Verificar se função `applyConfig` foi adaptada
- [ ] Testar manualmente:
```javascript
urlManager.loadFromURL().then(config => {
console.log('Config carregada:', config);
});
```
### Problema: Token não funciona
**Solução:**
- [ ] Verificar se token é válido (começa com `ghp_`)
- [ ] Verificar permissão `gist` no GitHub
- [ ] Testar no console:
```javascript
urlManager.hasToken() // deve retornar true
```
### Problema: Botão não faz nada
**Solução:**
- [ ] Verificar ID do botão (`shareBtn`)
- [ ] Verificar se `setupShareButton()` foi chamado
- [ ] Ver erros no console
---
## 📊 Fase 7: Validação Final
### Checklist de Funcionalidades
- [ ] ✅ Compartilhamento funciona
- [ ] ✅ Links são copiados automaticamente
- [ ] ✅ Links carregam corretamente
- [ ] ✅ Configuração é aplicada ao carregar
- [ ] ✅ Modal aparece corretamente
- [ ] ✅ Notificações funcionam
- [ ] ✅ Token pode ser configurado
- [ ] ✅ Funciona COM e SEM token
- [ ] ✅ Histórico salva links
- [ ] ✅ Cache funciona
### Teste em Diferentes Navegadores
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (Chrome/Safari)
### Teste de Performance
- [ ] Links curtos (~40 chars) ✅
- [ ] Links comprimidos (~200 chars) ✅
- [ ] Carregamento rápido (< 1s) ✅
- [ ] Sem lag ao compartilhar ✅
---
## 🎉 Fase 8: Deploy
### Antes de Publicar
- [ ] Remover console.logs desnecessários
- [ ] Testar em produção (GitHub Pages)
- [ ] Verificar HTTPS funcionando
- [ ] Testar compartilhamento entre dispositivos
### Após Publicar
- [ ] Criar 3-5 links de teste
- [ ] Compartilhar com amigos
- [ ] Verificar analytics (se tiver)
- [ ] Monitorar erros
---
## 📝 Notas Importantes
### ⚠️ Limitações
- Gists são públicos (qualquer um pode ver)
- Token deve ser renovado periodicamente
- Cache tem limite de 50 items
- Links LZ-String não funcionam em SMS (muito longos)
### 💡 Dicas
- **Sempre teste** sem token primeiro
- **Configure token** só quando estiver tudo funcionando
- **Use console** para debugging
- **Mantenha backups** dos tokens
### 🔒 Segurança
- ✅ Token fica apenas no navegador
- ✅ Token tem permissão apenas de Gist
- ✅ Pode ser revogado a qualquer momento
- ✅ Sem acesso a repos ou dados privados
---
## 🎯 Resultado Esperado
### Antes (LZ-String original):
```
https://seu-site.com/app/#cfg=N4IgdghgtgpiBcIDKBXATgQwLaQEYBsAThAJYwAmCAJjhAM4IAuA...
```
**~250 caracteres** 😰
### Depois (Com Gist):
```
https://seu-site.com/app/#g:a1b2c3d
```
**~40 caracteres** 🎉
### Redução:
**~85% menor!** 🚀
---
## ✅ Checklist Final
### Implementação Completa:
- [ ] Sistema instalado e funcionando
- [ ] Adaptado para seu app específico
- [ ] Testado com e sem token
- [ ] Modal e notificações funcionando
- [ ] Histórico implementado (opcional)
- [ ] Atalhos de teclado funcionando (opcional)
- [ ] Testado em múltiplos navegadores
- [ ] Deploy feito com sucesso
### Documentação:
- [ ] README atualizado
- [ ] Instruções para usuários finais
- [ ] Exemplos de uso documentados
### Manutenção:
- [ ] Token salvo em local seguro
- [ ] Procedimento de renovação definido
- [ ] Plano de backup implementado
---
## 🎊 Parabéns!
Se você marcou todos os items acima, seu sistema de links curtos está **100% funcional**!
Agora seus usuários podem compartilhar wallpapers com links **~85% menores**! 🚀
---
## 📞 Suporte
Problemas? Verifique:
1. Console do navegador (F12)
2. Guia de integração completa
3. Exemplos práticos
4. FAQ no guia principal
**Boa sorte!** 🎨✨
````
# script de teste automatizado que você pode rodar para verificar se tudo está funcionando:
````js
/**
* Script de Testes Automatizados - AuraWall URL System
*
* Execute este script no console para verificar se tudo está funcionando.
*
* Como usar:
* 1. Abra o console (F12)
* 2. Cole todo este código
* 3. Pressione Enter
* 4. Aguarde os resultados
*
* @author AuraWall Team
*/
(async function runAuraWallTests() {
console.clear();
console.log(`
╔════════════════════════════════════════════════════════════╗
║       AURAWALL - TESTES AUTOMATIZADOS DO SISTEMA           ║
╚════════════════════════════════════════════════════════════╝
`);
const results = {
passed: 0,
failed: 0,
warnings: 0,
tests: []
};
// Utilidades de teste
function test(name, fn) {
try {
const result = fn();
if (result) {
console.log(`✅ ${name}`);
results.passed++;
results.tests.push({ name, status: 'passed' });
return true;
} else {
console.log(`❌ ${name}`);
results.failed++;
results.tests.push({ name, status: 'failed' });
return false;
}
} catch (error) {
console.log(`❌ ${name}`);
console.error(`   Erro: ${error.message}`);
results.failed++;
results.tests.push({ name, status: 'failed', error: error.message });
return false;
}
}
function warn(name, message) {
console.log(`⚠️  ${name}`);
console.log(`   ${message}`);
results.warnings++;
results.tests.push({ name, status: 'warning', message });
}
console.log('\n📦 VERIFICANDO DEPENDÊNCIAS...\n');
// Teste 1: LZ-String carregado
test('LZ-String está carregado', () => {
return typeof LZString !== 'undefined';
});
// Teste 2: Sistema de URLs carregado
test('AuraWallURLManager está disponível', () => {
return typeof AuraWallURLManager !== 'undefined';
});
// Teste 3: Instância global
test('urlManager está disponível', () => {
return typeof urlManager !== 'undefined' && urlManager instanceof AuraWallURLManager;
});
// Teste 4: Função de compartilhamento
test('shareAuraWall está disponível', () => {
return typeof shareAuraWall === 'function';
});
console.log('\n🔧 VERIFICANDO FUNCIONALIDADES BÁSICAS...\n');
// Teste 5: Compressão funciona
test('Compressão LZ-String funciona', () => {
const testData = { test: 'data', colors: ['#FF0000'] };
const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(testData));
const decompressed = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));
return decompressed.test === 'data';
});
// Teste 6: Cache funciona
test('Sistema de cache funciona', () => {
urlManager.addToCache('test-key', { test: 'value' });
const cached = urlManager.getFromCache('test-key');
return cached && cached.test === 'value';
});
// Teste 7: Clear cache
test('Limpar cache funciona', () => {
urlManager.clearCache();
const cached = urlManager.getFromCache('test-key');
return !cached;
});
// Teste 8: Stats
test('getStats retorna dados corretos', () => {
const stats = urlManager.getStats();
return typeof stats === 'object' &&
typeof stats.hasToken === 'boolean' &&
typeof stats.cacheSize === 'number';
});
console.log('\n🔗 TESTANDO GERAÇÃO DE LINKS...\n');
// Teste 9: Criar link comprimido
let compressedResult;
test('Criar link comprimido funciona', () => {
const testConfig = {
colors: ['#667eea', '#764ba2'],
pattern: 'gradient',
timestamp: Date.now()
};
compressedResult = urlManager.createCompressedURL(testConfig);
return compressedResult &&
compressedResult.type === 'compressed' &&
compressedResult.compressedURL.includes('#cfg=');
});
if (compressedResult) {
console.log(`   Tamanho: ${compressedResult.size} caracteres`);
}
// Teste 10: Token
const hasToken = urlManager.hasToken();
if (hasToken) {
console.log('✅ Token GitHub configurado');
console.log('   Links curtos estarão disponíveis');
} else {
warn('Token GitHub não configurado',
'Links usarão compressão (maiores). Configure com: urlManager.saveToken("seu_token")');
}
console.log('\n🎨 TESTANDO INTEGRAÇÃO COM SEU APP...\n');
// Teste 11: Função getCurrentWallpaperConfig
test('getCurrentWallpaperConfig está definida', () => {
return typeof getCurrentWallpaperConfig === 'function';
});
// Teste 12: Função applyConfig
test('applyConfig está definida', () => {
return typeof applyConfig === 'function';
});
// Teste 13: Testar getCurrentWallpaperConfig
let currentConfig;
try {
currentConfig = getCurrentWallpaperConfig();
if (currentConfig && typeof currentConfig === 'object') {
console.log('✅ getCurrentWallpaperConfig retorna dados');
console.log('   Config atual:', JSON.stringify(currentConfig, null, 2));
} else {
warn('getCurrentWallpaperConfig precisa adaptação',
'Função não retorna objeto de configuração válido');
}
} catch (e) {
warn('getCurrentWallpaperConfig precisa ser adaptada',
'Função lança erro: ' + e.message);
}
console.log('\n🎭 TESTANDO INTERFACE...\n');
// Teste 14: Botão de compartilhar
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
console.log('✅ Botão de compartilhar encontrado (#shareBtn)');
} else {
warn('Botão de compartilhar não encontrado',
'Adicione um elemento com id="shareBtn" ao HTML');
}
// Teste 15: Funções de modal
test('showLinkModal está disponível', () => {
return typeof showLinkModal === 'function';
});
test('showTokenSetupModal está disponível', () => {
return typeof showTokenSetupModal === 'function';
});
test('showNotification está disponível', () => {
return typeof showNotification === 'function';
});
console.log('\n🚀 TESTE COMPLETO DE COMPARTILHAMENTO...\n');
// Teste 16: Compartilhamento completo
if (currentConfig) {
try {
console.log('🔄 Gerando link de teste...');
const shareResult = await shareAuraWall(currentConfig);
if (shareResult) {
console.log('✅ Link gerado com sucesso!');
console.log(`   URL: ${shareResult.substring(0, 60)}...`);
console.log(`   Tamanho: ${shareResult.length} caracteres`);
console.log(`   Tipo: ${shareResult.includes('#g:') ? 'Gist (curto)' : 'Comprimido'}`);
results.passed++;
} else {
console.log('❌ Falha ao gerar link');
results.failed++;
}
} catch (error) {
console.log('❌ Erro ao testar compartilhamento');
console.error('   ', error.message);
results.failed++;
}
} else {
warn('Não foi possível testar compartilhamento',
'getCurrentWallpaperConfig não retornou dados válidos');
}
// Teste 17: Carregar da URL
console.log('\n📥 TESTANDO CARREGAMENTO DE URL...\n');
const hashTest = window.location.hash;
if (hashTest && hashTest.length > 1) {
console.log('🔄 Detectada configuração na URL atual...');
try {
const loadedConfig = await urlManager.loadFromURL();
if (loadedConfig) {
console.log('✅ Configuração carregada com sucesso da URL');
console.log('   Config:', JSON.stringify(loadedConfig, null, 2).substring(0, 200) + '...');
results.passed++;
} else {
console.log('❌ Falha ao carregar configuração da URL');
results.failed++;
}
} catch (error) {
console.log('❌ Erro ao carregar da URL');
console.error('   ', error.message);
results.failed++;
}
} else {
console.log('ℹ️  Nenhuma configuração na URL para testar');
console.log('   Para testar: crie um link e abra-o em nova aba');
}
console.log('\n📊 RELATÓRIO FINAL...\n');
console.log('╔════════════════════════════════════════════════════════╗');
console.log(`║  ✅ Testes Passou:  ${results.passed.toString().padStart(2)}                                   ║`);
console.log(`║  ❌ Testes Falhou:  ${results.failed.toString().padStart(2)}                                   ║`);
console.log(`║  ⚠️  Avisos:        ${results.warnings.toString().padStart(2)}                                   ║`);
console.log('╚════════════════════════════════════════════════════════╝');
// Avaliação final
console.log('\n🎯 AVALIAÇÃO FINAL:\n');
if (results.failed === 0 && results.warnings === 0) {
console.log('🎉 EXCELENTE! Sistema 100% funcional!');
console.log('✅ Tudo está configurado e funcionando perfeitamente.');
} else if (results.failed === 0 && results.warnings > 0) {
console.log('✅ BOM! Sistema funcional com algumas observações.');
console.log('⚠️  Revise os avisos acima para otimizar a experiência.');
} else if (results.failed <= 2) {
console.log('⚠️  FUNCIONAL COM PROBLEMAS MENORES');
console.log('🔧 Corrija os problemas listados acima.');
} else {
console.log('❌ ATENÇÃO! Sistema com problemas');
console.log('🛠️  Revise a instalação e configuração.');
}
// Recomendações
console.log('\n💡 PRÓXIMOS PASSOS:\n');
if (!hasToken) {
console.log('1. Configure um GitHub token para links curtos:');
console.log('   urlManager.saveToken("ghp_seu_token_aqui")');
console.log('   Obtenha em: https://github.com/settings/tokens/new\n');
}
if (!currentConfig || typeof currentConfig !== 'object') {
console.log('2. Adapte a função getCurrentWallpaperConfig() no practical-examples.js');
console.log('   para retornar a configuração real do seu app.\n');
}
if (!shareBtn) {
console.log('3. Adicione um botão de compartilhar ao seu HTML:');
console.log('   <button id="shareBtn">🔗 Compartilhar</button>\n');
}
console.log('4. Teste criar e abrir um link em nova aba.');
console.log('5. Teste em diferentes navegadores.\n');
// Debug info
console.log('\n🔍 INFORMAÇÕES DE DEBUG:\n');
console.log('Status do Sistema:', urlManager.getStats());
console.log('URL atual:', window.location.href);
console.log('Hash atual:', window.location.hash || '(vazio)');
// Salvar relatório
window.auraWallTestResults = results;
console.log('\n💾 Relatório completo salvo em: window.auraWallTestResults\n');
return results;
})();
// Função auxiliar para executar testes novamente
window.runAuraWallTests = async function() {
return await runAuraWallTests();
};
console.log('\n💡 TIP: Execute novamente com: runAuraWallTests()\n');
````
-------------------------------
## 🎉 Sistema Completo Pronto!
Criei para você um **sistema completo de links curtos** para o seu AuraWall. Aqui está o que você tem:
### 📦 Arquivos Criados:
1. **`aurawall-url-system.js`** - Sistema principal (código base)
2. **`practical-examples.js`** - Exemplos prontos para usar
3. **`integration.html`** - Página de exemplo/teste
4. **Guia de Integração** - Documentação completa
5. **Checklist de Implementação** - Passo a passo
6. **Script de Testes** - Validação automática
### 🚀 Começar Agora:
#### Passo 1: Adicione ao seu projeto
```html
<!-- No seu index.html, antes do </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"></script>
<script src="aurawall-url-system.js"></script>
<script src="practical-examples.js"></script>
```
#### Passo 2: Adicione botão de compartilhar
```html
<button id="shareBtn">🔗 Compartilhar</button>
```
#### Passo 3: Adapte 2 funções no `practical-examples.js`
```javascript
// 1. Retornar config atual do seu app
function getCurrentWallpaperConfig() {
return {
colors: suasCoreSelecionadas,
pattern: seuPadraoAtual,
// ... outras configs
};
}
// 2. Aplicar config carregada
function applyConfig(config) {
aplicarCores(config.colors);
aplicarPadrao(config.pattern);
// ... aplicar resto
}
```
### ✅ Resultado:
**Antes:**
```
https://seu-site.com/app/#cfg=N4IgdghgtgpiBcIDKBX... (~250 chars)
```
**Depois (com token):**
```
https://seu-site.com/app/#g:a1b2c3d (~40 chars)
```
**85% menor!** 🎉
### 🔑 Token Opcional:
Sem token = funciona, mas links maiores (~200 chars)
Com token = links curtos (~40 chars)
Para configurar token:
1. https://github.com/settings/tokens/new
2. Permissão: apenas "gist"
3. No console: `urlManager.saveToken('seu_token')`
### 🧪 Testar Tudo:
Abra o console e cole o script de testes automatizado que criei. Ele vai validar se tudo está funcionando!
---