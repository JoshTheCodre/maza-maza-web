"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdminPage } from "@/components/admin/admin-shell";
import { Segmented } from "@/components/ui/controls";
import { Pill } from "@/components/ui/display";
import { useNow } from "@/hooks/use-now";
import { VEHICLE_LABEL } from "@/lib/config";
import { relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { DriverApplication } from "@/lib/types";

type Filter = "pending" | "approved" | "rejected" | "all";
const TONE = { pending: "counter", approved: "accept", rejected: "lost" } as const;

export default function DriversAdmin() {
  const s = useStore();
  const now = useNow(30_000);
  const [filter, setFilter] = useState<Filter>("pending");
  const [q, setQ] = useState("");
  const count = (st: DriverApplication["status"]) => s.applications.filter((a) => a.status === st).length;
  const rows = s.applications
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => !q || `${a.name} ${a.plate} ${a.phone}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <AdminPage title="Drivers" sub="Applications from car drivers and dispatch riders">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_280px]">
        <Segmented<Filter>
          label="Filter applications"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "pending", label: `Waiting (${count("pending")})` },
            { value: "approved", label: `Approved (${count("approved")})` },
            { value: "rejected", label: `Rejected (${count("rejected")})` },
            { value: "all", label: "All" },
          ]}
        />
        <label className="flex min-h-11 items-center gap-2 rounded-xl border-[1.5px] border-line bg-surface px-3 focus-within:border-brand">
          <Search size={18} className="text-muted" aria-hidden />
          <span className="sr-only">Search drivers</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, plate or phone" className="min-w-0 flex-1 bg-transparent outline-none" />
        </label>
      </div>
      <div className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-[0.88rem]">
          <thead className="border-b border-line">
            <tr className="kicker">
              <th className="px-4 py-3 font-semibold">Applicant</th>
              <th className="px-4 py-3 font-semibold">Works as</th>
              <th className="px-4 py-3 font-semibold">Plate</th>
              <th className="px-4 py-3 font-semibold">Documents</th>
              <th className="px-4 py-3 font-semibold">Sent</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((a) => {
              const done = a.documents.filter((d) => d.status !== "missing").length;
              return (
                <tr key={a.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link href={`/admin/drivers/${a.id}`} className="font-semibold">
                      {a.name}
                    </Link>
                    <div className="tabular text-[0.78rem] text-muted">{a.phone}</div>
                  </td>
                  <td className="px-4 py-3">{VEHICLE_LABEL[a.vehicleType]}</td>
                  <td className="px-4 py-3 font-mono text-[0.8rem]">{a.plate}</td>
                  <td className={`px-4 py-3 ${done < a.documents.length ? "font-semibold text-lost" : ""}`}>
                    {done} of {a.documents.length}
                  </td>
                  <td className="px-4 py-3 text-muted">{relativeTime(a.submittedAt, now)}</td>
                  <td className="px-4 py-3">
                    <Pill tone={TONE[a.status]}>{a.status === "pending" ? "Waiting" : a.status}</Pill>
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/admin/drivers/${a.id}`} aria-label={`Review ${a.name}`} className="grid size-8 place-items-center rounded-full hover:bg-line">
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  No applications here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
