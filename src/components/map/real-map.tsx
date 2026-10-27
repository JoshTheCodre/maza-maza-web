"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { CITY } from "@/lib/city";
import type { MapProps } from "./map-view";
import { StreetMap } from "./street-map";

// Real street map of the city: OpenStreetMap data drawn by MapLibre, with free OpenFreeMap tiles (no key needed).
// Google Maps takes over when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.

const STYLE = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};
const START: [number, number] = [CITY.center.lng, CITY.center.lat];

type PinKind = "pickup" | "drop" | "vehicle" | "other" | "me";
interface Pin {
  kind: PinKind;
  lng: number;
  lat: number;
  pulse?: boolean;
}

const pinType = (pin: Pin) => `${pin.kind}${pin.pulse ? "-pulse" : ""}`;

function pinElement(pin: Pin) {
  const el = document.createElement("div");
  el.className = `mz-pin mz-pin-${pin.kind}${pin.pulse ? " mz-pin-pulse" : ""}`;
  el.dataset.pin = pinType(pin);
  return el;
}

export function RealMap(props: MapProps & { path?: [number, number][]; me?: { lat: number; lng: number } }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  // Count map instances and finished style loads. Next keeps pages alive in the background and rebuilds their
  // maps when they're shown again, so pins and the route are redrawn for each new map rather than once.
  // Pins and framing only need the map to exist; the route line needs the style loaded.
  const [maps, setMaps] = useState(0);
  const [loads, setLoads] = useState(0);
  const [failed, setFailed] = useState(false);

  // Everything the map shows, as plain data, so effects only re-run when something actually moved.
  const pins: Record<string, Pin> = {};
  if (props.pickup) pins.pickup = { kind: "pickup", lng: props.pickup.lng, lat: props.pickup.lat, pulse: props.pulse };
  if (props.drop) pins.drop = { kind: "drop", lng: props.drop.lng, lat: props.drop.lat };
  if (props.vehicle) pins.vehicle = { kind: "vehicle", lng: props.vehicle.lng, lat: props.vehicle.lat };
  props.others?.forEach((o, i) => (pins[`other${i}`] = { kind: "other", lng: o.lng, lat: o.lat }));
  if (props.me) pins.me = { kind: "me", lng: props.me.lng, lat: props.me.lat };
  const pinsKey = JSON.stringify(pins);
  const pathKey = JSON.stringify(props.path ?? []);
  // Refit when the stops or the route change, not every time the vehicle moves.
  const fitKey = JSON.stringify([props.pickup && [props.pickup.lng, props.pickup.lat], props.drop && [props.drop.lng, props.drop.lat], props.path?.length ?? 0, props.others?.length ?? 0]);

  useEffect(() => {
    let cancelled = false;
    let instance: MapLibreMap | null = null;
    const pinsNow = markers.current;
    import("maplibre-gl")
      .then((ml) => {
        if (cancelled || !box.current) return;
        lib.current = ml;
        // Served from public/, copied there by scripts/copy-map-worker.mjs.
        ml.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        const dark = matchMedia("(prefers-color-scheme: dark)").matches;
        instance = new ml.Map({
          container: box.current,
          style: dark ? STYLE.dark : STYLE.light,
          center: START,
          zoom: 11,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
        });
        instance.touchZoomRotate.disableRotation();
        instance.on("load", () => {
          if (!instance) return;
          instance.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          instance.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": dark ? "#000000" : "#ffffff", "line-width": 8 } });
          instance.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": dark ? "#d5f02a" : "#0f100d", "line-width": 4 } });
          setLoads((n) => n + 1);
        });
        map.current = instance;
        setMaps((n) => n + 1);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      Object.values(pinsNow).forEach((m) => m.remove());
      for (const k of Object.keys(pinsNow)) delete pinsNow[k];
      instance?.remove();
      map.current = null;
    };
  }, []);

  // Pins: add new ones, move existing ones, drop the rest.
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!maps || !m || !ml) return;
    const want = JSON.parse(pinsKey) as Record<string, Pin>;
    for (const [k, marker] of Object.entries(markers.current)) {
      if (!want[k] || marker.getElement().dataset.pin !== pinType(want[k])) {
        marker.remove();
        delete markers.current[k];
      }
    }
    for (const [k, pin] of Object.entries(want)) {
      const existing = markers.current[k];
      if (existing) existing.setLngLat([pin.lng, pin.lat]);
      else markers.current[k] = new ml.Marker({ element: pinElement(pin) }).setLngLat([pin.lng, pin.lat]).addTo(m);
    }
  }, [maps, pinsKey]);

  // The road route line.
  useEffect(() => {
    const source = loads ? (map.current?.getSource("route") as GeoJSONSource | undefined) : undefined;
    if (!source) return;
    const path = JSON.parse(pathKey) as [number, number][];
    source.setData(
      path.length > 1
        ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: path } }
        : { type: "FeatureCollection", features: [] },
    );
  }, [loads, pathKey]);

  // Frame the trip: the route if there is one, otherwise the pins.
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!maps || !m || !ml) return;
    const path = JSON.parse(pathKey) as [number, number][];
    // Your blue dot never decides the frame; it may be far from the trip.
    const pts: [number, number][] =
      path.length > 1
        ? path
        : Object.values(JSON.parse(pinsKey) as Record<string, Pin>)
            .filter((p) => p.kind !== "me")
            .map((p) => [p.lng, p.lat]);
    if (!pts.length) return;
    if (pts.length === 1) {
      m.jumpTo({ center: pts[0], zoom: 14 });
      return;
    }
    const bounds = pts.reduce((b, p) => b.extend(p), new ml.LngLatBounds(pts[0], pts[0]));
    m.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 0 });
    // Only the stops and route decide the frame; pinsKey is read for maps with no route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maps, fitKey]);

  if (failed) return <StreetMap {...props} />;
  return (
    <div className="absolute inset-0 bg-[var(--map-land)]">
      <div ref={box} className="size-full" />
    </div>
  );
}
