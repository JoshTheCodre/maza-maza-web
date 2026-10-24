"use client";

import { AdminPage } from "@/components/admin/admin-shell";
import { Pill } from "@/components/ui/display";
import { place } from "@/lib/data/places";
import { clock, dayLabel, naira } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { TripStage } from "@/lib/types";

const STAGE: Record<TripStage, [string, "accept" | "counter" | "neutral" | "lost"]> = {
  to_pickup: ["To pickup", "counter"],
  at_pickup: ["At pickup", "counter"],
  on_trip: ["On trip", "counter"],
  payment: ["Paying", "counter"],
  completed: ["Completed", "accept"],
  cancelled: ["Cancelled", "lost"],
};

export default function TripsAdmin() {
  const s = useStore();
  const trips = [...s.trips].sort((a, b) => b.createdAt - a.createdAt);
  const openRequests = s.requests.filter((r) => r.status === "open");
  return (
    <AdminPage title="Trips" sub="Every trip, with the first offer and the fare both sides agreed">
      <div className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-[0.88rem]">
          <thead className="border-b border-line">
            <tr className="kicker">
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Driver</th>
              <th className="px-4 py-3 text-right font-semibold">First offer</th>
              <th className="px-4 py-3 text-right font-semibold">Agreed</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {trips.map((t) => {
              const req = s.requests.find((r) => r.id === t.requestId);
              const [label, tone] = STAGE[t.stage];
              return (
                <tr key={t.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {dayLabel(t.createdAt)}, {clock(t.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {place(t.pickupId).name} → {place(t.dropId).name}
                    <div className="text-[0.76rem] text-muted">{t.mode === "ride" ? "Ride" : "Delivery"}</div>
                  </td>
                  <td className="px-4 py-3">{t.customer.short}</td>
                  <td className="px-4 py-3">
                    {t.driver.short}
                    <div className="font-mono text-[0.74rem] text-muted">{t.driver.vehicle.plate}</div>
                  </td>
                  <td className="tabular px-4 py-3 text-right font-mono">{req ? naira(req.firstOffer) : "—"}</td>
                  <td className="tabular px-4 py-3 text-right font-mono font-semibold">{naira(t.price)}</td>
                  <td className="px-4 py-3">
                    <Pill tone={tone}>{label}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <section className="grid gap-2">
        <h2 className="font-bold">Open requests ({openRequests.length})</h2>
        <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
          {openRequests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-[0.88rem]">
              <span>
                {r.customer.short} · {place(r.pickupId).name} → {place(r.dropId).name}
              </span>
              <span className="tabular font-mono font-semibold">
                {naira(r.offer)} · {s.bids.filter((b) => b.requestId === r.id && b.status === "active").length} replies
              </span>
            </li>
          ))}
          {!openRequests.length && <li className="px-3.5 py-3 text-muted">No open requests right now.</li>}
        </ul>
      </section>
    </AdminPage>
  );
}
