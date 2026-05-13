// HDW :: minimal offline service worker.
// Cache-first for navigations, stale-while-revalidate for everything else.
// Bumping CACHE_VERSION on each deploy is enough to invalidate old caches.
//
// IMPORTANT: bump this on every meaningful release. The activate handler
// deletes every cache whose key doesn't start with the current version,
// so a bump is the single switch that evicts the previous install's
// cached shell + manifest + icons.

const CACHE_VERSION = 'hdw-v3-library-hub';
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSET_CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFallingBackToCache(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});

async function networkFallingBackToCache(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(ASSET_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    const fallback = await caches.match('./index.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || network || new Response('Offline', { status: 503 });
}
