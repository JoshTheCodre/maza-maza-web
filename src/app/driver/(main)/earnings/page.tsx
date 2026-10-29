"use client";

import { Page, PageHeader } from "@/components/app/layout-parts";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { clock, dayLabel, daysAgo, lagosDate, naira } from "@/lib/format";
import { driverHistory, todayTicket, todaysDriverTrips, useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";

export default function EarningsPage() {
  const s = useStore();
  const now = useNow(30_000);
  const ticket = todayTicket(s, now);
  const trips = todaysDriverTrips(s, now);
  const earned = trips.reduce((sum, t) => sum + t.price, 0);
  const tk = ticket?.price ?? 0;
  const keep = earned - tk;

  const done = driverHistory(s).filter((t) => t.stage === "completed");
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = lagosDate(daysAgo(i, now));
    const fares = done.filter((t) => lagosDate(t.stageAt) === date).reduce((sum, t) => sum + t.price, 0);
    const ticketCost = s.driver.tickets.filter((t) => t.serviceDate === date).reduce((sum, t) => sum + t.price, 0);
    return { i, date, fares, ticketCost, worked: ticketCost > 0 || fares > 0 };
  });
  const weekKeep = week.reduce((sum, d) => sum + d.fares - d.ticketCost, 0);
  const maxFares = Math.max(...week.map((d) => d.fares), 1);

  return (
    <Page>
      <PageHeader title="Earnings" />
      <div className="on-hero grid gap-3 rounded-[20px] bg-hero p-4 text-on-hero">
        <p className="font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-on-hero-muted uppercase">You keep today</p>
        <p className="tabular font-display text-[2rem] font-extrabold tracking-tight">{naira(keep)}</p>
        <div className="grid gap-1.5 text-[0.86rem]">
          {[
            [`Fares collected · ${trips.length} ${trips.length === 1 ? "trip" : "trips"}`, naira(earned)],
            ["Day ticket", tk ? naira(-tk) : "Not bought"],
            ["Commission", "₦0"],
          ].map(([k, v]) => (
            <p key={k} className="flex justify-between gap-3">
              <span className="text-on-hero-muted">{k}</span>
              <b className="tabular font-mono">{v}</b>
            </p>
          ))}
        </div>
        {tk > 0 && (
          <>
            <div className="h-2 overflow-hidden rounded-full bg-hero-2" aria-hidden>
              <i className="block h-full bg-danfo" style={{ width: `${Math.min(100, (earned / tk) * 100)}%` }} />
            </div>
            <p className="text-[0.8rem] text-on-hero-muted">{earned >= tk ? "Today's ticket is paid back. Everything else today is yours." : `${naira(tk - earned)} more and today's ticket is paid back.`}</p>
          </>
        )}
      </div>

      <p className="kicker">Today&apos;s trips</p>
      {trips.length ? (
        <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
          {trips.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[0.9rem] font-semibold">To {place(t.dropId).name}</b>
                <small className="block truncate text-[0.76rem] text-muted">
                  {clock(t.stageAt)} · {t.customer.short} · {t.payMethod}
                </small>
              </span>
              <span className="tabular flex-none text-[0.92rem] font-bold whitespace-nowrap text-accept">+{naira(t.price)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.88rem] text-muted">Finished trips show up here with the full fare you collected.</p>
      )}

      <p className="kicker">Last 7 days</p>
      <div className="grid gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-3.5">
        <p className="text-[0.88rem]">
          You kept <b>{naira(weekKeep)}</b> after tickets. Days off cost nothing.
        </p>
        <ul className="grid gap-2">
          {week.map((d) => (
            <li key={d.date} className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 text-[0.84rem]">
              <span className="text-muted">{d.i === 0 ? "Today" : dayLabel(daysAgo(d.i, now))}</span>
              {d.worked ? (
                <span className="h-3 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <i className="block h-full rounded-full bg-brand" style={{ width: `${(d.fares / maxFares) * 100}%` }} />
                </span>
              ) : (
                <span className="text-[0.78rem] text-muted">Day off</span>
              )}
              <span className="tabular w-[84px] text-right font-mono font-semibold">{d.worked ? naira(d.fares - d.ticketCost) : "₦0"}</span>
            </li>
          ))}
        </ul>
        <p className="text-[0.76rem] text-muted">Bars show fares collected. Amounts show what you kept after the day ticket.</p>
      </div>
      <DriverReviews trips={done} />
    </Page>
  );
}

/** Ratings and reviews customers left after trips with you. */
function DriverReviews({ trips }: { trips: Trip[] }) {
  const rated = trips.filter((t) => t.rating);
  if (!rated.length) return null;
  const average = rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length;
  const reviews = rated.filter((t) => t.review).slice(0, 5);
  return (
    <section className="grid gap-2">
      <h2 className="font-bold">What customers say</h2>
      <p className="text-[0.88rem] text-muted">
        ★ {average.toFixed(1)} from {rated.length} {rated.length === 1 ? "rating" : "ratings"}. Good ratings help you win more offers.
      </p>
      {reviews.length > 0 && (
        <ul className="grid gap-2">
          {reviews.map((t) => (
            <li key={t.id} className="rounded-2xl border-[1.5px] border-line bg-surface p-3">
              <p className="text-[0.92rem]">“{t.review}”</p>
              <small className="text-[0.76rem] text-muted">
                {"★".repeat(t.rating ?? 0)} · {t.customer.short} · {dayLabel(t.createdAt)}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
