"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { ReportKind } from "@/lib/types";

const KINDS: { kind: ReportKind; label: string }[] = [
  { kind: "overcharge", label: "Asked for more money" },
  { kind: "safety", label: "Safety concern" },
  { kind: "conduct", label: "Behaviour" },
  { kind: "lost_item", label: "Lost item" },
  { kind: "other", label: "Something else" },
];

export function ReportSheet({ open, onClose, tripId, audience = "customer" }: { open: boolean; onClose: () => void; tripId?: string; audience?: "customer" | "driver" }) {
  const report = useStore((s) => s.report);
  const [kind, setKind] = useState<ReportKind>(audience === "customer" ? "overcharge" : "conduct");
  const [message, setMessage] = useState("");
  const kinds = audience === "customer" ? KINDS : KINDS.filter((k) => k.kind !== "overcharge");
  return (
    <Sheet open={open} onClose={onClose} title="Report a problem">
      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <Chip key={k.kind} on={kind === k.kind} onClick={() => setKind(k.kind)}>
            {k.label}
          </Chip>
        ))}
      </div>
      <label htmlFor="report-msg" className="text-[0.85rem] font-bold">
        What happened?
      </label>
      <textarea
        id="report-msg"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={kind === "overcharge" ? "e.g. We agreed ₦2,800 but the driver asked for ₦3,300 at the drop-off." : "Tell us what happened."}
        className="rounded-xl border-[1.5px] border-line bg-surface p-3 outline-none focus:border-brand"
      />
      {kind === "overcharge" && <p className="text-[0.8rem] text-muted">You only have to pay the fare you agreed in the app.</p>}
      <Button
        size="lg"
        block
        disabled={message.trim().length < 5}
        onClick={() => {
          report(kind, message.trim(), audience, tripId);
          toast(audience, "Report sent. Our support team will get back to you.");
          setMessage("");
          onClose();
        }}
      >
        Send report
      </Button>
    </Sheet>
  );
}
