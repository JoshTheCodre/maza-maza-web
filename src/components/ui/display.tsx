import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { capitalise, initials, naira } from "@/lib/format";
import type { PayMethod } from "@/lib/types";

export function Avatar({ name, size = "md", dark = false }: { name: string; size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const s = size === "sm" ? "size-[34px] text-[0.7rem]" : size === "lg" ? "size-12 text-[0.88rem]" : "size-10 text-[0.78rem]";
  return (
    <span
      aria-hidden
      className={`grid flex-none place-items-center rounded-full font-extrabold ${s} ${
        dark ? "bg-hero-2 text-on-hero" : "bg-brand-soft text-brand-strong"
      }`}
    >
      {initials(name)}
    </span>
  );
}

type Tone = "accept" | "counter" | "lost" | "neutral" | "danfo";

const tones: Record<Tone, string> = {
  accept: "bg-accept-bg text-accept",
  counter: "bg-counter-bg text-counter",
  lost: "bg-lost-bg text-lost",
  neutral: "bg-surface-2 text-muted",
  danfo: "bg-danfo text-on-danfo",
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`rounded-full px-[7px] py-[3px] text-[0.58rem] font-extrabold tracking-[0.06em] whitespace-nowrap uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-danfo px-1.5 py-0.5 font-mono text-[0.5rem] font-semibold tracking-[0.08em] text-on-danfo uppercase">
      {children}
    </span>
  );
}

export function Plate({ children }: { children: ReactNode }) {
  return (
    <span className="flex-none rounded-lg bg-danfo px-2 py-1.5 font-mono text-[0.72rem] font-semibold tracking-[0.04em] whitespace-nowrap text-on-danfo">
      {children}
    </span>
  );
}

export function LockedFare({ price, payMethod, children }: { price: number; payMethod: PayMethod; children?: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 rounded-xl bg-danfo-soft px-3 py-[11px] text-[0.84rem]">
      <Lock size={18} className="flex-none" aria-hidden />
      <span>
        <b>{naira(price)}</b> · {capitalise(payMethod)} · {children ?? "Fare locked. It can't go up on the road."}
      </span>
    </p>
  );
}

export function RouteDots({ from, to, meta }: { from: string; to: string; meta?: ReactNode }) {
  return (
    <div className="grid gap-[5px] rounded-xl bg-surface-2 px-3 py-2.5 text-[0.84rem]">
      <p className="flex min-w-0 items-center gap-2 font-semibold">
        <Dot kind="a" />
        <span className="truncate">{from}</span>
      </p>
      <p className="flex min-w-0 items-center gap-2 font-semibold">
        <Dot kind="b" />
        <span className="truncate">{to}</span>
      </p>
      {meta && <span className="text-[0.74rem] text-muted">{meta}</span>}
    </div>
  );
}

export function Dot({ kind }: { kind: "a" | "b" }) {
  return kind === "a" ? (
    <span aria-hidden className="relative z-[1] size-[11px] flex-none rounded-full bg-brand shadow-[0_0_0_3px_var(--brand-soft)]" />
  ) : (
    <span aria-hidden className="relative z-[1] size-[11px] flex-none rounded-[3px] bg-ink" />
  );
}

export function Stars({ rating }: { rating: number }) {
  return <span className="text-[0.74rem] font-semibold text-muted">★ {rating.toFixed(1)}</span>;
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 px-3 py-7 text-center text-muted">
      <span className="radar" aria-hidden />
      <b className="text-ink">{title}</b>
      {children && <p className="max-w-[28em] text-[0.9rem]">{children}</p>}
      {action}
    </div>
  );
}

export function SectionTitle({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return (
    <p className="kicker flex items-center gap-2">
      {children}
      {extra}
    </p>
  );
}

/** The Maza-Maza logo is the wordmark alone, with no symbol. The hyphen carries the accent colour. */
export function Logo({ dark = true, size = "md" }: { dark?: boolean; size?: "md" | "lg" }) {
  return (
    <span
      className={`inline-block font-display leading-none font-extrabold tracking-[-0.04em] whitespace-nowrap ${size === "lg" ? "text-[2rem]" : "text-[1.3rem]"} ${dark ? "text-on-hero" : "text-ink"}`}
    >
      maza<span className={dark ? "text-danfo" : "text-brand"}>-</span>maza
    </span>
  );
}
