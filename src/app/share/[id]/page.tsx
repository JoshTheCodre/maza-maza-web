"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChatButton } from "@/components/app/chat-view";
import { AppProvider } from "@/components/app/providers";
import { Avatar, Logo, Plate, RouteDots } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { tripTimes } from "@/lib/eta";
import { capitalise, clock, firstName, minutesLabel } from "@/lib/format";
import { vehiclePosition } from "@/lib/geo";
import { knownRoute, useRoute } from "@/lib/routing";
import { useStore } from "@/lib/store";
import type { Trip } from "@/lib/types";

const RIDE_STATUS: Record<string, string> = {
  to_pickup: "Driver on the way to pickup",
  at_pickup: "Driver at the pickup",
  on_trip: "On the trip",
  payment: "Arrived",
  completed: "Trip finished",
  cancelled: "Trip cancelled",
};

const DELIVERY_STATUS: Record<string, string> = {
  to_pickup: "The rider is going to collect your package",
  at_pickup: "The rider is collecting your package",
  on_trip: "Your package is on the way",
  payment: "Delivered",
  completed: "Delivered",
  cancelled: "This delivery was cancelled",
};

/**
 * The link a customer shares. For a ride, family follow it for safety. For a delivery, it's the receiver's page:
 * when the package arrives, where the rider is, and a group chat with the rider and the sender.
 */
export default function SharedTripPage() {
  return (
    <AppProvider>
      <SharedTrip />
    </AppProvider>
  );
}

function SharedTrip() {
  const { id } = useParams<{ id: string }>();
  const trip = useStore((s) => s.trips.find((t) => t.id === id));
  if (!trip) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="grid gap-3">
          <h1 className="font-display text-xl font-bold">This link has expired</h1>
          <p className="text-muted">Tracking links stop updating when the trip or delivery ends.</p>
          <Link href="/" className="font-bold text-brand">
            Go to Maza-Maza
          </Link>
        </div>
      </div>
    );
  }
  return <Tracking trip={trip} />;
}

function Tracking({ trip }: { trip: Trip }) {
  const now = useNow(1000);
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  const route = useRoute(a, b);
  const times = tripTimes(trip, route ?? knownRoute(a, b), now);
  const live = trip.stage !== "completed" && trip.stage !== "cancelled" && trip.stage !== "payment";
  const send = trip.mode === "send";
  const sender = firstName(trip.customer.name);
  const step = ["to_pickup", "at_pickup", "on_trip", "payment"].indexOf(trip.stage === "completed" ? "payment" : trip.stage);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="on-hero flex flex-none items-center justify-between bg-hero px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 text-on-hero">
        <Logo />
        <span className="text-[0.8rem] text-on-hero-muted">{send ? "Package tracking" : "Shared trip"}</span>
      </header>
      <div className="relative h-[40dvh] flex-none">
        <MapView
          pickup={a}
          drop={b}
          vehicle={live ? vehiclePosition(trip.stage, trip.stageAt, now, a, b, trip.driverSource === "me", route?.road ? route.path : undefined) : undefined}
        />
      </div>
      <div className="mx-auto grid w-full max-w-xl gap-4 px-4 py-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {send ? (
          <section className="grid gap-1">
            <p className="kicker">
              From {sender}
              {trip.receiver ? ` to ${trip.receiver}` : ""} · {live ? `updated ${clock(now)}` : "finished"}
            </p>
            {live ? (
              <>
                <h1 className="font-display text-[1.6rem] leading-tight font-bold tracking-tight">Arrives in {minutesLabel(times.leftToDrop)}</h1>
                <p className="text-[0.95rem]">
                  About <b>{clock(times.arriveAt)}</b> at {b.name}. {DELIVERY_STATUS[trip.stage]}.
                </p>
              </>
            ) : (
              <h1 className="font-display text-[1.4rem] font-bold tracking-tight">{DELIVERY_STATUS[trip.stage]}</h1>
            )}
            {trip.stage !== "cancelled" && (
              <ol className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.72rem] font-semibold">
                {["Collected", "On the way", "Delivered"].map((label, i) => {
                  // step: 0 to pickup, 1 at pickup, 2 on the way, 3 delivered.
                  const done = i === 0 ? step >= 2 : step >= 3;
                  const current = !done && (i === 0 ? step <= 1 : i === 1 && step === 2);
                  return (
                    <li key={label} className="grid justify-items-center gap-1">
                      <span className={`grid size-7 place-items-center rounded-full ${done ? "bg-ink text-surface" : current ? "bg-danfo text-on-danfo" : "bg-surface-2 text-muted"}`}>
                        {done ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}
                      </span>
                      {label}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        ) : (
          <section className="grid gap-1">
            <p className="kicker">
              {live ? "Live" : "Ended"} · updated {clock(now)}
            </p>
            <h1 className="font-display text-[1.2rem] font-bold tracking-tight">
              {sender}&apos;s trip: {RIDE_STATUS[trip.stage]}
            </h1>
            {live && (
              <p className="text-[0.92rem]">
                At {b.name} about <b>{clock(times.arriveAt)}</b> ({minutesLabel(times.leftToDrop)})
              </p>
            )}
          </section>
        )}

        <RouteDots from={a.name} to={b.name} meta={`${(route ?? knownRoute(a, b)).km} km · ${minutesLabel(times.tripMin)} drive`} />
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3">
          <Avatar name={trip.driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {trip.driver.short} {send ? "· your rider" : ""}
            </p>
            <p className="text-[0.76rem] text-muted">{capitalise(trip.driver.vehicle.description)}</p>
          </div>
          <Plate>{trip.driver.vehicle.plate}</Plate>
        </div>

        {send && trip.stage !== "cancelled" && (
          <div className="grid gap-2">
            <ChatButton trip={trip} me="recipient" href={`/share/${trip.id}/chat`} />
            <p className="text-center text-[0.8rem] text-muted">
              Chat with {trip.driver.short} and {sender} about the delivery. Your number stays private.
            </p>
          </div>
        )}
        {!send && (
          <p className="text-[0.84rem] text-muted">
            If you&apos;re worried, call {sender} first. In an emergency, call{" "}
            <a href="tel:112" className="font-bold text-danger">
              112
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
