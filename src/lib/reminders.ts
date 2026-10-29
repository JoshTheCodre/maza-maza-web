"use client";

// Timed reminders and alerts for trips: the day before and an hour before a scheduled pickup (built around the
// flight for airport rides), the driver's "time to leave", "your driver is 2 minutes away", and "your package
// is nearly there". Each goes out once per trip. Runs with the app's once-a-second loop for now; the backend
// will send these as push notifications from a scheduled job.

import { place } from "./data/places";
import { tripTimes } from "./eta";
import { clock, firstName } from "./format";
import { knownRoute } from "./routing";
import { useStore, when } from "./store";
import type { Trip } from "./types";

const MIN = 60_000;

/** When the driver should set off for a scheduled pickup: their drive there plus five minutes' slack. */
export const leaveAt = (t: Trip) => (t.scheduledFor ?? 0) - (t.etaMin + 5) * MIN;

const flightNote = (t: Trip) =>
  t.flight?.kind === "departure" ? ` for your ${clock(t.flight.time)} flight${t.flight.number ? ` ${t.flight.number}` : ""}` : t.flight ? " at the airport" : "";

export function runReminders(now: number) {
  const s = useStore.getState();
  for (const t of s.trips) {
    const alert = (key: string, audience: "customer" | "driver", title: string) =>
      s.tripAlert(t.id, key, audience, title, audience === "customer" ? `/ride/trip/${t.id}` : `/driver/trip/${t.id}`);

    if (t.stage === "scheduled" && t.scheduledFor) {
      const lead = t.scheduledFor - now;
      if (t.customerSource === "me") {
        if (lead <= 24 * 60 * MIN && t.scheduledFor - t.createdAt > 24 * 60 * MIN)
          alert("day", "customer", `Reminder: ${firstName(t.driver.name)} picks you up ${when(t.scheduledFor, now)}${flightNote(t)}.`);
        if (lead <= 60 * MIN) alert("hour", "customer", `Your pickup is at ${clock(t.scheduledFor)}, in ${Math.max(1, Math.round(lead / MIN))} min${flightNote(t)}. Get ready.`);
      }
      if (t.driverSource === "me") {
        if (lead <= 60 * MIN) alert("hour-driver", "driver", `Scheduled pickup at ${clock(t.scheduledFor)}: ${firstName(t.customer.name)} at ${place(t.pickupId).name}.`);
        if (now >= leaveAt(t)) alert("leave", "driver", `Time to leave for ${firstName(t.customer.name)}'s ${clock(t.scheduledFor)} pickup. Tap Start driving.`);
      } else if (now >= leaveAt(t)) {
        // Other drivers set off on time by themselves.
        s.startScheduledTrip(t.id);
      }
      continue;
    }

    if (t.customerSource !== "me") continue;
    const times = () => tripTimes(t, knownRoute(place(t.pickupId), place(t.dropId)), now);
    if (t.stage === "to_pickup" && times().toPickup <= 2) {
      alert("near", "customer", `${firstName(t.driver.name)} is about 2 minutes away. Look for ${t.driver.vehicle.plate}, ${t.driver.vehicle.description}.`);
    }
    if (t.mode === "send" && t.stage === "on_trip" && times().leftToDrop <= 5) {
      alert("drop-near", "customer", `Your package is about 5 minutes from ${place(t.dropId).name}.`);
    }
  }
}
