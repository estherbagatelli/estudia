/* Esther's Planner — Service Worker
 * Strategy:
 *   - Supabase (auth/data/realtime): NEVER cached — always network. Keeping
 *     these fresh is essential; caching would break login and sync.
 *   - Navigations (HTML): network-first, fall back to the cached shell when
 *     offline so the installed app still opens.
 *   - Same-origin static assets (JS/CSS/img/fonts): stale-while-revalidate.
 *   - Everything else: passthrough.
 */
const VERSION = "v1";
const RUNTIME = `ep-runtime-${VERSION}`;
const SHELL = `ep-shell-${VERSION}`;
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.add(OFFLINE_URL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isSupabase(url) {
  return url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch Supabase (auth, REST, realtime).
  if (isSupabase(url)) return;

  // Navigations: network-first with offline shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch {
          const cache = await caches.open(SHELL);
          const cached = await cache.match(OFFLINE_URL);
          return cached ?? Response.error();
        }
      })(),
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(request, res.clone());
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});

// Allow the page to trigger an immediate update.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
