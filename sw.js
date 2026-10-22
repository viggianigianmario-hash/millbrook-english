// Keeps the game and its characters on the device after the first visit, so it opens fast.
const CACHE = "millbrook-v1";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const heavy = /\/(rb|rbhd)\/.+\.json$/.test(url.pathname) || /cdnjs|jsdelivr|fonts\.(googleapis|gstatic)/.test(url.host);
  if (heavy) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
  } else if (url.origin === location.origin) {
    // the page itself: always try the newest version first
    e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request)));
  }
});
