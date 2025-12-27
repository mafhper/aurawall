# Componentes do Site Promocional (website/src/components/)

## Propósito

Este diretório contém componentes React reutilizáveis que são específicos para a construção da interface do site promocional. Eles são projetados para funcionalidades que aparecem em múltiplas páginas do site ou encapsulam partes complexas da UI.

## Conteúdo

### Arquivos
- `CodeWindow.tsx`: Componente para exibir blocos de código formatados.
- `GalleryCard.tsx`: Card utilizado para exibir presets ou engines em galerias, muitas vezes com pré-visualização interativa.
- `HeroBackground.tsx`: Componente de background animado para seções de herói, utilizando o `WallpaperRenderer` com presets curados.
- `LazySection.tsx`: Componente utilitário para "lazy hydrate" seções, renderizando-as apenas quando visíveis na viewport (usando IntersectionObserver).
- `ScrollToTop.tsx`: Componente que força a página a rolar para o topo em cada mudança de rota.
