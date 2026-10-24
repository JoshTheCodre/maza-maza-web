"use client";

import { useToasts } from "@/lib/toasts";
import type { ToastMessage } from "@/lib/types";

export function Toaster({ audience }: { audience: ToastMessage["audience"] }) {
  const all = useToasts((s) => s.items);
  const items = all.filter((t) => t.audience === audience);
  const dismiss = useToasts((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[60] flex flex-col items-center gap-2 px-4"
    >
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className="pointer-events-auto w-full max-w-md animate-drop rounded-2xl bg-ink px-4 py-3 text-left text-[0.88rem] font-semibold text-bg shadow-card"
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}
