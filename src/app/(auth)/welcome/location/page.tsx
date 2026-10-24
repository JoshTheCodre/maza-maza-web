"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { nearestPlace } from "@/lib/data/places";
import { takeNext } from "@/lib/next-path";
import { useStore } from "@/lib/store";

/** Asks before the browser does, so people know why we want their location. */
export default function LocationPermissionPage() {
  const router = useRouter();
  const s = useStore();
  const [asking, setAsking] = useState(false);

  const done = () => {
    s.setLocationAsked();
    router.push(takeNext());
  };

  const allow = () => {
    if (!navigator.geolocation) return done();
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        s.setDraft({ pickupId: nearestPlace(pos.coords.latitude, pos.coords.longitude).id });
        done();
      },
      () => done(),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <div className="flex min-h-dvh flex-col justify-end bg-brand px-4 pt-[env(safe-area-inset-top)] pb-[calc(16px+env(safe-area-inset-bottom))] lg:items-center lg:justify-center">
      <div className="w-full max-w-md animate-rise rounded-[28px] bg-surface px-6 pt-7 pb-4 text-center shadow-card">
        <MapPin size={30} className="mx-auto text-brand" aria-hidden />
        <h1 className="mt-4 text-[1.2rem] leading-snug font-normal">
          Allow <b className="font-bold">Maza-Maza</b> to use this device&apos;s location?
        </h1>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <figure className="grid justify-items-center gap-2">
            <PickupDisc />
            <figcaption className="text-[0.95rem] font-bold">Your pickup</figcaption>
          </figure>
          <figure className="grid justify-items-center gap-2">
            <DriversDisc />
            <figcaption className="text-[0.95rem]">Drivers near you</figcaption>
          </figure>
        </div>
        <p className="mt-4 text-[0.86rem] text-muted">We use it to set your pickup and show drivers nearby. We never share it outside your trips.</p>
        <div className="mt-4 grid">
          {[
            ["While using the app", allow],
            ["Only this time", allow],
            ["Don't allow", done],
          ].map(([label, run]) => (
            <button key={label as string} type="button" disabled={asking} onClick={run as () => void} className="min-h-14 rounded-2xl text-[1.08rem] font-semibold text-brand hover:bg-brand-soft disabled:opacity-50">
              {asking && run === allow && label === "While using the app" ? "Waiting for your browser…" : (label as string)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PickupDisc() {
  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[132px]" aria-hidden>
      <defs>
        <clipPath id="disc-a">
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>
      <g clipPath="url(#disc-a)">
        <rect width="120" height="120" fill="var(--map-land)" />
        <path d="M0 30h120M0 72h120M0 100h120M28 0v120M64 0v120M96 0v120M0 0l120 120" stroke="var(--map-road)" strokeWidth="4" />
        <rect x="70" y="80" width="22" height="16" rx="3" fill="var(--map-park)" />
        <circle cx="34" cy="50" r="3" fill="var(--danfo)" />
        <circle cx="92" cy="40" r="3" fill="var(--brand)" />
        <path d="M60 34c-9 0-16 7-16 16 0 12 16 26 16 26s16-14 16-26c0-9-7-16-16-16z" fill="var(--brand)" />
        <circle cx="60" cy="50" r="6" fill="#ffffff" />
        <ellipse cx="60" cy="80" rx="9" ry="3.5" fill="none" stroke="var(--brand)" strokeWidth="2" />
      </g>
      <circle cx="60" cy="60" r="56" fill="none" stroke="var(--brand)" strokeWidth="4" />
    </svg>
  );
}

function DriversDisc() {
  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[132px]" aria-hidden>
      <defs>
        <clipPath id="disc-b">
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>
      <g clipPath="url(#disc-b)">
        <rect width="120" height="120" fill="var(--map-land)" />
        <path d="M10 0c10 30 40 40 50 60s0 40 10 60M0 46c30 0 50-10 70-30s50-6 50-6M40 120c10-20 40-30 80-28" stroke="var(--map-major)" strokeWidth="6" fill="none" />
        <path d="M0 84h120M84 0v120" stroke="var(--map-road)" strokeWidth="3" />
        {[
          [36, 40],
          [80, 60],
          [58, 92],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <circle r="8" fill="var(--danfo)" stroke="var(--on-danfo)" strokeWidth="1.6" />
            <circle r="2.6" fill="var(--on-danfo)" />
          </g>
        ))}
      </g>
      <circle cx="60" cy="60" r="56" fill="none" stroke="var(--line)" strokeWidth="2" />
    </svg>
  );
}
