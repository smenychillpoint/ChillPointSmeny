// Jednoduchý service worker: vždy skúsi najprv sieť (aktuálne dáta a verzia), keď nie je internet, použije uloženú kópiu stránky.
// v2: index.html je úvodná stránka (rozcestník), Smeny sú v smeny.html, Objednávky v objednavky.html.
const CACHE = 'cp-smeny-v2';
const SHELL = ['./', './index.html', './smeny.html', './objednavky.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;   // Firebase a ostatné externé veci idú priamo
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
