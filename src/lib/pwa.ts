/**
 * Registers the service worker in the browser. No-op during SSR and in dev
 * where a SW would fight Vite HMR — enabled only for production builds.
 */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[pwa] service worker registration failed:", err);
    });
  });
}
