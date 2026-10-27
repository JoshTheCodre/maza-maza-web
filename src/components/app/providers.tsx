"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Logo } from "@/components/ui/display";
import { resumeIfAllowed } from "@/lib/location";
import { startSimulation } from "@/lib/sim";
import { STORAGE_KEY, useStore } from "@/lib/store";

/** Loads saved data, keeps open tabs in sync, and runs the stand-in for other users. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.resolve(useStore.persist.rehydrate()).then(() => alive && setReady(true));
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) useStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    resumeIfAllowed();
    let stop = startSimulation();
    // A page parked in the back/forward cache must let go of the simulation, or the tab you're
    // actually looking at waits for it forever. Take it back if the page is restored.
    const onHide = () => stop();
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) stop = startSimulation();
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
      stop();
    };
  }, []);

  if (!ready) {
    return (
      <div className="grid h-dvh place-items-center bg-bg" aria-busy="true" aria-label="Loading Maza-Maza">
        <span className="animate-blink">
          <Logo dark={false} size="lg" />
        </span>
      </div>
    );
  }
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-ink px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 text-[0.84rem] font-semibold text-bg">
      <WifiOff size={16} aria-hidden /> You&apos;re offline. We&apos;ll update offers and trips when you&apos;re back.
    </div>
  );
}
