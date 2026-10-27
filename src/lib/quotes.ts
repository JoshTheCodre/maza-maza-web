"use client";

import { touchesAirport, estimateTrip, fareSettings, quoteFare, type FareQuote } from "./pricing";
import { knownRoute } from "./routing";
import type { Mode, Place, Settings } from "./types";

/** Recommended fare and trip time between two places at a given moment, from the best route known so far. */
export function quoteFor(a: Place, b: Place, mode: Mode, at: number, settings: Pick<Settings, "fare">): FareQuote {
  return quoteFare(estimateTrip(knownRoute(a, b), mode, at), mode, fareSettings(settings), touchesAirport(a, b));
}
