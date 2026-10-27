import { pointAlong } from "./routing";
import type { Place, TripStage } from "./types";

export interface MapPoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Curve control point used by the fallback map so routes don't look ruler-straight. */
export const curveControl = (a: MapPoint, b: MapPoint) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return { x: mx - (b.y - a.y) * 0.16, y: my + (b.x - a.x) * 0.16 };
};

const along = (a: MapPoint, b: MapPoint, t: number): MapPoint => {
  const c = curveControl(a, b);
  return {
    x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
    lat: mix(a.lat, b.lat, t),
    lng: mix(a.lng, b.lng, t),
  };
};

/**
 * How far through the current leg a trip is, from 0 to 1. The real app uses the driver's live GPS; until then
 * trips play out quickly. `live` trips (where you're the driver) stop short until you tap the next step.
 */
export function legProgress(stage: TripStage, stageAt: number, now: number, live: boolean) {
  const el = (now - stageAt) / 1000;
  if (stage === "to_pickup") return Math.min(live ? 0.92 : 1, el / (live ? 14 : 8));
  if (stage === "on_trip") return Math.min(live ? 0.95 : 1, el / (live ? 16 : 10));
  return 1;
}

/** Where to draw the vehicle during a trip: along the road route when we have it, otherwise a gentle curve. */
export function vehiclePosition(stage: TripStage, stageAt: number, now: number, a: Place, b: Place, live: boolean, path?: [number, number][]): MapPoint {
  const k = legProgress(stage, stageAt, now, live);
  if (stage === "to_pickup") {
    const start = { x: a.x - 30, y: a.y - 22, lat: a.lat + 0.012, lng: a.lng - 0.015 };
    return { x: mix(start.x, a.x, k), y: mix(start.y, a.y, k), lat: mix(start.lat, a.lat, k), lng: mix(start.lng, a.lng, k) };
  }
  if (stage === "at_pickup") return a;
  if (stage === "on_trip") {
    const p = along(a, b, k);
    return path && path.length > 1 ? { ...p, ...pointAlong(path, k) } : p;
  }
  return b;
}

/** A few cars or bikes idling near a point, for the home map. Decorative only. */
export const nearbyVehicles = (p: Place): MapPoint[] =>
  [
    [-18, -10, 0.006, -0.009],
    [14, -16, 0.01, 0.007],
    [22, 12, -0.006, 0.011],
    [-12, 18, -0.009, -0.006],
  ].map(([dx, dy, dlat, dlng]) => ({ x: p.x + dx, y: p.y + dy, lat: p.lat + dlat, lng: p.lng + dlng }));
