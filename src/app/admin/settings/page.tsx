"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { CITY } from "@/lib/city";
import { RIDE_CLASSES } from "@/lib/ride-classes";
import { DEFAULT_SETTINGS } from "@/lib/config";
import { place } from "@/lib/data/places";
import { naira } from "@/lib/format";
import { DEFAULT_FARE, fareSettings, type FareSettings, type VehicleRates } from "@/lib/pricing";
import { quoteFor } from "@/lib/quotes";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { Settings } from "@/lib/types";

type Unit = "naira" | "min" | "pct" | "kmpl" | "perkm" | "permin" | "perl";
interface FieldSpec {
  label: string;
  hint: string;
  unit: Unit;
  min: number;
  max: number;
}

const SUFFIX: Record<Unit, string> = { naira: "", min: "min", pct: "%", kmpl: "km/L", perkm: "/km", permin: "/min", perl: "/L" };
const NAIRA_UNITS: Unit[] = ["naira", "perkm", "permin", "perl"];

type GeneralKey = Exclude<keyof Settings, "fare">;
const GENERAL: (FieldSpec & { key: GeneralKey })[] = [
  { key: "ticketCar", label: "Car day ticket", hint: "What car drivers pay for one day online.", unit: "naira", min: 0, max: 50000 },
  { key: "ticketBike", label: "Dispatch bike day ticket", hint: "What dispatch riders pay for one day online.", unit: "naira", min: 0, max: 50000 },
  { key: "minOffer", label: "Lowest offer a customer can send", hint: "Stops offers too small to be serious.", unit: "naira", min: 100, max: 10000 },
  { key: "raiseStep", label: "Raise button step", hint: "How much each tap of Raise adds to an offer.", unit: "naira", min: 50, max: 2000 },
  { key: "requestTtlMin", label: "Request stays open for", hint: "Minutes before an unanswered request expires.", unit: "min", min: 1, max: 30 },
];

type FareKey = Exclude<keyof FareSettings, "car" | "bike" | "classPct">;
const FARE: (FieldSpec & { key: FareKey })[] = [
  { key: "fuelPrice", label: "Petrol pump price", hint: `Update when the ${CITY.name} pump price moves. Depots sold at about ₦1,350 in mid-October 2026; stations charge more.`, unit: "perl", min: 200, max: 5000 },
  { key: "rushPct", label: "Rush hour extra", hint: "Weekdays 6:30–10am and 4–8:30pm, on top of the longer trip time.", unit: "pct", min: 0, max: 100 },
  { key: "nightPct", label: "Late night extra", hint: "10pm to 5am.", unit: "pct", min: 0, max: 100 },
  { key: "airportFee", label: "Airport fee", hint: "Added to trips to or from Port Harcourt International Airport, for car park and access charges.", unit: "naira", min: 0, max: 5000 },
  { key: "nextJobPct", label: "Next-job discount", hint: "Customers pay this much less when they book a rider who's about to finish a delivery nearby.", unit: "pct", min: 0, max: 50 },
  { key: "nextJobWindowMin", label: "Next-job window", hint: "How close to their drop-off a rider must be to take a next job.", unit: "min", min: 1, max: 15 },
];

const VEHICLE: (FieldSpec & { key: keyof VehicleRates })[] = [
  { key: "baseFare", label: "Base fare", hint: "Covers the drive to the pickup.", unit: "naira", min: 0, max: 10000 },
  { key: "kmPerLitre", label: "Fuel use", hint: "Typical distance per litre in city traffic.", unit: "kmpl", min: 1, max: 100 },
  { key: "upkeepPerKm", label: "Upkeep", hint: "Tyres, oil, repairs and wear.", unit: "perkm", min: 0, max: 1000 },
  { key: "perMinute", label: "Driver's time", hint: "Per minute of the trip, so slow traffic pays fairly.", unit: "permin", min: 0, max: 500 },
  { key: "minFare", label: "Minimum fare", hint: "No recommended fare goes below this.", unit: "naira", min: 0, max: 20000 },
];

const CLASS_FIELDS = ["comfort", "suv", "group"] as const;
const CLASS_SPEC: FieldSpec = { label: "", hint: "", unit: "pct", min: 0, max: 300 };

const ok = (v: number, f: FieldSpec) => Number.isFinite(v) && v >= f.min && v <= f.max;

function NumberField({ id, spec, value, onChange }: { id: string; spec: FieldSpec; value: number; onChange: (v: number) => void }) {
  const bad = !ok(value, spec);
  const naira_ = NAIRA_UNITS.includes(spec.unit);
  return (
    <div className="grid gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
      <div>
        <label htmlFor={id} className="font-bold">
          {spec.label}
        </label>
        <p className="text-[0.84rem] text-muted">{spec.hint}</p>
        {bad && (
          <p className="text-[0.8rem] font-semibold text-danger">
            Use {naira_ ? `${naira(spec.min)} to ${naira(spec.max)}` : `${spec.min} to ${spec.max}`}.
          </p>
        )}
      </div>
      <div className={`flex min-h-11 items-center rounded-xl border-[1.5px] bg-surface px-3 focus-within:border-brand ${bad ? "border-danger" : "border-line"}`}>
        {naira_ && <span className="text-muted">₦</span>}
        <input
          id={id}
          inputMode="numeric"
          value={Number.isFinite(value) ? String(value) : ""}
          onChange={(e) => onChange(parseInt(e.target.value.replace(/\D/g, ""), 10))}
          className="tabular min-w-0 flex-1 bg-transparent px-1 text-right font-mono font-semibold outline-none"
        />
        {SUFFIX[spec.unit] && <span className="text-muted">{SUFFIX[spec.unit]}</span>}
      </div>
    </div>
  );
}

export default function SettingsAdmin() {
  const s = useStore();
  const now = useNow(60_000);
  const [draft, setDraft] = useState<Settings>({ ...s.settings, fare: fareSettings(s.settings) });
  const fare = fareSettings(draft);
  const saved = fareSettings(s.settings);

  const valid =
    GENERAL.every((f) => ok(draft[f.key], f)) &&
    FARE.every((f) => ok(fare[f.key], f)) &&
    (["car", "bike"] as const).every((v) => VEHICLE.every((f) => ok(fare[v][f.key], f))) &&
    CLASS_FIELDS.every((c) => ok(fare.classPct[c], CLASS_SPEC));
  const changed = JSON.stringify({ ...draft, fare }) !== JSON.stringify({ ...s.settings, fare: saved });
  const setFare = (patch: Partial<FareSettings>) => setDraft({ ...draft, fare: { ...fare, ...patch } });

  // A live example so admins see what a change does before saving.
  const a = place("rumuokoro");
  const b = place("phmall");
  const example = valid ? { car: quoteFor(a, b, "ride", now, draft), bike: quoteFor(a, b, "send", now, draft) } : null;

  return (
    <AdminPage title="Settings" sub={`Prices and limits for ${CITY.name}. Changes apply to new tickets and requests straight away.`}>
      <form
        className="grid max-w-2xl gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          s.updateSettings({ ...draft, fare });
          toast("admin", "Settings saved.");
        }}
      >
        <section className="grid gap-3">
          <h2 className="font-display text-[1.1rem] font-bold tracking-tight">Tickets and requests</h2>
          {GENERAL.map((f) => (
            <NumberField key={f.key} id={f.key} spec={f} value={draft[f.key]} onChange={(v) => setDraft({ ...draft, [f.key]: v })} />
          ))}
        </section>

        <section className="grid gap-3">
          <div>
            <h2 className="font-display text-[1.1rem] font-bold tracking-tight">Recommended fares</h2>
            <p className="text-[0.86rem] text-muted">
              Customers still name their price. This sets the guide fare beside the offer box: base fare + fuel + upkeep + the driver&apos;s time, plus rush hour, late night and the airport fee.
            </p>
          </div>
          {example && (
            <div className="rounded-2xl bg-ink p-4 text-surface">
              <p className="text-[0.78rem] font-semibold opacity-70">
                Example right now · {a.name} → {b.name} · {example.car.trip.km} km
              </p>
              <p className="mt-1 font-display text-[1.25rem] font-bold">
                Car {naira(example.car.recommended)} · Bike {naira(example.bike.recommended)}
              </p>
              <p className="text-[0.78rem] opacity-70">
                About {example.car.trip.minutes} min by car, {example.bike.trip.minutes} min by bike
              </p>
            </div>
          )}
          {FARE.slice(0, 1).map((f) => (
            <NumberField key={f.key} id={f.key} spec={f} value={fare[f.key]} onChange={(v) => setFare({ [f.key]: v })} />
          ))}
          {(["car", "bike"] as const).map((v) => (
            <fieldset key={v} className="grid gap-3">
              <legend className="mb-2 font-bold">{v === "car" ? "Cars" : "Dispatch bikes"}</legend>
              {VEHICLE.map((f) => (
                <NumberField key={f.key} id={`${v}-${f.key}`} spec={f} value={fare[v][f.key]} onChange={(n) => setFare({ [v]: { ...fare[v], [f.key]: n } })} />
              ))}
            </fieldset>
          ))}
          <fieldset className="grid gap-3">
            <legend className="mb-2 font-bold">Car classes</legend>
            {CLASS_FIELDS.map((c) => (
              <NumberField
                key={c}
                id={`class-${c}`}
                spec={{ ...CLASS_SPEC, label: `${RIDE_CLASSES[c].label} costs more than Economy by`, hint: `${RIDE_CLASSES[c].seats}. ${RIDE_CLASSES[c].blurb}.` }}
                value={fare.classPct[c]}
                onChange={(v) => setFare({ classPct: { ...fare.classPct, [c]: v } })}
              />
            ))}
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="mb-2 font-bold">Extras</legend>
            {FARE.slice(1).map((f) => (
              <NumberField key={f.key} id={f.key} spec={f} value={fare[f.key]} onChange={(v) => setFare({ [f.key]: v })} />
            ))}
          </fieldset>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!changed || !valid}>
            Save settings
          </Button>
          <Button variant="ghost" onClick={() => setDraft({ ...DEFAULT_SETTINGS, fare: DEFAULT_FARE })}>
            Back to defaults
          </Button>
        </div>
      </form>
    </AdminPage>
  );
}
