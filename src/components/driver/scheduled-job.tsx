"use client";

import { BellRing, CalendarClock, ExternalLink, Plane } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CancelTripSheet } from "@/components/app/common";
import { ChatButton } from "@/components/app/chat-view";
import { MapLayout, Panel } from "@/components/app/layout-parts";
import { Button } from "@/components/ui/button";
import { Avatar, LockedFare, Stars } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { DRIVER_CANCEL_REASONS } from "@/lib/config";
import { place } from "@/lib/data/places";
import { clock, dayLabel, firstName, minutesLabel } from "@/lib/format";
import { leaveAt } from "@/lib/reminders";
import { upcomingTrips, useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";

/** How early before the pickup a driver can set off. */
const START_WINDOW_MS = 90 * 60_000;

/** A job booked for later, on the driver's side: when to leave, the flight, and the button to set off. */
export function ScheduledJob({ trip }: { trip: Trip }) {
  const s = useStore();
  const now = useNow(15_000);
  const [cancel, setCancel] = useState(false);
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  const at = trip.scheduledFor ?? trip.createdAt;
  const leave = leaveAt(trip);
  const canStart = now >= at - START_WINDOW_MS;
  const name = firstName(trip.customer.name);
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lng}&travelmode=driving`;

  return (
    <MapLayout map={<MapView pickup={a} drop={b} />}>
      <Panel
        footer={
          <Button size="lg" block disabled={!canStart} onClick={() => s.startScheduledTrip(trip.id)}>
            {canStart ? "Start driving to pickup" : `You can set off from ${clock(at - START_WINDOW_MS)}`}
          </Button>
        }
      >
        <div className="grid gap-1">
          <p className="kicker">Scheduled job</p>
          <h1 className="font-display text-[1.2rem] leading-tight font-bold tracking-tight">
            Pick up {name} {dayLabel(at)}, {clock(at)}
          </h1>
          <p className="text-[0.84rem] text-muted">
            Leave by {clock(leave)} · {a.name} → {b.name}
            {at > now ? ` · in ${minutesLabel(Math.round((at - now) / 60_000))}` : ""}
          </p>
        </div>
        {trip.flight && (
          <p className="flex items-start gap-2.5 rounded-2xl bg-danfo-soft px-3.5 py-3 text-[0.86rem]">
            <Plane size={18} className="mt-0.5 flex-none" aria-hidden />
            <span>
              {trip.flight.kind === "departure"
                ? `${name} is catching ${trip.flight.number ? `flight ${trip.flight.number}` : "a flight"} at ${clock(trip.flight.time)}. Don't be late.`
                : `${name} lands at ${clock(trip.flight.time)}${trip.flight.number ? ` on ${trip.flight.number}` : ""}. Wait in the arrivals car park.`}
            </span>
          </p>
        )}
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3">
          <Avatar name={trip.customer.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-bold">
              {trip.customer.short} <Stars rating={trip.customer.rating} />
            </p>
            <p className="text-[0.76rem] text-muted">
              {trip.notes.length ? trip.notes.join(" · ") : "No note"} · pays by {trip.payMethod}
            </p>
          </div>
        </div>
        <LockedFare price={trip.price} payMethod={trip.payMethod}>
          Agreed with {name}. The fare is locked for both of you.
        </LockedFare>
        <p className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[0.82rem] text-muted">
          <BellRing size={16} className="mt-0.5 flex-none" aria-hidden />
          We&apos;ll remind you an hour before and when it&apos;s time to leave. You&apos;ll need a day ticket for {dayLabel(at)}.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ChatButton trip={trip} me="driver" href={`/driver/trip/${trip.id}/chat`} />
          <a href={navUrl} target="_blank" rel="noreferrer" className="grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold hover:border-ink">
            <ExternalLink size={20} aria-hidden />
            Navigate to pickup
          </a>
        </div>
        <button type="button" onClick={() => setCancel(true)} className="justify-self-center text-[0.86rem] font-bold text-danger">
          Cancel this job
        </button>
      </Panel>
      <CancelTripSheet open={cancel} onClose={() => setCancel(false)} trip={trip} by="driver" reasons={DRIVER_CANCEL_REASONS} />
    </MapLayout>
  );
}

/** The driver's jobs booked for later, on their home screen. */
export function UpcomingJobs() {
  const s = useStore();
  const jobs = upcomingTrips(s, "driver");
  if (!jobs.length) return null;
  return (
    <section className="grid gap-2">
      <p className="kicker">Scheduled jobs</p>
      <ul className="grid gap-2">
        {jobs.map((t) => (
          <li key={t.id}>
            <Link href={`/driver/trip/${t.id}`} className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line bg-surface px-3.5 py-3 hover:border-ink">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-danfo text-on-danfo">
                {t.flight ? <Plane size={20} aria-hidden /> : <CalendarClock size={20} aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[0.92rem]">
                  {dayLabel(t.scheduledFor ?? t.createdAt)}, {clock(t.scheduledFor ?? t.createdAt)} · {firstName(t.customer.name)}
                </b>
                <small className="block truncate text-[0.76rem] text-muted">
                  {place(t.pickupId).name} → {place(t.dropId).name}
                </small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
