"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_PICKUP, place } from "@/lib/data/places";
import { curveControl, type MapPoint } from "@/lib/geo";
import type { MapProps } from "./map-view";

// A simple drawn map of the city, used only when the browser can't run the real map.

function viewBoxFor(points: { x: number; y: number }[], aspect: number, minW: number, shift: number) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  let w = Math.max(x1 - x0 + 90, minW);
  let h = Math.max(y1 - y0 + 90, minW / aspect);
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2 + h * shift;
  const x = Math.max(-60, Math.min(460 - w, cx - w / 2));
  const y = Math.max(-40, Math.min(320 - h, cy - h / 2));
  return `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
}

// Main roads, as chains of landmarks: Ikwerre Road up to Rumuokoro, on to UNIPORT and the airport road;
// Aba Road out to Elelenwo; and the links between them. Rough, but in the right places.
const MAJOR = [
  ["mile1", "rumuola", "rumuokoro", "uniport", "airport"],
  ["phmall", "gra2", "pleasure", "shellra", "oilmill"],
  ["gra2", "transamadi", "woji"],
];
const MINOR = [
  ["mile1", "rsu"],
  ["mile1", "phmall", "creekroad"],
  ["rumuola", "adageorge"],
  ["rumuola", "gra2"],
  ["transamadi", "peterodili"],
  ["pleasure", "rumuokoro"],
];
const LABELS: [string, string][] = [
  ["mile1", "DIOBU"],
  ["gra2", "GRA"],
  ["rumuokoro", "RUMUOKORO"],
  ["uniport", "CHOBA"],
  ["transamadi", "TRANS-AMADI"],
  ["oilmill", "ELELENWO"],
  ["creekroad", "BOROKIRI"],
  ["airport", "OMAGWA"],
];

const line = (ids: string[]) =>
  ids
    .map((id, i) => {
      const p = place(id);
      return `${i ? "L" : "M"}${p.x} ${p.y}`;
    })
    .join("");

function Base() {
  return (
    <>
      <rect className="m-land" x="-200" y="-200" width="840" height="700" />
      <path className="m-water" d="M-200 262C-40 250 60 268 150 262C215 258 255 270 300 262C360 252 420 236 480 228L480 500L-200 500Z" />
      <path className="m-water" d="M-60 200C-20 210 0 230 10 262L-60 262Z" />
      <path className="m-road" d={MINOR.map(line).join("")} />
      <path className="m-major" d={MAJOR.map(line).join("")} />
      {LABELS.map(([id, label]) => (
        <text key={id} className="m-label" x={place(id).x + 6} y={place(id).y - 6}>
          {label}
        </text>
      ))}
      <text className="m-wlabel" x="250" y="282">
        Bonny River
      </text>
    </>
  );
}

export function StreetMap({ pickup, drop, vehicle, others, pulse, minWidth = 170, shift = 0.06 }: MapProps) {
  const box = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1.4);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setAspect(width / height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pts: MapPoint[] = [pickup, drop].filter(Boolean) as MapPoint[];
  const c = pickup && drop ? curveControl(pickup, drop) : null;
  const d = c && pickup && drop ? `M${pickup.x} ${pickup.y} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${drop.x} ${drop.y}` : null;

  return (
    <div ref={box} className="absolute inset-0 bg-[var(--map-land)]">
      <svg className="block size-full" viewBox={viewBoxFor(pts.length ? pts : [place(DEFAULT_PICKUP)], aspect, minWidth, shift)} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <Base />
        {others?.map((o, i) => (
          <g key={i} transform={`translate(${o.x} ${o.y})`}>
            <circle className="m-other" r="3.4" />
          </g>
        ))}
        {d && (
          <>
            <path className="m-route-bg" d={d} />
            <path className="m-route" d={d} />
          </>
        )}
        {pickup && (
          <g transform={`translate(${pickup.x} ${pickup.y})`}>
            {pulse && <circle className="m-pulse" r="5" />}
            <circle className="m-pin-a" r="4.5" />
          </g>
        )}
        {drop && <rect className="m-pin-b" x={drop.x - 4} y={drop.y - 4} width="8" height="8" rx="1.5" />}
        {vehicle && (
          <g transform={`translate(${vehicle.x.toFixed(1)} ${vehicle.y.toFixed(1)})`}>
            <circle className="m-veh" r="6.5" />
            <circle className="m-veh-dot" r="2.2" />
          </g>
        )}
      </svg>
    </div>
  );
}
