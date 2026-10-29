"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapLayout, Page, Panel } from "@/components/app/layout-parts";
import { BidCard } from "@/components/customer/parts";
import { Button, ButtonLink } from "@/components/ui/button";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { clock, dayLabel, minutesSeconds, naira } from "@/lib/format";
import { RIDE_CLASSES, classOf } from "@/lib/ride-classes";
import { useStore } from "@/lib/store";

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const router = useRouter();
  const now = useNow(1000);
  const req = s.requests.find((r) => r.id === id);
  const trip = s.trips.find((t) => t.requestId === id && t.customerSource === "me");

  useEffect(() => {
    if (trip) router.replace(`/ride/trip/${trip.id}`);
  }, [trip, router]);

  if (!req) {
    return (
      <Page>
        <h1 className="font-display text-xl font-bold">Request not found</h1>
        <p className="text-muted">It may have expired or been cancelled.</p>
        <ButtonLink href="/ride">Back home</ButtonLink>
      </Page>
    );
  }

  const a = place(req.pickupId);
  const b = place(req.dropId);
  const bids = s.bids.filter((x) => x.requestId === id && x.status === "active").sort((x, y) => x.amount - y.amount);
  const who = req.mode === "ride" ? "drivers" : "dispatch riders";

  if (req.status !== "open") {
    const again = () => {
      s.setDraft({ pickupId: req.pickupId, dropId: req.dropId, mode: req.mode, offer: req.offer });
      router.push("/ride/offer");
    };
    return (
      <MapLayout map={<MapView pickup={a} drop={b} />}>
        <Panel>
          <h1 className="font-display text-[1.2rem] font-bold">{req.status === "expired" ? "This request expired" : req.status === "cancelled" ? "You cancelled this request" : "Finding your trip…"}</h1>
          <p className="text-muted">
            {a.name} → {b.name} · {naira(req.offer)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={again}>Send it again</Button>
            <ButtonLink href="/ride" variant="ghost">
              Back home
            </ButtonLink>
          </div>
        </Panel>
      </MapLayout>
    );
  }

  const elapsed = Math.floor((now - req.createdAt) / 1000);
  const left = Math.max(0, Math.floor((req.expiresAt - now) / 1000));

  return (
    <MapLayout mapSize="short" map={<MapView pickup={a} drop={b} pulse />}>
      <Panel
        footer={
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                s.cancelRequest(req.id);
                router.push("/ride/offer");
              }}
            >
              Cancel
            </Button>
            <Button variant="dark" onClick={() => s.raiseOffer(req.id)}>
              Raise to {naira(req.offer + s.settings.raiseStep)}
            </Button>
          </div>
        }
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="kicker">Your offer</p>
            <h1 className="tabular font-display text-[1.7rem] font-bold tracking-tight">{naira(req.offer)}</h1>
          </div>
          <p className="tabular flex items-center gap-1.5 font-mono text-[0.76rem] text-muted">
            <span className="size-2 animate-blink rounded-full bg-brand" aria-hidden />
            {minutesSeconds(elapsed)}
          </p>
        </div>
        <p className="font-bold leading-snug">
          {a.name} → {b.name}
        </p>
        {(req.scheduledFor || req.rideClass) && (
          <p className="text-[0.84rem] text-muted">
            {req.scheduledFor ? `Booking for ${dayLabel(req.scheduledFor)}, ${clock(req.scheduledFor)}` : "Ride now"}
            {req.mode === "ride" ? ` · ${RIDE_CLASSES[classOf(req)].label}` : ""}
            {req.flight?.number ? ` · flight ${req.flight.number}` : ""}
          </p>
        )}
        <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-[0.84rem] text-muted" aria-live="polite">
          {bids.length
            ? `${bids.length} ${bids.length === 1 ? "reply" : "replies"} so far. Accept one, or wait for more.`
            : `Sent to ${req.reach} ${who} nearby. Waiting for replies…`}{" "}
          Expires in {minutesSeconds(left)}.
        </p>
        <ul className="grid gap-2" aria-label="Replies from drivers">
          {bids.map((bid) => (
            <BidCard
              key={bid.id}
              bid={bid}
              scheduledFor={req.scheduledFor}
              onDecline={() => s.declineBid(bid.id)}
              onAccept={() => {
                const tripId = s.acceptBid(bid.id);
                if (tripId) router.push(`/ride/trip/${tripId}`);
              }}
            />
          ))}
        </ul>
      </Panel>
    </MapLayout>
  );
}
