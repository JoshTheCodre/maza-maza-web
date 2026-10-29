"use client";

import { Bus, CalendarClock, Car, CarFront, CarTaxiFront, ChevronRight, Plane, Zap } from "lucide-react";
import Link from "next/link";
import { Segmented } from "@/components/ui/controls";
import { MIN_LEAD_MIN, toInputValue, fromInputValue } from "@/lib/airport";
import { clock, dayLabel, naira } from "@/lib/format";
import { estimateTrip, fareSettings, quoteFare, touchesAirport, type RouteSize } from "@/lib/pricing";
import { RIDE_CLASS_ORDER, RIDE_CLASSES } from "@/lib/ride-classes";
import { place } from "@/lib/data/places";
import { upcomingTrips, useStore } from "@/lib/store";
import type { FlightInfo, Place, RideClass } from "@/lib/types";

const CLASS_ICON = { economy: Car, comfort: CarFront, suv: CarTaxiFront, group: Bus } as const;
const MIN = 60_000;

/** Economy, Comfort, SUV and Group, each with its recommended fare for this trip. */
export function ClassPicker({ route, a, b, at, value, onChange }: { route: RouteSize; a: Place; b: Place; at: number; value: RideClass; onChange: (c: RideClass) => void }) {
  const settings = useStore((s) => s.settings);
  const fare = fareSettings(settings);
  const trip = estimateTrip(route, "ride", at);
  const airport = touchesAirport(a, b);
  return (
    <div className="grid gap-2">
      <p className="text-[0.85rem] font-bold">Vehicle</p>
      <div role="radiogroup" aria-label="Vehicle" className="grid grid-cols-2 gap-2">
        {RIDE_CLASS_ORDER.map((c) => {
          const on = c === value;
          const Icon = CLASS_ICON[c];
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(c)}
              className={`grid gap-0.5 rounded-2xl border-2 bg-surface p-3 text-left transition-colors ${on ? "border-ink" : "border-line hover:border-muted"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <Icon size={20} aria-hidden />
                <b className="tabular font-display text-[0.9rem] tracking-tight">{naira(quoteFare(trip, "ride", fare, airport, c).recommended)}</b>
              </span>
              <b className="text-[0.95rem]">{RIDE_CLASSES[c].label}</b>
              <small className="text-[0.72rem] text-muted">{RIDE_CLASSES[c].seats}</small>
            </button>
          );
        })}
      </div>
      <p className="text-[0.74rem] text-muted">{RIDE_CLASSES[value].blurb}.</p>
    </div>
  );
}

/** Ride now, or book a pickup time up to a week ahead. */
export function WhenPicker({ value, onChange, now }: { value: number | null; onChange: (t: number | null) => void; now: number }) {
  const min = now + MIN_LEAD_MIN * MIN;
  const max = now + 7 * 24 * 60 * MIN;
  const clamp = (t: number) => Math.min(max, Math.max(min, t));
  const inAnHour = Math.ceil((now + 60 * MIN) / (5 * MIN)) * 5 * MIN;
  return (
    <div className="grid gap-2">
      <Segmented<"now" | "later">
        label="When"
        value={value === null ? "now" : "later"}
        onChange={(v) => onChange(v === "now" ? null : clamp(inAnHour))}
        options={[
          { value: "now", label: <><Zap size={16} aria-hidden /> Now</> },
          { value: "later", label: <><CalendarClock size={16} aria-hidden /> Schedule</> },
        ]}
      />
      {value !== null && (
        <label className="grid gap-1 text-[0.85rem] font-bold">
          Pickup time
          <input
            type="datetime-local"
            value={toInputValue(value)}
            min={toInputValue(min)}
            max={toInputValue(max)}
            step={300}
            onChange={(e) => {
              const t = fromInputValue(e.target.value);
              if (Number.isFinite(t)) onChange(clamp(t));
            }}
            className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold outline-none focus:border-brand"
          />
          <small className="font-normal text-muted">
            {dayLabel(value)} at {clock(value)}. Drivers can accept now; we&apos;ll remind you both before.
          </small>
        </label>
      )}
    </div>
  );
}

/** The flight an airport booking is built around, with a way back to change it. */
export function FlightSummary({ flight, pickupAt }: { flight: FlightInfo; pickupAt: number | null }) {
  const depart = flight.kind === "departure";
  return (
    <Link href="/ride/airport" className="flex items-center gap-3 rounded-2xl bg-danfo-soft px-3.5 py-3 text-[0.86rem]">
      <Plane size={20} className="flex-none" aria-hidden />
      <span className="min-w-0 flex-1">
        <b className="block">
          {flight.number ? `Flight ${flight.number}` : "Your flight"} {depart ? "departs" : "lands"} {dayLabel(flight.time)}, {clock(flight.time)}
          {flight.international ? " · international" : ""}
        </b>
        <small className="text-muted">{pickupAt ? `Pickup ${clock(pickupAt)}, worked out from your flight` : "Pickup now"} · Change</small>
      </span>
      <ChevronRight size={18} className="flex-none text-muted" aria-hidden />
    </Link>
  );
}

/** Rides booked for later, on the home and Activity screens. */
export function UpcomingTrips() {
  const s = useStore();
  const trips = upcomingTrips(s, "customer");
  if (!trips.length) return null;
  return (
    <section className="grid gap-2">
      <p className="kicker">Upcoming</p>
      <ul className="grid gap-2">
        {trips.map((t) => (
          <li key={t.id}>
            <Link href={`/ride/trip/${t.id}`} className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line bg-surface px-3.5 py-3 hover:border-ink">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-danfo text-on-danfo">
                {t.flight ? <Plane size={20} aria-hidden /> : <CalendarClock size={20} aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[0.92rem]">
                  {dayLabel(t.scheduledFor ?? t.createdAt)}, {clock(t.scheduledFor ?? t.createdAt)} · {place(t.dropId).name}
                </b>
                <small className="block text-[0.76rem] text-muted">
                  {t.driver.short} · {t.driver.vehicle.plate} · {naira(t.price)}
                </small>
              </span>
              <ChevronRight size={18} className="text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
