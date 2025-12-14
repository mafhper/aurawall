<!-- id: task-system-optimization -->
# System Optimization & Standardization Plan

## 1. Analysis Summary
The current system status, based on recent audits (2025-12-13 22:00+), indicates critical performance bottlenecks and inconsistency in testing methodologies.

### 📊 Status Snapshot
| Metric | Dashboard App | Promo Site |
| :--- | :--- | :--- |
| **Performance** | **37/100** (Critical) | **19/100** (Critical) |
| **Accessibility**| 55/100 (Fail) | **96/100** (Success) |
| **Bundle Size** | ~6.33 MB (Heavy) | N/A |
| **Key Issues** | Large Images (~2MB), Unminified Code (Dev Mode) | Dev Mode Overhead |

### 🚨 Critical Issues
1.  **Dev Mode vs Production:** Audits are running against `npm run dev` (Unminified, HMR overhead), resulting in artificially low performance scores. Real-world performance requires auditing `npm run preview`.
2.  **Asset Management:** Two single image files (`logo-mac-1024x1024*.png`) consume ~30% of the bundle size.
3.  **Code Consistency:** `audit-landing.cjs` uses legacy logic, producing different report formats than `audit-app.cjs`.
4.  **Accessibility Gap:** The Dashboard app has significant a11y regressions compared to the Promo site.

---

## 2. Action Plan

###  Phase 1: Pipeline & Script Standardization (Immediate)
- [ ] **Unify Audit Logic:** specific `audit-app.cjs` and `audit-landing.cjs` should be merged or share a common core (Project `audit-core.js`).
- [ ] **Fix Production Audit:** Configure `vite preview` to serve correctly locally (fixing MIME/404 errors) so audits can run on optimized builds.
- [ ] **Automate Image Optimization:** Integrate `optimize:images` into the `build` hook.

### Phase 2: Asset & Bundle Optimization
- [ ] **Convert Assets:** Convet PNG logos to WebP/AVIF.
- [ ] **Lazy Loading:** Implement `React.lazy` for heavy Dashboard routes (`Creation`, `Gallery`).
- [ ] **Tree Shaking:** Audit massive dependencies (e.g., `lucide-react` is good, but check imports).

### Phase 3: Accessibility Retrofit
- [ ] **Dashboard A11y:** Fix color contrast in Dark Mode and add missing ARIA labels to Sidebar/Controls.

---

## 3. Recommended Next Step
Refactor the audit scripts into a single, robust tool that supports both 'dev' and 'preview' modes, ensuring we optimized what matters.
