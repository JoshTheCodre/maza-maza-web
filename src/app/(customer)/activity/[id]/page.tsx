"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { ReportSheet } from "@/components/customer/report-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { Avatar, Plate, RouteDots, Stars } from "@/components/ui/display";
import { place, roadKm } from "@/lib/data/places";
import { capitalise, clock, dayLabel, naira } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function TripReceipt() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const router = useRouter();
  const [report, setReport] = useState(false);
  const t = s.trips.find((x) => x.id === id && x.customerSource === "me");
  if (!t) {
    return (
      <Page>
        <PageHeader title="Trip not found" back="/activity" />
        <ButtonLink href="/activity">Back to activity</ButtonLink>
      </Page>
    );
  }
  const a = place(t.pickupId);
  const b = place(t.dropId);
  return (
    <Page>
      <PageHeader title={t.mode === "ride" ? "Ride receipt" : "Delivery receipt"} back="/activity" />
      <p className="text-muted">
        {dayLabel(t.createdAt)} at {clock(t.createdAt)}
      </p>
      <RouteDots from={a.name} to={b.name} meta={`${roadKm(a, b)} km`} />
      <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-line p-3">
        <Avatar name={t.driver.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-bold">
            {t.driver.short} <Stars rating={t.driver.rating} />
          </p>
          <p className="text-[0.76rem] text-muted">{capitalise(t.driver.vehicle.description)}</p>
        </div>
        <Plate>{t.driver.vehicle.plate}</Plate>
      </div>
      <dl className="divide-y divide-line rounded-2xl border-[1.5px] border-line">
        {(t.stage === "cancelled"
          ? [
              ["Status", `Cancelled by ${t.cancelledBy === "customer" ? "you" : "the driver"}`],
              ["Reason", t.cancelReason ?? "—"],
              ["You paid", "₦0"],
            ]
          : [
              ["Agreed fare", naira(t.price)],
              ["Paid by", capitalise(t.payMethod)],
              ["Maza-Maza fee", "₦0"],
              ["Your rating", t.rating ? "★".repeat(t.rating) : "Not rated"],
            ]
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-3.5 py-2.5">
            <dt className="text-[0.88rem] text-muted">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            s.setDraft({ pickupId: t.pickupId, dropId: t.dropId, mode: t.mode, offer: t.price });
            router.push("/ride/offer");
          }}
        >
          Book this again
        </Button>
        <Button variant="ghost" onClick={() => setReport(true)}>
          Report a problem
        </Button>
      </div>
      <ReportSheet open={report} onClose={() => setReport(false)} tripId={t.id} />
    </Page>
  );
}
