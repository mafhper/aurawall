# Docs

Esta pasta documenta o estado atual do AuraWall, nao o historico completo de experimentos.

## Arquivos

- `README.md`: visao rapida da documentacao disponivel
- `TECHNICAL_GUIDE.md`: arquitetura atual do app, promo e pipeline visual
- `change.log`: log cronologico de mudancas relevantes

## Escopo Atual

O produto hoje tem:

- app editor em `src/`
- promo site estatico em `website/`
- 1 engine ativa por vez no editor
- biblioteca com 3 presets por engine
- randomizacao que preserva a identidade do preset selecionado
- assets estaticos do promo gerados a partir de presets canonicos reais

Se uma decisao de produto ou arquitetura mudar esse contrato, atualize esta pasta no mesmo ciclo da mudanca.
