"use client";

// Road routes between places: real distance, empty-road time and the line to draw on the map.
// For now they come from the public OSRM demo server (free, no key, light use only) and are cached on this
// device. The backend will call a commercial routing API (Google Routes or Mapbox) with live traffic instead.
// Until a route arrives, a straight-line estimate stands in, so prices and times never wait on the network.

import { useEffect, useSyncExternalStore } from "react";
import type { RouteSize } from "./pricing";

/** Anything with an id and a position: a place, or a pin on the map. */
export interface Stop {
  id: string;
  lat: number;
  lng: number;
}

export interface Route extends RouteSize {
  /** [lng, lat] points along the road. */
  path: [number, number][];
  /** False while it's still the straight-line estimate. */
  road: boolean;
}

const STORAGE_KEY = "maza-routes-v1";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

let cache: Record<string, Route> | null = null;
let version = 0;
const listeners = new Set<() => void>();
const pending = new Set<string>();

const keyOf = (a: Stop, b: Stop) => `${a.id}>${b.id}`;
const round1 = (n: number) => Math.round(n * 10) / 10;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, Route>;
  } catch {
    cache = {};
  }
  return cache;
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

export function straightKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** City roads wind about a third longer than a straight line; empty-road speed averages about 45 km/h. */
function estimate(a: Stop, b: Stop): Route {
  const km = round1(straightKm(a, b) * 1.35);
  return { km, freeFlowMin: (km / 45) * 60, path: [[a.lng, a.lat], [b.lng, b.lat]], road: false };
}

/** The best route known right now. Safe to call anywhere, including outside React. */
export function knownRoute(a: Stop, b: Stop): Route {
  if (typeof window === "undefined") return estimate(a, b);
  const c = load();
  const hit = c[keyOf(a, b)];
  if (hit) return hit;
  const back = c[keyOf(b, a)];
  if (back) return { ...back, path: [...back.path].reverse() };
  return estimate(a, b);
}

/** Keeps at most about 200 points so a few hundred routes fit comfortably in local storage. */
function thin(points: [number, number][]): [number, number][] {
  const step = Math.max(1, Math.ceil(points.length / 200));
  const kept = points.filter((_, i) => i % step === 0);
  if (kept[kept.length - 1] !== points[points.length - 1]) kept.push(points[points.length - 1]);
  return kept.map(([lng, lat]) => [Math.round(lng * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5]);
}

/** Fetches the road route once and tells every map and price on screen when it lands. */
export function requestRoute(a: Stop, b: Stop) {
  if (typeof window === "undefined" || a.id === b.id) return;
  const key = keyOf(a, b);
  const c = load();
  if (c[key] || c[keyOf(b, a)] || pending.has(key)) return;
  pending.add(key);
  fetch(`${OSRM}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((j: { routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] }) => {
      const r = j.routes?.[0];
      if (!r) return;
      load()[key] = { km: round1(r.distance / 1000), freeFlowMin: r.duration / 60, path: thin(r.geometry.coordinates), road: true };
      save();
      version++;
      listeners.forEach((l) => l());
    })
    .catch(() => {})
    .finally(() => pending.delete(key));
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The route between two places, upgraded from the estimate to the real road as soon as it's fetched. */
export function useRoute(a?: Stop, b?: Stop): Route | null {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  const from = a ? `${a.id}|${a.lat}|${a.lng}` : "";
  const to = b ? `${b.id}|${b.lat}|${b.lng}` : "";
  useEffect(() => {
    if (!from || !to) return;
    const [ia, la, ga] = from.split("|");
    const [ib, lb, gb] = to.split("|");
    requestRoute({ id: ia, lat: +la, lng: +ga }, { id: ib, lat: +lb, lng: +gb });
  }, [from, to]);
  return a && b && a.id !== b.id ? knownRoute(a, b) : null;
}

/** A point part of the way along a route (0 = start, 1 = end), measured by distance. */
export function pointAlong(path: [number, number][], t: number): { lat: number; lng: number } {
  if (path.length === 1 || t <= 0) return { lng: path[0][0], lat: path[0][1] };
  const legs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  let left = Math.min(1, t) * legs.reduce((s, l) => s + l, 0);
  for (let i = 0; i < legs.length; i++) {
    if (left <= legs[i] || i === legs.length - 1) {
      const k = legs[i] ? Math.min(1, left / legs[i]) : 1;
      return { lng: path[i][0] + (path[i + 1][0] - path[i][0]) * k, lat: path[i][1] + (path[i + 1][1] - path[i][1]) * k };
    }
    left -= legs[i];
  }
  const last = path[path.length - 1];
  return { lng: last[0], lat: last[1] };
}
