"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppProvider } from "@/components/app/providers";
import { Avatar, Logo, Plate, RouteDots } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { capitalise, clock, firstName } from "@/lib/format";
import { vehiclePosition } from "@/lib/geo";
import { useStore } from "@/lib/store";

const STATUS: Record<string, string> = {
  to_pickup: "Driver on the way to pickup",
  at_pickup: "Driver at the pickup",
  on_trip: "On the trip",
  payment: "Arrived",
  completed: "Trip finished",
  cancelled: "Trip cancelled",
};

/** Public page a rider shares with family so they can follow the trip. */
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
  const now = useNow(2000);
  if (!trip) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="grid gap-3">
          <h1 className="font-display text-xl font-bold">This trip link has expired</h1>
          <p className="text-muted">Shared trips stop updating when the trip ends.</p>
          <Link href="/" className="font-bold text-brand">
            Go to Maza-Maza
          </Link>
        </div>
      </div>
    );
  }
  const a = place(trip.pickupId);
  const b = place(trip.dropId);
  const live = trip.stage !== "completed" && trip.stage !== "cancelled";
  return (
    <div className="flex h-dvh flex-col">
      <header className="on-hero flex flex-none items-center justify-between bg-hero px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 text-on-hero">
        <Logo />
        <span className="text-[0.8rem] text-on-hero-muted">Shared trip</span>
      </header>
      <div className="relative h-[42dvh] flex-none">
        <MapView pickup={a} drop={b} vehicle={live ? vehiclePosition(trip.stage, trip.stageAt, now, a, b, trip.driverSource === "me") : undefined} />
      </div>
      <div className="mx-auto grid w-full max-w-xl gap-3 px-4 py-4">
        <p className="kicker">{live ? "Live" : "Ended"} · updated {clock(now)}</p>
        <h1 className="font-display text-[1.2rem] font-bold tracking-tight">
          {firstName(trip.customer.name)}&apos;s trip: {STATUS[trip.stage]}
        </h1>
        <RouteDots from={a.name} to={b.name} />
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3">
          <Avatar name={trip.driver.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{trip.driver.short}</p>
            <p className="text-[0.76rem] text-muted">{capitalise(trip.driver.vehicle.description)}</p>
          </div>
          <Plate>{trip.driver.vehicle.plate}</Plate>
        </div>
        <p className="text-[0.84rem] text-muted">
          If you&apos;re worried, call {firstName(trip.customer.name)} first. In an emergency, call{" "}
          <a href="tel:112" className="font-bold text-danger">
            112
          </a>
          .
        </p>
      </div>
    </div>
  );
}
