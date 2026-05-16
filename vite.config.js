import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves the site at https://hunterdellere.github.io/hd-workout/.
// Production builds and `vite preview` (which serves the built bundle) must
// share the same base so asset URLs in dist/index.html resolve correctly.
// `vite preview` runs with mode='production' by default.
export default defineConfig(({ command, mode }) => {
  const isProd = command === 'build' || mode === 'production';
  const base = isProd ? '/hd-workout/' : '/';
  return {
    base,
    plugins: [
      react(),
      // Real PWA precache via Workbox. The previous hand-rolled sw.js only
      // cached the shell (index.html + manifest + icon); JS/CSS chunks
      // entered the cache lazily on first visit. That breaks "fully offline"
      // for a freshly-installed user. This plugin emits a precache manifest
      // covering every hashed asset Vite produces.
      VitePWA({
        registerType: 'prompt', // user-prompted update; no mid-session bundle swap
        injectRegister: false,  // main.jsx already registers; keep one source
        // The Workbox-generated SW is emitted at the build root. The runtime
        // registration in main.jsx already points at `${BASE_URL}sw.js`.
        filename: 'sw.js',
        // Match the manifest we already authored in public/. We pass it
        // through `manifest: false` and let our static manifest.webmanifest
        // be the source of truth.
        manifest: false,
        workbox: {
          // Precache every Vite-emitted asset: index.html, JS chunks, CSS,
          // icons, the manifest webmanifest. The default glob covers it.
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
          // SPA fallback for HashRouter deep links served by GH Pages.
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/^\/api\//],
          // Stay strict: HashRouter means deep links never become GET 404s.
          cleanupOutdatedCaches: true,
          // Google Fonts: cache the CSS + woff2 so cold offline survives
          // the first visit. (Real fix is self-hosting fonts — Wave 4.)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        // Dev server should not register a SW; it interferes with HMR.
        devOptions: { enabled: false },
      }),
    ],
  };
});
