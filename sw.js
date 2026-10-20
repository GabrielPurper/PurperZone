const CACHE = 'purperzone-static-v5';

// Cache apenas recursos estáticos do próprio site. Não coloque HTML personalizado,
// respostas autenticadas, endpoints de API ou arquivos privados nesta lista.
const STATIC_ASSETS = [
  './app.js', './apps.js', './auth.js', './cart.js', './checkout.js', './feed.js',
  './games.js', './jarvis.js', './library.js', './messages.js', './moderation.js',
  './notifications.js', './plans.js', './post.js', './profile.js', './projects.js',
  './pwa.js', './realtime.js', './reels.js', './search.js', './settings.js', './store.js',
  './supabaseClient.js', './avatar-placeholder.svg', './layout.js', './home.js', './variables.css', './reset.css',
  './main.css', './style.css'
];
const STATIC_PATHS = new Set(STATIC_ASSETS.map(path => new URL(path, self.location.href).pathname));
const API_PATHS = ['/rest/v1/', '/auth/v1/', '/functions/v1/', '/storage/v1/', '/realtime/v1/', '/graphql/v1/'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('purperzone-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (API_PATHS.some(path => url.pathname.includes(path))) return;
  if (request.headers.has('authorization') || request.headers.has('cookie')) return;
  // Cache somente arquivos estáticos explicitamente listados, sem query string.
  if (url.search || !STATIC_PATHS.has(url.pathname)) return;

  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic' && !response.headers.has('set-cookie')) {
      await cache.put(request, response.clone());
    }
    return response;
  }));
});
