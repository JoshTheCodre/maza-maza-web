"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Pill } from "@/components/ui/display";
import { useNow } from "@/hooks/use-now";
import { relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { ReportKind } from "@/lib/types";

const KIND: Record<ReportKind, string> = {
  sos: "SOS",
  overcharge: "Asked for more money",
  safety: "Safety concern",
  conduct: "Behaviour",
  lost_item: "Lost item",
  other: "Other",
};

export default function ReportsAdmin() {
  const s = useStore();
  const now = useNow(30_000);
  const [show, setShow] = useState<"open" | "resolved">("open");
  const rows = s.reports
    .filter((r) => r.status === show)
    .sort((a, b) => (a.kind === "sos" ? -1 : 0) - (b.kind === "sos" ? -1 : 0) || b.createdAt - a.createdAt);
  return (
    <AdminPage title="Reports" sub="Problems raised by customers and drivers. SOS reports stay on top.">
      <div className="max-w-sm">
        <Segmented
          label="Report status"
          value={show}
          onChange={setShow}
          options={[
            { value: "open", label: `Open (${s.reports.filter((r) => r.status === "open").length})` },
            { value: "resolved", label: "Resolved" },
          ]}
        />
      </div>
      <ul className="grid gap-3">
        {rows.map((r) => (
          <li key={r.id} className={`grid gap-2 rounded-2xl border-[1.5px] bg-surface p-4 ${r.kind === "sos" ? "border-danger" : "border-line"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={r.kind === "sos" ? "lost" : r.kind === "overcharge" ? "counter" : "neutral"}>{KIND[r.kind]}</Pill>
              <span className="text-[0.8rem] text-muted">
                {relativeTime(r.createdAt, now)} · from {r.from} · about {r.against}
              </span>
            </div>
            <p>{r.message}</p>
            {r.status === "open" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    s.resolveReport(r.id);
                    toast("admin", "Report marked as resolved.");
                  }}
                >
                  Mark resolved
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast("admin", "Connecting you through the support line…")}>
                  Call reporter
                </Button>
              </div>
            )}
          </li>
        ))}
        {!rows.length && <li className="rounded-2xl border-[1.5px] border-line bg-surface p-4 text-muted">Nothing here.</li>}
      </ul>
    </AdminPage>
  );
}
