"use client";

import { AdvancedMarker, APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { CITY } from "@/lib/city";
import { GOOGLE_MAP_ID, GOOGLE_MAPS_KEY } from "@/lib/config";
import type { MapProps } from "./map-view";

const START = CITY.center;

function FitAndRoute({ pickup, drop, path: road }: Pick<MapProps, "pickup" | "drop"> & { path?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !pickup) return;
    if (!drop) {
      map.panTo({ lat: pickup.lat, lng: pickup.lng });
      return;
    }
    // The road route once it's fetched; a straight line until then.
    const path = road?.length
      ? road.map(([lng, lat]) => ({ lat, lng }))
      : [
          { lat: pickup.lat, lng: pickup.lng },
          { lat: drop.lat, lng: drop.lng },
        ];
    const line = new google.maps.Polyline({ path, strokeColor: "#0f100d", strokeOpacity: 0.85, strokeWeight: 4, map });
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 64);
    return () => line.setMap(null);
  }, [map, pickup, drop, road]);
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

export function GoogleStreetMap({ pickup, drop, vehicle, others, path, me }: MapProps & { path?: [number, number][]; me?: { lat: number; lng: number } }) {
  const center = pickup ? { lat: pickup.lat, lng: pickup.lng } : START;
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
        <FitAndRoute pickup={pickup} drop={drop} path={path} />
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
        {me && (
          <AdvancedMarker position={{ lat: me.lat, lng: me.lng }} title="You">
            <div style={{ ...pin("#2f7cf6", 16), border: "3px solid #fff" }} />
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
