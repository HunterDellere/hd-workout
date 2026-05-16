import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts (Wave 4.3). Replaces the Google Fonts CDN load:
//   - kills the render-blocking @import that duplicated index.html's link
//   - makes "fully offline" actually true (Workbox precache picks up the
//     emitted woff2s alongside the JS chunks)
//   - cuts ~250 KB of font CSS+woff2 from third-party origin
// Weights chosen to mirror the previous CDN set; latin subset only.
import '@fontsource/newsreader/latin-300.css';
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/newsreader/latin-500.css';
import '@fontsource/newsreader/latin-300-italic.css';
import '@fontsource/newsreader/latin-400-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';

import './index.css';
import App from './App.jsx';
import { applyTheme, initTheme } from './design-system/applyTheme';
import { SettingsProvider } from './state/settings.jsx';
import { SessionProvider } from './state/session.jsx';
import { OverlayProvider } from './state/overlay.jsx';

// Inject theme tokens (CSS vars) once, before first paint.
applyTheme();
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <OverlayProvider>
        <SessionProvider>
          <App />
        </SessionProvider>
      </OverlayProvider>
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
