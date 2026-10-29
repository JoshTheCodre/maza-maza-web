"use client";

import { Clock, Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { useNow } from "@/hooks/use-now";
import { AIRPORT_ID, airport, fromInputValue, MIN_LEAD_MIN, planArrival, planDeparture, toInputValue } from "@/lib/airport";
import { DEFAULT_PICKUP, PLACES, place } from "@/lib/data/places";
import { clock, dayLabel, minutesLabel } from "@/lib/format";
import { useRoute } from "@/lib/routing";
import { useStore } from "@/lib/store";
import type { FlightInfo } from "@/lib/types";

const MIN = 60_000;

/** Book a ride to catch a flight or from a landing: the pickup time is worked out from the flight. */
export default function AirportPage() {
  const s = useStore();
  const router = useRouter();
  const now = useNow(30_000);
  const d = s.customer.draft;
  const [dir, setDir] = useState<"to" | "from">(d.pickupId === AIRPORT_ID ? "from" : "to");
  const [number, setNumber] = useState(d.flight?.number ?? "");
  const [time, setTime] = useState(() => d.flight?.time ?? Math.ceil((Date.now() + 5 * 60 * MIN) / (15 * MIN)) * 15 * MIN);
  const [international, setInternational] = useState(d.flight?.international ?? false);
  const [fromId, setFromId] = useState(d.pickupId !== AIRPORT_ID ? d.pickupId : DEFAULT_PICKUP);
  const toId = d.dropId && d.dropId !== AIRPORT_ID ? d.dropId : null;

  // Fetch the real road route so the plan uses it rather than the rough estimate (and redraws when it lands).
  useRoute(dir === "to" ? place(fromId) : airport(), dir === "to" ? airport() : toId ? place(toId) : undefined);

  const flight: FlightInfo = { kind: dir === "to" ? "departure" : "arrival", number: number.trim().toUpperCase() || undefined, time, international };
  const plan = dir === "to" ? planDeparture(flight, place(fromId)) : planArrival(flight, toId ? place(toId) : undefined);
  const pickupNow = plan.pickupAt < now + MIN_LEAD_MIN * MIN;
  const tooLate = dir === "to" && (plan.beAtAirportBy ?? 0) < now;
  const choices = [...PLACES, ...s.customPlaces].filter((p) => p.id !== AIRPORT_ID);

  const go = () => {
    const scheduledFor = pickupNow ? null : plan.pickupAt;
    if (dir === "to") {
      s.setDraft({ mode: "ride", pickupId: fromId, dropId: AIRPORT_ID, scheduledFor, flight, editing: "drop" });
      s.chooseDrop(AIRPORT_ID);
      router.push("/ride/offer");
      return;
    }
    s.setDraft({ mode: "ride", pickupId: AIRPORT_ID, scheduledFor, flight, editing: "drop", dropId: toId });
    if (toId) {
      s.chooseDrop(toId);
      router.push("/ride/offer");
    } else router.push("/ride/search");
  };

  return (
    <Page>
      <PageHeader title="Airport ride" back="/ride" />
      <p className="text-[0.9rem] text-muted">Tell us your flight and we&apos;ll work out when to pick you up. Book now, or ahead with a driver confirmed in advance.</p>
      <Segmented<"to" | "from">
        label="Direction"
        value={dir}
        onChange={setDir}
        options={[
          { value: "to", label: <><PlaneTakeoff size={16} aria-hidden /> To the airport</> },
          { value: "from", label: <><PlaneLanding size={16} aria-hidden /> From the airport</> },
        ]}
      />

      <div className="grid gap-3 rounded-2xl border-[1.5px] border-line bg-surface p-3.5">
        <label className="grid gap-1 text-[0.85rem] font-bold">
          <span>
            Flight number <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. P4 7120"
            autoCapitalize="characters"
            className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold uppercase outline-none placeholder:normal-case placeholder:font-normal focus:border-brand"
          />
        </label>
        <label className="grid gap-1 text-[0.85rem] font-bold">
          {dir === "to" ? "Take-off time" : "Landing time"}
          <input
            type="datetime-local"
            value={toInputValue(time)}
            min={toInputValue(now)}
            step={300}
            onChange={(e) => {
              const t = fromInputValue(e.target.value);
              if (Number.isFinite(t)) setTime(t);
            }}
            className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold outline-none focus:border-brand"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-[0.9rem] font-semibold">
          International flight
          <input type="checkbox" checked={international} onChange={(e) => setInternational(e.target.checked)} className="size-5 accent-[var(--ink)]" />
        </label>
        {dir === "to" ? (
          <label className="grid gap-1 text-[0.85rem] font-bold">
            Pick me up at
            <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold">
              {choices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-[0.85rem]">
            <b>Going to:</b> {toId ? place(toId).name : "you'll choose next"}
          </p>
        )}
      </div>

      <section className="grid gap-2 rounded-2xl bg-ink p-4 text-surface">
        <p className="flex items-center gap-2 text-[0.8rem] font-semibold opacity-75">
          <Plane size={14} aria-hidden /> Your plan
        </p>
        {tooLate ? (
          <p className="font-bold">That flight is too soon to make check-in from here. Check the time, or call your airline.</p>
        ) : (
          <>
            <p className="font-display text-[1.25rem] leading-tight font-bold">
              {pickupNow ? "Leave now" : `Pickup ${dayLabel(plan.pickupAt)}, ${clock(plan.pickupAt)}`}
            </p>
            <p className="text-[0.86rem] opacity-80">
              {dir === "to"
                ? `About ${minutesLabel(plan.driveMin)} to ${airport().name} in that hour's traffic, so you're there by ${clock(plan.beAtAirportBy ?? plan.arriveAt)}, ${international ? "three hours" : "an hour"} before take-off.`
                : `${international ? "45" : "25"} minutes after landing, for bags.${toId ? ` About ${minutesLabel(plan.driveMin)} to ${place(toId).name}.` : ""}`}
            </p>
            <p className="flex items-center gap-1.5 text-[0.8rem] opacity-75">
              <Clock size={14} aria-hidden /> We&apos;ll remind you the day before and an hour before pickup.
            </p>
          </>
        )}
      </section>

      <Button size="lg" block disabled={tooLate} onClick={go}>
        {dir === "to" || toId ? "Choose your car and price" : "Choose where you're going"}
      </Button>
    </Page>
  );
}
