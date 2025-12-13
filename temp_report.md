# Health Check Report
**Date:** 13/12/2025, 00:20:26
**System:** win32 x64 | **Node:** v22.20.0

## 📊 Executive Summary

| Task | Status | Duration |
| :--- | :---: | :---: |
| **Clean Environment** | ✅ SUCCESS | 13.03s |
| **Install Dependencies** | ✅ SUCCESS | 77.21s |
| **Build: Promo Site** | ✅ SUCCESS | 24.71s |
| **Build: Application** | ✅ SUCCESS | 14.13s |
| **Test: File Structure** | ✅ SUCCESS | 1.14s |
| **Test: Security Audit** | ✅ SUCCESS | 3.71s |
| **Test: i18n Integrity** | ❌ FAILED | 1.55s |
| **Test: Linting** | ❌ FAILED | 24.77s |
| **Test: Performance** | ✅ SUCCESS | 1.36s |

---

## 📝 Detailed Logs

### ✅ Clean Environment
<details>
<summary>View Output Log</summary>

node_modules and package-lock.json removed.
</details>

---

### ✅ Install Dependencies
<details>
<summary>View Output Log</summary>

added 222 packages, and audited 223 packages in 1m

57 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
</details>

---

### ✅ Build: Promo Site
<details>
<summary>View Output Log</summary>

> aurawall-v0.1@0.0.0 build-promo
> vite build --config website/vite.config.ts

vite v6.4.1 building for production...
transforming...
✓ 1769 modules transformed.
rendering chunks...
computing gzip size...
../dist/index.html                   0.52 kB │ gzip:   0.32 kB
../dist/assets/index-Zd246BtE.css  113.96 kB │ gzip:  14.73 kB
../dist/assets/index-B9fAEl8n.js   491.42 kB │ gzip: 143.84 kB
✓ built in 22.59s
</details>

---

### ✅ Build: Application
<details>
<summary>View Output Log</summary>

> aurawall-v0.1@0.0.0 build-app
> vite build

vite v6.4.1 building for production...
transforming...
✓ 1753 modules transformed.
rendering chunks...
computing gzip size...
dist/app/index.html                   4.51 kB │ gzip:   1.30 kB
dist/app/assets/index-BIVPrdNJ.css  113.97 kB │ gzip:  14.73 kB
dist/app/assets/index-C2NJXPUe.js   392.56 kB │ gzip: 116.94 kB
✓ built in 11.74s
</details>

---

### ✅ Test: File Structure
<details>
<summary>View Output Log</summary>

> aurawall-v0.1@0.0.0 test:structure
> node scripts/test-structure.cjs

Checking File Structure...

✅ Found File: README.md
✅ Found File: package.json
✅ Found File: vite.config.ts
✅ Found File: tailwind.config.js
✅ Found File: src/App.tsx
✅ Found File: src/components/WallpaperRenderer.tsx
✅ Found File: docs/TECHNICAL_GUIDE.md
✅ Found Directory: src
✅ Found Directory: public
✅ Found Directory: website
✅ Found Directory: _desenvolvimento
✅ Found Directory: .github

Structure check passed.
</details>

---

### ✅ Test: Security Audit
<details>
<summary>View Output Log</summary>

> aurawall-v0.1@0.0.0 test:security
> npm audit --audit-level=critical

found 0 vulnerabilities
</details>

---

### ❌ Test: i18n Integrity
<details>
<summary>View Output Log</summary>

> aurawall-v0.1@0.0.0 test:i18n
> node scripts/test-i18n.cjs

🔍 Checking i18n consistency...
  ⚠️  10 values identical to English (check if translation needed):
     - translation.showcase.boreal_title: "Boreal"
     - translation.showcase.chroma_title: "Chroma"
     - translation.creation.boreal_title: "Boreal"
     - translation.creation.chroma_title: "Chroma"
     - translation.tech.stack_core: "Core: React 19 + TypeScript"
     ...and 5 more.
  ❌ Missing 38 keys:
     - translation.tech.stack_github
     - translation.tech.stack_compress
     - translation.procedural.chaos_title
     - translation.procedural.chaos_desc
     - translation.procedural.tag_deterministic
     ...and 33 more.
  ⚠️  6 values identical to English (check if translation needed):
     - translation.showcase.boreal_title: "Boreal"
     - translation.creation.boreal_title: "Boreal"
     - translation.tech.stack_core: "Core: React 19 + TypeScript"
     - translation.tech.stack_build: "Build: Vite 6"
     - translation.changes.commits: "Commits"
     ...and 1 more.
📝 Found languages: en, pt-BR, es

🔎 Checking 'pt-BR'...

🔎 Checking 'es'...

❌ Verification failed with errors.
</details>

---

### ❌ Test: Linting
<details>
<summary>View Output Log</summary>

error    Error: Cannot create components during render

Components created during render will reset their state each time they are created. Declare components outside of render.

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\App.tsx:195:14
  193 |             <MobileLink to="/gallery">{t('nav.gallery')}</MobileLink>
  194 |             <MobileLink to="/changes">{t('nav.changes')}</MobileLink>
> 195 |             <MobileLink to="/about">{t('nav.about')}</MobileLink>
      |              ^^^^^^^^^^ This component is created during render
  196 |             
  197 |             <div className="mt-8">
  198 |               <a 

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\App.tsx:131:22
  129 |   }, [isOpen]);
  130 |
> 131 |   const MobileLink = ({ to, children, className = "" }: { to: string, children: React.ReactNode, className?: string }) => {
      |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 132 |      const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 133 |      return (
      …
      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 141 |      )
      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
> 142 |   }
      | ^^^^ The component is created during render here
  143 |
  144 |   return (
  145 |     <div className="md:hidden">                                                            react-hooks/static-components

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\components\GalleryCard.tsx
   3:47  warning  'Check' is defined but never used         @typescript-eslint/no-unused-vars
   9:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  29:11  warning  'rnd' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\About.tsx
  3:32  warning  'Newspaper' is defined but never used  @typescript-eslint/no-unused-vars
  3:43  warning  'FileText' is defined but never used   @typescript-eslint/no-unused-vars
  3:53  warning  'Server' is defined but never used     @typescript-eslint/no-unused-vars

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\Changes.tsx
    3:21  warning  'Tag' is defined but never used                    @typescript-eslint/no-unused-vars
    3:36  warning  'ArrowRight' is defined but never used             @typescript-eslint/no-unused-vars
  113:21  warning  'setChangelog' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\Creation.tsx
  82:35  error  React Hook "useMemo" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function  react-hooks/rules-of-hooks

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\CreationBoreal.tsx
  152:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\CreationChroma.tsx
  189:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\CreationEngineDetail.tsx
  13:11  warning  't' is assigned a value but never used                                                                        @typescript-eslint/no-unused-vars
  31:6   warning  React Hook useMemo has a missing dependency: 'engineLogic'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\CreationEngines.tsx
   97:11  warning  't' is assigned a value but never used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         @typescript-eslint/no-unused-vars
  101:46  error    Error: Cannot call impure function during render

`Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\CreationEngines.tsx:101:46
   99 |   // Shuffle engines once on mount
  100 |   const { hero, secondary, grid } = useMemo(() => {
> 101 |     const shuffled = [...ENGINES].sort(() => Math.random() - 0.5);
      |                                              ^^^^^^^^^^^^^ Cannot call impure function
  102 |     return {
  103 |       hero: shuffled[0],
  104 |       secondary: shuffled.slice(1, 4),  react-hooks/purity

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\CreationProcedural.tsx
  26:72  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\Gallery.tsx
  153:47  error  React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function  react-hooks/rules-of-hooks
  154:28  error  React Hook "useMemo" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function   react-hooks/rules-of-hooks

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\Home.tsx
   1:36  warning  'useEffect' is defined but never used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   @typescript-eslint/no-unused-vars
   4:70  warning  'Shuffle' is defined but never used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     @typescript-eslint/no-unused-vars
   5:19  warning  'DEFAULT_CONFIG' is defined but never used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              @typescript-eslint/no-unused-vars
  85:36  error    Error: Cannot call impure function during render

`Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\Home.tsx:85:36
  83 |   // Get 3 random presets for the gallery teaser
  84 |   const galleryPresets = useMemo(() => {
> 85 |     return [...PRESETS].sort(() => Math.random() - 0.5).slice(0, 3);
     |                                    ^^^^^^^^^^^^^ Cannot call impure function
  86 |   }, []);
  87 |
  88 |   const launchUrl = useMemo(() => {  react-hooks/purity

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\pages\Tech.tsx
  4:16  warning  'Cpu' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\mafhp\Documents\GitHub\aurawall\website\src\utils\svgGenerator.ts
   4:52  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  71:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  93:28  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 112 problems (51 errors, 61 warnings)
  9 errors and 0 warnings potentially fixable with the `--fix` option.


❌ Linting failed.
*(Log truncated)*

</details>

---

### ✅ Test: Performance
<details>
<summary>View Output Log</summary>

> aurawall-v0.1@0.0.0 test:perf
> node scripts/test-perf.cjs

Checking Build Performance (Bundle Size)...

Total Build Size: 6.14 MB
File Count: 68
⚠️ Build exceeds warning threshold (5 MB).
</details>

---

