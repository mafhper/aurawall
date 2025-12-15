import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import '../../src/index.css';

// Hydration for SSG or createRoot for Dev/SPA
const container = document.getElementById('root')!;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter 
        basename={import.meta.env.BASE_URL}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
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
