"use client";

import { ChevronLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (path: string) => boolean;
}

const isActive = (item: NavItem, path: string) => (item.match ? item.match(path) : path === item.href || path.startsWith(item.href + "/"));

export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="flex-none border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const on = isActive(item, path);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`grid justify-items-center gap-0.5 py-2 text-[0.68rem] font-bold ${on ? "text-brand" : "text-muted"}`}
            >
              <Icon size={22} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopNavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const on = isActive(item, path);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-[0.92rem] font-semibold ${on ? "bg-hero-2 text-on-hero" : "text-on-hero-muted hover:text-on-hero"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Map beside the panel on wide screens, above it on phones. */
export function MapLayout({ map, children, mapSize = "mid", overlay }: { map: ReactNode; children: ReactNode; mapSize?: "tall" | "mid" | "short"; overlay?: ReactNode }) {
  const h = mapSize === "tall" ? "h-[44dvh]" : mapSize === "short" ? "h-[28dvh]" : "h-[36dvh]";
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[440px_minmax(0,1fr)]">
      <div className={`relative flex-none overflow-hidden ${h} lg:order-2 lg:h-auto`}>
        {map}
        {overlay}
      </div>
      <section className="relative z-[2] -mt-[22px] flex min-h-0 flex-1 flex-col overflow-auto rounded-t-3xl bg-surface shadow-[0_-12px_28px_-20px_rgb(5_30_20_/_0.55)] lg:order-1 lg:mt-0 lg:rounded-none lg:border-r lg:border-line lg:shadow-none">
        <div className="mx-auto mt-2 h-[5px] w-10 flex-none rounded-full bg-line lg:hidden" aria-hidden />
        {children}
      </section>
    </div>
  );
}

/** Padded column of panel content with an optional sticky footer. */
export function Panel({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <div className="grid gap-3.5 px-4 pt-2 pb-4 lg:px-6 lg:pt-6">{children}</div>
      {footer && (
        <div className="sticky bottom-0 z-[2] mt-auto grid gap-2 border-t border-line bg-surface px-4 pt-3 pb-4 lg:px-6">{footer}</div>
      )}
    </>
  );
}

export function PageHeader({ title, back, action }: { title: string; back?: string | true; action?: ReactNode }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3">
      {back && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => (back === true ? router.back() : router.push(back))}
          className="grid size-10 flex-none place-items-center rounded-full border-[1.5px] border-line bg-surface hover:border-ink"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="min-w-0 flex-1 font-display text-[1.25rem] font-bold tracking-tight">{title}</h1>
      {action}
    </div>
  );
}

/** Plain scrolling page for list screens (activity, account, earnings…). */
export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className={`mx-auto grid gap-4 px-4 py-4 lg:py-8 ${wide ? "max-w-5xl" : "max-w-xl"}`}>{children}</div>
    </div>
  );
}
