"use client";

import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { GOOGLE_MAP_ID, GOOGLE_MAPS_KEY } from "@/lib/config";
import type { MapProps } from "./map-view";

const LAGOS = { lat: 6.5244, lng: 3.3792 };

function FitAndRoute({ pickup, drop }: Pick<MapProps, "pickup" | "drop">) {
  const map = useMap();
  useEffect(() => {
    if (!map || !pickup) return;
    if (!drop) {
      map.panTo({ lat: pickup.lat, lng: pickup.lng });
      return;
    }
    const path = [
      { lat: pickup.lat, lng: pickup.lng },
      { lat: drop.lat, lng: drop.lng },
    ];
    // The real route comes from the Routes API; until then a straight line marks the trip.
    const line = new google.maps.Polyline({ path, strokeColor: "#0f100d", strokeOpacity: 0.85, strokeWeight: 4, map });
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 64);
    return () => line.setMap(null);
  }, [map, pickup, drop]);
  return null;
}

const pin = (bg: string, size: number, square = false) => ({
  width: size,
  height: size,
  borderRadius: square ? 3 : "50%",
  background: bg,
  border: "2px solid #fff",
  boxShadow: "0 1px 4px rgb(0 0 0 / 0.35)",
});

export function GoogleStreetMap({ pickup, drop, vehicle, others }: MapProps) {
  const center = pickup ? { lat: pickup.lat, lng: pickup.lng } : LAGOS;
  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY} region="NG" language="en">
      <Map
        className="absolute inset-0"
        mapId={GOOGLE_MAP_ID}
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
      >
        <FitAndRoute pickup={pickup} drop={drop} />
        {others?.map((o, i) => (
          <AdvancedMarker key={i} position={{ lat: o.lat, lng: o.lng }}>
            <div style={pin("#ffffff", 12)} />
          </AdvancedMarker>
        ))}
        {pickup && (
          <AdvancedMarker position={{ lat: pickup.lat, lng: pickup.lng }} title="Pickup">
            <div style={pin("#0f100d", 16)} />
          </AdvancedMarker>
        )}
        {drop && (
          <AdvancedMarker position={{ lat: drop.lat, lng: drop.lng }} title="Drop-off">
            <div style={{ ...pin("#d5f02a", 14, true), border: "2px solid #0f100d" }} />
          </AdvancedMarker>
        )}
        {vehicle && (
          <AdvancedMarker position={{ lat: vehicle.lat, lng: vehicle.lng }} title="Driver">
            <div style={{ ...pin("#0f100d", 20), border: "3px solid #d5f02a" }} />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}
