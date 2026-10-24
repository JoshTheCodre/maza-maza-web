"use client";

import { useEffect, useRef, useState } from "react";
import { curveControl, type MapPoint } from "@/lib/geo";
import type { MapProps } from "./map-view";

// Hand-drawn Lagos used until a Google Maps key is configured.

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

function Base() {
  return (
    <>
      <rect className="m-land" x="-200" y="-200" width="840" height="700" />
      <rect className="m-park" x="141" y="161" width="20" height="16" rx="3" />
      <rect className="m-park" x="58" y="40" width="26" height="14" rx="3" />
      <path className="m-water" d="M212 108C245 98 320 106 480 116L480 206C370 212 330 214 300 213C272 212 258 208 248 205C234 201 222 194 216 182C211 160 209 130 212 108Z" />
      <path className="m-water" d="M150 212C168 206 188 208 198 218C201 232 197 246 201 258L168 264C164 246 160 230 150 212Z" />
      <path className="m-water" d="M-200 266C80 258 190 262 250 254C310 248 360 250 480 248L480 500L-200 500Z" />
      <path
        className="m-road"
        d="M72 58L98 96M118 46L98 96M98 96L142 88M142 88L172 98M185 150L202 134M150 170L185 150M185 150L192 190L206 222M206 222L228 238C250 236 270 230 292 226M60 120L120 140M130 120L172 98M160 205L100 205L46 204M120 140L185 150M46 204L30 150L60 120M292 226L298 246M332 230L334 250M206 222L200 246M242 218L246 240M118 46L132 60L142 88M30 60L72 58M118 46L170 40M-40 120L60 120M-40 204L46 204"
      />
      <path
        className="m-major"
        d="M98 96L120 140L150 170L160 205L180 212M172 98C205 108 214 130 214 160C214 185 212 200 206 222M242 218C262 222 280 226 292 226C330 228 360 232 480 240M206 222L242 218M142 88L185 150M118 46L118 -40"
      />
      <text className="m-label" x="100" y="34">IKEJA</text>
      <text className="m-label" x="150" y="140">YABA</text>
      <text className="m-label" x="112" y="186">SURULERE</text>
      <text className="m-label" x="300" y="244">LEKKI</text>
      <text className="m-label" x="214" y="254">V.I.</text>
      <text className="m-label" x="244" y="210">IKOYI</text>
      <text className="m-label" x="28" y="218">FESTAC</text>
      <text className="m-label" x="368" y="226">AJAH</text>
      <text className="m-label" x="176" y="90">GBAGADA</text>
      <text className="m-wlabel" x="290" y="162">Lagos Lagoon</text>
      <text className="m-wlabel" x="290" y="276">Atlantic Ocean</text>
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
      <svg className="block size-full" viewBox={viewBoxFor(pts.length ? pts : [{ x: 185, y: 150 }], aspect, minWidth, shift)} preserveAspectRatio="xMidYMid slice" aria-hidden>
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
