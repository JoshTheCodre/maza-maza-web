import { legProgress } from "./geo";
import { estimateTrip, type RouteSize } from "./pricing";
import type { Trip } from "./types";

/** Minutes to get in, or to hand over a package, at the pickup. */
const HANDOVER_MIN = 2;

export interface TripTimes {
  /** Until the driver reaches the pickup (0 once there). */
  toPickup: number;
  /** The whole pickup-to-drop-off drive, in the traffic of when it was booked. */
  tripMin: number;
  /** Until the drop-off, from now. */
  leftToDrop: number;
  /** Clock time of arrival at the drop-off. */
  arriveAt: number;
}

/** Live timings for a trip, for the rider, the driver and anyone following the tracking link. */
export function tripTimes(trip: Trip, route: RouteSize, now: number): TripTimes {
  const tripMin = estimateTrip(route, trip.mode, trip.createdAt).minutes;
  const k = legProgress(trip.stage, trip.stageAt, now, trip.driverSource === "me");
  const toPickup = trip.stage === "to_pickup" ? Math.max(1, Math.round(trip.etaMin * (1 - k))) : 0;
  const leftToDrop =
    trip.stage === "to_pickup"
      ? toPickup + HANDOVER_MIN + tripMin
      : trip.stage === "at_pickup"
        ? HANDOVER_MIN + tripMin
        : trip.stage === "on_trip"
          ? Math.max(1, Math.round(tripMin * (1 - k)))
          : 0;
  return { toPickup, tripMin, leftToDrop, arriveAt: now + leftToDrop * 60_000 };
}
