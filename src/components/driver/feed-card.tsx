"use client";

import { CalendarClock, Plane } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip, NairaStepper } from "@/components/ui/controls";
import { Avatar, Pill, RouteDots, Stars } from "@/components/ui/display";
import { useQuote } from "@/hooks/use-quote";
import { place } from "@/lib/data/places";
import { clock, dayLabel, firstName, naira } from "@/lib/format";
import { fareSettings, minutesAway, nextJobPrice } from "@/lib/pricing";
import { myBidFor, useStore } from "@/lib/store";
import type { RideRequest } from "@/lib/types";

/** One customer request in the driver's feed. As a `nextJob`, the customer pays less and the rider takes it after their drop-off. */
export function FeedCard({ req, now, nextJob }: { req: RideRequest; now: number; nextJob?: { freeInMin: number } }) {
  const s = useStore();
  const [countering, setCountering] = useState(false);
  const [amount, setAmount] = useState(req.offer + 500);
  const bid = myBidFor(s, req.id);
  const a = place(req.pickupId);
  const b = place(req.dropId);
  const name = firstName(req.customer.name);
  const raised = req.offer > req.firstOffer;
  const q = useQuote(a, b, req.mode);
  const fare = fareSettings(s.settings);
  const youGet = (n: number) => (nextJob ? nextJobPrice(n, fare) : n);

  let state: { tone: "wait" | "lost"; text: string } | null = null;
  if (bid?.status === "active") state = { tone: "wait", text: bid.kind === "accept" ? `You accepted ${naira(bid.amount)}. Waiting for ${name} to choose…` : `You countered ${naira(bid.amount)}. Waiting for ${name}…` };
  else if (bid?.status === "declined") state = { tone: "lost", text: `${name} declined your offer` };
  else if (bid?.status === "lost") state = { tone: "lost", text: req.status === "cancelled" ? `${name} cancelled the request` : req.status === "expired" ? "This request expired" : `${name} chose another driver` };
  const ended = req.status !== "open" || bid?.status === "declined" || bid?.status === "lost";
  const leftPct = Math.max(0, Math.min(100, ((req.expiresAt - now) / Math.max(1, req.expiresAt - req.createdAt)) * 100));

  return (
    <li className={`grid animate-enter gap-2.5 rounded-[18px] border-[1.5px] bg-surface p-3 border-line ${ended ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2.5">
        <Avatar name={req.customer.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.9rem] font-bold">
            {req.customer.short} <Stars rating={req.customer.rating} />
          </p>
          <p className="text-[0.74rem] text-muted">
            {req.kmToPickup} km to pickup · {(nextJob?.freeInMin ?? 0) + minutesAway(req.kmToPickup, req.mode, now)} min away · pays by {req.payMethod}
          </p>
        </div>
        <div className="grid justify-items-end gap-1">
          <b className="tabular font-display text-[1.2rem] font-bold tracking-tight">{naira(req.offer)}</b>
          {raised && <Pill tone="accept">Raised</Pill>}
          {q && !raised && <small className="text-[0.7rem] text-muted">fair {naira(q.quote.recommended)}</small>}
        </div>
      </div>
      <RouteDots from={a.name} to={b.name} meta={[q ? `${q.trip.km} km · ${q.trip.minutes} min trip` : "", req.parcel, ...req.notes].filter(Boolean).join(" · ")} />
      {req.scheduledFor && (
        <p className="flex items-center gap-2 rounded-xl bg-danfo-soft px-3 py-2 text-[0.8rem] font-semibold">
          {req.flight ? <Plane size={16} aria-hidden /> : <CalendarClock size={16} aria-hidden />}
          Scheduled: {dayLabel(req.scheduledFor)}, {clock(req.scheduledFor)}
          {req.flight ? ` · flight ${req.flight.number ?? ""} ${req.flight.kind === "departure" ? "departs" : "lands"} ${clock(req.flight.time)}` : ""}
        </p>
      )}
      {nextJob && !bid && req.status === "open" && (
        <p className="rounded-xl bg-danfo-soft px-3 py-2 text-[0.8rem]">
          <b>Next job.</b> You&apos;re about {nextJob.freeInMin} min from your drop-off, so {name} pays {fare.nextJobPct}% less: you&apos;d get {naira(youGet(req.offer))}.
        </p>
      )}
      {!bid && req.status === "open" && !countering && (
        <div className="h-[3px] overflow-hidden rounded bg-line" aria-hidden>
          <i className="block h-full bg-brand transition-[width] duration-1000 ease-linear" style={{ width: `${leftPct}%` }} />
        </div>
      )}
      {!bid && req.status === "open" && !countering && (
        <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-2">
          <Button variant="ghost" size="sm" onClick={() => s.skipRequest(req.id)}>
            Skip
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAmount(req.offer + 500);
              setCountering(true);
            }}
          >
            Counter
          </Button>
          <Button size="sm" onClick={() => s.placeBid(req.id, "accept", req.offer)}>
            Accept {naira(youGet(req.offer))}
          </Button>
        </div>
      )}
      {!bid && req.status === "open" && countering && (
        <div className="grid gap-2.5 rounded-[14px] border-[1.5px] border-ink p-3">
          <p className="text-[0.85rem] font-bold">Your counter-offer</p>
          <div className="flex flex-wrap gap-2">
            {[200, 500, 1000].map((x) => (
              <Chip key={x} on={amount === req.offer + x} onClick={() => setAmount(req.offer + x)}>
                +{naira(x)}
              </Chip>
            ))}
          </div>
          <NairaStepper id={`counter-${req.id}`} value={amount} onChange={setAmount} small />
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCountering(false)}>
              Back
            </Button>
            <Button
              size="sm"
              disabled={amount <= req.offer}
              onClick={() => {
                if (s.placeBid(req.id, "counter", amount)) setCountering(false);
              }}
            >
              {amount > req.offer ? `Send counter · ${naira(amount)}` : `Go above ${naira(req.offer)}`}
            </Button>
          </div>
        </div>
      )}
      {state && <p className={`rounded-xl px-3 py-2.5 text-[0.82rem] font-semibold ${state.tone === "wait" ? "bg-counter-bg text-counter" : "bg-lost-bg text-lost"}`}>{state.text}</p>}
    </li>
  );
}
