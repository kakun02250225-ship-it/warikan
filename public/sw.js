// PWA用の最小サービスワーカー。
// - 画面遷移(navigate)はネット優先、オフライン時はキャッシュ済みの index.html を返す
// - ハッシュ付き静的アセット(_expo/)はキャッシュ優先
const CACHE = 'warikan-v1';
const BASE = '/warikan';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([`${BASE}/`, `${BASE}/index.html`])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Firebase等の外部通信には触らない

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(`${BASE}/index.html`, res.clone()));
          return res.clone();
        })
        .catch(() => caches.match(`${BASE}/index.html`)),
    );
    return;
  }

  if (url.pathname.startsWith(`${BASE}/_expo/`) || url.pathname.startsWith(`${BASE}/icons/`)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
  }
});
