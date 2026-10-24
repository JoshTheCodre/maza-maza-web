"use client";

import { CircleCheck, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { Button } from "@/components/ui/button";
import { NIGERIAN_BANKS } from "@/lib/config";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toasts";

export default function PayoutPage() {
  const s = useStore();
  const router = useRouter();
  const current = s.driver.profile.payout;
  const [bank, setBank] = useState(current?.bank ?? "");
  const [number, setNumber] = useState(current?.accountNumber ?? "");
  const [checked, setChecked] = useState<string | null>(current?.accountName ?? null);
  const [checking, setChecking] = useState(false);
  const holder = (s.driver.profile.name || s.customer.profile.name).toUpperCase();
  const complete = !!bank && number.length === 10;

  // Look up the account name once the bank and all 10 digits are in, as Paystack's resolve endpoint will.
  useEffect(() => {
    if (!complete || (current && current.bank === bank && current.accountNumber === number)) return;
    const startId = setTimeout(() => {
      setChecked(null);
      setChecking(true);
    }, 0);
    const doneId = setTimeout(() => {
      setChecking(false);
      setChecked(holder);
    }, 900);
    return () => {
      clearTimeout(startId);
      clearTimeout(doneId);
    };
  }, [complete, bank, number, holder, current]);

  return (
    <Page>
      <PageHeader title="Bank account" back="/driver/account" />
      <p className="text-muted">Customers who pay by transfer send money straight to this account. Maza-Maza never holds your fares.</p>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!complete || !checked) return;
          s.setPayout({ bank, accountNumber: number, accountName: checked });
          toast("driver", "Bank account saved.");
          router.push("/driver/account");
        }}
      >
        <div className="grid gap-1.5">
          <label htmlFor="bank" className="text-[0.85rem] font-bold">
            Bank
          </label>
          <select id="bank" value={bank} onChange={(e) => setBank(e.target.value)} className="min-h-12 rounded-xl border-[1.5px] border-line bg-surface px-3 font-semibold">
            <option value="">Choose your bank</option>
            {NIGERIAN_BANKS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="acct" className="text-[0.85rem] font-bold">
            Account number
          </label>
          <input
            id="acct"
            inputMode="numeric"
            autoComplete="off"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit NUBAN"
            className="tabular min-h-12 rounded-xl border-[1.5px] border-line bg-surface px-3 font-mono text-[1.05rem] font-semibold tracking-wide outline-none focus:border-brand"
          />
        </div>
        {complete && (
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-3 text-[0.9rem]" aria-live="polite">
            {checking || !checked ? (
              <>
                <LoaderCircle size={18} className="animate-spin" aria-hidden /> Checking the account…
              </>
            ) : (
              <>
                <CircleCheck size={18} className="text-accept" aria-hidden />
                <span>
                  <b>{checked}</b>
                  <small className="block text-muted">The name must match your ID.</small>
                </span>
              </>
            )}
          </div>
        )}
        <Button type="submit" size="lg" block disabled={!complete || !checked || checking}>
          Save bank account
        </Button>
      </form>
    </Page>
  );
}
