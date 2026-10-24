"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { AdminPage } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Avatar, Pill } from "@/components/ui/display";
import { useNow } from "@/hooks/use-now";
import { BOT_CUSTOMERS } from "@/lib/data/people";
import { naira, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { Person } from "@/lib/types";

export default function CustomersAdmin() {
  const s = useStore();
  const now = useNow(30_000);
  const [q, setQ] = useState("");
  const people: Person[] = [...(s.customer.profile.name ? [s.customer.profile] : []), ...BOT_CUSTOMERS];
  const rows = people
    .map((p) => {
      const trips = s.trips.filter((t) => t.customer.id === p.id && t.stage === "completed");
      const reqs = s.requests.filter((r) => r.customer.id === p.id);
      const last = Math.max(0, ...trips.map((t) => t.createdAt), ...reqs.map((r) => r.createdAt));
      const reports = s.reports.filter((r) => r.against.includes(p.short)).length;
      return { p, trips: trips.length, spent: trips.reduce((sum, t) => sum + t.price, 0), last, reports, suspended: s.suspended.includes(p.id) };
    })
    .filter(({ p }) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.last - a.last);

  return (
    <AdminPage title="Customers" sub="People booking rides and deliveries">
      <label className="flex min-h-11 max-w-sm items-center gap-2 rounded-xl border-[1.5px] border-line bg-surface px-3 focus-within:border-brand">
        <Search size={18} className="text-muted" aria-hidden />
        <span className="sr-only">Search customers</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="min-w-0 flex-1 bg-transparent outline-none" />
      </label>
      <div className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-surface">
        <table className="w-full min-w-[680px] text-left text-[0.88rem]">
          <thead className="border-b border-line">
            <tr className="kicker">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
              <th className="px-4 py-3 text-right font-semibold">Trips</th>
              <th className="px-4 py-3 text-right font-semibold">Paid to drivers</th>
              <th className="px-4 py-3 font-semibold">Last active</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ p, trips, spent, last, reports, suspended }) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <Avatar name={p.name} size="sm" />
                    <span>
                      <b className="font-semibold">{p.name}</b>
                      {reports > 0 && <small className="block text-[0.74rem] text-lost">{reports} report{reports > 1 ? "s" : ""}</small>}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">★ {p.rating.toFixed(1)}</td>
                <td className="tabular px-4 py-3 text-right font-mono">{trips}</td>
                <td className="tabular px-4 py-3 text-right font-mono">{naira(spent)}</td>
                <td className="px-4 py-3 text-muted">{last ? relativeTime(last, now) : "—"}</td>
                <td className="px-4 py-3">{suspended ? <Pill tone="lost">Suspended</Pill> : <Pill tone="accept">Active</Pill>}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={suspended ? "ghost" : "danger"}
                    onClick={() => {
                      s.setSuspended(p.id, !suspended);
                      toast("admin", suspended ? `${p.name} can book again.` : `${p.name} is suspended and can't book.`);
                    }}
                  >
                    {suspended ? "Restore" : "Suspend"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
