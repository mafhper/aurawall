// As portas deste projeto, em um lugar so.
//
// AuraWall tem DUAS superficies Vite e elas sobem ao mesmo tempo (`npm run dev` =
// `concurrently "npm run app" "npm run promo"`), e o site de promo faz PROXY de
// `/app` para o app. Entao tres numeros precisam concordar entre si:
//
//   app       5330
//   website   5340
//   (preview) 5330
//
// Antes cada um vivia no seu config, e o alvo do proxy era um literal. Um `npm
// run dev` que subisse o app em outra porta deixaria o promo proxyando para o
// vazio — e o sintoma seria "o app nao abre dentro do site", sem mencao a porta.
//
// Fora de 5173-5175 e 4173-4175 de proposito: sao as faixas onde o incremento
// automatico do Vite cai, e uma porta nomeada ali dentro seria indistinguivel de
// um incremento.

export const APP_PORT = 5330;
export const WEBSITE_PORT = 5340;

/**
 * O app usa `host: '0.0.0.0'` de proposito — ele e servido para o celular na
 * rede local durante o desenvolvimento de wallpapers. Isso e exatamente o
 * caso em que bindar `0.0.0.0` tem sucesso mesmo com `127.0.0.1` ocupado (ver
 * `.dev/docs/padroes/colisao-de-porta-dev-server.md` na frota), entao a porta
 * precisa ser nomeada E verificada. Ver `scripts/sonda-porta.ts`.
 */
export const APP_HOST = '0.0.0.0';