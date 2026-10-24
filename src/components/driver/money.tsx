"use client";

import { Check, CreditCard, Hash, Landmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip, NairaStepper } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/sheet";
import { useNow } from "@/hooks/use-now";
import { MIN_TOP_UP, VEHICLE_LABEL } from "@/lib/config";
import { clock, dayLabel, hoursMinutes, msLeftToday, naira } from "@/lib/format";
import { ticketPrice, todayTicket, useStore, walletBalance } from "@/lib/store";
import { toast } from "@/lib/toasts";
import type { TopUpMethod } from "@/lib/types";

/** The yellow day ticket, shown once it's bought. */
export function TicketStub() {
  const s = useStore();
  const now = useNow(30_000);
  const t = todayTicket(s, now);
  const p = s.driver.profile;
  if (!t) return null;
  return (
    <div role="img" aria-label={`Day ticket for ${p.short}, active until 23:59 today, ${t.price} naira`} className="grid gap-3 rounded-[18px] bg-danfo px-[18px] py-4 text-on-danfo [--notch:var(--bg)]">
      <div className="flex items-center justify-between font-mono text-[0.56rem] font-semibold tracking-[0.12em] uppercase">
        <span className="font-display text-[0.88rem] font-extrabold tracking-tight normal-case">maza-maza</span>
        <span>Day ticket · Active</span>
      </div>
      <p className="font-display text-[1.3rem] leading-tight font-extrabold tracking-tight">You&apos;re on the road today</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
        {[
          ["Driver", p.short],
          ["Plate", p.vehicle.plate],
          ["Date", dayLabel(t.boughtAt)],
          ["Valid until", `23:59 · ${hoursMinutes(msLeftToday(now))} left`],
          ["Bought", `${clock(t.boughtAt)} from wallet`],
          ["Commission", "0%"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="font-mono text-[0.52rem] font-semibold tracking-[0.12em] uppercase opacity-70">{k}</dt>
            <dd className="tabular text-[0.84rem] font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="perforation -mx-[18px]" />
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-[1.35rem] font-extrabold tracking-tight">{naira(t.price)}</span>
        <span className="font-mono text-[0.62rem] font-semibold tracking-[0.1em]">{t.number}</span>
        <span className="barcode h-[30px] w-[100px]" aria-hidden />
      </div>
    </div>
  );
}

export function BuyTicketSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const now = useNow(60_000);
  const [paying, setPaying] = useState(false);
  const [topUp, setTopUp] = useState(false);
  const type = s.driver.profile.vehicle.type;
  const price = ticketPrice(s, type);
  const balance = walletBalance(s);
  const short = balance < price;
  return (
    <>
      <Sheet open={open && !topUp} onClose={onClose} title="Buy today's ticket">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-danfo p-3.5 text-on-danfo">
          <div>
            <p className="font-mono text-[0.54rem] font-semibold tracking-[0.12em] uppercase">
              {VEHICLE_LABEL[type]} · {dayLabel(now)}
            </p>
            <p className="font-bold">Valid until 23:59 tonight</p>
          </div>
          <b className="font-display text-[1.3rem] font-extrabold tracking-tight">{naira(price)}</b>
        </div>
        <ul className="grid gap-1.5 text-[0.86rem]">
          {["0% commission on every fare today", "Customers can see you and send you offers", "Go offline any time. The ticket stays valid until midnight."].map((t) => (
            <li key={t} className="grid grid-cols-[18px_minmax(0,1fr)] gap-2">
              <Check size={16} className="mt-0.5 text-brand" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-line p-3">
          <span>
            <b className="block">Pay from wallet</b>
            <small className="text-[0.8rem] text-muted">Balance {naira(balance)}</small>
          </span>
          <button type="button" onClick={() => setTopUp(true)} className="text-[0.86rem] font-bold text-brand">
            Top up
          </button>
        </div>
        {short && (
          <p className="rounded-xl bg-lost-bg px-3 py-2.5 text-[0.84rem] text-lost">
            Your wallet has {naira(balance)}. Top up at least {naira(Math.max(MIN_TOP_UP, price - balance))} to buy today&apos;s ticket.
          </p>
        )}
        <Button
          size="lg"
          block
          disabled={paying}
          onClick={() => {
            if (short) return setTopUp(true);
            setPaying(true);
            setTimeout(() => {
              const ok = s.buyTicket();
              setPaying(false);
              if (ok) {
                toast("driver", "Ticket active. You're online until 23:59.");
                onClose();
              } else toast("driver", "Couldn't buy the ticket. Check your wallet balance and try again.");
            }, 700);
          }}
        >
          {paying ? "Buying…" : short ? "Top up wallet first" : `Pay ${naira(price)} from wallet`}
        </Button>
        <button type="button" onClick={onClose} className="justify-self-center py-1 text-[0.86rem] font-bold text-muted">
          Not today
        </button>
      </Sheet>
      <TopUpSheet open={open && topUp} onClose={() => setTopUp(false)} suggested={Math.max(5000, price - balance)} />
    </>
  );
}

const METHODS: { id: TopUpMethod; label: string; sub: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Debit card", sub: "Verve, Mastercard or Visa", icon: CreditCard },
  { id: "transfer", label: "Bank transfer", sub: "To your own wallet account number", icon: Landmark },
  { id: "ussd", label: "USSD", sub: "No data needed", icon: Hash },
];

export function TopUpSheet({ open, onClose, suggested = 5000 }: { open: boolean; onClose: () => void; suggested?: number }) {
  const s = useStore();
  const [amount, setAmount] = useState(suggested);
  const [method, setMethod] = useState<TopUpMethod>("card");
  const [paying, setPaying] = useState(false);
  const ok = amount >= MIN_TOP_UP;
  const finish = () => {
    setPaying(true);
    setTimeout(() => {
      s.topUp(amount, method);
      setPaying(false);
      onClose();
    }, 1200);
  };
  return (
    <Sheet open={open} onClose={onClose} title="Top up your wallet">
      <div className="flex flex-wrap gap-2">
        {[2000, 5000, 10000, 20000].map((v) => (
          <Chip key={v} on={amount === v} onClick={() => setAmount(v)}>
            {naira(v)}
          </Chip>
        ))}
      </div>
      <NairaStepper id="topup-amount" value={amount} onChange={setAmount} step={500} />
      <div role="radiogroup" aria-label="Payment method" className="grid gap-2">
        {METHODS.map(({ id, label, sub, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={method === id}
            onClick={() => setMethod(id)}
            className={`flex items-center gap-3 rounded-2xl border-[1.5px] p-3 text-left ${method === id ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
          >
            <Icon size={20} className="flex-none" aria-hidden />
            <span>
              <b className="block text-[0.9rem]">{label}</b>
              <small className="text-[0.76rem] text-muted">{sub}</small>
            </span>
          </button>
        ))}
      </div>
      {method === "transfer" && (
        <div className="grid gap-1 rounded-2xl border-[1.5px] border-dashed border-muted p-3 text-[0.86rem]">
          <p className="kicker">Your wallet account</p>
          <p className="tabular font-mono text-[1.15rem] font-semibold">782 000 4417</p>
          <p>Wema Bank · MAZA-MAZA / {s.driver.profile.name.toUpperCase()}</p>
          <p className="text-[0.78rem] text-muted">Transfers to this account credit your wallet automatically, usually within a few minutes.</p>
        </div>
      )}
      {method === "ussd" && <p className="rounded-2xl border-[1.5px] border-dashed border-muted p-3 text-[0.86rem]">Paystack shows a code for your bank. Dial it, then approve the payment on your phone.</p>}
      <Button size="lg" block disabled={!ok || paying} onClick={finish}>
        {paying ? "Waiting for Paystack…" : method === "transfer" ? `I've sent ${naira(amount)}` : `Pay ${naira(amount)} with Paystack`}
      </Button>
      <p className="text-center text-[0.76rem] text-muted">Wallet credit can only be used for day tickets. Minimum top-up {naira(MIN_TOP_UP)}.</p>
    </Sheet>
  );
}
