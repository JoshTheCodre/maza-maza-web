"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-scrim lg:items-center lg:p-6" onClick={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[92dvh] w-full max-w-lg animate-rise gap-3 overflow-auto rounded-t-3xl bg-surface px-4 pt-2 pb-[calc(18px+env(safe-area-inset-bottom))] outline-none lg:rounded-3xl lg:pt-4"
      >
        <div className="mx-auto h-[5px] w-10 rounded-full bg-line lg:hidden" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-[1.12rem] font-bold tracking-tight">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
