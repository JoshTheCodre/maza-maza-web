"use client";

import { GOOGLE_MAPS_KEY } from "@/lib/config";
import type { MapPoint } from "@/lib/geo";
import { useMyLocation } from "@/lib/location";
import { useRoute } from "@/lib/routing";
import { GoogleStreetMap } from "./google-map";
import { RealMap } from "./real-map";

export interface MapProps {
  /** Places carry an id, which lets the map fetch and draw the road route between pickup and drop-off. */
  pickup?: MapPoint & { id?: string };
  drop?: MapPoint & { id?: string };
  vehicle?: MapPoint;
  others?: MapPoint[];
  pulse?: boolean;
  /** Drawn fallback map only: the narrowest area to show, in map units. */
  minWidth?: number;
  /** Drawn fallback map only: nudges the view down (+) or up (−) as a share of its height. */
  shift?: number;
}

const stop = (p?: MapPoint & { id?: string }) => (p?.id ? { id: p.id, lat: p.lat, lng: p.lng } : undefined);

/** Google Maps when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set, otherwise a real OpenStreetMap map. Both draw the road route. */
export function MapView(props: MapProps) {
  const route = useRoute(stop(props.pickup), stop(props.drop));
  const path = route?.road ? route.path : undefined;
  // Your own live position, once you've allowed location.
  const me = useMyLocation().fix ?? undefined;
  return GOOGLE_MAPS_KEY ? <GoogleStreetMap {...props} path={path} me={me} /> : <RealMap {...props} path={path} me={me} />;
}
