"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/controls";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { ReportKind, Side } from "@/lib/types";

const FAQ: Record<Side, [string, string][]> = {
  customer: [
    ["Who decides the fare?", "You and the driver. You make an offer, drivers nearby accept it or counter, and you choose. Maza-Maza doesn't set or suggest fares."],
    ["What if nobody accepts my offer?", "You'll usually get counter-offers. Accept one, or raise your offer so drivers who passed see the new price."],
    ["How do I pay?", "Pay the driver directly at the end of the trip, in cash or by bank transfer to the account shown in the app. Maza-Maza takes nothing from the fare."],
    ["The driver asked for more money", "You only pay the fare you agreed. Don't pay more. Report it from the trip screen and our safety team will follow up."],
    ["I left something in the car", "Open the trip in Activity and choose Report a problem, then Lost item. We'll put you in touch with the driver."],
    ["Can I cancel?", "Yes, until the trip starts. Open the trip and tap Cancel trip. Cancelling is free."],
  ],
  driver: [
    ["How does the day ticket work?", "Buy it on any day you want to work. It makes you visible to customers until 23:59 that night. No ticket means you're offline and pay nothing."],
    ["Do you take commission?", "No. You keep the full fare of every trip. The day ticket is the only fee."],
    ["How do customers pay me?", "Directly, in cash or by transfer to the bank account in Account → Bank account. Confirm the payment before you end the trip."],
    ["A customer didn't show up", "Wait at the pickup. After 5 minutes you can cancel with No-show from the trip screen."],
    ["My wallet top-up didn't arrive", "Card and USSD top-ups arrive straight away. Bank transfers can take a few minutes. If it's been longer, send us a message below with the time and amount."],
    ["Can I work as a car driver and a dispatch rider?", "Each account has one vehicle type. Contact support if you want to change yours."],
  ],
};

export function HelpCenter({ audience }: { audience: Side }) {
  const report = useStore((s) => s.report);
  const [kind, setKind] = useState<ReportKind>("other");
  const [message, setMessage] = useState("");
  return (
    <>
      <section className="grid gap-2">
        <h2 className="font-bold">Common questions</h2>
        <div className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
          {FAQ[audience].map(([q, a]) => (
            <details key={q} className="group px-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden className="text-xl leading-none text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-3 text-[0.9rem] text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <form
        className="grid gap-3 rounded-2xl border-[1.5px] border-line bg-surface p-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim().length < 5) return;
          report(kind, message.trim(), audience);
          toast(audience, "Message sent. Our support team usually replies within a few hours.");
          setMessage("");
        }}
      >
        <h2 className="font-bold">Message support</h2>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["other", "General"],
              ["safety", "Safety"],
              ["lost_item", "Lost item"],
              [audience === "customer" ? "overcharge" : "conduct", audience === "customer" ? "Fare problem" : "Customer problem"],
            ] as [ReportKind, string][]
          ).map(([k, label]) => (
            <Chip key={k} on={kind === k} onClick={() => setKind(k)}>
              {label}
            </Chip>
          ))}
        </div>
        <label htmlFor="support-msg" className="sr-only">
          Your message
        </label>
        <textarea
          id="support-msg"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what happened, with the date and time if it's about a trip."
          className="rounded-xl border-[1.5px] border-line bg-surface p-3 outline-none focus:border-brand"
        />
        <Button type="submit" disabled={message.trim().length < 5}>
          Send message
        </Button>
      </form>
      <p className="text-[0.84rem] text-muted">
        In an emergency, call <a href="tel:112" className="font-bold text-danger">112</a>.
      </p>
    </>
  );
}
