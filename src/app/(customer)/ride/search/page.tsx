"use client";

import { LocateFixed, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { Dot } from "@/components/ui/display";
import { place, searchPlaces } from "@/lib/data/places";
import { locationProblem, pickupHere } from "@/lib/location";
import { CITY } from "@/lib/city";
import { knownRoute } from "@/lib/routing";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { Mode } from "@/lib/types";

export default function PlaceSearch() {
  const s = useStore();
  const router = useRouter();
  const d = s.customer.draft;
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const setDraft = s.setDraft;

  // Links from the landing page carry ?mode=ride|send.
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "ride" || m === "send") setDraft({ mode: m as Mode, notes: [], editing: "drop" });
  }, [setDraft]);

  const locateMe = () => {
    setLocating(true);
    pickupHere()
      .then((p) => {
        s.addPlace(p);
        toast("customer", `Pickup set to ${p.name}.`);
        pick(p.id);
      })
      .catch((e: Error) => toast("customer", locationProblem(e.message)))
      .finally(() => setLocating(false));
  };
  const editing = d.editing;
  const pickup = place(d.pickupId);
  const results = searchPlaces(query, editing === "drop" ? d.pickupId : undefined);
  const dropLabel = d.mode === "ride" ? "Drop-off" : "Deliver to";

  const pick = (id: string) => {
    if (editing === "pickup") {
      s.setDraft({ pickupId: id, editing: "drop", dropId: d.dropId === id ? null : d.dropId });
      setQuery("");
      if (d.dropId && d.dropId !== id) router.push("/ride/offer");
      return;
    }
    if (s.chooseDrop(id)) router.push("/ride/offer");
  };

  const field = (which: "pickup" | "drop") => {
    const on = editing === which;
    const label = which === "pickup" ? "Pickup" : dropLabel;
    const value = which === "pickup" ? pickup.name : d.dropId ? place(d.dropId).name : "";
    const inner = (
      <>
        <Dot kind={which === "pickup" ? "a" : "b"} />
        <span className="min-w-0">
          <small className="block text-[0.64rem] font-bold tracking-[0.06em] text-muted uppercase">{label}</small>
          {on ? (
            <input
              id={`search-${which}`}
              autoFocus
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={which === "pickup" ? "Search pickup" : `Search places in ${CITY.name}`}
              className="block w-full border-0 bg-transparent p-0 font-semibold outline-none"
            />
          ) : (
            <span className="block truncate font-semibold">{value || "Choose a place"}</span>
          )}
        </span>
      </>
    );
    const cls = `grid w-full grid-cols-[20px_minmax(0,1fr)] items-center gap-3 px-3.5 py-2.5 text-left ${on ? "bg-brand-soft" : ""}`;
    return on ? (
      <label htmlFor={`search-${which}`} className={cls}>
        {inner}
      </label>
    ) : (
      <button
        type="button"
        className={cls}
        onClick={() => {
          s.setDraft({ editing: which });
          setQuery("");
        }}
      >
        {inner}
      </button>
    );
  };

  return (
    <Page>
      <PageHeader title={d.mode === "ride" ? "Plan your ride" : "Plan your delivery"} back="/ride" />
      <div className="relative divide-y divide-line overflow-hidden rounded-2xl border-[1.5px] border-line bg-surface before:absolute before:top-[30px] before:bottom-[30px] before:left-[23px] before:z-[1] before:border-l-2 before:border-dotted before:border-muted">
        {field("pickup")}
        {field("drop")}
      </div>
      {editing === "pickup" && (
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line px-3 py-2.5 text-left font-semibold hover:border-ink disabled:opacity-60"
        >
          <LocateFixed size={18} className="text-brand" aria-hidden /> {locating ? "Finding you…" : "Use my current location"}
        </button>
      )}
      <ul aria-label="Places">
        {results.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => pick(p.id)} className="flex w-full items-center gap-3 border-b border-line px-0.5 py-2.5 text-left">
              <span className="grid size-8 flex-none place-items-center rounded-full bg-surface-2 text-muted">
                <MapPin size={16} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[0.92rem] font-semibold">{p.name}</b>
                <small className="block text-[0.74rem] text-muted">
                  {p.area}
                  {editing === "drop" ? ` · ${knownRoute(pickup, p).km} km away` : ""}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {!results.length && (
        <p className="text-[0.9rem] text-muted">No places match “{query}”. Try a landmark, bus stop, estate or area name.</p>
      )}
    </Page>
  );
}
