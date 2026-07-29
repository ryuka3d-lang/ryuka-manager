const CACHE_NAME = "ryuka-shell-v2";
const APP_SHELL = ["/login", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Los archivos generados por Next nunca deben recibir una página HTML como reemplazo.
  if (url.pathname.startsWith("/_next/") || request.destination === "script" || request.destination === "style") {
    event.respondWith(fetch(request));
    return;
  }

  // Para navegación: red primero; si no hay conexión, usar la pantalla de acceso almacenada.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/login")));
    return;
  }

  // Recursos estáticos: caché primero y actualización normal desde la red.
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
