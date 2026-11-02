// IGNYT 5 · The Blueprint — push notifications only (no offline caching).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'IGNYT 5', {
    body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag, icon: '/blueprint/icon-192.png', badge: '/blueprint/icon-192.png', data: { url: d.url || '/blueprint/' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/blueprint/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.startsWith(self.location.origin + '/blueprint')) return w.focus();
    return self.clients.openWindow(url);
  }));
});
