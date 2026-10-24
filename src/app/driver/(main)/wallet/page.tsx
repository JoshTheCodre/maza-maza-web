"use client";

import { ArrowDownLeft, Ticket } from "lucide-react";
import { useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { TopUpSheet } from "@/components/driver/money";
import { Button } from "@/components/ui/button";
import { clock, dayLabel, naira } from "@/lib/format";
import { ticketPrice, useStore, walletBalance } from "@/lib/store";

export default function WalletPage() {
  const s = useStore();
  const [topUp, setTopUp] = useState(false);
  const balance = walletBalance(s);
  const price = ticketPrice(s, s.driver.profile.vehicle.type);
  const days = Math.floor(balance / price);
  return (
    <Page>
      <PageHeader title="Wallet" />
      <div className="on-hero grid gap-3 rounded-[20px] bg-hero p-4 text-on-hero">
        <p className="font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-on-hero-muted uppercase">Ticket wallet</p>
        <p className="tabular font-display text-[2rem] font-extrabold tracking-tight">{naira(balance)}</p>
        <p className="text-[0.86rem] text-on-hero-muted">
          Enough for {days} {days === 1 ? "day ticket" : "day tickets"} at {naira(price)}.
        </p>
        <Button variant="danfo" onClick={() => setTopUp(true)} className="justify-self-start">
          Top up
        </Button>
      </div>
      <p className="text-[0.84rem] text-muted">
        Top up once, then buy tickets in one tap, even on a weak network. Wallet credit is only for day tickets and isn&apos;t a bank account.
      </p>
      <p className="kicker">History</p>
      {!s.driver.wallet.length && <p className="text-[0.88rem] text-muted">No activity yet. Top up to buy your first day ticket.</p>}
      <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface empty:hidden">
        {s.driver.wallet.map((e) => {
          const Icon = e.amount > 0 ? ArrowDownLeft : Ticket;
          return (
            <li key={e.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <span className={`grid size-9 flex-none place-items-center rounded-xl ${e.amount > 0 ? "bg-accept-bg text-accept" : "bg-danfo-soft text-ink"}`}>
                <Icon size={18} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[0.9rem] font-semibold">{e.note}</b>
                <small className="text-[0.76rem] text-muted">
                  {dayLabel(e.createdAt)}, {clock(e.createdAt)}
                </small>
              </span>
              <span className={`tabular font-mono text-[0.88rem] font-semibold ${e.amount > 0 ? "text-accept" : ""}`}>
                {e.amount > 0 ? "+" : ""}
                {naira(e.amount)}
              </span>
            </li>
          );
        })}
      </ul>
      <TopUpSheet open={topUp} onClose={() => setTopUp(false)} />
    </Page>
  );
}
