"use client";

import {
  Briefcase,
  CalendarClock,
  Check,
  ChevronDown,
  Clock,
  CloudSun,
  House,
  LocateFixed,
  MapPin,
  Moon,
  Plane,
  Plus,
  Radio,
  Search,
  Star,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BellLink } from "@/components/app/common";
import { MapLayout, Panel } from "@/components/app/layout-parts";
import { UpcomingTrips } from "@/components/customer/booking-options";
import { ModeSwitch, ResumeBanner } from "@/components/customer/parts";
import { Avatar } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { place } from "@/lib/data/places";
import { firstName, naira, partOfDay } from "@/lib/format";
import { CITY } from "@/lib/city";
import { nearbyVehicles } from "@/lib/geo";
import { locationProblem, pickupHere } from "@/lib/location";
import { toast } from "@/lib/toasts";
import { customerHistory, useStore } from "@/lib/store";
import type { Mode } from "@/lib/types";

const ICONS = { home: House, work: Briefcase, star: Star };
const DAY_ICONS = { morning: Sun, afternoon: CloudSun, evening: Moon };
const POPULAR = ["uniport", "airport", "phmall", "transamadi"];

export default function RideHome() {
  const s = useStore();
  const router = useRouter();
  const now = useNow(60_000);
  const d = s.customer.draft;
  const pickup = place(d.pickupId);
  const setDraft = s.setDraft;

  // Links from the landing page carry ?mode=ride|send.
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "ride" || m === "send") setDraft({ mode: m as Mode, notes: [] });
  }, [setDraft]);

  const history = customerHistory(s).filter((t) => t.stage !== "cancelled");
  const recent = [...new Set(history.map((t) => t.dropId))]
    .filter((id) => id !== d.pickupId)
    .slice(0, 3);
  const suggestions = recent.length
    ? recent
    : POPULAR.filter((id) => id !== d.pickupId).slice(0, 3);
  const others = s.customer.savedPlaces.filter(
    (p) => p.label !== "Home" && p.label !== "Work",
  );
  const part = partOfDay(now);
  const DayIcon = DAY_ICONS[part];

  const [locating, setLocating] = useState(false);
  const locate = () => {
    setLocating(true);
    pickupHere()
      .then((p) => {
        s.addPlace(p);
        s.setDraft({ pickupId: p.id });
        toast("customer", `Pickup set to ${p.name}.`);
      })
      .catch((e: Error) => toast("customer", locationProblem(e.message)))
      .finally(() => setLocating(false));
  };

  // Bookings from here are for now; Schedule and Airport set a time.
  const forNow = { scheduledFor: null, flight: null };
  const go = (placeId: string) => {
    s.setDraft(forNow);
    if (s.chooseDrop(placeId)) router.push("/ride/offer");
  };
  const tile = "grid min-h-[68px] place-items-center content-center gap-1 rounded-2xl bg-surface-2 px-2 text-[0.8rem] font-semibold hover:bg-line";

  return (
    <MapLayout
      mapSize="tall"
      map={
        <MapView
          pickup={pickup}
          others={nearbyVehicles(pickup)}
          minWidth={200}
          shift={-0.1}
        />
      }
      overlay={
        <>
          <div className="absolute inset-x-3 top-3 z-[3] flex items-center gap-2 lg:right-auto lg:left-6 lg:w-[420px]">
            <Link
              href="/account"
              aria-label="Account"
              className="grid size-[52px] flex-none place-items-center rounded-full bg-surface shadow-soft"
            >
              <Avatar name={s.customer.profile.name} />
            </Link>
            <button
              type="button"
              className="flex min-h-[52px] min-w-0 flex-1 items-center gap-2.5 rounded-full bg-surface py-1.5 pr-4 pl-1.5 text-left shadow-soft"
              onClick={() => {
                s.setDraft({ editing: "pickup" });
                router.push("/ride/search");
              }}
            >
              <span
                className={`grid size-10 flex-none place-items-center rounded-full ${part === "evening" ? "bg-hero text-danfo" : "bg-danfo text-on-danfo"}`}
              >
                <DayIcon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.95rem] leading-tight font-bold">
                  Good {part}, {firstName(s.customer.profile.name)}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[0.78rem] text-muted">
                  <span
                    className="size-1.5 flex-none rounded-full bg-brand"
                    aria-hidden
                  />
                  <span className="truncate">{pickup.name}</span>
                  <ChevronDown size={14} className="flex-none" aria-hidden />
                  <span className="sr-only">(change pickup)</span>
                </span>
              </span>
            </button>
            <span className="flex-none lg:hidden">
              <BellLink audience="customer" chip />
            </span>
          </div>
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            aria-label="Use my location as the pickup"
            className="absolute right-3 bottom-9 z-[3] grid size-12 place-items-center rounded-full bg-surface shadow-soft hover:bg-surface-2 lg:bottom-6"
          >
            <LocateFixed
              size={22}
              className={locating ? "animate-pulse text-muted" : "text-ink"}
              aria-hidden
            />
          </button>
        </>
      }
    >
      <Panel>
        <h1 className="sr-only">Book a ride or delivery</h1>
        <ResumeBanner />
        <ModeSwitch />
        <Link
          href="/ride/search"
          onClick={() => s.setDraft({ editing: "drop", ...forNow })}
          className="flex min-h-[52px] items-center gap-2.5 rounded-2xl bg-surface-2 px-4 text-[1.02rem] font-bold"
        >
          <Search size={20} className="text-muted" aria-hidden />
          {d.mode === "ride" ? "Where to?" : "Where should it go?"}
        </Link>
        <div className="grid grid-cols-3 gap-2">
          <Link href="/ride/airport" className={tile}>
            <Plane size={20} aria-hidden /> Airport
          </Link>
          <button
            type="button"
            className={tile}
            onClick={() => {
              s.setDraft({ editing: "drop", flight: null, scheduledFor: Math.ceil((Date.now() + 60 * 60_000) / 300_000) * 300_000 });
              router.push("/ride/search");
            }}
          >
            <CalendarClock size={20} aria-hidden /> Schedule
          </button>
          <Link href="/account/safety#live" className={tile}>
            <Radio size={20} aria-hidden /> Share location
          </Link>
        </div>
        <UpcomingTrips />
        {others.length > 0 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {others.map((sp) => {
              const Icon = ICONS[sp.icon];
              return (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => go(sp.placeId)}
                  className="flex flex-none items-center gap-2 rounded-full border-[1.5px] border-line px-3 py-1.5 text-[0.84rem] font-semibold"
                >
                  <Icon size={16} aria-hidden /> {sp.label}
                </button>
              );
            })}
            <Link
              href="/account/places"
              className="flex flex-none items-center gap-1 rounded-full border-[1.5px] border-dashed border-line px-3 py-1.5 text-[0.84rem] font-semibold text-muted"
            >
              <Plus size={16} aria-hidden /> Add
            </Link>
          </div>
        )}
        <div className="grid gap-1">
          <p className="kicker">
            {recent.length ? "Recent" : `Popular in ${CITY.name}`}
          </p>
          <ul>
            {suggestions.map((id) => {
              const last = s.customer.lastOffers[`${d.pickupId}>${id}`];
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    className="flex w-full items-center gap-3 border-b border-line px-0.5 py-2.5 text-left"
                  >
                    <span className="grid size-8 flex-none place-items-center rounded-full bg-surface-2 text-muted">
                      {recent.length ? (
                        <Clock size={16} aria-hidden />
                      ) : (
                        <MapPin size={16} aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[0.9rem] font-semibold">
                        {place(id).name}
                      </b>
                      <small className="block text-[0.74rem] text-muted">
                        {place(id).area}
                        {last ? ` · you last offered ${naira(last)}` : ""}
                      </small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="flex items-start gap-2.5 rounded-2xl bg-danfo-soft p-3 text-[0.82rem]">
          <Check size={16} className="mt-0.5 flex-none" aria-hidden />
          You set the price. Drivers keep your whole fare, and you pay them
          directly in cash or by transfer.
        </p>
      </Panel>
    </MapLayout>
  );
}
