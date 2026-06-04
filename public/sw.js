// Looka Admin Service Worker
const CACHE = "looka-admin-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(["/dashboard", "/login"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Network-first for API, cache-first for assets
  if (e.request.url.includes("/api/") || e.request.url.includes("localhost:4000")) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// ── Push notification handler ──────────────────────────────────
self.addEventListener("push", (e) => {
  if (!e.data) return;

  let payload;
  try { payload = e.data.json(); }
  catch { payload = { title: "Looka Admin", body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(payload.title ?? "Looka Admin", {
      body:    payload.body  ?? "",
      icon:    payload.icon  ?? "/icon-192.png",
      badge:   payload.badge ?? "/icon-192.png",
      data:    { url: payload.url ?? "/dashboard" },
      vibrate: [200, 100, 200],
      tag:     "looka-admin",
      renotify: true,
    })
  );
});

// Open the app when notification is clicked
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? "/dashboard";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
