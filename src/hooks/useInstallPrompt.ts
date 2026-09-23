import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Manages "Add to Home Screen" / install-app UX across platforms.
 *
 * - Chrome / Android / desktop: captures `beforeinstallprompt` so a custom
 *   button can trigger the native install dialog (`promptInstall`).
 * - iOS Safari: no programmatic install exists, so we surface `isIOS` and the
 *   caller shows the Share → "Adicionar à Tela de Início" instructions.
 * - Hides itself once the app is already installed (standalone).
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/crios|fxios/i.test(navigator.userAgent); // real Safari, not Chrome/FF on iOS

  async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    return outcome;
  }

  return { canPrompt: !!deferred, installed, isIOS, promptInstall };
}
