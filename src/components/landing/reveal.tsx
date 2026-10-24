"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Plays its children's entrance once, when scrolled into view.
 * It only hides them if they start off-screen, so the content is never stuck invisible.
 */
export function Reveal({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"rest" | "armed" | "play">("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          if (!entry.isIntersecting) setState("armed");
          return;
        }
        if (entry.isIntersecting) {
          setState("play");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={`${className} ${state === "rest" ? "" : `is-${state}`}`} aria-label={label}>
      {children}
    </figure>
  );
}
