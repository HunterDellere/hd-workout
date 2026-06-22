import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Preload only the faces actually painted above the fold so the LCP text
// (Inter-styled body + Newsreader titles) doesn't wait on JS → CSS → font.
// Keep this set SMALL — over-preloading competes with the JS bundle and can
// regress LCP. Matched by the stable @fontsource source basename; Vite emits
// each as `<basename>-<hash>.woff2`, so we resolve the hashed name at build.
const PRELOAD_FONT_PREFIXES = [
  'inter-latin-400-normal',
  'newsreader-latin-400-normal',
  'newsreader-latin-400-italic',
  'jetbrains-mono-latin-400-normal',
];

// Inject <link rel=preload> for the above-the-fold woff2 faces using the
// hashed filenames Vite actually emitted (never hardcode hashes). Resolves
// the deploy base from config so hrefs are absolute under GH Pages' subpath.
function preloadFonts() {
  let resolvedBase = '/';
  return {
    name: 'hdw-preload-fonts',
    enforce: 'post',
    apply: 'build',
    configResolved(config) {
      resolvedBase = config.base ?? '/';
    },
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const tags = [];
      for (const fileName of Object.keys(ctx.bundle)) {
        if (!fileName.endsWith('.woff2')) continue;
        const baseName = fileName.split('/').pop();
        if (!PRELOAD_FONT_PREFIXES.some((p) => baseName.startsWith(p))) continue;
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'preload',
            as: 'font',
            type: 'font/woff2',
            href: `${resolvedBase}${fileName}`,
            crossorigin: '',
          },
          injectTo: 'head-prepend',
        });
      }
      return { html, tags };
    },
  };
}

// GitHub Pages serves the site at https://hunterdellere.github.io/hd-workout/.
// Production builds and `vite preview` (which serves the built bundle) must
// share the same base so asset URLs in dist/index.html resolve correctly.
// `vite preview` runs with mode='production' by default.
export default defineConfig(({ command, mode }) => {
  const isProd = command === 'build' || mode === 'production';
  const base = isProd ? '/hd-workout/' : '/';
  return {
    base,
    build: {
      rollupOptions: {
        output: {
          // Split a stable vendor chunk for the React runtime so it stays
          // cacheable across deploys and app-code churn doesn't re-bust it.
          manualChunks: (id) =>
            id.includes('node_modules/react') || id.includes('react-router')
              ? 'vendor'
              : undefined,
        },
      },
    },
    plugins: [
      react(),
      preloadFonts(),
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
          // Fonts are self-hosted via @fontsource and emitted as hashed
          // woff2 into dist/assets, so the globPatterns precache above
          // already covers offline font availability — no runtime caching
          // of any third-party font origin is needed.
        },
        // Dev server should not register a SW; it interferes with HMR.
        devOptions: { enabled: false },
      }),
    ],
  };
});
