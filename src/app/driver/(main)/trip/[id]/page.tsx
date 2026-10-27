"use client";

import { Check, ExternalLink, Siren, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CancelTripSheet, SosSheet } from "@/components/app/common";
import { ChatButton } from "@/components/app/chat-view";
import { MapLayout, Page, Panel } from "@/components/app/layout-parts";
import { ReportSheet } from "@/components/customer/report-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar, LockedFare, Stars } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { DRIVER_CANCEL_REASONS, NO_SHOW_WAIT_MS } from "@/lib/config";
import { FeedCard } from "@/components/driver/feed-card";
import { place } from "@/lib/data/places";
import { tripTimes } from "@/lib/eta";
import { clock, firstName, minutesSeconds, naira } from "@/lib/format";
import { vehiclePosition } from "@/lib/geo";
import { knownRoute, useRoute } from "@/lib/routing";
import { driverFeed, nextJobWindow, queuedDriverTrip, todayTicket, todaysDriverTrips, useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";

export default function DriverTripPage() {
  const { id } = useParams<{ id: string }>();
  const trip = useStore((s) => s.trips.find((t) => t.id === id && t.driverSource === "me"));
  if (!trip) {
    return (
      <Page>
        <h1 className="font-display text-xl font-bold">Trip not found</h1>
        <ButtonLink href="/driver">Back to offers</ButtonLink>
      </Page>
    );
  }
  if (trip.stage === "cancelled") return <Cancelled trip={trip} />;
  return trip.stage === "completed" ? <Summary trip={trip} /> : <Live trip={trip} />;
}

function Live({ trip }: { trip: Trip }) {
  const s = useStore();
  const now = useNow(1000);
  const [report, setReport] = useState(false);
  const [sos, setSos] = useState(false);
  const [cancel, setCancel] = useState(false);
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  const name = firstName(trip.customer.name);
  const send = trip.mode === "send";
  const item = (trip.notes[0] ?? "parcel").toLowerCase();
  const target = trip.stage === "to_pickup" ? a : b;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving`;
  const payout = s.driver.profile.payout;
  const waited = now - trip.stageAt;
  const noShowIn = Math.max(0, Math.ceil((NO_SHOW_WAIT_MS - waited) / 1000));
  const route = useRoute(a, b);
  const times = tripTimes(trip, route ?? knownRoute(a, b), now);
  const freeIn = nextJobWindow(s, now);
  const queued = queuedDriverTrip(s);
  const nextJobs = freeIn !== null ? driverFeed(s, now) : [];

  const copy = {
    to_pickup: { title: `Pick up ${name}`, sub: `${a.name} · about ${times.toPickup} min away`, cta: "I've arrived" },
    at_pickup: { title: send ? `Collect the ${item} from ${name}` : `Waiting for ${name}`, sub: send ? "Take a photo of the item before you leave" : `Confirm the name before ${name} gets in`, cta: send ? "Start delivery" : "Start trip" },
    on_trip: { title: `${send ? "Deliver to" : "Drop off at"} ${b.name}`, sub: `${times.leftToDrop} min left · arrive about ${clock(times.arriveAt)} · ${naira(trip.price)} locked`, cta: send ? "Mark as delivered" : "End trip" },
    payment: {
      title: `Collect ${naira(trip.price)}`,
      sub: trip.customerPaid
        ? `${name} says it's paid. Confirm when you have it.`
        : trip.payMethod === "cash"
          ? `${name} pays you in cash`
          : payout
            ? `${name} transfers to your ${payout.bank} account ending ${payout.accountNumber.slice(-4)}`
            : `${name} wants to pay by transfer. Share your account in chat, or take cash.`,
      cta: "Payment received",
    },
  }[trip.stage as "to_pickup" | "at_pickup" | "on_trip" | "payment"];
  const step = ["to_pickup", "at_pickup", "on_trip", "payment"].indexOf(trip.stage);

  return (
    <MapLayout map={<MapView pickup={a} drop={b} vehicle={vehiclePosition(trip.stage, trip.stageAt, now, a, b, true, route?.road ? route.path : undefined)} />}>
      <Panel
        footer={
          <Button size="lg" block onClick={() => (trip.stage === "payment" ? s.confirmPaid(trip.id) : s.advanceTrip(trip.id))}>
            {copy.cta}
          </Button>
        }
      >
        <div className="grid gap-1">
          <h1 className="font-display text-[1.12rem] leading-tight font-bold tracking-tight">{copy.title}</h1>
          <p className="text-[0.8rem] text-muted">{copy.sub}</p>
          <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={`h-1 rounded ${i <= step ? "bg-brand" : "bg-line"}`} />
            ))}
          </div>
        </div>
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
        <div className="grid grid-cols-3 gap-2">
          <ChatButton trip={trip} me="driver" href={`/driver/trip/${trip.id}/chat`} />
          <a href={navUrl} target="_blank" rel="noreferrer" className="grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold hover:border-ink">
            <ExternalLink size={20} aria-hidden />
            Navigate
          </a>
          <button type="button" onClick={() => setSos(true)} className="grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold text-danger hover:border-danger">
            <Siren size={20} aria-hidden />
            SOS
          </button>
        </div>
        {queued && queued.id !== trip.id && (
          <p className="rounded-xl bg-danfo-soft px-3 py-2.5 text-[0.84rem]">
            <b>Next job lined up:</b> {firstName(queued.customer.name)} at {place(queued.pickupId).name}, {naira(queued.price)}. It starts when you finish here.
          </p>
        )}
        {freeIn !== null && (
          <section className="grid gap-2">
            <h2 className="font-bold">Take your next job</h2>
            <p className="text-[0.8rem] text-muted">You&apos;re nearly done. Customers near your drop-off can book you now and pay a little less.</p>
            {nextJobs.length ? (
              <ul className="grid gap-2">
                {nextJobs.map((r) => (
                  <FeedCard key={r.id} req={r} now={now} nextJob={{ freeInMin: freeIn }} />
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-[0.84rem] text-muted">Looking for customers near {b.name}…</p>
            )}
          </section>
        )}
        {trip.stage === "at_pickup" && (
          <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-[0.84rem] text-muted">
            {noShowIn > 0 ? (
              <>
                If {name} doesn&apos;t come, you can cancel for a no-show in <b className="tabular text-ink">{minutesSeconds(noShowIn)}</b>.
              </>
            ) : (
              <>
                {name} hasn&apos;t come out.{" "}
                <button type="button" onClick={() => s.cancelTrip(trip.id, "driver", "Customer didn't show up")} className="font-bold text-danger">
                  Cancel for no-show
                </button>
              </>
            )}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {trip.stage === "to_pickup" && (
            <button type="button" onClick={() => setCancel(true)} className="text-[0.86rem] font-bold text-danger">
              Cancel trip
            </button>
          )}
          <button type="button" onClick={() => setReport(true)} className="text-[0.86rem] font-semibold text-muted underline">
            Report a problem
          </button>
        </div>
      </Panel>
      <ReportSheet open={report} onClose={() => setReport(false)} tripId={trip.id} audience="driver" />
      <SosSheet open={sos} onClose={() => setSos(false)} trip={trip} by="driver" />
      <CancelTripSheet open={cancel} onClose={() => setCancel(false)} trip={trip} by="driver" reasons={DRIVER_CANCEL_REASONS} />
    </MapLayout>
  );
}

function Summary({ trip }: { trip: Trip }) {
  const s = useStore();
  const router = useRouter();
  const now = useNow(30_000);
  const ticket = todayTicket(s, now);
  const today = todaysDriverTrips(s, now);
  const earned = today.reduce((sum, t) => sum + t.price, 0);
  const tk = ticket?.price ?? 0;
  return (
    <Page>
      <div className="grid justify-items-center gap-1.5 pt-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand text-on-brand">
          <Check size={28} strokeWidth={2.8} aria-hidden />
        </span>
        <p className="kicker">Trip complete · {place(trip.dropId).name}</p>
        <p className="tabular font-display text-[2.1rem] font-extrabold tracking-tight text-brand">+{naira(trip.price)}</p>
        <p className="text-muted">You keep all of it. Commission: ₦0.</p>
      </div>
      <div className="on-hero grid gap-3 rounded-[20px] bg-hero p-4 text-on-hero">
        <p className="font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-on-hero-muted uppercase">Today so far</p>
        <div className="grid gap-1.5 text-[0.86rem]">
          <p className="flex justify-between gap-3">
            <span className="text-on-hero-muted">
              Fares collected · {today.length} {today.length === 1 ? "trip" : "trips"}
            </span>
            <b className="tabular font-mono">{naira(earned)}</b>
          </p>
          <p className="flex justify-between gap-3">
            <span className="text-on-hero-muted">Day ticket</span>
            <b className="tabular font-mono">{naira(-tk)}</b>
          </p>
        </div>
        {tk > 0 && (
          <>
            <div className="h-2 overflow-hidden rounded-full bg-hero-2">
              <i className="block h-full bg-danfo" style={{ width: `${Math.min(100, (earned / tk) * 100)}%` }} />
            </div>
            <p className="text-[0.8rem] text-on-hero-muted">{earned >= tk ? "Today's ticket is paid back. Everything else today is yours." : `${naira(tk - earned)} more and today's ticket is paid back.`}</p>
          </>
        )}
      </div>
      <Button size="lg" block onClick={() => router.push("/driver")}>
        Back to offers
      </Button>
    </Page>
  );
}

function Cancelled({ trip }: { trip: Trip }) {
  return (
    <Page>
      <div className="grid justify-items-center gap-1.5 pt-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-lost-bg text-lost">
          <X size={28} strokeWidth={2.8} aria-hidden />
        </span>
        <h1 className="font-display text-[1.4rem] font-bold tracking-tight">{trip.cancelledBy === "driver" ? "You cancelled this trip" : `${firstName(trip.customer.name)} cancelled the trip`}</h1>
        {trip.cancelReason && <p className="text-muted">{trip.cancelReason}</p>}
      </div>
      <ButtonLink href="/driver" size="lg" block>
        Back to offers
      </ButtonLink>
    </Page>
  );
}
