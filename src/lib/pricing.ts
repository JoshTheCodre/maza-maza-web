// Recommended fares and trip times. Customers still name their own price; this is the guide shown beside
// the offer box (like other ride apps' "recommended fare"), and what bot drivers and customers bargain around.
//
// fare = base + fuel + upkeep + driver's time, plus a rush-hour or night share and any airport fee, never below the minimum.
//   fuel   = km ÷ vehicle's km per litre × petrol price per litre
//   upkeep = km × tyres, oil, repairs and wear per km
//   time   = trip minutes in today's traffic × the driver's time per minute
// Every rate lives in Admin → Settings so it can follow the pump price.

import type { Mode, Place, Settings, VehicleType } from "./types";

export interface VehicleRates {
  /** Covers the drive to the pickup. */
  baseFare: number;
  kmPerLitre: number;
  upkeepPerKm: number;
  perMinute: number;
  minFare: number;
}

export interface FareSettings {
  /** Petrol (PMS) pump price in Port Harcourt, naira per litre. */
  fuelPrice: number;
  car: VehicleRates;
  bike: VehicleRates;
  /** Extra share in weekday rush hours, in percent. */
  rushPct: number;
  /** Extra share from 10pm to 5am, in percent. */
  nightPct: number;
  /** Added to trips to or from Port Harcourt International Airport (car park and access charges). */
  airportFee: number;
  /** Discount, in percent, for booking a dispatch rider who's about to finish a delivery nearby. */
  nextJobPct: number;
  /** How close to their drop-off (in minutes) a rider must be to take a next job. */
  nextJobWindowMin: number;
}

// Pump price: Port Harcourt depots sold petrol at about ₦1,350/L in mid-October 2026 and stations sell above
// that. Car rates assume a petrol saloon doing about 10 km/L in city traffic; bike rates a 125–150cc dispatch
// motorcycle at about 35 km/L.
export const DEFAULT_FARE: FareSettings = {
  fuelPrice: 1420,
  car: { baseFare: 600, kmPerLitre: 10, upkeepPerKm: 60, perMinute: 30, minFare: 1500 },
  bike: { baseFare: 500, kmPerLitre: 35, upkeepPerKm: 25, perMinute: 20, minFare: 1000 },
  rushPct: 15,
  nightPct: 20,
  airportFee: 0,
  nextJobPct: 10,
  nextJobWindowMin: 5,
};

const round50 = (n: number) => Math.round(n / 50) * 50;

/** What the customer pays a rider booked as their next job: the bargained price less the discount. */
export const nextJobPrice = (bargain: number, fare: FareSettings) => round50(bargain * (1 - fare.nextJobPct / 100));

/** Saved settings from before fares existed have no fare block, so fill any gaps from the defaults. */
export const fareSettings = (s: Pick<Settings, "fare">): FareSettings => ({
  ...DEFAULT_FARE,
  ...s.fare,
  car: { ...DEFAULT_FARE.car, ...s.fare?.car },
  bike: { ...DEFAULT_FARE.bike, ...s.fare?.bike },
});

export type TrafficPeriod = "night" | "morning_rush" | "evening_rush" | "day" | "weekend";

/**
 * How much slower than empty roads a trip is, by time of day. Road times from the router assume empty roads;
 * Port Harcourt's jams build on Ikwerre Road, Aba Road and around Garrison and Rumuokoro at rush hour.
 */
const TRAFFIC: Record<TrafficPeriod, number> = { night: 1.2, morning_rush: 2.3, evening_rush: 2.5, day: 1.6, weekend: 1.4 };

export const TRAFFIC_LABEL: Record<TrafficPeriod, string> = {
  night: "Quiet roads",
  morning_rush: "Morning rush hour",
  evening_rush: "Evening rush hour",
  day: "Normal traffic",
  weekend: "Weekend traffic",
};

/** Nigeria is on West Africa Time, UTC+1, all year. */
export function trafficPeriod(at: number): TrafficPeriod {
  const d = new Date(at + 3_600_000);
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
  if (mins >= 22 * 60 || mins < 5 * 60) return "night";
  if (weekend) return "weekend";
  if (mins >= 6 * 60 + 30 && mins < 10 * 60) return "morning_rush";
  if (mins >= 16 * 60 && mins < 20 * 60 + 30) return "evening_rush";
  return "day";
}

/** A road route's length and its time on empty roads. */
export interface RouteSize {
  km: number;
  freeFlowMin: number;
}

export interface TripEstimate {
  km: number;
  minutes: number;
  period: TrafficPeriod;
}

export const vehicleFor = (mode: Mode): VehicleType => (mode === "ride" ? "car" : "bike");

/** Trip time in the traffic of the moment. Dispatch bikes slip through traffic, so they're a quarter quicker. */
export function estimateTrip(route: RouteSize, mode: Mode, at: number): TripEstimate {
  const period = trafficPeriod(at);
  const factor = TRAFFIC[period] * (mode === "send" ? 0.75 : 1);
  return { km: route.km, minutes: Math.max(3, Math.round(route.freeFlowMin * factor)), period };
}

/** How long a driver this far away takes to reach the pickup. */
export function minutesAway(km: number, mode: Mode, at: number) {
  return estimateTrip({ km, freeFlowMin: (km / 40) * 60 + 1 }, mode, at).minutes;
}

/** Port Harcourt International Airport, Omagwa. */
const AIRPORT = { lat: 5.0165, lng: 6.9518 };
const nearAirport = (p: Place) => Math.hypot(p.lat - AIRPORT.lat, p.lng - AIRPORT.lng) < 0.015;
export const touchesAirport = (a: Place, b: Place) => nearAirport(a) || nearAirport(b);

export interface FareLine {
  label: string;
  amount: number;
}

export interface FareQuote {
  recommended: number;
  /** Below this, drivers rarely say yes. */
  low: number;
  high: number;
  lines: FareLine[];
  trip: TripEstimate;
}

export function quoteFare(trip: TripEstimate, mode: Mode, fare: FareSettings, airport: boolean): FareQuote {
  const vehicle = vehicleFor(mode);
  const r = fare[vehicle];
  const fuel = (trip.km / r.kmPerLitre) * fare.fuelPrice;
  const upkeep = trip.km * r.upkeepPerKm;
  const time = trip.minutes * r.perMinute;
  const sub = r.baseFare + fuel + upkeep + time;
  const rush = trip.period === "morning_rush" || trip.period === "evening_rush" ? (sub * fare.rushPct) / 100 : 0;
  const night = trip.period === "night" ? (sub * fare.nightPct) / 100 : 0;
  const airportAmount = airport ? fare.airportFee : 0;
  const total = sub + rush + night + airportAmount;
  const recommended = Math.max(r.minFare, round50(total));

  const lines: FareLine[] = [
    { label: "Base fare", amount: r.baseFare },
    { label: `Fuel · ${trip.km} km at ₦${fare.fuelPrice.toLocaleString("en-NG")}/L`, amount: fuel },
    { label: "Tyres, oil and upkeep", amount: upkeep },
    { label: `Driver's time · ${trip.minutes} min`, amount: time },
  ];
  if (rush) lines.push({ label: `Rush hour +${fare.rushPct}%`, amount: rush });
  if (night) lines.push({ label: `Late night +${fare.nightPct}%`, amount: night });
  if (airportAmount) lines.push({ label: "Airport fee", amount: airportAmount });
  if (recommended > round50(total)) lines.push({ label: "Minimum fare top-up", amount: recommended - total });

  return {
    recommended,
    low: Math.max(r.minFare, round50(recommended * 0.85)),
    high: round50(recommended * 1.2),
    lines: lines.map((l) => ({ ...l, amount: Math.round(l.amount) })),
    trip,
  };
}
