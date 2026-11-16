// Service worker: precache the whole app so it runs offline on the slope.
// Bump CACHE with every release (keep in sync with js/version.js).

const CACHE = 'pistencoach-0.4.0';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'icons/icon.svg',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/app.js',
  'js/store.js',
  'js/version.js',
  'js/ui/motion.js',
  'js/views/common.js',
  'js/views/home.js',
  'js/views/level.js',
  'js/views/lesson.js',
  'js/views/coach.js',
  'js/views/problems.js',
  'js/views/more.js',
  'js/views/extras.js',
  'js/anim/curves.js',
  'js/anim/svg.js',
  'js/anim/palette.js',
  'js/anim/model.js',
  'js/anim/topdown.js',
  'js/anim/front.js',
  'js/anim/side.js',
  'js/anim/player.js',
  'js/anim/scenes/index.js',
  'js/anim/scenes/grundschwung.js',
  'js/anim/scenes/schwungausloesung.js',
  'js/anim/scenes/basics.js',
  'js/anim/scenes/parallel.js',
  'js/anim/scenes/advanced.js',
  'js/anim/scenes/extra.js',
  'data/lessons.js',
  'data/extras.js',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' bypasses the HTTP cache. GitHub Pages lets browsers keep
  // files for 10 minutes, which would otherwise put stale files into a new cache.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pistencoach-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
