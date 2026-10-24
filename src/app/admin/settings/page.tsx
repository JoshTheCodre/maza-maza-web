"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS } from "@/lib/config";
import { naira } from "@/lib/format";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { Settings } from "@/lib/types";

const FIELDS: { key: keyof Settings; label: string; hint: string; unit: "naira" | "min"; min: number; max: number }[] = [
  { key: "ticketCar", label: "Car day ticket", hint: "What car drivers pay for one day online.", unit: "naira", min: 0, max: 50000 },
  { key: "ticketBike", label: "Dispatch bike day ticket", hint: "What dispatch riders pay for one day online.", unit: "naira", min: 0, max: 50000 },
  { key: "minOffer", label: "Lowest offer a customer can send", hint: "Stops offers too small to be serious.", unit: "naira", min: 100, max: 10000 },
  { key: "raiseStep", label: "Raise button step", hint: "How much each tap of Raise adds to an offer.", unit: "naira", min: 50, max: 2000 },
  { key: "requestTtlMin", label: "Request stays open for", hint: "Minutes before an unanswered request expires.", unit: "min", min: 1, max: 30 },
];

export default function SettingsAdmin() {
  const s = useStore();
  const [draft, setDraft] = useState<Settings>(s.settings);
  const changed = FIELDS.some((f) => draft[f.key] !== s.settings[f.key]);
  const valid = FIELDS.every((f) => Number.isFinite(draft[f.key]) && draft[f.key] >= f.min && draft[f.key] <= f.max);
  return (
    <AdminPage title="Settings" sub="Prices and limits for Lagos. Changes apply to new tickets and requests straight away.">
      <form
        className="grid max-w-2xl gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          s.updateSettings(draft);
          toast("admin", "Settings saved.");
        }}
      >
        {FIELDS.map((f) => {
          const v = draft[f.key];
          const bad = !(v >= f.min && v <= f.max);
          return (
            <div key={f.key} className="grid gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
              <div>
                <label htmlFor={f.key} className="font-bold">
                  {f.label}
                </label>
                <p className="text-[0.84rem] text-muted">{f.hint}</p>
                {bad && (
                  <p className="text-[0.8rem] font-semibold text-danger">
                    Use {f.unit === "naira" ? `${naira(f.min)} to ${naira(f.max)}` : `${f.min} to ${f.max} minutes`}.
                  </p>
                )}
              </div>
              <div className={`flex min-h-11 items-center rounded-xl border-[1.5px] bg-surface px-3 focus-within:border-brand ${bad ? "border-danger" : "border-line"}`}>
                {f.unit === "naira" && <span className="text-muted">₦</span>}
                <input
                  id={f.key}
                  inputMode="numeric"
                  value={Number.isFinite(v) ? String(v) : ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: parseInt(e.target.value.replace(/\D/g, ""), 10) })}
                  className="tabular min-w-0 flex-1 bg-transparent px-1 text-right font-mono font-semibold outline-none"
                />
                {f.unit === "min" && <span className="text-muted">min</span>}
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!changed || !valid}>
            Save settings
          </Button>
          <Button variant="ghost" onClick={() => setDraft(DEFAULT_SETTINGS)}>
            Back to defaults
          </Button>
        </div>
      </form>
    </AdminPage>
  );
}
