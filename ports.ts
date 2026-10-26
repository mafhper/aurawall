// As portas deste projeto, em um lugar so.
//
// AuraWall tem DUAS superficies Vite e elas sobem ao mesmo tempo (`npm run dev` =
// `concurrently "npm run app" "npm run promo"`), e o site de promo faz PROXY de
// `/app` para o app. Entao tres numeros precisam concordar entre si: app, website
// e o preview, que serve na porta do app.
//
// Os NUMEROS moram em `ports.json`, ao lado deste arquivo — este modulo e' so a
// fachada tipada deles. O JSON existe porque e' o unico formato que o TypeScript,
// o Vite e os scripts CommonJS leem sem que um deles precise de uma copia. Antes
// cada config tinha o seu numero, e o alvo do proxy era um literal: um `npm run
// dev` que subisse o app em outra porta deixaria o promo proxyando para o vazio,
// e o sintoma seria "o app nao abre dentro do site", sem mencao a porta.
//
// Fora de 5173-5175 e 4173-4175 de proposito: sao as faixas onde o incremento
// automatico do Vite cai, e uma porta nomeada ali dentro seria indistinguivel de
// um incremento.

import ports from './ports.json' with { type: 'json' };

export const APP_PORT = ports.app;
export const WEBSITE_PORT = ports.website;

/**
 * O app usa `host: '0.0.0.0'` de proposito — ele e servido para o celular na
 * rede local durante o desenvolvimento de wallpapers. Isso e exatamente o
 * caso em que bindar `0.0.0.0` tem sucesso mesmo com `127.0.0.1` ocupado, e e
 * por isso que a sonda VERIFICA antes do bind em vez de realocar: sem isso o
 * servidor sobe sem erro e serve o projeto errado. A porta precisa ser
 * nomeada E verificada. Ver `scripts/sonda-porta.ts`.
 */
export const APP_HOST = ports.host;
