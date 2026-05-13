import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { applyTheme, initTheme } from './design-system/applyTheme';
import { SettingsProvider } from './state/settings.jsx';
import { SessionProvider } from './state/session.jsx';

// Inject theme tokens (CSS vars) once, before first paint.
applyTheme();
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </SettingsProvider>
  </StrictMode>,
);

// Register a basic offline service worker in production.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      .register(swPath, { scope: import.meta.env.BASE_URL })
      .catch(() => { /* fail silently — app still works without SW */ });
  });
}
