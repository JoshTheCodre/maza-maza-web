"use client";

// Notifications on the phone or computer when Maza-Maza isn't on screen, using the browser's Notification API
// once the person allows it (the welcome step asks). On screen, the in-app toast is enough. The backend will add
// web push through a service worker so reminders arrive with the app closed too.

export function pushToDevice(title: string, href?: string) {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted" || document.visibilityState === "visible") return;
  try {
    const n = new Notification("Maza-Maza", { body: title, tag: href ?? title, icon: "/icons/maza-maza.svg" });
    n.onclick = () => {
      window.focus();
      if (href) window.location.href = href;
      n.close();
    };
    navigator.vibrate?.(200);
  } catch {
    // Some mobile browsers only show notifications from a service worker.
  }
}
