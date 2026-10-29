"use client";

import { Check, Landmark, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BuyTicketSheet } from "@/components/driver/money";
import { FeedCard } from "@/components/driver/feed-card";
import { UpcomingJobs } from "@/components/driver/scheduled-job";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { MapView } from "@/components/map/map-view";
import { useNow } from "@/hooks/use-now";
import { VEHICLE_LABEL } from "@/lib/config";
import { DEFAULT_PICKUP, place } from "@/lib/data/places";
import { dayLabel, naira } from "@/lib/format";
import { driverFeed, driverMode, myBidFor, nextJobWindow, ticketPrice, todayTicket, useStore, walletBalance } from "@/lib/store";

const DRIVER_SPOT = DEFAULT_PICKUP;

export default function DriverOffers() {
  const s = useStore();
  const now = useNow(1000);
  const [buying, setBuying] = useState(false);
  const ticket = todayTicket(s, now);
  const feed = driverFeed(s, now);
  const freeIn = nextJobWindow(s, now);
  const fresh = feed.filter((r) => r.status === "open" && !myBidFor(s, r.id)).length;

  let body;
  if (!ticket) body = <NoTicket onBuy={() => setBuying(true)} now={now} />;
  else if (!s.driver.online)
    body = (
      <EmptyState title="You're offline" action={<Button onClick={() => s.setOnline(true)}>Go online</Button>}>
        Your ticket stays valid until 23:59. Go online when you&apos;re ready for more offers.
      </EmptyState>
    );
  else if (!feed.length)
    body = (
      <EmptyState title="Looking for offers near you…">
        New {driverMode(s) === "ride" ? "ride" : "delivery"} requests show up here. You choose which to accept, counter or skip. Keep this screen open while you&apos;re online.
      </EmptyState>
    );
  else
    body = (
      <>
        <p className="kicker">Offers near you · {fresh} new</p>
        <ul className="grid gap-2.5" aria-live="polite">
          {feed.map((r) => (
            <FeedCard key={r.id} req={r} now={now} nextJob={freeIn !== null ? { freeInMin: freeIn } : undefined} />
          ))}
        </ul>
      </>
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto grid max-w-xl gap-3 px-4 py-4 lg:py-6">
          <h1 className="sr-only">Offers</h1>
          {!s.driver.profile.payout && (
            <Link href="/driver/account/payout" className="flex items-center gap-3 rounded-2xl border-[1.5px] border-danfo bg-danfo-soft p-3">
              <Landmark size={20} className="flex-none" aria-hidden />
              <span className="min-w-0 flex-1 text-[0.88rem]">
                <b className="block">Add your bank account</b>
                Customers who pay by transfer need it.
              </span>
              <span className="text-[0.84rem] font-bold text-brand">Add</span>
            </Link>
          )}
          <UpcomingJobs />
          {body}
        </div>
      </div>
      <div className="relative hidden border-l border-line lg:block">
        <MapView pickup={place(DRIVER_SPOT)} others={feed.filter((r) => r.status === "open").map((r) => place(r.pickupId))} minWidth={260} />
        {feed.length > 0 && <p className="absolute top-4 left-4 rounded-full bg-surface px-3 py-1.5 text-[0.8rem] font-semibold shadow-soft">Black pin: you · White pins: pickups</p>}
      </div>
      <BuyTicketSheet open={buying} onClose={() => setBuying(false)} />
    </div>
  );
}

function NoTicket({ onBuy, now }: { onBuy: () => void; now: number }) {
  const s = useStore();
  const type = s.driver.profile.vehicle.type;
  const price = ticketPrice(s, type);
  const balance = walletBalance(s);
  return (
    <>
      <div className="grid gap-3 rounded-[20px] bg-danfo p-4 text-on-danfo">
        <p className="font-mono text-[0.58rem] font-semibold tracking-[0.1em] uppercase opacity-80">
          {VEHICLE_LABEL[type]} · {dayLabel(now)}
        </p>
        <h2 className="font-display text-[1.1rem] leading-tight font-bold tracking-tight">Buy today&apos;s ticket to start getting offers</h2>
        <p className="font-display text-[1.7rem] font-extrabold tracking-tight">
          {naira(price)} <small className="font-sans text-[0.84rem] font-semibold tracking-normal">for today</small>
        </p>
        <ul className="grid gap-1.5 text-[0.86rem] font-semibold">
          {["0% commission. Keep every fare.", "Customers see you and send offers until 23:59.", "Not working today? Don't buy. Nothing is charged."].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check size={16} strokeWidth={2.6} className="mt-0.5 flex-none" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <button type="button" onClick={onBuy} className="min-h-[52px] rounded-full bg-on-danfo px-5 font-bold text-danfo">
          {balance >= price ? `Buy today's ticket · ${naira(price)}` : "Top up and buy today's ticket"}
        </button>
        <p className="text-[0.8rem] font-semibold">Wallet balance: {naira(balance)}</p>
      </div>
      <div className="relative grid gap-2" aria-label="Offers are locked until you buy today's ticket">
        {[0, 1, 2].map((i) => (
          <div key={i} aria-hidden className="grid h-14 rounded-2xl border-[1.5px] border-line bg-surface opacity-60" />
        ))}
        <div className="absolute inset-0 grid place-items-center p-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[0.86rem] font-bold shadow-soft">
            <Lock size={16} aria-hidden /> Offers near you show here once your ticket is active
          </span>
        </div>
      </div>
      <p className="text-center text-[0.8rem] text-muted">Rest day? Close the app. You only pay on days you work.</p>
    </>
  );
}
