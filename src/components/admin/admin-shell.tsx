"use client";

import { Car, Flag, LayoutDashboard, Route, Settings, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/display";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/lib/store";

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const s = useStore();
  const pending = s.applications.filter((a) => a.status === "pending").length;
  const open = s.reports.filter((r) => r.status === "open").length;
  const nav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/drivers", label: "Drivers", icon: Car, badge: pending },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/trips", label: "Trips", icon: Route },
    { href: "/admin/tickets", label: "Tickets & wallet", icon: Ticket },
    { href: "/admin/reports", label: "Reports", icon: Flag, badge: open },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  const active = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="on-hero bg-hero pt-[env(safe-area-inset-top)] text-on-hero lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5">
          <Link href="/admin" aria-label="Admin home">
            <Logo />
          </Link>
          <span className="rounded-full bg-hero-2 px-2 py-1 font-mono text-[0.56rem] font-semibold tracking-[0.1em] uppercase">Admin</span>
        </div>
        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:grid lg:overflow-visible lg:px-3">
          {nav.map(({ href, label, icon: Icon, exact, badge }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href, exact) ? "page" : undefined}
              className={`flex flex-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.9rem] font-semibold whitespace-nowrap ${active(href, exact) ? "bg-hero-2 text-on-hero" : "text-on-hero-muted hover:text-on-hero"}`}
            >
              <Icon size={18} aria-hidden />
              {label}
              {!!badge && <span className="ml-auto rounded-full bg-danfo px-1.5 text-[0.7rem] font-bold text-on-danfo">{badge}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0">{children}</main>
      <Toaster audience="admin" />
    </div>
  );
}

export function AdminPage({ title, sub, action, children }: { title: string; sub?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.45rem] font-bold tracking-tight">{title}</h1>
          {sub && <p className="text-[0.9rem] text-muted">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "warn" }) {
  return (
    <div className={`grid gap-1 rounded-2xl border-[1.5px] bg-surface p-4 ${tone === "warn" ? "border-danfo" : "border-line"}`}>
      <p className="kicker">{label}</p>
      <p className="tabular font-display text-[1.6rem] font-bold tracking-tight">{value}</p>
      {note && <p className="text-[0.78rem] text-muted">{note}</p>}
    </div>
  );
}
