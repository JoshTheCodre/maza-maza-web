"use client";

// The device's own position: followed live once the person allows it, shown as the blue dot on every map,
// and used for "use my location" pickups. Browsers only share location on secure pages (https or localhost),
// so opening the dev server from a phone over plain http won't work; use `npm run dev:phone`.

import { useSyncExternalStore } from "react";
import { CITY } from "./city";
import { mapXY } from "./data/places";
import { straightKm } from "./routing";
import type { Place } from "./types";

export type LocationStatus = "idle" | "locating" | "on" | "denied" | "unavailable" | "insecure";

export interface Fix {
  lat: number;
  lng: number;
  /** Metres. */
  accuracy: number;
  at: number;
}

interface LocationState {
  status: LocationStatus;
  fix: Fix | null;
}

const IDLE: LocationState = { status: "idle", fix: null };
let state: LocationState = IDLE;
let watchId: number | null = null;
const listeners = new Set<() => void>();

function emit(patch: Partial<LocationState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/** Starts following the device's position. Asks the browser the first time; safe to call again. */
export function startWatching() {
  if (typeof window === "undefined" || watchId !== null) return;
  if (!window.isSecureContext) return emit({ status: "insecure" });
  if (!navigator.geolocation) return emit({ status: "unavailable" });
  emit({ status: state.fix ? "on" : "locating" });
  watchId = navigator.geolocation.watchPosition(
    (p) => emit({ status: "on", fix: { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy, at: p.timestamp } }),
    (e) => {
      emit({ status: e.code === e.PERMISSION_DENIED ? "denied" : "unavailable" });
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      watchId = null;
    },
    { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
  );
}

/** On later visits, picks up following again if the browser already allows it, without asking. */
export function resumeIfAllowed() {
  if (typeof navigator === "undefined" || !navigator.permissions) return;
  navigator.permissions
    .query({ name: "geolocation" })
    .then((r) => {
      if (r.state === "granted") startWatching();
    })
    .catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Live position and whether location is on, for components. */
export function useMyLocation() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => IDLE,
  );
}

/** A fresh position for a one-off "use my location", waiting up to 15 seconds for the first fix. */
export function currentFix(timeoutMs = 15_000): Promise<Fix> {
  startWatching();
  return new Promise((resolve, reject) => {
    if (state.fix && Date.now() - state.fix.at < 30_000) return resolve(state.fix);
    const done = () => {
      listeners.delete(check);
      clearTimeout(timer);
    };
    const check = () => {
      if (state.fix) {
        done();
        resolve(state.fix);
      } else if (state.status !== "locating") {
        done();
        reject(new Error(state.status));
      }
    };
    const timer = setTimeout(() => {
      done();
      reject(new Error("timeout"));
    }, timeoutMs);
    listeners.add(check);
    check();
  });
}

/** Why location isn't available, in words for a toast. */
export const locationProblem = (reason: string) =>
  reason === "outside"
    ? `Maza-Maza works in ${CITY.name} for now. Search for a pickup in ${CITY.name} instead.`
    : reason === "insecure"
    ? "Your browser only shares location on secure (https) pages. Search for your pickup instead."
    : reason === "denied"
      ? "Location is blocked for Maza-Maza. Allow it in your browser settings, or search for your pickup."
      : "We couldn't get your location. Search for your pickup instead.";

/** Maza-Maza covers one city for now (see lib/city.ts). */
export const inServiceArea = (f: { lat: number; lng: number }) => straightKm(f, CITY.center) < CITY.radiusKm;

/** Your exact position as a pickup place. Fails with "outside" beyond the city, or the reason location isn't available. */
export async function pickupHere(): Promise<Place> {
  const f = await currentFix();
  if (!inServiceArea(f)) throw new Error("outside");
  return placeFromFix(f);
}

/** Turns a position into a pickup place, named from OpenStreetMap (Photon, free). */
export async function placeFromFix(f: Fix): Promise<Place> {
  const base = { id: `gps-${Math.round(f.lat * 1e5)}-${Math.round(f.lng * 1e5)}`, lat: f.lat, lng: f.lng, ...mapXY(f.lat, f.lng) };
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lon=${f.lng}&lat=${f.lat}&lang=en`);
    const j = (await res.json()) as { features?: { properties: Record<string, string | undefined> }[] };
    const p = j.features?.[0]?.properties ?? {};
    const street = [p.housenumber, p.street].filter(Boolean).join(" ");
    const name = (p.type === "street" || p.type === "house" ? street || p.name : p.name || street) || "Your location";
    return { ...base, name, area: p.district ?? p.locality ?? p.city ?? p.county ?? CITY.name };
  } catch {
    return { ...base, name: "Your location", area: "Pinned on the map" };
  }
}
