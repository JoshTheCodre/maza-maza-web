"use client";

import { ChartColumn, CircleCheck, Clock, List, Ticket, User, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { BellLink } from "@/components/app/common";
import { BottomNav, TopNavLinks, type NavItem } from "@/components/app/layout-parts";
import { ButtonLink } from "@/components/ui/button";
import { Toggle } from "@/components/ui/controls";
import { Avatar, Logo } from "@/components/ui/display";
import { Toaster } from "@/components/ui/toaster";
import { useNow } from "@/hooks/use-now";
import { VEHICLE_LABEL } from "@/lib/config";
import { hoursMinutes, msLeftToday, naira } from "@/lib/format";
import { activeDriverTrip, todayTicket, todaysDriverTrips, useStore } from "@/lib/store";

const NAV: NavItem[] = [
  { href: "/driver", label: "Offers", icon: List, match: (p) => p === "/driver" || p.startsWith("/driver/trip") },
  { href: "/driver/ticket", label: "Ticket", icon: Ticket },
  { href: "/driver/wallet", label: "Wallet", icon: Wallet },
  { href: "/driver/earnings", label: "Earnings", icon: ChartColumn },
  { href: "/driver/account", label: "Account", icon: User, match: (p) => p.startsWith("/driver/account") || p.startsWith("/driver/help") || p.startsWith("/driver/notifications") },
];

const TOP_LEVEL = ["/driver", "/driver/ticket", "/driver/wallet", "/driver/earnings", "/driver/account"];
/** Pages a driver can use before they're approved. */
const OPEN_PAGES = (p: string) => p.startsWith("/driver/account") || p.startsWith("/driver/help") || p.startsWith("/driver/notifications");

export function DriverShell({ children }: { children: ReactNode }) {
  const s = useStore();
  const path = usePathname();
  const router = useRouter();
  const now = useNow(30_000);
  const ticket = todayTicket(s, now);
  const p = s.driver.profile;
  const onTrip = path.startsWith("/driver/trip");
  const trip = activeDriverTrip(s);
  const earned = todaysDriverTrips(s, now).reduce((sum, t) => sum + t.price, 0);

  // When a customer picks this driver, go straight to the trip.
  const seen = useRef(trip?.id ?? null);
  useEffect(() => {
    if (trip && seen.current !== trip.id && !onTrip) router.push(`/driver/trip/${trip.id}`);
    seen.current = trip?.id ?? null;
  }, [trip, onTrip, router]);

  const gated = s.driver.status !== "approved" && !OPEN_PAGES(path);
  const approved = s.driver.status === "approved";

  return (
    <div className="flex h-dvh flex-col">
      {!onTrip && (
        <header className="on-hero flex-none bg-hero pt-[env(safe-area-inset-top)] text-on-hero">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 lg:gap-5 lg:px-6">
            <Link href="/driver" aria-label="Maza-Maza driver home" className="hidden lg:block">
              <Logo />
            </Link>
            <Avatar name={p.name || s.customer.profile.name} dark />
            <div className="min-w-0 flex-1 lg:flex-none">
              <p className="font-bold">
                {p.short || s.customer.profile.short} {approved && <span className="text-[0.74rem] font-semibold text-on-hero-muted">★ {p.rating.toFixed(1)}</span>}
              </p>
              <p className="truncate text-[0.74rem] text-on-hero-muted">{approved ? `${VEHICLE_LABEL[p.vehicle.type]} · ${p.vehicle.plate}` : "Driver mode"}</p>
            </div>
            <div className="hidden flex-1 justify-center lg:flex">{approved && <TopNavLinks items={NAV} />}</div>
            {approved && (ticket ? <Toggle dark on={s.driver.online} onChange={(v) => s.setOnline(v)} label={s.driver.online ? "Online" : "Offline"} /> : <span className="rounded-full bg-hero-2 px-3 py-1.5 text-[0.76rem] font-bold text-on-hero-muted">Offline</span>)}
            <BellLink audience="driver" dark />
          </div>
          {ticket && approved && (
            <div className="mx-auto max-w-5xl px-4 pb-3 lg:px-6">
              <Link href="/driver/ticket" className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[14px] bg-danfo px-3 py-2.5 text-on-danfo">
                <span className="font-mono text-[0.54rem] leading-tight font-semibold tracking-[0.12em]">
                  DAY
                  <br />
                  TICKET
                </span>
                <b className="text-[0.86rem]">Active · {hoursMinutes(msLeftToday(now))} left</b>
                <span className="tabular font-mono text-[0.76rem] font-semibold">{naira(earned)} today</span>
              </Link>
            </div>
          )}
        </header>
      )}
      {trip && !onTrip && (
        <Link href={`/driver/trip/${trip.id}`} className="flex-none bg-ink px-4 py-2.5 text-center text-[0.88rem] font-bold text-bg">
          You have a trip in progress. Open it →
        </Link>
      )}
      <main className="flex min-h-0 flex-1 flex-col">{gated ? <StatusGate /> : children}</main>
      {!onTrip && approved && TOP_LEVEL.includes(path) && <BottomNav items={NAV} />}
      <Toaster audience="driver" />
    </div>
  );
}

function StatusGate() {
  const s = useStore();
  const app = s.applications.find((a) => a.isMe);
  if (s.driver.status === "none") {
    return (
      <div className="mx-auto grid max-w-md gap-3 px-4 py-10 text-center">
        <h1 className="font-display text-xl font-bold">Start driving with Maza-Maza</h1>
        <p className="text-muted">Sign up once. Then buy a day ticket on the days you want to work and keep every fare.</p>
        <ButtonLink href="/driver/signup" size="lg">
          Sign up to drive
        </ButtonLink>
        <ButtonLink href="/ride" variant="ghost">
          Back to rider mode
        </ButtonLink>
      </div>
    );
  }
  if (s.driver.status === "rejected") {
    return (
      <div className="mx-auto grid max-w-md gap-3 px-4 py-10">
        <h1 className="font-display text-xl font-bold">Your application needs changes</h1>
        <p className="rounded-xl bg-lost-bg p-3 text-lost">{app?.note ?? "One of your documents couldn't be verified."}</p>
        <ButtonLink href="/driver/signup">Update and send again</ButtonLink>
        <ButtonLink href="/ride" variant="ghost">
          Back to rider mode
        </ButtonLink>
      </div>
    );
  }
  const steps = [
    { label: "Application sent", done: true },
    { label: "Documents and guarantor checked", done: false, current: true },
    { label: "Approved. Buy your first day ticket", done: false },
  ];
  return (
    <div className="mx-auto grid max-w-md gap-4 px-4 py-8">
      <h1 className="font-display text-xl font-bold">We&apos;re checking your application</h1>
      <p className="text-muted">Our team checks your ID, licence, vehicle papers and guarantor. This usually takes 1 to 2 working days. We&apos;ll message you when you&apos;re approved.</p>
      <ol className="grid gap-3">
        {steps.map((st) => (
          <li key={st.label} className="flex items-center gap-3">
            <span className={`grid size-8 place-items-center rounded-full ${st.done ? "bg-brand text-on-brand" : st.current ? "bg-danfo text-on-danfo" : "bg-surface-2 text-muted"}`}>
              {st.done ? <CircleCheck size={18} aria-hidden /> : <Clock size={16} aria-hidden />}
            </span>
            <span className={st.done || st.current ? "font-semibold" : "text-muted"}>{st.label}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/driver/account/payout" variant="ghost">
          Add your bank account
        </ButtonLink>
        <ButtonLink href="/ride" variant="ghost">
          Back to rider mode
        </ButtonLink>
      </div>
    </div>
  );
}
