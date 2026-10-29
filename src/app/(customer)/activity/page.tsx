"use client";

import { Bike, Car, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { UpcomingTrips } from "@/components/customer/booking-options";
import { ResumeBanner } from "@/components/customer/parts";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/display";
import { place } from "@/lib/data/places";
import { clock, dayLabel, naira } from "@/lib/format";
import { customerHistory, useStore } from "@/lib/store";

export default function ActivityPage() {
  const s = useStore();
  const trips = customerHistory(s);
  const paid = trips.filter((t) => t.stage !== "cancelled");
  const total = paid.reduce((sum, t) => sum + t.price, 0);
  return (
    <Page>
      <PageHeader title="Activity" />
      <ResumeBanner />
      <UpcomingTrips />
      {trips.length ? (
        <>
          <p className="text-[0.88rem] text-muted">
            {paid.length} {paid.length === 1 ? "trip" : "trips"} · {naira(total)} paid to drivers. Every fare here is the price you and the driver agreed.
          </p>
          <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
            {trips.map((t) => {
              const Icon = t.mode === "ride" ? Car : Bike;
              const cancelled = t.stage === "cancelled";
              return (
                <li key={t.id}>
                  <Link href={`/activity/${t.id}`} className="flex items-center gap-3 px-3.5 py-3 hover:bg-surface-2">
                    <span className={`grid size-10 flex-none place-items-center rounded-xl ${cancelled ? "bg-surface-2 text-muted" : "bg-brand-soft text-brand-strong"}`}>
                      <Icon size={20} aria-hidden />
                    </span>
                    {/* Destination first, like a receipt; the pickup is one tap away. */}
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[0.92rem] font-semibold">
                        {t.mode === "send" ? "Delivery to" : "To"} {place(t.dropId).name}
                      </b>
                      <small className="block truncate text-[0.76rem] text-muted">
                        {dayLabel(t.createdAt)}, {clock(t.createdAt)} · {t.driver.short}
                      </small>
                    </span>
                    {cancelled ? <Pill tone="lost">Cancelled</Pill> : <span className="tabular flex-none text-[0.92rem] font-bold">{naira(t.price)}</span>}
                    <ChevronRight size={18} className="flex-none text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="grid justify-items-start gap-3 rounded-2xl border-[1.5px] border-dashed border-line p-5">
          <b>No trips yet</b>
          <p className="text-muted">Your rides and deliveries show up here, with the fare you agreed and a receipt.</p>
          <ButtonLink href="/ride">Book your first ride</ButtonLink>
        </div>
      )}
    </Page>
  );
}
