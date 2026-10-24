"use client";

import { Check, Copy, Siren, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CancelTripSheet, ShareTripButton, SosSheet } from "@/components/app/common";
import { ChatButton } from "@/components/app/chat-view";
import { MapLayout, Page, Panel } from "@/components/app/layout-parts";
import { ReportSheet } from "@/components/customer/report-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip, Segmented } from "@/components/ui/controls";
import { Avatar, LockedFare, Plate, RouteDots, Stars } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { CUSTOMER_CANCEL_REASONS, RATING_TAGS } from "@/lib/config";
import { place, roadKm } from "@/lib/data/places";
import { capitalise, clock, dayLabel, firstName, naira } from "@/lib/format";
import { vehiclePosition } from "@/lib/geo";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { PayMethod, Trip } from "@/lib/types";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const trip = useStore((s) => s.trips.find((t) => t.id === id && t.customerSource === "me"));
  if (!trip) {
    return (
      <Page>
        <h1 className="font-display text-xl font-bold">Trip not found</h1>
        <ButtonLink href="/ride">Back home</ButtonLink>
      </Page>
    );
  }
  if (trip.stage === "cancelled") return <CancelledView trip={trip} />;
  if (trip.stage === "payment" && !trip.customerPaid) return <PayView trip={trip} />;
  if ((trip.stage === "payment" || trip.stage === "completed") && trip.rating === undefined) return <RateView trip={trip} />;
  if (trip.stage === "completed" || trip.stage === "payment") return <DoneView trip={trip} />;
  return <LiveView trip={trip} />;
}

function LiveView({ trip }: { trip: Trip }) {
  const now = useNow(1000);
  const [report, setReport] = useState(false);
  const [sos, setSos] = useState(false);
  const [cancel, setCancel] = useState(false);
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  const name = firstName(trip.driver.name);
  const send = trip.mode === "send";
  const live = trip.driverSource === "me";
  const el = (now - trip.stageAt) / 1000;
  const eta = Math.max(1, Math.round(trip.etaMin * (1 - Math.min(1, el / 9))));
  const rideLeft = Math.max(1, Math.round(roadKm(a, b) * 2.6 * (1 - Math.min(1, el / 12))));
  const copy = {
    to_pickup: [`${name} is on the way`, `About ${eta} min away · ${capitalise(trip.driver.vehicle.description)}`],
    at_pickup: [`${name} has arrived`, send ? `Hand over the ${(trip.notes[0] ?? "parcel").toLowerCase()} at ${a.name}. Check the plate first.` : `Meet at ${a.name}. Check the plate before you get in.`],
    on_trip: [send ? "Your delivery is on the way" : `On the way to ${b.name}`, `Arriving in about ${rideLeft} min`],
  }[trip.stage as "to_pickup" | "at_pickup" | "on_trip"];
  const step = ["to_pickup", "at_pickup", "on_trip"].indexOf(trip.stage);
  const canCancel = trip.stage === "to_pickup" || trip.stage === "at_pickup";

  return (
    <MapLayout map={<MapView pickup={a} drop={b} vehicle={vehiclePosition(trip.stage, trip.stageAt, now, a, b, live)} />}>
      <Panel>
        <div className="grid gap-1">
          <h1 className="font-display text-[1.12rem] leading-tight font-bold tracking-tight">{copy[0]}</h1>
          <p className="text-[0.8rem] text-muted">{copy[1]}</p>
          <div className="mt-2 grid grid-cols-3 gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <i key={i} className={`h-1 rounded ${i <= step ? "bg-brand" : "bg-line"}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3">
          <Avatar name={trip.driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-bold">
              {trip.driver.short} <Stars rating={trip.driver.rating} />
            </p>
            <p className="text-[0.76rem] text-muted">{capitalise(trip.driver.vehicle.description)}</p>
          </div>
          <Plate>{trip.driver.vehicle.plate}</Plate>
        </div>
        <LockedFare price={trip.price} payMethod={trip.payMethod} />
        <div className="grid grid-cols-3 gap-2">
          <ChatButton trip={trip} me="customer" href={`/ride/trip/${trip.id}/chat`} />
          <ShareTripButton trip={trip} />
          <button type="button" onClick={() => setSos(true)} className="grid justify-items-center gap-1 rounded-2xl border-[1.5px] border-line bg-surface px-1 py-2.5 text-[0.72rem] font-bold text-danger hover:border-danger">
            <Siren size={20} aria-hidden />
            SOS
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {canCancel && (
            <button type="button" onClick={() => setCancel(true)} className="text-[0.86rem] font-bold text-danger">
              Cancel trip
            </button>
          )}
          <button type="button" onClick={() => setReport(true)} className="text-[0.86rem] font-semibold text-muted underline">
            Report a problem
          </button>
        </div>
      </Panel>
      <ReportSheet open={report} onClose={() => setReport(false)} tripId={trip.id} />
      <SosSheet open={sos} onClose={() => setSos(false)} trip={trip} by="customer" />
      <CancelTripSheet open={cancel} onClose={() => setCancel(false)} trip={trip} by="customer" reasons={CUSTOMER_CANCEL_REASONS} />
    </MapLayout>
  );
}

function PayView({ trip }: { trip: Trip }) {
  const pay = useStore((s) => s.customerPay);
  const [method, setMethod] = useState<PayMethod>(trip.payMethod);
  const name = firstName(trip.driver.name);
  const payout = trip.driver.payout;
  return (
    <Page>
      <div className="grid justify-items-center gap-1.5 pt-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand text-on-brand">
          <Check size={28} strokeWidth={2.8} aria-hidden />
        </span>
        <p className="kicker">
          {trip.mode === "send" ? "Delivered" : "You've arrived"} · {place(trip.dropId).name}
        </p>
        <h1 className="font-display text-[1.4rem] font-bold tracking-tight">
          Pay {name} {naira(trip.price)}
        </h1>
        <p className="text-muted">Maza-Maza takes nothing from this fare.</p>
      </div>
      <Segmented<PayMethod>
        label="Payment method"
        value={method}
        onChange={setMethod}
        options={[
          { value: "cash", label: "Cash" },
          { value: "transfer", label: "Transfer" },
        ]}
      />
      {method === "cash" ? (
        <div className="grid gap-1 rounded-2xl border-[1.5px] border-line p-3.5">
          <p>
            Hand <b>{naira(trip.price)}</b> in cash to {name}.
          </p>
          <p className="text-[0.86rem] text-muted">Ask for change before the trip if you need it.</p>
        </div>
      ) : payout ? (
        <div className="grid gap-1 rounded-2xl border-[1.5px] border-line p-3.5">
          <p className="kicker">Transfer to {name}</p>
          <div className="flex items-center justify-between gap-3">
            <p className="tabular font-mono text-[1.2rem] font-semibold tracking-wide">{payout.accountNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}</p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[0.84rem] font-bold text-brand"
              onClick={() =>
                navigator.clipboard?.writeText(payout.accountNumber).then(
                  () => toast("customer", "Account number copied."),
                  () => toast("customer", "Couldn't copy. Select the number instead."),
                )
              }
            >
              <Copy size={16} aria-hidden /> Copy
            </button>
          </div>
          <p>
            {payout.accountName} · {payout.bank}
          </p>
          <p className="text-[0.8rem] text-muted">Check the name matches before you send.</p>
        </div>
      ) : (
        <p className="rounded-2xl bg-danfo-soft p-3.5 text-[0.9rem]">{name} hasn&apos;t added a bank account. Pay in cash, or ask for details in chat.</p>
      )}
      <Button size="lg" block onClick={() => pay(trip.id, method)}>
        I&apos;ve paid {name}
      </Button>
    </Page>
  );
}

function RateView({ trip }: { trip: Trip }) {
  const rate = useStore((s) => s.rateTrip);
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const name = firstName(trip.driver.name);
  return (
    <Page>
      <div className="grid justify-items-center gap-1.5 pt-4 text-center">
        <Avatar name={trip.driver.name} size="lg" />
        <h1 className="font-display text-[1.4rem] font-bold tracking-tight">How was {name}?</h1>
        <p className="text-muted">Ratings help good drivers get more offers.</p>
      </div>
      <div className="flex justify-center gap-1" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={n <= stars} onClick={() => setStars(n)} className={`p-1 text-4xl leading-none ${n <= stars ? "text-danfo" : "text-line"}`}>
            ★
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {RATING_TAGS[trip.mode].map((t) => (
          <Chip key={t} on={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>
            {t}
          </Chip>
        ))}
      </div>
      <Button size="lg" block onClick={() => rate(trip.id, stars, tags)}>
        Submit rating
      </Button>
      <button type="button" onClick={() => rate(trip.id, 0, [])} className="justify-self-center text-[0.86rem] font-bold text-muted">
        Skip
      </button>
    </Page>
  );
}

function Receipt({ trip }: { trip: Trip }) {
  return (
    <>
      <RouteDots from={place(trip.pickupId).name} to={place(trip.dropId).name} meta={`${roadKm(place(trip.pickupId), place(trip.dropId))} km · ${trip.mode === "ride" ? "Ride" : "Delivery"}`} />
      <dl className="divide-y divide-line rounded-2xl border-[1.5px] border-line">
        {[
          ["Agreed fare", naira(trip.price)],
          ["Paid by", capitalise(trip.payMethod)],
          ["Driver", `${trip.driver.short} · ${trip.driver.vehicle.plate}`],
          ["Your rating", trip.rating ? "★".repeat(trip.rating) : "Not rated"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-3.5 py-2.5">
            <dt className="text-[0.88rem] text-muted">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function BookAgain({ trip, label = "Book this again" }: { trip: Trip; label?: string }) {
  const s = useStore();
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        s.setDraft({ pickupId: trip.pickupId, dropId: trip.dropId, mode: trip.mode, offer: trip.price });
        router.push("/ride/offer");
      }}
    >
      {label}
    </Button>
  );
}

function DoneView({ trip }: { trip: Trip }) {
  const [report, setReport] = useState(false);
  return (
    <Page>
      <div className="grid justify-items-center gap-1.5 pt-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand text-on-brand">
          <Check size={28} strokeWidth={2.8} aria-hidden />
        </span>
        <h1 className="font-display text-[1.4rem] font-bold tracking-tight">Trip complete</h1>
        <p className="text-muted">
          {dayLabel(trip.createdAt)} · {clock(trip.createdAt)}
        </p>
      </div>
      <Receipt trip={trip} />
      <div className="flex flex-wrap gap-2">
        <BookAgain trip={trip} />
        <ButtonLink href="/ride" variant="ghost">
          Back home
        </ButtonLink>
      </div>
      <button type="button" onClick={() => setReport(true)} className="justify-self-start text-[0.86rem] font-semibold text-muted underline">
        Report a problem with this trip
      </button>
      <ReportSheet open={report} onClose={() => setReport(false)} tripId={trip.id} />
    </Page>
  );
}

function CancelledView({ trip }: { trip: Trip }) {
  const byMe = trip.cancelledBy === "customer";
  return (
    <Page>
      <div className="grid justify-items-center gap-1.5 pt-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-lost-bg text-lost">
          <X size={28} strokeWidth={2.8} aria-hidden />
        </span>
        <h1 className="font-display text-[1.4rem] font-bold tracking-tight">{byMe ? "You cancelled this trip" : `${firstName(trip.driver.name)} cancelled the trip`}</h1>
        {trip.cancelReason && <p className="text-muted">{trip.cancelReason}</p>}
      </div>
      <RouteDots from={place(trip.pickupId).name} to={place(trip.dropId).name} />
      <p className="text-[0.88rem] text-muted">You don&apos;t owe anything for a cancelled trip.</p>
      <div className="flex flex-wrap gap-2">
        <BookAgain trip={trip} label="Send the offer again" />
        <ButtonLink href="/ride" variant="ghost">
          Back home
        </ButtonLink>
      </div>
    </Page>
  );
}
