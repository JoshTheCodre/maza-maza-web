"use client";

import { BellRing, CalendarPlus, Plane } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CancelTripSheet, ShareTripButton } from "@/components/app/common";
import { ChatButton } from "@/components/app/chat-view";
import { MapLayout, Panel } from "@/components/app/layout-parts";
import { Avatar, LockedFare, Plate, Stars } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { capitalise, clock, dayLabel, firstName, minutesLabel } from "@/lib/format";
import { estimateTrip } from "@/lib/pricing";
import { RIDE_CLASSES, classOf } from "@/lib/ride-classes";
import { knownRoute, useRoute } from "@/lib/routing";
import type { Trip } from "@/lib/types";

const CANCEL_REASONS = ["I changed my plans", "My flight changed", "I found another ride", "Booked by mistake"];

/** An .ics calendar file for the pickup, with a reminder an hour before. */
function calendarFile(trip: Trip, start: number, end: number) {
  const stamp = (ts: number) => new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maza-Maza//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${trip.id}@maza-maza`,
    `DTSTAMP:${stamp(trip.createdAt)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Maza-Maza pickup: ${a.name} to ${b.name}`,
    `DESCRIPTION:${trip.driver.short}, ${trip.driver.vehicle.description}, plate ${trip.driver.vehicle.plate}.${trip.flight?.number ? ` Flight ${trip.flight.number}.` : ""}`,
    `LOCATION:${a.name}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Your Maza-Maza pickup is in an hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** A ride booked for later: when, who's coming, the flight it's built around, and how you'll be reminded. */
export function ScheduledView({ trip }: { trip: Trip }) {
  const now = useNow(30_000);
  const [cancel, setCancel] = useState(false);
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  const route = useRoute(a, b);
  const at = trip.scheduledFor ?? trip.createdAt;
  const driveMin = estimateTrip(route ?? knownRoute(a, b), trip.mode, at).minutes;
  const arrive = at + (2 + driveMin) * 60_000;
  const lead = Math.round((at - now) / 60_000);
  const name = firstName(trip.driver.name);

  const addToCalendar = () => {
    const blob = new Blob([calendarFile(trip, at, arrive)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: "maza-maza-pickup.ics" });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MapLayout map={<MapView pickup={a} drop={b} />}>
      <Panel>
        <div className="grid gap-1">
          <p className="kicker">{trip.flight ? "Airport ride booked" : "Ride booked"}</p>
          <h1 className="font-display text-[1.3rem] leading-tight font-bold tracking-tight">
            Pickup {dayLabel(at)}, {clock(at)}
          </h1>
          <p className="text-[0.84rem] text-muted">
            {lead > 0 ? `In ${minutesLabel(lead)}` : "Starting now"} · {a.name} → {b.name} · arrive about {clock(arrive)}
          </p>
        </div>

        {trip.flight && (
          <p className="flex items-start gap-2.5 rounded-2xl bg-danfo-soft px-3.5 py-3 text-[0.86rem]">
            <Plane size={18} className="mt-0.5 flex-none" aria-hidden />
            <span>
              <b>
                {trip.flight.number ? `Flight ${trip.flight.number}` : "Your flight"} {trip.flight.kind === "departure" ? "takes off" : "lands"} at {clock(trip.flight.time)}
              </b>
              {trip.flight.kind === "departure"
                ? `. You'll reach the airport about ${clock(arrive)}, in time for ${trip.flight.international ? "international" : "domestic"} check-in.`
                : `. ${name} will wait in the arrivals car park.`}
            </span>
          </p>
        )}

        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3">
          <Avatar name={trip.driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-bold">
              {trip.driver.short} <Stars rating={trip.driver.rating} />
            </p>
            <p className="text-[0.76rem] text-muted">
              {capitalise(trip.driver.vehicle.description)}
              {trip.mode === "ride" ? ` · ${RIDE_CLASSES[classOf(trip)].label}` : ""}
            </p>
          </div>
          <Plate>{trip.driver.vehicle.plate}</Plate>
        </div>
        <LockedFare price={trip.price} payMethod={trip.payMethod} />

        <p className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[0.82rem] text-muted">
          <BellRing size={16} className="mt-0.5 flex-none" aria-hidden />
          We&apos;ll remind you {at - trip.createdAt > 24 * 3_600_000 ? "the day before and " : ""}an hour before, tell you when {name} sets off, and alert you when they&apos;re 2 minutes away.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <ChatButton trip={trip} me="customer" href={`/ride/trip/${trip.id}/chat`} />
          <button type="button" onClick={addToCalendar} className="grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold hover:border-ink">
            <CalendarPlus size={20} aria-hidden />
            Calendar
          </button>
          <ShareTripButton trip={trip} />
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          <button type="button" onClick={() => setCancel(true)} className="text-[0.86rem] font-bold text-danger">
            Cancel booking
          </button>
          <Link href="/help" className="text-[0.86rem] font-semibold text-muted underline">
            Get help
          </Link>
        </div>
      </Panel>
      <CancelTripSheet open={cancel} onClose={() => setCancel(false)} trip={trip} by="customer" reasons={CANCEL_REASONS} />
    </MapLayout>
  );
}
