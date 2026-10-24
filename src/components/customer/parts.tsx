"use client";

import { Bike, Car } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Avatar, Pill, Stars } from "@/components/ui/display";
import { capitalise, firstName, naira } from "@/lib/format";
import { activeCustomerTrip, openCustomerRequest, placeName, useStore } from "@/lib/store";
import type { Bid, Mode } from "@/lib/types";

export function ModeSwitch() {
  const mode = useStore((s) => s.customer.draft.mode);
  const setDraft = useStore((s) => s.setDraft);
  return (
    <Segmented<Mode>
      label="Service"
      value={mode}
      onChange={(m) => m !== mode && setDraft({ mode: m, notes: [] })}
      options={[
        { value: "ride", label: <><Car size={18} aria-hidden /> Ride</> },
        { value: "send", label: <><Bike size={18} aria-hidden /> Send</> },
      ]}
    />
  );
}

export function BidCard({ bid, onAccept, onDecline }: { bid: Bid; onAccept: () => void; onDecline: () => void }) {
  return (
    <li className={`grid animate-enter grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-1.5 rounded-2xl border-[1.5px] bg-surface p-3 border-line`}>
      <Avatar name={bid.driver.name} />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.9rem] font-bold">
          {bid.driver.short} <Stars rating={bid.driver.rating} />
        </p>
        <p className="text-[0.76rem] leading-snug text-muted">
          {capitalise(bid.driver.vehicle.description)} · {bid.driver.vehicle.plate}
        </p>
        <p className="text-[0.76rem] text-muted">{bid.etaMin} min away</p>
      </div>
      <div className="grid justify-items-end gap-1">
        <Pill tone={bid.kind === "accept" ? "accept" : "counter"}>{bid.kind === "accept" ? "Accepts" : "Counter"}</Pill>
        <b className="tabular font-mono text-[0.94rem] font-semibold">{naira(bid.amount)}</b>
      </div>
      <div className="col-span-2 col-start-2 mt-1 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDecline}>
          Decline
        </Button>
        <Button size="sm" onClick={onAccept}>
          Accept {naira(bid.amount)}
        </Button>
      </div>
    </li>
  );
}

/** Shown on the home screen when a request or trip is still going. */
export function ResumeBanner() {
  const s = useStore();
  const trip = activeCustomerTrip(s);
  const req = openCustomerRequest(s);
  if (trip) {
    const name = firstName(trip.driver.name);
    const label =
      trip.stage === "payment" && !trip.customerPaid
        ? `Pay ${name} ${naira(trip.price)}`
        : trip.stage === "payment" || trip.stage === "completed"
          ? `Rate your trip with ${name}`
          : `${name} is on your trip to ${placeName(trip.dropId)}`;
    return (
      <Link href={`/ride/trip/${trip.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-bg">
        <span className="text-[0.9rem] font-semibold">{label}</span>
        <span className="text-[0.84rem] font-bold text-danfo">Open</span>
      </Link>
    );
  }
  if (req) {
    const n = s.bids.filter((b) => b.requestId === req.id && b.status === "active").length;
    return (
      <Link href={`/ride/request/${req.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-bg">
        <span className="text-[0.9rem] font-semibold">
          Your {naira(req.offer)} offer is open · {n} {n === 1 ? "reply" : "replies"}
        </span>
        <span className="text-[0.84rem] font-bold text-danfo">Open</span>
      </Link>
    );
  }
  return null;
}
