# Código Fonte da Aplicação Principal (src/)

## Propósito

Esta pasta contém o código fonte da aplicação AuraWall, onde toda a lógica de geração de wallpapers, interface do usuário e funcionalidades principais são desenvolvidas. É o coração da aplicação interativa.

## Conteúdo

### Subdiretórios
- `components/`: Componentes React reutilizáveis da aplicação.
- `engines/`: Lógica e definições para os diferentes motores de geração de wallpapers (Boreal, Chroma, Lava, etc.).
- `hooks/`: Custom React Hooks para encapsular lógicas de estado e comportamento.
- `services/`: Módulos com lógica de negócio e serviços específicos, como geração de variações ou comunicação.
- `utils/`: Funções utilitárias e helpers genéricos usados em diversas partes da aplicação.

### Arquivos
- `App.tsx`: O componente raiz principal da aplicação React.
- `constants.ts`: Definições de constantes, presets, configurações padrão e outros valores fixos.
- `i18n.ts`: Configuração e instâncias para internacionalização (tradução) da aplicação.
- `index.css`: Estilos CSS globais da aplicação.
- `index.tsx`: Ponto de entrada principal da aplicação (onde o React é montado no DOM).
- `types.ts`: Definições de tipos TypeScript para as estruturas de dados usadas na aplicação.
