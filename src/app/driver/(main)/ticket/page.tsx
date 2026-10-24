"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Page, PageHeader } from "@/components/app/layout-parts";
import { BuyTicketSheet, TicketStub } from "@/components/driver/money";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { VEHICLE_LABEL } from "@/lib/config";
import { dayLabel, lagosDate, naira } from "@/lib/format";
import { driverHistory, ticketPrice, todayTicket, useStore, walletBalance } from "@/lib/store";

export default function TicketPage() {
  const s = useStore();
  const now = useNow(30_000);
  const [buying, setBuying] = useState(false);
  const ticket = todayTicket(s, now);
  const type = s.driver.profile.vehicle.type;
  const price = ticketPrice(s, type);
  const balance = walletBalance(s);
  const today = lagosDate(now);
  const past = s.driver.tickets.filter((t) => t.serviceDate !== today);
  const tripsOn = (date: string) => driverHistory(s).filter((t) => t.stage === "completed" && lagosDate(t.stageAt) === date).length;

  return (
    <Page>
      <PageHeader title="Day ticket" />
      {ticket ? (
        <TicketStub />
      ) : (
        <div className="grid gap-3 rounded-[18px] border-[1.5px] border-dashed border-muted bg-surface-2 p-4">
          <div className="flex items-center justify-between font-mono text-[0.56rem] font-semibold tracking-[0.12em] uppercase">
            <span className="font-display text-[0.88rem] font-extrabold tracking-tight normal-case">maza-maza</span>
            <span>{dayLabel(now)}</span>
          </div>
          <p className="font-display text-[1.3rem] font-extrabold tracking-tight">No ticket today</p>
          <p className="text-[0.88rem] text-muted">Customers can&apos;t see you and you pay nothing. Buy a ticket when you&apos;re ready to work.</p>
          <Button onClick={() => setBuying(true)}>Buy today&apos;s ticket · {naira(price)}</Button>
        </div>
      )}
      <p className="text-[0.86rem] text-muted">
        Wallet balance {naira(balance)} ·{" "}
        <Link href="/driver/wallet" className="font-bold text-brand">
          Top up
        </Link>
      </p>
      <ul className="grid gap-2 text-[0.88rem]">
        {[
          `Buy it on the days you want to work. ${VEHICLE_LABEL[type]} tickets cost ${naira(price)}.`,
          "It runs out at 23:59 the same day. Tomorrow is your choice again.",
          "No commission on any fare. Customers pay you directly.",
          "You can go offline and back online all day on one ticket.",
        ].map((t) => (
          <li key={t} className="grid grid-cols-[20px_minmax(0,1fr)] gap-2.5">
            <Check size={18} className="mt-0.5 text-brand" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
      <p className="kicker">Past tickets</p>
      {past.length ? (
        <ul className="divide-y divide-line rounded-2xl border-[1.5px] border-line bg-surface">
          {past.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <span>
                <b className="block text-[0.9rem] font-semibold">{dayLabel(t.boughtAt)}</b>
                <small className="text-[0.76rem] text-muted">
                  {t.number} · {tripsOn(t.serviceDate)} trips
                </small>
              </span>
              <span className="tabular font-mono text-[0.86rem] font-semibold">{naira(-t.price)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.88rem] text-muted">Tickets you buy show up here. Days without a ticket cost nothing.</p>
      )}
      <BuyTicketSheet open={buying} onClose={() => setBuying(false)} />
    </Page>
  );
}
