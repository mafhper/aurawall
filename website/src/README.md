# Código Fonte do Site Promocional (website/src/)

## Propósito

Este diretório contém o código fonte da aplicação React que compõe o site promocional do AuraWall. Ele é o coração da experiência do usuário no site, definindo as rotas, páginas e componentes interativos.

## Conteúdo

### Subdiretórios
- `components/`: Componentes React reutilizáveis específicos do site promocional (ex: `HeroBackground`, `GalleryCard`).
- `data/`: Dados estáticos ou mockados usados pelo site (ex: definições de engines).
- `pages/`: Componentes React que representam as diferentes páginas do site (ex: Home, About, Creation Engines).
- `utils/`: Funções utilitárias e helpers específicos para o site promocional.

### Arquivos
- `App.tsx`: O componente raiz principal da aplicação React do site promocional, onde as rotas são definidas.
- `entry-client.tsx`: Ponto de entrada do lado do cliente para a aplicação (hidratation).
- `entry-server.tsx`: Ponto de entrada do lado do servidor para a aplicação (SSR/SSG).
- `i18n.ts`: Configuração e instâncias para internacionalização (tradução) do site promocional.
- `main.tsx`: Ponto de entrada principal da aplicação (montagem do React no DOM do cliente).
