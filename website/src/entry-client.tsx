import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import '../../src/index.css';

// Hydration for SSG or createRoot for Dev/SPA
const container = document.getElementById('root')!;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      {/* As flags v7_* saíram de cena no react-router 8: `v7_startTransition`
          virou o comportamento padrão (BrowserRouter envolve o setState em
          startTransition, a menos que useTransitions={false}) e
          `v7_relativeSplatPath` virou o createBrowserHistory, que é criado
          internamente com v5Compat: true. Manter o `future` aqui só produzia
          erro de tipo — o prop não existe mais em BrowserRouterProps. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Check if container has REAL content (not just comments or whitespace)
// This prevents hydration issues when <!--app-html--> placeholder exists
const hasRealContent = () => {
  // Get text content (ignoring comments)
  const text = container.textContent?.trim();
  if (text && text.length > 0) return true;
  
  // Check for element children (not just comment nodes)
  for (const child of Array.from(container.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      return true;
    }
  }
  return false;
};

if (hasRealContent()) {
  // SSG: Hydrate pre-rendered content
  ReactDOM.hydrateRoot(container, app);
} else {
  // Dev/SPA: Create fresh root
  ReactDOM.createRoot(container).render(app);
}
