# Refactor Creation Engines to Data-Driven Architecture

**Date:** 12-12-2025
**Goal:** Extract hardcoded engine logic (Boreal, Chroma) into standardized, configuration-based definitions to allow easy expansion and management.

## Plan
1.  **Define Interface:** Create `EngineDefinition` type in `src/types.ts`.
2.  **Create Registry:** Create `src/engines/index.ts` and individual engine files.
3.  **Migrate Logic:**
    - Extract metadata (name, description, etc.).
    - Extract randomization logic parameters (e.g., blur ranges, color palettes).
4.  **Refactor Components:**
    - `App.tsx`: Remove hardcoded switches; use engine definitions.
    - `variationService.ts`: Accept engine config instead of `CollectionId` switch.
    - `Controls.tsx`: Generate mode switcher from engine registry.

## Status
- [x] Define `EngineDefinition` interface.
- [x] Create `src/engines/boreal.ts`.
- [x] Create `src/engines/chroma.ts`.
- [x] Create `src/engines/index.ts` (Registry).
- [x] Refactor `variationService.ts`.
- [x] Refactor `App.tsx`.
- [x] Refactor `Controls.tsx`.

# Create New Engine Types and Theme Gallery

**Date:** 12-12-2025
**Goal:** Create 6 new engine types and implement a theme gallery with active engine limit.

## Plan
1.  **Create 6 new Engine Definition files:**
    - `src/engines/lava.ts`
    - `src/engines/midnight.ts`
    - `src/engines/geometrica.ts`
    - `src/engines/glitch.ts`
    - `src/engines/sakura.ts`
    - `src/engines/ember.ts`
2.  **Update `src/engines/index.ts`:** Register new engines.
3.  **Update `src/types.ts`:** Change `CollectionId` to `string`.
4.  **Refactor `src/App.tsx`:**
    - Add `enabledEngines` state (initial: `['boreal', 'chroma', 'lava']`).
    - Pass `enabledEngines` and `setEnabledEngines` to `Controls`.
5.  **Create `src/components/EngineGallery.tsx`:** Modal component for browsing/equipping engines.
6.  **Refactor `src/components/Controls.tsx`:**
    - Update `ControlsProps` to accept `enabledEngines` and `setEnabledEngines`.
    - Modify collection switcher to iterate over `enabledEngines`.
    - Add logic to open `EngineGallery` for swapping.

## Status
- [x] Create `src/engines/lava.ts`.
- [x] Create `src/engines/midnight.ts`.
- [x] Create `src/engines/geometrica.ts`.
- [x] Create `src/engines/glitch.ts`.
- [x] Create `src/engines/sakura.ts`.
- [x] Create `src/engines/ember.ts`.
- [x] Create `src/engines/oceanic.ts` (Special Request).
- [x] Update `src/engines/index.ts`.
- [x] Update `src/types.ts` (CollectionId to string).
- [x] Refactor `src/App.tsx` (enabledEngines state and props).
- [x] Create `src/components/EngineGallery.tsx`.
- [x] Refactor `src/components/Controls.tsx` (dynamic switcher, gallery logic).
- [x] Fix `useTranslation` import in `src/components/Controls.tsx` (it was already there, no change needed).
- [x] Refine `geometrica` (Grid system) and `glitch` (RGB split) for better distinction.
- [x] Generate animated SVG backgrounds for all themes using `scripts/generate-bgs.cjs`.

# Website Refactoring and UX Improvements

**Date:** 12-12-2025
**Goal:** Refactor the promotional website to better showcase new engines, improve navigation, and enhance user experience.

## Plan
1.  **Copy Animated SVGs:** Copy `bg-*.svg` from root `public/` to `website/public/`.
2.  **Update Navigation & Routes (`website/src/App.tsx`):**
    - Consolidate "Boreal" and "Chroma" links into a single "Motores de Criação".
    - Add routes for `/creation/engines` and `/creation/engine/:id`.
3.  **Update Creation Landing Page (`website/src/pages/Creation.tsx`):**
    - Replace individual engine cards with a "Motores de Criação" card.
4.  **Create Engines Hub Page (`website/src/pages/CreationEngines.tsx`):**
    - Implement a layout with a hero engine, three secondary engines, and a grid of all others.
    - Use `WallpaperRenderer` for hover-animated previews.
5.  **Create Dynamic Engine Detail Page (`website/src/pages/CreationEngineDetail.tsx`):**
    - Generic page to display details for any engine based on URL `id`.
6.  **Enhance Gallery Page (`website/src/pages/Gallery.tsx`):**
    - Implement modal functionality to show engine details and examples on click.
    - Ensure examples in modal also animate on hover.
7.  **Update Home Page (`website/src/pages/Home.tsx`):**
    - Update text to reflect the expanded collection.
    - Ensure "Launch App" buttons encode `heroConfig` to the app URL.

## Status
- [x] Copy animated SVGs to `website/public/`.
- [x] Update Navigation & Routes (`website/src/App.tsx`).
- [x] Update Creation Landing Page (`website/src/pages/Creation.tsx`).
- [x] Create Engines Hub Page (`website/src/pages/CreationEngines.tsx`).
- [x] Create Dynamic Engine Detail Page (`website/src/pages/CreationEngineDetail.tsx`).
- [x] Enhance Gallery Page (`website/src/pages/Gallery.tsx`).
- [x] Update Home Page (`website/src/pages/Home.tsx`).
- [x] Fix missing i18n keys for new content.
- [x] Implement "static by default, animate on hover" for Gallery cards and Modal examples.
- [x] Remove "Início" button from navigation.
- [x] Verify ScrollToTop behavior (Confirmed working).

# Final UX Enhancements

**Date:** 12-12-2025
**Goal:** Implement final polish suggestions for improved user experience.

## Plan
1.  **Engine Swap Button Visibility (`src/components/Controls.tsx`):**
    *   Change opacity from `0` to `50%` by default, `100%` on hover.
2.  **Zen Mode (`src/App.tsx`):**
    *   Add `isZenMode` state and `useEffect` for cursor hiding.
    *   Add toggle button in preview area controls.
    *   Conditionally render UI based on `isZenMode`.
3.  **Color Palette Extraction (`src/components/Controls.tsx`):**
    *   Create `src/components/ColorPaletteExtractor.tsx`.
    *   Integrate as new `CollapsibleSection` in `Controls.tsx`.
    *   Extract and display main colors (HEX), with copy-to-clipboard functionality.
    *   Add new i18n keys.

## Status
- [x] Engine Swap Button Visibility (`src/components/Controls.tsx`).
- [x] Zen Mode (`src/App.tsx`).
- [x] Color Palette Extraction (`src/components/Controls.tsx`).
- [x] Fix duplicate import in `Controls.tsx`.
- [x] Fix missing import in `App.tsx`.