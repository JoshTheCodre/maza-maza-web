"use client";

import { GOOGLE_MAPS_KEY } from "@/lib/config";
import type { MapPoint } from "@/lib/geo";
import { GoogleStreetMap } from "./google-map";
import { StreetMap } from "./street-map";

export interface MapProps {
  pickup?: MapPoint;
  drop?: MapPoint;
  vehicle?: MapPoint;
  others?: MapPoint[];
  pulse?: boolean;
  /** Fallback map only: the narrowest area to show, in map units. */
  minWidth?: number;
  /** Fallback map only: nudges the view down (+) or up (−) as a share of its height. */
  shift?: number;
}

/** Google Maps when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set, otherwise the drawn Lagos map. */
export function MapView(props: MapProps) {
  return GOOGLE_MAPS_KEY ? <GoogleStreetMap {...props} /> : <StreetMap {...props} />;
}
