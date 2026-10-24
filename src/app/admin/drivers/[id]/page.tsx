"use client";

import { ChevronLeft, FileText, ImageOff } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AdminPage } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/display";
import { VEHICLE_LABEL } from "@/lib/config";
import { capitalise, clock, dayLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";

const DOC_TONE = { missing: "lost", uploaded: "counter", verified: "accept", rejected: "lost" } as const;

export default function ApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const a = s.applications.find((x) => x.id === id);
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  if (!a) {
    return (
      <AdminPage title="Application not found">
        <Link href="/admin/drivers" className="font-bold text-brand">
          Back to drivers
        </Link>
      </AdminPage>
    );
  }
  const missing = a.documents.some((d) => d.status === "missing");

  return (
    <AdminPage
      title={a.name}
      sub={`${VEHICLE_LABEL[a.vehicleType]} · ${a.city} · sent ${dayLabel(a.submittedAt)}, ${clock(a.submittedAt)}`}
      action={
        <Link href="/admin/drivers" className="inline-flex items-center gap-1 text-[0.88rem] font-bold text-brand">
          <ChevronLeft size={16} aria-hidden /> All drivers
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={a.status === "pending" ? "counter" : a.status === "approved" ? "accept" : "lost"}>{a.status === "pending" ? "Waiting for review" : a.status}</Pill>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="grid content-start gap-2">
          <h2 className="font-bold">Documents</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {a.documents.map((d) => (
              <li key={d.key} className="grid gap-2 rounded-2xl border-[1.5px] border-line bg-surface p-3">
                <div className="grid aspect-[4/3] max-w-full place-items-center rounded-xl bg-surface-2 text-muted">
                  {d.status === "missing" ? <ImageOff size={28} aria-hidden /> : <FileText size={28} aria-hidden />}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <b className="block text-[0.9rem]">{d.label}</b>
                    <small className="block truncate text-[0.76rem] text-muted">{d.fileName ?? "Not uploaded"}</small>
                  </span>
                  <Pill tone={DOC_TONE[d.status]}>{d.status === "uploaded" ? "To check" : d.status}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="grid content-start gap-3">
          <h2 className="font-bold">Details</h2>
          <dl className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
            {[
              ["Phone", a.phone],
              ["Vehicle", capitalise(a.vehicle)],
              ["Plate", a.plate],
              ["Guarantor", `${a.guarantor.name} (${a.guarantor.relationship})`],
              ["Guarantor phone", a.guarantor.phone],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-3.5 py-2.5">
                <dt className="text-[0.86rem] text-muted">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="grid gap-1.5 rounded-2xl bg-surface-2 p-3.5 text-[0.86rem]">
            <li>☐ NIN matches the name on the licence</li>
            <li>☐ Licence class fits the vehicle ({a.vehicleType === "bike" ? "Class A" : "Class B"})</li>
            <li>☐ Plate in the photo matches {a.plate}</li>
            <li>☐ Guarantor called and confirmed</li>
          </ul>
          {a.note && <p className="rounded-xl bg-lost-bg p-3 text-[0.86rem] text-lost">{a.note}</p>}
          {a.status === "pending" && !rejecting && (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={missing}
                onClick={() => {
                  s.reviewApplication(a.id, "approved");
                  toast("admin", `${a.name} is approved and can buy a day ticket.`);
                }}
              >
                Approve driver
              </Button>
              <Button variant="danger" onClick={() => setRejecting(true)}>
                Ask for changes
              </Button>
            </div>
          )}
          {missing && a.status === "pending" && <p className="text-[0.8rem] text-lost">A document is missing, so this can&apos;t be approved yet.</p>}
          {rejecting && (
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                s.reviewApplication(a.id, "rejected", note.trim());
                toast("admin", `${a.name} was asked to fix the application.`);
                setRejecting(false);
              }}
            >
              <label htmlFor="reject-note" className="text-[0.85rem] font-bold">
                What should they fix? (sent by SMS)
              </label>
              <textarea id="reject-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl border-[1.5px] border-line bg-surface p-3 outline-none focus:border-brand" placeholder="e.g. The licence photo is blurred. Send a clear photo." />
              <div className="flex gap-2">
                <Button type="submit" variant="danger" disabled={note.trim().length < 5}>
                  Send request
                </Button>
                <Button variant="ghost" onClick={() => setRejecting(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AdminPage>
  );
}
