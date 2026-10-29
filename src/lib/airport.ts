// Airport rides: work out the pickup time from the flight.
// Catching a flight: be at the airport an hour before a domestic take-off (three for international), so pick up
// that much earlier again by the drive time in the traffic of that hour, plus ten minutes' slack.
// Landing: pick up once bags are likely through (25 minutes domestic, 45 international).

import { place } from "./data/places";
import { estimateTrip } from "./pricing";
import { knownRoute } from "./routing";
import type { FlightInfo, Place } from "./types";

export const AIRPORT_ID = "airport";
export const airport = () => place(AIRPORT_ID);

const MIN = 60_000;
const CHECK_IN_MIN = { domestic: 60, international: 180 };
const BAGGAGE_MIN = { domestic: 25, international: 45 };
const SLACK_MIN = 10;
/** Bookings for later start at least this far ahead; anything sooner is a ride now. */
export const MIN_LEAD_MIN = 20;

export interface AirportPlan {
  pickupAt: number;
  /** When you'd reach the airport (departures) or your drop-off (arrivals). */
  arriveAt: number;
  driveMin: number;
  /** Departures: when to be at the airport. */
  beAtAirportBy?: number;
}

export function planDeparture(flight: FlightInfo, from: Place): AirportPlan {
  const beAtAirportBy = flight.time - (flight.international ? CHECK_IN_MIN.international : CHECK_IN_MIN.domestic) * MIN;
  const route = knownRoute(from, airport());
  // Traffic depends on the hour you leave, which depends on the drive time, so settle it in two passes.
  let pickupAt = beAtAirportBy - 60 * MIN;
  let driveMin = 0;
  for (let i = 0; i < 2; i++) {
    driveMin = estimateTrip(route, "ride", pickupAt).minutes;
    pickupAt = beAtAirportBy - (driveMin + SLACK_MIN) * MIN;
  }
  pickupAt = Math.floor(pickupAt / (5 * MIN)) * 5 * MIN;
  return { pickupAt, arriveAt: pickupAt + driveMin * MIN, driveMin, beAtAirportBy };
}

export function planArrival(flight: FlightInfo, to?: Place): AirportPlan {
  const pickupAt = Math.ceil((flight.time + (flight.international ? BAGGAGE_MIN.international : BAGGAGE_MIN.domestic) * MIN) / (5 * MIN)) * 5 * MIN;
  const driveMin = to ? estimateTrip(knownRoute(airport(), to), "ride", pickupAt).minutes : 0;
  return { pickupAt, arriveAt: pickupAt + driveMin * MIN, driveMin };
}

// <input type="datetime-local"> works in the device's time zone; Maza-Maza shows Nigerian time everywhere.
/** A time as "YYYY-MM-DDTHH:mm" in Nigerian time, for date-time inputs. */
export const toInputValue = (ts: number) => new Date(ts + 3_600_000).toISOString().slice(0, 16);
/** The reverse of toInputValue. NaN if the input is empty or invalid. */
export const fromInputValue = (v: string) => (v ? Date.parse(`${v}:00Z`) - 3_600_000 : NaN);
