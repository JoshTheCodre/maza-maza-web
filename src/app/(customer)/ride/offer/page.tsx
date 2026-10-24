"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MapLayout, Panel } from "@/components/app/layout-parts";
import { ModeSwitch } from "@/components/customer/parts";
import { Button } from "@/components/ui/button";
import { Chip, NairaStepper } from "@/components/ui/controls";
import { MapView } from "@/components/map/map-view";
import { PARCEL_TYPES, RIDE_NOTES } from "@/lib/config";
import { place, roadKm, trafficMinutes } from "@/lib/data/places";
import { naira } from "@/lib/format";
import { openCustomerRequest, useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

export default function OfferPage() {
  const s = useStore();
  const router = useRouter();
  const d = s.customer.draft;
  const open = openCustomerRequest(s);
  const MIN_OFFER = s.settings.minOffer;

  useEffect(() => {
    if (!d.dropId) router.replace("/ride/search");
  }, [d.dropId, router]);
  if (!d.dropId) return null;

  const a = place(d.pickupId);
  const b = place(d.dropId);
  const km = roadKm(a, b);
  const last = s.customer.lastOffers[`${d.pickupId}>${d.dropId}`];
  const ok = d.offer >= MIN_OFFER && !open;
  const toggleNote = (n: string) => s.setDraft({ notes: d.notes.includes(n) ? d.notes.filter((x) => x !== n) : [...d.notes, n] });

  return (
    <MapLayout
      map={<MapView pickup={a} drop={b} />}
      overlay={
        <button
          type="button"
          aria-label="Back"
          onClick={() => {
            s.setDraft({ editing: "drop" });
            router.push("/ride/search");
          }}
          className="absolute top-3 left-3 z-[3] grid size-10 place-items-center rounded-full border-[1.5px] border-line bg-surface lg:hidden"
        >
          <ChevronLeft size={20} />
        </button>
      }
    >
      <Panel
        footer={
          <Button
            size="lg"
            block
            disabled={!ok}
            onClick={() => {
              const id = s.sendOffer();
              if (id) router.push(`/ride/request/${id}`);
            }}
          >
            {open ? "You already have an open request" : ok ? `Send offer · ${naira(d.offer)}` : `Enter an offer of ${naira(MIN_OFFER)} or more`}
          </Button>
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-bold leading-snug">
              {a.name} → {b.name}
            </h1>
            <p className="text-[0.78rem] text-muted">
              About {km} km · {trafficMinutes(km)} in traffic
            </p>
          </div>
          <Link href="/ride/search" onClick={() => s.setDraft({ editing: "drop" })} className="flex-none text-[0.86rem] font-bold text-brand">
            Change
          </Link>
        </div>
        {open && (
          <Link href={`/ride/request/${open.id}`} className="rounded-2xl bg-ink px-4 py-3 text-[0.9rem] font-semibold text-bg">
            You have an open {naira(open.offer)} offer. Open it to see replies →
          </Link>
        )}
        <ModeSwitch />
        {d.mode === "send" && (
          <div className="grid gap-2">
            <p className="text-[0.85rem] font-bold">What are you sending?</p>
            <div className="flex flex-wrap gap-2">
              {PARCEL_TYPES.map((p) => (
                <Chip key={p} on={d.parcel === p} onClick={() => s.setDraft({ parcel: p })}>
                  {p}
                </Chip>
              ))}
            </div>
            <label htmlFor="receiver" className="text-[0.85rem] font-bold">
              Receiver&apos;s name
            </label>
            <input
              id="receiver"
              value={d.receiver}
              onChange={(e) => s.setDraft({ receiver: e.target.value })}
              placeholder="e.g. Bisi at the front desk"
              className="min-h-11 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold outline-none focus:border-brand"
            />
          </div>
        )}
        <div className="grid gap-2 rounded-2xl bg-surface-2 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-1">
            <label htmlFor="offer" className="font-bold">
              Your offer
            </label>
            <span className="text-[0.76rem] text-muted">{last ? `Last time you offered ${naira(last)}` : "No fixed fares"}</span>
          </div>
          <NairaStepper id="offer" value={d.offer} onChange={(v) => s.setDraft({ offer: v })} />
          <p className="text-center text-[0.74rem] text-muted">Maza-Maza doesn&apos;t suggest fares. Offer what you&apos;d pay on the street.</p>
        </div>
        <div className="grid gap-2">
          <p className="text-[0.85rem] font-bold">Pay the {d.mode === "ride" ? "driver" : "rider"} with</p>
          <div className="flex gap-2">
            {(["cash", "transfer"] as PayMethod[]).map((m) => (
              <Chip key={m} on={d.payMethod === m} onClick={() => s.setDraft({ payMethod: m })}>
                {m === "cash" ? "Cash" : "Transfer"}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <p className="text-[0.85rem] font-bold">Note</p>
          <div className="flex flex-wrap gap-2">
            {RIDE_NOTES[d.mode].map((n) => (
              <Chip key={n} on={d.notes.includes(n)} onClick={() => toggleNote(n)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>
      </Panel>
    </MapLayout>
  );
}
