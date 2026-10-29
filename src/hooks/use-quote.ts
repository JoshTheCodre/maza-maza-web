"use client";

import { touchesAirport, estimateTrip, fareSettings, quoteFare } from "@/lib/pricing";
import { useRoute } from "@/lib/routing";
import { useStore } from "@/lib/store";
import type { Mode, Place, RideClass } from "@/lib/types";
import { useNow } from "./use-now";

/**
 * Route, trip time and recommended fare between two places, refreshed when the road route arrives and each minute
 * (traffic changes with the hour). Pass `at` to price a trip as of when it was booked.
 */
export function useQuote(a: Place | undefined, b: Place | undefined, mode: Mode, at?: number, rideClass?: RideClass) {
  const route = useRoute(a, b);
  const settings = useStore((s) => s.settings);
  const now = useNow(60_000);
  if (!route || !a || !b) return null;
  const quote = quoteFare(estimateTrip(route, mode, at ?? now), mode, fareSettings(settings), touchesAirport(a, b), rideClass);
  return { route, quote, trip: quote.trip };
}
