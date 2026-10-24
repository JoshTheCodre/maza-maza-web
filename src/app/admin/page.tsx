"use client";

import Link from "next/link";
import { AdminPage, Stat } from "@/components/admin/admin-shell";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { clock, lagosDate, naira, plainNumber, relativeTime } from "@/lib/format";
import { driverCanReceive, useStore } from "@/lib/store";

export default function AdminOverview() {
  const s = useStore();
  const now = useNow(5000);
  const today = lagosDate(now);
  const ticketsToday = s.driver.tickets.filter((t) => t.serviceDate === today);
  const revenue = ticketsToday.reduce((sum, t) => sum + t.price, 0);
  const liveTrips = s.trips.filter((t) => t.stage !== "completed" && t.stage !== "cancelled");
  const tripsToday = s.trips.filter((t) => lagosDate(t.createdAt) === today && t.stage !== "cancelled");
  const agreedToday = tripsToday.map((t) => ({ t, r: s.requests.find((r) => r.id === t.requestId) })).filter((x) => x.r);
  const gap = agreedToday.length ? Math.round((agreedToday.reduce((sum, { t, r }) => sum + (t.price - r!.firstOffer) / r!.firstOffer, 0) / agreedToday.length) * 100) : null;
  const openReq = s.requests.filter((r) => r.status === "open");
  const pending = s.applications.filter((a) => a.status === "pending");
  const openReports = s.reports.filter((r) => r.status === "open");

  const feed = [
    ...s.requests.map((r) => ({ at: r.createdAt, text: `${r.customer.short} offered ${naira(r.firstOffer)} · ${place(r.pickupId).name} → ${place(r.dropId).name}`, tag: r.status })),
    ...s.trips.filter((t) => lagosDate(t.createdAt) === today).map((t) => ({ at: t.createdAt, text: `${t.customer.short} and ${t.driver.short} agreed ${naira(t.price)}`, tag: t.stage === "completed" ? "completed" : t.stage === "cancelled" ? "cancelled" : "on trip" })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  return (
    <AdminPage title="Overview" sub={`Lagos · today · updated ${clock(now)}`}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Drivers online" value={plainNumber(driverCanReceive(s, now) ? 1 : 0)} note="With today's ticket" />
        <Stat label="Day tickets sold" value={plainNumber(ticketsToday.length)} note="Today" />
        <Stat label="Ticket revenue" value={naira(revenue)} note="Today. No commission on fares." />
        <Stat label="Trips agreed" value={plainNumber(tripsToday.length)} note={gap === null ? "Today" : `Agreed fares average ${gap}% above the first offer`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/drivers" className={`grid gap-1 rounded-2xl border-[1.5px] p-4 hover:border-ink ${pending.length ? "border-danfo bg-danfo-soft" : "border-line bg-surface"}`}>
          <b>
            {pending.length} driver {pending.length === 1 ? "application" : "applications"} waiting
          </b>
          <span className="text-[0.86rem] text-muted">Check documents and call guarantors before approving.</span>
        </Link>
        <Link href="/admin/reports" className={`grid gap-1 rounded-2xl border-[1.5px] p-4 hover:border-ink ${openReports.length ? "border-danfo bg-danfo-soft" : "border-line bg-surface"}`}>
          <b>
            {openReports.length} open {openReports.length === 1 ? "report" : "reports"}
          </b>
          <span className="text-[0.86rem] text-muted">{openReports.some((r) => r.kind === "sos") ? "Includes an SOS. Handle it first." : "Overcharging, conduct and lost items."}</span>
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="grid gap-2">
          <h2 className="font-bold">Live now</h2>
          <div className="relative h-[320px] overflow-hidden rounded-2xl border-[1.5px] border-line">
            <MapView pickup={place("yaba")} others={[...openReq.map((r) => place(r.pickupId)), ...liveTrips.map((t) => place(t.dropId))]} minWidth={330} />
          </div>
          <p className="text-[0.8rem] text-muted">
            {openReq.length} open {openReq.length === 1 ? "request" : "requests"} · {liveTrips.length} {liveTrips.length === 1 ? "trip" : "trips"} in progress
          </p>
        </section>
        <section className="grid content-start gap-2">
          <h2 className="font-bold">Latest activity</h2>
          <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
            {feed.length ? (
              feed.map((f, i) => (
                <li key={i} className="grid gap-0.5 px-3.5 py-2.5">
                  <span className="text-[0.88rem]">{f.text}</span>
                  <small className="text-[0.74rem] text-muted">
                    {relativeTime(f.at, now)} · {f.tag}
                  </small>
                </li>
              ))
            ) : (
              <li className="px-3.5 py-3 text-[0.88rem] text-muted">Offers and trips show up here as they happen.</li>
            )}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}
