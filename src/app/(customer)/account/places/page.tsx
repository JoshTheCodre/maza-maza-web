"use client";

import { Briefcase, House, Star, X } from "lucide-react";
import { useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { Button } from "@/components/ui/button";
import { Chip, Field } from "@/components/ui/controls";
import { PLACES, place } from "@/lib/data/places";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { SavedPlace } from "@/lib/types";

const ICONS = { home: House, work: Briefcase, star: Star };

export default function SavedPlacesPage() {
  const s = useStore();
  const [label, setLabel] = useState("Home");
  const [custom, setCustom] = useState("");
  const [placeId, setPlaceId] = useState(PLACES[0].id);
  const [note, setNote] = useState("");
  const finalLabel = label === "Other" ? custom.trim() : label;
  const icon: SavedPlace["icon"] = label === "Home" ? "home" : label === "Work" ? "work" : "star";

  return (
    <Page>
      <PageHeader title="Saved places" back="/account" />
      <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
        {s.customer.savedPlaces.map((sp) => {
          const Icon = ICONS[sp.icon];
          return (
            <li key={sp.label} className="flex items-center gap-3 px-3.5 py-3">
              <span className="grid size-10 flex-none place-items-center rounded-xl bg-brand-soft text-brand-strong">
                <Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block">{sp.label}</b>
                <small className="block text-[0.8rem] text-muted">
                  {place(sp.placeId).name}
                  {sp.note ? ` · ${sp.note}` : ""}
                </small>
              </span>
              <button type="button" aria-label={`Remove ${sp.label}`} onClick={() => s.removeSavedPlace(sp.label)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2">
                <X size={18} />
              </button>
            </li>
          );
        })}
        {!s.customer.savedPlaces.length && <li className="px-3.5 py-3 text-muted">No saved places yet.</li>}
      </ul>

      <form
        className="grid gap-3 rounded-2xl border-[1.5px] border-line bg-surface p-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!finalLabel) return;
          s.savePlace({ label: finalLabel, placeId, icon, note: note.trim() || undefined });
          toast("customer", `${finalLabel} saved.`);
          setNote("");
          setCustom("");
        }}
      >
        <h2 className="font-bold">Add a place</h2>
        <div className="flex flex-wrap gap-2">
          {["Home", "Work", "Other"].map((l) => (
            <Chip key={l} on={label === l} onClick={() => setLabel(l)}>
              {l}
            </Chip>
          ))}
        </div>
        {label === "Other" && <Field id="place-label" label="Name" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Mum's house" />}
        <div className="grid gap-1.5">
          <label htmlFor="place-id" className="text-[0.85rem] font-bold">
            Place
          </label>
          <select id="place-id" value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold">
            {PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <Field id="place-note" label="Landmark note for drivers" hint="Addresses can be hard to find. A landmark helps." value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Blue gate opposite the filling station" />
        <Button type="submit" disabled={!finalLabel}>
          Save place
        </Button>
      </form>
    </Page>
  );
}
