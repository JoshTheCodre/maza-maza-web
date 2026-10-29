"use client";

import { ChevronDown, Clock, Fuel, Gauge } from "lucide-react";
import { clock, minutesLabel, naira } from "@/lib/format";
import { TRAFFIC_LABEL, type FareQuote } from "@/lib/pricing";

/** Distance, time in today's traffic and when you'd arrive. */
/** `startAt` is when the pickup happens: a booked time, or now plus the nearest driver's drive. */
export function TripFacts({ quote, startAt }: { quote: FareQuote; startAt: number }) {
  const { km, minutes, period } = quote.trip;
  const arrive = startAt + (2 + minutes) * 60_000;
  return (
    <ul className="grid grid-cols-3 gap-2 text-center">
      <li className="grid gap-0.5 rounded-2xl bg-surface-2 px-2 py-2.5">
        <Gauge size={16} className="mx-auto text-muted" aria-hidden />
        <b className="tabular text-[0.95rem]">{km} km</b>
        <small className="text-[0.7rem] text-muted">by road</small>
      </li>
      <li className="grid gap-0.5 rounded-2xl bg-surface-2 px-2 py-2.5">
        <Clock size={16} className="mx-auto text-muted" aria-hidden />
        <b className="tabular text-[0.95rem]">{minutesLabel(minutes)}</b>
        <small className="text-[0.7rem] text-muted">{TRAFFIC_LABEL[period].toLowerCase()}</small>
      </li>
      <li className="grid gap-0.5 rounded-2xl bg-surface-2 px-2 py-2.5">
        <span className="mx-auto size-4 rounded-[4px] border-[3px] border-ink bg-danfo" aria-hidden />
        <b className="tabular text-[0.95rem]">{clock(arrive)}</b>
        <small className="text-[0.7rem] text-muted">arrive about</small>
      </li>
    </ul>
  );
}

/** The recommended fare beside the offer box, how the offer compares, and how the fare is worked out. */
export function FareGuide({ quote, offer, onUse, fuelPrice }: { quote: FareQuote; offer: number; onUse: () => void; fuelPrice: number }) {
  const verdict =
    offer >= quote.recommended
      ? { tone: "text-accept", text: "Fair price. Drivers should say yes quickly." }
      : offer >= quote.low
        ? { tone: "text-counter", text: "A little under the usual fare. Some drivers may counter." }
        : { tone: "text-danger", text: `Drivers rarely accept below ${naira(quote.low)}. Expect counter-offers.` };
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2">
        <span className="min-w-0">
          <small className="block text-[0.72rem] text-muted">Recommended fare</small>
          <b className="font-display text-[1.05rem] tracking-tight">{naira(quote.recommended)}</b>
        </span>
        {offer !== quote.recommended && (
          <button type="button" onClick={onUse} className="min-h-9 flex-none rounded-full bg-danfo px-4 text-[0.84rem] font-bold text-on-danfo hover:brightness-95">
            Use it
          </button>
        )}
      </div>
      {offer > 0 && <p className={`text-center text-[0.78rem] font-semibold ${verdict.tone}`}>{verdict.text}</p>}
      <details className="group rounded-xl bg-surface px-3 py-2 text-[0.84rem]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
          How we work this out
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <dl className="mt-2 grid gap-1">
          {quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-3">
              <dt className="text-muted">{l.label}</dt>
              <dd className="tabular font-semibold">{naira(l.amount)}</dd>
            </div>
          ))}
          <div className="mt-1 flex justify-between gap-3 border-t border-line pt-1.5">
            <dt className="font-bold">Recommended, rounded</dt>
            <dd className="tabular font-bold">{naira(quote.recommended)}</dd>
          </div>
        </dl>
        <p className="mt-2 flex items-start gap-1.5 text-[0.76rem] text-muted">
          <Fuel size={14} className="mt-0.5 flex-none" aria-hidden />
          Petrol at {naira(fuelPrice)}/L and today&apos;s traffic. You can still offer any price, and drivers keep the whole fare.
        </p>
      </details>
    </div>
  );
}
