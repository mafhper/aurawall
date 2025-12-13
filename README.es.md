# AuraWall

**Generador Procedural de Fondos de Pantalla Vectoriales**

AuraWall es una aplicacion web del lado del cliente que genera fondos de pantalla abstractos en alta resolucion utilizando algoritmos procedurales y graficos vectoriales. A diferencia de los generadores basados en IA, AuraWall crea imagenes deterministicas, matematicamente armoniosas, infinitamente escalables y ligeras.

![Interfaz de AuraWall](public/og-image.jpg)

---

## Indice

- [Vision General](#vision-general)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnologico](#stack-tecnologico)
- [Instalacion](#instalacion)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Personalizacion](#personalizacion)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## Vision General

AuraWall opera completamente en el navegador sin dependencias de servidor. La aplicacion utiliza un sistema de configuracion basado en JSON (`WallpaperConfig`) que describe formas, colores, filtros y animaciones. Esta configuracion se renderiza reactivamente como SVG y luego se rasteriza mediante Canvas API para la exportacion.

### Principios Fundamentales

- **Generacion Deterministica**: La misma semilla produce resultados identicos siempre
- **Vector-First**: Todo el renderizado ocurre en SVG hasta la exportacion final
- **Inteligencia Procedural**: Aleatoriedad curada garantiza consistencia estetica
- **Cero Dependencias**: Sin backend, sin APIs de IA, sin servicios externos

---

## Funcionalidades

### Motores de Generacion

| Motor | Estetica | Caracteristicas |
|-------|----------|-----------------|
| **Boreal** | Etereo, suave | Alto desenfoque, colores analogos, modos de mezcla multiply/screen |
| **Chroma** | Liquido, acido | Bajo desenfoque, colores complementarios, modos de mezcla difference/exclusion |
| **Animation** | Cinetico, fluido | Animaciones CSS keyframe para deriva, pulso, rotacion, ruido |

### Controles

- **Gestion de Formas**: Anadir, eliminar y configurar capas individuales
- **Ciencia del Color**: Gradientes base, restricciones de tono, seleccion armonica
- **Post-Procesado**: Efecto vineta, grano procedural, intensidad de desenfoque
- **Fisica de Movimiento**: Velocidad de animacion, direccion de flujo, turbulencia

### Opciones de Exportacion

| Formato | Caso de Uso |
|---------|-------------|
| PNG | Sin perdida, soporte de fondo transparente |
| JPG | Menor tamano de archivo, calidad configurable |
| SVG | Fuente vectorial para edicion en Illustrator/Figma |

### Presets de Resolucion

- Escritorio: 1920x1080, 2560x1440, 3840x2160 (4K)
- Movil: iPhone, Android, iPad
- Personalizado: Cualquier proporcion

---

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Core | React 19, TypeScript |
| Build | Vite 6, PostCSS |
| Estilos | Tailwind CSS v4 |
| Graficos | SVG DOM Nativo, Canvas API |
| i18n | i18next (8 idiomas) |
| Testing | Vitest, Playwright |

---

## Instalacion

### Prerequisitos

- Node.js 18 o superior (Node.js 20+ recomendado)
- npm o yarn

### Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/mafhper/aurawall.git
cd aurawall

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (App Principal + Sitio Promo concurrentemente)
npm run dev

# O iniciar individualmente:
# Aplicacion Principal
npm run app

# Sitio Promocional
npm run promo
```

La aplicacion estara disponible en `http://localhost:5173`.

### Build de Produccion

```bash
# Build de ambas aplicaciones
npm run build

# Build solo de la aplicacion principal
npm run build-app

# Build solo del sitio promocional
npm run build-promo

# Preview del build de produccion
npm run preview
```

---

## Uso

### Inicio Rapido

1. Abra la aplicacion en su navegador
2. Seleccione un motor de generacion (Boreal o Chroma)
3. Ajuste los parametros usando el panel de control
4. Haga clic en "Generar" o use el aleatorizador
5. Exporte en su formato y resolucion preferidos

### Compartir via URL

Las configuraciones pueden compartirse via URL. La aplicacion usa compresion `lz-string` para codificar todo el objeto `WallpaperConfig` en un enlace compartible.

### Galeria de Presets

Acceda a la galeria para explorar los presets curados. Cada preset puede ser:
- Descargado directamente como PNG (1920x1080)
- Abierto en el editor para personalizacion
- Usado como punto de partida para nuevas creaciones

---

## Estructura del Proyecto

```
aurawall/
├── src/                      # Codigo fuente de la aplicacion principal
│   ├── components/           # Componentes React
│   ├── services/             # Logica de negocio
│   ├── constants.ts          # Presets y valores por defecto
│   └── types.ts              # Definiciones TypeScript
│
├── website/                  # Sitio promocional (build separado)
│   ├── src/pages/            # Landing, Galeria, Acerca de
│   └── vite.config.ts        # Configuracion de build del sitio
│
├── public/                   # Assets estaticos
└── package.json              # Dependencias y scripts
```

---

## Personalizacion

### Anadir Nuevos Presets

Los presets se definen en `src/constants.ts`:

```typescript
export const PRESETS: Preset[] = [
  {
    id: 'mi-preset',
    name: 'Mi Preset Personalizado',
    collection: 'boreal',
    config: {
      baseColor: '#1a0a2e',
      shapes: [...],
      animation: { enabled: true, speed: 2 },
    }
  }
];
```

### Crear Motores Personalizados

Los motores se definen por su modo de mezcla y caracteristicas de desenfoque. Modifique `src/services/svgGenerator.ts` para anadir nuevos algoritmos de generacion.

---

## Contribuir

1. Fork del repositorio
2. Crear una rama de feature: `git checkout -b feature/tu-feature`
3. Commit de cambios: `git commit -m 'Anadir tu feature'`
4. Push a la rama: `git push origin feature/tu-feature`
5. Abrir un Pull Request

---

## Licencia

Licencia MIT - Ver archivo [LICENSE](LICENSE) para detalles.

---

**Autor**: [@mafhper](https://github.com/mafhper)

**Repositorio**: [github.com/mafhper/aurawall](https://github.com/mafhper/aurawall)
